import config from "../site.config.json";
export { config };
export const zh = config.locale.toLowerCase().startsWith("zh");
export const tr = (cn: string, en: string) => zh ? cn : en;
const fraction = new Intl.NumberFormat(config.locale, { style: "currency", currency: config.currency }).resolvedOptions().maximumFractionDigits ?? 2;
export const money = (minor: number) => new Intl.NumberFormat(config.locale, { style: "currency", currency: config.currency }).format(minor / (10 ** fraction));
export async function api(path: string, options: RequestInit = {}) {
  const response = await fetch("/api/" + path, { ...options, headers: { "content-type": "application/json", ...options.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}
export type Variant = { id: string; sku: string; size: string; color: string; price: number; stock: number; active: boolean };
export type Product = { id: string; name: string; description: string; image: string; active: boolean; category: { name: string }; variants: Variant[] };
export type Order = { id: string; customerName: string; email: string; address: string; currency: string; total: number; status: string; items: { name: string; size: string; color: string; quantity: number; unitPrice: number }[] };
