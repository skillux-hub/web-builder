import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
const temp = mkdtempSync(join(tmpdir(), "web-builder-commerce-"));
process.env.DATABASE_URL = "file:" + join(temp, "test.db").replaceAll("\\", "/");
process.env.TEST_PAYMENT_SECRET = "test-only-secret-".repeat(4);
let db: typeof import("../lib/db").db;
let commerce: typeof import("../lib/commerce");
let auth: typeof import("../lib/auth");
const input = (variantId: string, quantity = 1) => ({ customerName: "Test", email: "test@example.test", address: "Test address", items: [{ variantId, quantity }] });
let sequence = 0;
async function variant(stock = 5, price = 2500) {
  const category = await db.category.upsert({ where: { name: "Test" }, create: { name: "Test" }, update: {} });
  const product = await db.product.create({ data: { name: "Test shirt", categoryId: category.id, variants: { create: { sku: `TEST-${sequence++}`, size: "M", color: "Black", stock, price } } }, include: { variants: true } });
  return product.variants[0];
}
before(async () => {
  execFileSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/prepare-db.ts"], { env: process.env, stdio: "pipe" });
  execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "db", "push", "--config", "prisma7.config.ts"], { env: process.env, stdio: "pipe" });
  db = (await import("../lib/db")).db; commerce = await import("../lib/commerce"); auth = await import("../lib/auth");
});
after(async () => { if (db) await db.$disconnect(); rmSync(temp, { recursive: true, force: true }); });
test("admin login is required, session persists and logout revokes access", async () => {
  await assert.rejects(() => auth.requireAdmin(undefined), /login required/);
  await db.admin.create({ data: { email: "admin@example.test", passwordHash: auth.hashPassword("example-password-123") } });
  await assert.rejects(() => auth.login("admin@example.test", "wrong"), /Invalid/);
  const token = await auth.login("admin@example.test", "example-password-123");
  assert.ok(await auth.requireAdmin(token)); await db.$disconnect(); assert.ok(await auth.requireAdmin(token));
  await auth.logout(token); await assert.rejects(() => auth.requireAdmin(token), /expired/);
});
test("admin edits become public data and orders use server prices", async () => {
  const product = await commerce.saveProduct({ name: "New shirt", category: "Shirts", variants: [{ sku: "NEW-M", size: "M", color: "White", price: 1990, stock: 2 }] });
  const publicProduct = (await commerce.products()).find((p) => p.id === product.id)!;
  assert.equal(publicProduct.variants[0].stock, 2);
  const receipt = await commerce.createOrder({ ...input(publicProduct.variants[0].id), total: 1, price: 1 }, "server-price-key-0001");
  assert.equal(receipt.order.total, 1990);
  assert.equal((await db.variant.findUniqueOrThrow({ where: { id: publicProduct.variants[0].id } })).stock, 1);
  assert.equal((await db.order.findUniqueOrThrow({ where: { id: receipt.order.id } })).status, "PENDING");
  await assert.rejects(() => commerce.readOrder(receipt.order.id, "bad-token"), /not found/);
  assert.equal((await commerce.readOrder(receipt.order.id, receipt.accessToken)).id, receipt.order.id);
  assert.ok(!("accessHash" in receipt.order));
});
test("idempotent checkout preserves stock and rejects changed requests", async () => {
  const v = await variant(); const key = "idempotency-key-0001";
  const first = await commerce.createOrder(input(v.id), key);
  const second = await commerce.createOrder(input(v.id), key);
  assert.equal(first.order.id, second.order.id); assert.equal(first.accessToken, second.accessToken);
  assert.equal((await db.variant.findUniqueOrThrow({ where: { id: v.id } })).stock, 4);
  await assert.rejects(() => commerce.createOrder(input(v.id, 2), key), /different request/);
});
test("invalid quantities and duplicate lines cannot bypass validation", async () => {
  const v = await variant();
  for (const quantity of [0, -1, 1.5, 101]) await assert.rejects(() => commerce.createOrder(input(v.id, quantity), "invalid-quantity-0001"));
  const order = input(v.id); order.items.push({ variantId: v.id, quantity: 1 });
  await assert.rejects(() => commerce.createOrder(order, "duplicate-items-0001"), /duplicate/);
  await assert.rejects(() => commerce.createOrder({ ...input(v.id), items: [null] }, "null-order-item-0001"), /Invalid order item/);
});
test("oversold and multi-line failed orders roll back every stock reservation", async () => {
  const a = await variant(3); const b = await variant(0);
  await assert.rejects(() => commerce.createOrder({ ...input(a.id), items: [{ variantId: a.id, quantity: 2 }, { variantId: b.id, quantity: 1 }] }, "rollback-stock-0001"), /stock/);
  assert.equal((await db.variant.findUniqueOrThrow({ where: { id: a.id } })).stock, 3);
});
test("parallel buyers cannot both reserve the last unit", async () => {
  const v = await variant(1);
  const results = await Promise.allSettled([commerce.createOrder(input(v.id), "parallel-buyer-0001"), commerce.createOrder(input(v.id), "parallel-buyer-0002")]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal((await db.variant.findUniqueOrThrow({ where: { id: v.id } })).stock, 0);
  assert.equal(await db.orderItem.count({ where: { variantId: v.id } }), 1);
});
test("payment events and cancellation are idempotent; failure restores stock", async () => {
  const a = await variant(3); const success = await commerce.createOrder(input(a.id), "payment-success-0001");
  assert.equal((await commerce.testPayment(success.order.id, "event-success-1", "success")).status, "PAID");
  assert.equal((await commerce.testPayment(success.order.id, "event-success-1", "success")).status, "PAID");
  await assert.rejects(() => commerce.testPayment(success.order.id, "event-success-1", "failure"), /conflict/);
  await assert.rejects(() => commerce.changeOrder(success.order.id, "CANCELLED"), /transition/);
  assert.equal((await commerce.changeOrder(success.order.id, "SHIPPED")).status, "SHIPPED");
  const failure = await commerce.createOrder(input(a.id), "payment-failure-0001");
  await commerce.testPayment(failure.order.id, "event-failure-1", "failure");
  await commerce.testPayment(failure.order.id, "event-failure-1", "failure");
  assert.equal((await db.variant.findUniqueOrThrow({ where: { id: a.id } })).stock, 2);
  const cancelled = await commerce.createOrder(input(a.id), "cancelled-order-0001");
  await commerce.changeOrder(cancelled.order.id, "CANCELLED"); await commerce.changeOrder(cancelled.order.id, "CANCELLED");
  assert.equal((await db.variant.findUniqueOrThrow({ where: { id: a.id } })).stock, 2);
  await assert.rejects(() => commerce.testPayment(cancelled.order.id, "late-payment-1", "success"), /cannot accept/);
});
test("products and orders persist after database reconnect", async () => {
  const v = await variant(); const receipt = await commerce.createOrder(input(v.id), "persistent-order-0001");
  await db.$disconnect();
  assert.equal((await commerce.readOrder(receipt.order.id, receipt.accessToken)).total, v.price);
});
test("concurrent retries create one order and one payment event", async () => {
  const v = await variant(3); const key = "concurrent-retry-0001";
  const receipts = await Promise.all([commerce.createOrder(input(v.id), key), commerce.createOrder(input(v.id), key)]);
  assert.equal(receipts[0].order.id, receipts[1].order.id);
  assert.equal((await db.variant.findUniqueOrThrow({ where: { id: v.id } })).stock, 2);
  const id = receipts[0].order.id;
  const payments = await Promise.all([commerce.testPayment(id, "parallel-payment-event", "success"), commerce.testPayment(id, "parallel-payment-event", "success")]);
  assert.ok(payments.every((p) => p.status === "PAID"));
  assert.equal(await db.paymentEvent.count({ where: { orderId: id } }), 1);
});

let foundationActor: Awaited<ReturnType<typeof auth.adminIdentity>>;
test("foundation roles enforce grants, revoke permissions immediately and protect the last owner",async()=>{
  const governance=await import("../lib/governance");
  const ownerRole=await db.role.create({data:{slug:"owner",name:"Owner",permissionsJson:'["*"]'}});
  await db.admin.create({data:{email:"foundation-owner@example.test",name:"Owner",roleId:ownerRole.id,passwordHash:auth.hashPassword("foundation-owner-1234")}});
  foundationActor=await auth.adminIdentity(await auth.login("foundation-owner@example.test","foundation-owner-1234"));
  const role=await governance.saveRole(foundationActor,{name:"Test operator",permissions:["logs.view"]});
  const operator=await governance.saveAdministrator(foundationActor,{name:"Operator",email:"foundation-operator@example.test",password:"foundation-operator-1234",roleId:role.id});
  const token=await auth.login(operator.email,"foundation-operator-1234");
  assert.equal(await auth.requireAdmin(token,"logs.view"),operator.id);
  await assert.rejects(()=>auth.requireAdmin(token,"roles.manage"),/permission/);
  await governance.saveRole(foundationActor,{id:role.id,name:"Restricted",permissions:[]});
  await assert.rejects(()=>auth.requireAdmin(token,"logs.view"),/permission/);
  await assert.rejects(()=>governance.saveRole({...foundationActor,permissions:["roles.manage"]},{name:"Escalation",permissions:["admins.manage"]}),/cannot grant/);
  await assert.rejects(()=>governance.saveAdministrator(foundationActor,{id:foundationActor.id,name:"Owner",email:foundationActor.email,roleId:ownerRole.id,active:false}),/at least one/);
});
test("foundation settings and SEO are persisted without exposing credentials",async()=>{
  const governance=await import("../lib/governance");
  await governance.saveSettings(foundationActor,{storeName:"Configured business",contactEmail:"",maintenance:true,lowStockThreshold:4});
  await governance.saveSettings(foundationActor,{seoTitle:"Configured SEO",seoDescription:"Configured description",siteUrl:"https://example.test",allowIndexing:false},true);
  const site=await governance.settings();assert.equal(site.storeName,"Configured business");assert.equal(site.seoTitle,"Configured SEO");assert.equal(site.maintenance,true);
  await governance.saveSettings(foundationActor,{...site,maintenance:false});
});
test("foundation password change requires the old password and revokes all sessions",async()=>{
  const governance=await import("../lib/governance");
  const token=await auth.login("foundation-owner@example.test","foundation-owner-1234");
  await assert.rejects(()=>governance.changePassword(foundationActor,{currentPassword:"wrong",newPassword:"foundation-new-1234"}),/incorrect/);
  await governance.changePassword(foundationActor,{currentPassword:"foundation-owner-1234",newPassword:"foundation-new-1234"});
  await assert.rejects(()=>auth.requireAdmin(token),/expired/);
  assert.ok(await auth.requireAdmin(await auth.login("foundation-owner@example.test","foundation-new-1234")));
  const logs=JSON.stringify(await db.auditLog.findMany());assert.ok(logs.includes("administrator.password"));assert.ok(!logs.includes("foundation-new-1234"));assert.ok(!logs.includes(token));
});
