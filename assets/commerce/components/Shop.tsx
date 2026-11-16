"use client";
import { useEffect, useState, type FormEvent } from "react";
import { api, config, money, tr, type Product, type Order } from "@/lib/ui";
type Cart = Record<string, number>;
type Receipt = { order: Order; accessToken: string };
export function Shop({ mode = "catalog", productId }: { mode?: "catalog" | "cart" | "orders"; productId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [busy, setBusy] = useState(false);
  const [chosen, setChosen] = useState<Record<string, string>>({});
  useEffect(() => {
    api("products").then((data) => { setProducts(data.products); setLoaded(true); }).catch((e) => setError(e.message));
    try {
      const saved = JSON.parse(localStorage.getItem("wb-cart") || "{}");
      if (saved && typeof saved === "object" && !Array.isArray(saved)) setCart(Object.fromEntries(Object.entries(saved).filter(([, n]) => typeof n === "number" && Number.isInteger(n) && n > 0 && n <= 100)) as Cart);
      const last = JSON.parse(localStorage.getItem("wb-last-order") || "null");
      if (last?.order?.id && typeof last.accessToken === "string") setReceipt(last);
    } catch { /* Ignore invalid local drafts; never trust them on the server. */ }
  }, []);
  function updateCart(next: Cart) { setCart(next); localStorage.setItem("wb-cart", JSON.stringify(next)); }
  const variants = products.flatMap((p) => p.variants.map((v) => ({ ...v, name: p.name })));
  const lines = Object.entries(cart).map(([id, quantity]) => ({ variant: variants.find((v) => v.id === id), id, quantity }));
  const total = lines.reduce((sum, line) => sum + (line.variant?.price || 0) * line.quantity, 0);
  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const values = new FormData(event.currentTarget);
    const input = { customerName: values.get("name"), email: values.get("email"), address: values.get("address"), items: lines.map((line) => ({ variantId: line.id, quantity: line.quantity })) };
    const signature = JSON.stringify(input);
    let pending: { signature: string; key: string } | null = null;
    try { pending = JSON.parse(localStorage.getItem("wb-checkout-key") || "null"); } catch { /* recreate */ }
    const key = pending?.signature === signature ? pending.key : crypto.randomUUID();
    localStorage.setItem("wb-checkout-key", JSON.stringify({ signature, key }));
    try {
      const result = await api("orders", { method: "POST", headers: { "idempotency-key": key }, body: JSON.stringify(input) });
      setReceipt(result); localStorage.setItem("wb-last-order", JSON.stringify(result)); updateCart({}); localStorage.removeItem("wb-checkout-key");
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function pay(outcome: "success" | "failure") {
    if (!receipt) return;
    setBusy(true); setError("");
    try {
      const result = await api(`orders/${receipt.order.id}/test-payment`, { method: "POST", headers: { "x-order-token": receipt.accessToken }, body: JSON.stringify({ eventId: crypto.randomUUID(), outcome }) });
      const next = { ...receipt, order: result.order }; setReceipt(next); localStorage.setItem("wb-last-order", JSON.stringify(next));
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); const values = new FormData(event.currentTarget);
    const id = String(values.get("orderId")); const token = String(values.get("token"));
    try { const result = await api(`orders/${encodeURIComponent(id)}`, { headers: { "x-order-token": token } }); setReceipt({ order: result.order, accessToken: token }); }
    catch (e) { setError((e as Error).message); }
  }
  return <div className="storefront"><header><a href="/"><strong>{config.brand}</strong></a><nav><a href="/">{tr("商品", "Shop")}</a><a href="/cart">{tr("购物车", "Cart")} ({Object.values(cart).reduce((a, b) => a + b, 0)})</a><a href="/orders">{tr("订单查询", "Track order")}</a><a href="/admin">{tr("管理后台", "Admin")}</a></nav></header><main>
    <p className="notice">{tr("本地测试商城 · 支付为模拟测试，不会实际扣款。", "Local test store · Payments are simulated; no money is charged.")}</p>
    {error && <p role="alert" className="error">{error}</p>}{message && <p role="status" className="success">{message}</p>}
    {mode === "catalog" && <><div className="hero"><small>{config.brand}</small><h1>{tr("找到适合你的那一件", "Find your next favorite")}</h1><p>{tr("查看款式、颜色与尺码，选择你的日常所爱。", "Explore styles, colors and sizes for every day.")}</p></div>
      {!productId && <div className="filters"><input aria-label={tr("搜索商品", "Search products")} placeholder={tr("搜索商品…", "Search products…")} value={query} onChange={(e) => setQuery(e.target.value)} /><select aria-label={tr("分类", "Category")} value={category} onChange={(e) => setCategory(e.target.value)}><option value="">{tr("全部分类", "All categories")}</option>{[...new Set(products.map((p) => p.category.name))].map((name) => <option key={name}>{name}</option>)}</select></div>}
      <div className="grid">{products.filter((p) => (!productId || p.id === productId) && (!category || p.category.name === category) && p.name.toLowerCase().includes(query.toLowerCase())).map((product) => {
        const variant = product.variants.find((v) => v.id === chosen[product.id]) || product.variants[0];
        return <article key={product.id}><a href={`/products/${product.id}`} className="product-image">{product.image ? <img src={product.image} alt={product.name} /> : <span>{tr("商品图片待添加", "Product image coming soon")}</span>}</a><small>{product.category.name}</small><h2><a href={`/products/${product.id}`}>{product.name}</a></h2><p>{product.description}</p><p><strong>{variant ? money(variant.price) : tr("暂不可售", "Unavailable")}</strong></p><label>{tr("选择规格", "Choose a variant")}<select value={variant?.id || ""} onChange={(e) => setChosen({ ...chosen, [product.id]: e.target.value })}>{product.variants.map((v) => <option key={v.id} value={v.id}>{v.size} / {v.color} · {tr("库存", "Stock")} {v.stock}</option>)}</select></label><button disabled={!variant || variant.stock < 1} onClick={() => { if (variant) { updateCart({ ...cart, [variant.id]: Math.min(100, (cart[variant.id] || 0) + 1) }); setMessage(tr("已加入购物车", "Added to cart")); } }}>{tr("加入购物车", "Add to cart")}</button></article>;
      })}</div>{loaded && (!products.length || (productId && !products.some((p) => p.id === productId))) && <p>{tr("暂无商品", "No products found")}</p>}</>}
    {mode === "cart" && <section className="checkout"><h1>{tr("购物车与结账", "Cart & checkout")}</h1>{lines.map((line) => <div className="item" key={line.id}><strong>{line.variant?.name || tr("商品不可用", "Product unavailable")}</strong><p>{line.variant?.size} / {line.variant?.color}</p><div className="row"><input aria-label={tr("数量", "Quantity")} type="number" min="1" max="100" value={line.quantity} onChange={(e) => { const n = Number(e.target.value); if (Number.isInteger(n) && n > 0 && n <= 100) updateCart({ ...cart, [line.id]: n }); }} /><button className="secondary" onClick={() => { const next = { ...cart }; delete next[line.id]; updateCart(next); }}>{tr("移除", "Remove")}</button></div></div>)}<h2>{tr("商品合计", "Items total")} {money(total)}</h2><p className="muted">{tr("基础项目未计运费和税费，实际销售前需按业务配置。", "Shipping and tax are not configured in this foundation. Configure them before real sales.")}</p>{lines.length > 0 && <form onSubmit={checkout}><label>{tr("姓名", "Name")}<input name="name" required maxLength={200} /></label><label>Email<input name="email" type="email" required /></label><label>{tr("收货地址", "Shipping address")}<textarea name="address" required maxLength={1000} /></label><button disabled={busy || lines.some((line) => !line.variant)}>{busy ? tr("处理中…", "Working…") : tr("创建测试订单", "Create test order")}</button></form>}</section>}
    {mode === "orders" && <section className="checkout"><h1>{tr("订单查询", "Track your order")}</h1><form onSubmit={lookup}><label>{tr("订单号", "Order ID")}<input name="orderId" required defaultValue={receipt?.order.id} /></label><label>{tr("订单访问密钥", "Order access key")}<input name="token" required defaultValue={receipt?.accessToken} /></label><button>{tr("查询", "Look up")}</button></form></section>}
    {mode !== "catalog" && receipt && <section className="panel checkout"><h2>{tr("最近查询／创建的订单", "Last retrieved / created order")}</h2><p>{receipt.order.id}</p><p>{tr("状态", "Status")}: {receipt.order.status} · {money(receipt.order.total)}</p><p>{tr("请保存订单号和访问密钥，用于查询订单。", "Save the order ID and access key to retrieve your order.")}</p><details><summary>{tr("查看访问密钥", "Show access key")}</summary><pre>{receipt.accessToken}</pre></details>{receipt.order.items.map((item, i) => <p key={i}>{item.name} · {item.size}/{item.color} × {item.quantity}</p>)}{receipt.order.status === "PENDING" && <div className="row"><button disabled={busy} onClick={() => pay("success")}>{tr("模拟支付成功", "Simulate successful payment")}</button><button disabled={busy} className="secondary" onClick={() => pay("failure")}>{tr("模拟支付失败", "Simulate failed payment")}</button></div>}</section>}
  </main></div>;
}
