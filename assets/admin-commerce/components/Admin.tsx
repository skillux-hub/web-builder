"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api, config, money, tr, type Product, type Order } from "@/lib/ui";
import { AdminSystem } from "./AdminSystem";
import { allowed } from "@/lib/permissions";
type Draft = { id?: string; name: string; description: string; image: string; category: string; active: boolean; variants: { sku: string; size: string; color: string; price: number; stock: number }[] };
const blank = (): Draft => ({ name: "", description: "", image: "", category: "", active: true, variants: [{ sku: "", size: "", color: "", price: 0, stock: 0 }] });
export function Admin() {
  const router = useRouter(); const authenticated = true;
  const [permissions,setPermissions]=useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [draft, setDraft] = useState<Draft>(blank);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("products");
  async function refresh() {
    const session=await api("admin/session");setPermissions(session.admin.permissions);
    const [p,o]=await Promise.all([allowed(session.admin.permissions,"catalog.view")?api("admin/products"):null,allowed(session.admin.permissions,"orders.view")?api("admin/orders"):null]);
    setProducts(p?.products||[]);setOrders(o?.orders||[]);
  }
  useEffect(() => { refresh().catch(() => router.replace("/admin/login")); }, []);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try { await api("admin/products", { method: "POST", body: JSON.stringify(draft) }); setMessage(tr("已保存，前台已更新", "Saved; storefront data updated")); setDraft(blank()); await refresh(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function transition(id: string, status: string) {
    setError(""); setBusy(true);
    try { await api(`admin/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); await refresh(); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <div className="admin-shell"><header><strong>{config.brand} · {tr("管理后台", "Admin")}</strong><nav>{[["roles","Roles & permissions","roles.manage"],["administrators","Administrators","admins.manage"],["logs","Audit logs","logs.view"],["settings","System settings","settings.manage"],["seo","SEO","seo.manage"],["password","Change password",""]].filter(([, ,p])=>!p||allowed(permissions,p)).map(([id,label])=><button key={id} onClick={()=>setTab(id)}>{label}</button>)}<a href="/">{tr("查看前台", "View store")}</a>{authenticated && <><button className="secondary" onClick={() => setTab("products")}>{tr("商品与库存", "Products & inventory")}</button><button className="secondary" onClick={() => { setTab("orders"); refresh().catch((e) => setError(e.message)); }}>{tr("订单", "Orders")}</button><button className="secondary" onClick={async () => { try { await api("admin/session", { method: "DELETE" }); setProducts([]); setOrders([]); router.replace("/admin/login"); router.refresh(); } catch (e) { setError((e as Error).message); } }}>{tr("退出", "Sign out")}</button></>}</nav></header><main>
    {error && <p className="error" role="alert">{error}</p>}{message && <p className="success" role="status">{message}</p>}
    {<>
      {tab === "products" && allowed(permissions,"catalog.view") && <><h1>{tr("商品与库存", "Products & inventory")}</h1><div className="columns"><section className="panel"><button onClick={() => setDraft(blank())}>{tr("新增商品", "New product")}</button>{products.map((p) => <button className="list-button" key={p.id} onClick={() => setDraft({ id: p.id, name: p.name, description: p.description, image: p.image, category: p.category.name, active: p.active, variants: p.variants.filter((v) => v.active).map(({ sku, size, color, price, stock }) => ({ sku, size, color, price, stock })) })}>{p.name} · {p.active ? tr("上架", "Active") : tr("下架", "Hidden")}<br /><small>{p.variants.filter((v) => v.active).map((v) => `${v.size}/${v.color}: ${v.stock}`).join(" · ")}</small></button>)}</section><form className="panel" onSubmit={save}><h2>{draft.id ? tr("编辑商品", "Edit product") : tr("新增商品", "New product")}</h2><label>{tr("商品名称", "Product name")}<input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></label><label>{tr("分类", "Category")}<input required value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} /></label><label>{tr("商品描述", "Description")}<textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></label><label>{tr("图片地址", "Image URL")}<input value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} /></label><label><input type="checkbox" style={{ display: "inline", width: "auto" }} checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> {tr("上架", "Active")}</label><p className="muted">{tr("价格使用最小货币单位，例如人民币分。", "Prices use the smallest currency unit, e.g. cents.")}</p>{draft.variants.map((v, i) => <div className="variant" key={i}><div className="variant-grid">{([ ["sku", "SKU"], ["size", tr("尺码", "Size")], ["color", tr("颜色", "Color")], ["price", tr("价格", "Price")], ["stock", tr("库存", "Stock")] ] as const).map(([key, label]) => <label key={key}>{label}<input required type={key === "price" || key === "stock" ? "number" : "text"} min="0" step="1" value={v[key]} onChange={(e) => { const variants = [...draft.variants]; variants[i] = { ...v, [key]: key === "price" || key === "stock" ? Number(e.target.value) : e.target.value }; setDraft({ ...draft, variants }); }} /></label>)}</div>{draft.variants.length > 1 && <button type="button" className="secondary" onClick={() => setDraft({ ...draft, variants: draft.variants.filter((_, n) => n !== i) })}>{tr("移除规格", "Remove variant")}</button>}</div>)}<div className="row"><button type="button" className="secondary" onClick={() => setDraft({ ...draft, variants: [...draft.variants, { sku: "", size: "", color: "", price: 0, stock: 0 }] })}>{tr("添加规格", "Add variant")}</button><button disabled={busy}>{tr("保存商品", "Save product")}</button></div></form></div></>}
      {tab === "orders" && allowed(permissions,"orders.view") && <><h1>{tr("订单管理", "Orders")}</h1><p className="notice">{tr("本地测试订单，不代表实际收款。", "Local test orders do not represent real payments.")}</p><section className="orders">{orders.map((order) => <article className="panel" key={order.id}><h2>{order.id}</h2><p>{order.customerName} · {order.email}</p><p>{order.address}</p><p><strong>{money(order.total)} · {order.status}</strong></p>{order.items.map((item, i) => <p key={i}>{item.name} · {item.size}/{item.color} × {item.quantity}</p>)}{order.status === "PENDING" && <button disabled={busy} onClick={() => transition(order.id, "CANCELLED")}>{tr("取消并返还库存", "Cancel & restore stock")}</button>}{order.status === "PAID" && <button disabled={busy} onClick={() => transition(order.id, "SHIPPED")}>{tr("标记已发货", "Mark shipped")}</button>}</article>)}{!orders.length && <p>{tr("暂无订单", "No orders yet")}</p>}</section></>}
    </>}
    {["roles","administrators","logs","settings","seo","password"].includes(tab)&&<AdminSystem key={tab} tab={tab}/>}
  </main></div>;
}
