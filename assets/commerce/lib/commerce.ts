import { settings } from "./settings";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { digest } from "./digest";
import { BusinessError, integer, text } from "./errors";
import config from "../site.config.json";

export async function products(admin = false) {
  return db.product.findMany({ where: admin ? {} : { active: true }, include: {
    category: true, variants: { where: admin ? {} : { active: true }, orderBy: { sku: "asc" } },
  }, orderBy: { name: "asc" } });
}

export async function saveProduct(input: Record<string, unknown>) {
  const name = text(input.name, "name");
  const description = typeof input.description === "string" ? input.description.slice(0, 5000) : "";
  const image = typeof input.image === "string" ? input.image.slice(0, 2000) : "";
  if (image && !/^\/(?!\/)|^https:\/\//.test(image)) throw new BusinessError("Use a local image path or HTTPS image URL");
  const categoryName = text(input.category, "category");
  const id = input.id === undefined ? undefined : text(input.id, "product id");
  if (input.active !== undefined && typeof input.active !== "boolean") throw new BusinessError("Invalid active flag");
  if (!Array.isArray(input.variants) || !input.variants.length || input.variants.length > 100) throw new BusinessError("Product needs 1–100 variants");
  if (input.variants.some((value) => !value || typeof value !== "object" || Array.isArray(value))) throw new BusinessError("Invalid variant");
  const variants = input.variants.map((value: Record<string, unknown>) => ({
    sku: text(value.sku, "SKU"), size: text(value.size, "size", 40), color: text(value.color, "color", 60),
    price: integer(value.price, "price"), stock: integer(value.stock, "stock", 1000000),
  }));
  if (new Set(variants.map((v) => v.sku)).size !== variants.length || new Set(variants.map((v) => JSON.stringify([v.size, v.color]))).size !== variants.length) throw new BusinessError("Duplicate SKU or size/color combination");
  try {
    return await db.$transaction(async (tx) => {
      const category = await tx.category.upsert({ where: { name: categoryName }, create: { name: categoryName }, update: {} });
      const data = { name, description, image, active: input.active !== false, categoryId: category.id };
      const product = id ? await tx.product.update({ where: { id }, data }) : await tx.product.create({ data });
      await tx.variant.updateMany({ where: { productId: product.id }, data: { active: false } });
      for (const variant of variants) {
        const existing = await tx.variant.findUnique({ where: { sku: variant.sku } });
        if (existing && existing.productId !== product.id) throw new BusinessError("SKU belongs to another product", 409);
        await tx.variant.upsert({ where: { productId_size_color: { productId: product.id, size: variant.size, color: variant.color } },
          create: { ...variant, productId: product.id }, update: { ...variant, active: true } });
      }
      return product;
    });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") throw new BusinessError("SKU or variant already exists", 409);
    if ((error as { code?: string }).code === "P2025") throw new BusinessError("Product not found", 404);
    throw error;
  }
}

function orderRequest(input: Record<string, unknown>) {
  const customerName = text(input.customerName, "customer name");
  const email = text(input.email, "email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BusinessError("Invalid email");
  const address = text(input.address, "address", 1000);
  if (!Array.isArray(input.items) || !input.items.length || input.items.length > 50) throw new BusinessError("Order needs 1–50 items");
  if (input.items.some((item) => !item || typeof item !== "object" || Array.isArray(item))) throw new BusinessError("Invalid order item");
  const items = input.items.map((item: Record<string, unknown>) => ({ variantId: text(item.variantId, "variant"), quantity: integer(item.quantity, "quantity", 100) }));
  if (items.some((item) => item.quantity === 0) || new Set(items.map((item) => item.variantId)).size !== items.length) throw new BusinessError("Invalid or duplicate order items");
  items.sort((a, b) => a.variantId.localeCompare(b.variantId));
  return { customerName, email, address, items };
}

function accessToken(key: string) {
  const secret = process.env.TEST_PAYMENT_SECRET;
  if (!secret || secret.length < 32) throw new BusinessError("Configure TEST_PAYMENT_SECRET before accepting orders", 503);
  return createHmac("sha256", secret).update("order-access:" + key).digest("hex");
}

export async function createOrder(input: Record<string, unknown>, keyInput: unknown) {
  const key = text(keyInput, "Idempotency-Key", 128);
  if (key.length < 16) throw new BusinessError("Idempotency-Key must be at least 16 characters");
  const request = orderRequest(input);
  const requestHash = digest(JSON.stringify(request));
  const token = accessToken(key);
  const existing = async () => {
    const order = await db.order.findUnique({ where: { idempotencyKey: key }, include: { items: true } });
    if (order && order.requestHash !== requestHash) throw new BusinessError("Idempotency key reused for a different request", 409);
    return order;
  };
  const previous = await existing();
  if (previous) return { order: publicOrder(previous), accessToken: token };
  if((await settings()).maintenance)throw new BusinessError("Checkout is temporarily paused",503);
  try {
    const order = await db.$transaction(async (tx) => {
      let total = 0;
      const items = [];
      for (const item of request.items) {
        const variant = await tx.variant.findUnique({ where: { id: item.variantId }, include: { product: true } });
        if (!variant?.active || !variant.product.active) throw new BusinessError("Product unavailable", 409);
        const result = await tx.variant.updateMany({ where: { id: variant.id, active: true, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
        if (result.count !== 1) throw new BusinessError("Insufficient stock", 409);
        total += variant.price * item.quantity;
        if (!Number.isSafeInteger(total) || total > 1000000000) throw new BusinessError("Order total exceeds supported limit");
        items.push({ variantId: variant.id, name: variant.product.name, sku: variant.sku, size: variant.size,
          color: variant.color, quantity: item.quantity, unitPrice: variant.price });
      }
      return tx.order.create({ data: { idempotencyKey: key, requestHash, accessHash: digest(token),
        customerName: request.customerName, email: request.email, address: request.address,
        currency: config.currency, total, items: { create: items } }, include: { items: true } });
    }, { timeout: 10000 });
    return { order: publicOrder(order), accessToken: token };
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      const order = await existing();
      if (order) return { order: publicOrder(order), accessToken: token };
    }
    throw error;
  }
}

type FullOrder = Prisma.OrderGetPayload<{ include: { items: true } }>;
export function publicOrder(order: FullOrder) {
  const { idempotencyKey: _key, requestHash: _request, accessHash: _access, ...result } = order;
  return result;
}
export async function readOrder(id: string, token: string) {
  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order || !token || !timingSafeEqual(Buffer.from(order.accessHash, "hex"), Buffer.from(digest(token), "hex"))) throw new BusinessError("Order not found", 404);
  return publicOrder(order);
}

async function returnStock(tx: Prisma.TransactionClient, items: { variantId: string; quantity: number }[]) {
  for (const item of items) await tx.variant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
}

export async function testPayment(id: string, eventIdInput: unknown, outcomeInput: unknown) {
  const eventId = text(eventIdInput, "event id", 128);
  const outcome = text(outcomeInput, "outcome");
  if (outcome !== "success" && outcome !== "failure") throw new BusinessError("Invalid payment outcome");
  return db.$transaction(async (tx) => {
    const duplicate = await tx.paymentEvent.findUnique({ where: { id: eventId } });
    if (duplicate) {
      if (duplicate.orderId !== id || duplicate.outcome !== outcome) throw new BusinessError("Payment event conflict", 409);
      const current = await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
      return publicOrder(current);
    }
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new BusinessError("Order not found", 404);
    if (order.status !== "PENDING") throw new BusinessError("Order cannot accept payment", 409);
    const result = await tx.order.updateMany({ where: { id, status: "PENDING" }, data: { status: outcome === "success" ? "PAID" : "PAYMENT_FAILED" } });
    if (result.count !== 1) throw new BusinessError("Order state changed", 409);
    if (outcome === "failure") await returnStock(tx, order.items);
    await tx.paymentEvent.create({ data: { id: eventId, orderId: id, outcome } });
    return publicOrder(await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } }));
  });
}

export async function changeOrder(id: string, status: unknown) {
  if (status !== "CANCELLED" && status !== "SHIPPED") throw new BusinessError("Unsupported order transition");
  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) throw new BusinessError("Order not found", 404);
    if (order.status === status) return publicOrder(order);
    const from = status === "CANCELLED" ? "PENDING" : "PAID";
    if (order.status !== from) throw new BusinessError("Invalid order state transition", 409);
    const changed = await tx.order.updateMany({ where: { id, status: from }, data: { status } });
    if (changed.count !== 1) throw new BusinessError("Order state changed", 409);
    if (status === "CANCELLED") await returnStock(tx, order.items);
    return publicOrder(await tx.order.findUniqueOrThrow({ where: { id }, include: { items: true } }));
  });
}
