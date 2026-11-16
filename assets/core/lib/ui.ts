import config from "../site.config.json";
export { config };
export const zh = config.locale.toLowerCase().startsWith("zh");
export const tr = (cn: string, en: string) => zh ? cn : en;
export async function api(path: string, options: RequestInit = {}) {
  const response = await fetch("/api/" + path, { ...options, headers: { "content-type": "application/json", ...options.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}
