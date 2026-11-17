import { extensionRoute } from "@/lib/extension-routes";
import { timingSafeEqual } from "node:crypto";
import { products, createOrder, readOrder, testPayment } from "@/lib/commerce";
import { BusinessError } from "@/lib/errors";
import { body, checkOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: Request, context: Context) {
  try {
    const { path } = await context.params;
    const route = path.join("/");
    const method = request.method;
    if (method !== "GET") checkOrigin(request);
    const reply = (value: unknown, status = 200) => Response.json(value, { status, headers: { "cache-control": "no-store" } });
    const extension = await extensionRoute(request, path);
    if (extension) return extension;
    if (route === "products" && method === "GET") return reply({ products: await products() });
    if (route === "orders" && method === "POST") return reply(await createOrder(await body(request), request.headers.get("idempotency-key")), 201);
    if (path[0] === "orders" && path.length >= 2) {
      const token = request.headers.get("x-order-token") || "";
      const order = await readOrder(path[1], token);
      if (path.length === 2 && method === "GET") return reply({ order });
      if (path.length === 3 && path[2] === "test-payment" && method === "POST") {
        const input = await body(request);
        return reply({ order: await testPayment(order.id, input.eventId, input.outcome), mode: "test" });
      }
    }
    if (route === "test-payments" && method === "POST") {
      const expected = process.env.TEST_PAYMENT_SECRET || "";
      const supplied = request.headers.get("x-test-payment-secret") || "";
      if (expected.length < 32 || Buffer.byteLength(expected) !== Buffer.byteLength(supplied) || !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) throw new BusinessError("Invalid test payment secret", 401);
      const input = await body(request);
      if (typeof input.orderId !== "string") throw new BusinessError("Missing order id");
      return reply({ order: await testPayment(input.orderId, input.eventId, input.outcome), mode: "test" });
    }
    throw new BusinessError("Route not found", 404);
  } catch (error) {
    if (error instanceof BusinessError) return Response.json({ error: error.message }, { status: error.status });
    console.error("Business request failed", error instanceof Error ? error.name : "UnknownError");
    return Response.json({ error: "Request failed; retry or check server logs" }, { status: 500 });
  }
}
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
