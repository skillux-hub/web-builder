import { db } from "./db";
import { products, saveProduct, changeOrder, publicOrder } from "./commerce";
import { audit, authorize, type Actor } from "./governance";
import { body } from "./http";
export async function businessAdmin(request: Request, path: string[], actor: Actor): Promise<Response | null> {
  const route = path.join("/"); const method = request.method;
  const reply = (value: unknown) => Response.json(value, { headers: { "cache-control": "no-store" } });
  if (route === "admin/products" && method === "GET") {authorize(actor,"catalog.view");return reply({products:await products(true)});}
      if (route === "admin/products" && method === "POST") {authorize(actor,"catalog.manage");const product=await saveProduct(await body(request));await audit(actor,"product.save",product.id);return reply({product});}
      if (route === "admin/orders" && method === "GET") {authorize(actor,"orders.view");return reply({ orders: (await db.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 200 })).map(publicOrder) });}
      if (path.length === 3 && path[1] === "orders" && method === "PATCH") {authorize(actor,"orders.manage");const order=await changeOrder(path[2],(await body(request)).status);await audit(actor,"order.status",order.id,{status:order.status});return reply({order});}
  return null;
}
