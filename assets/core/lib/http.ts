import { BusinessError } from "./errors";
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) throw new BusinessError("Cross-origin write rejected", 403);
}
export async function body(request: Request, maxBytes = 128000): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) {
          await reader.cancel();
          throw new BusinessError("请求内容过大，请缩小文件后重试", 413);
        }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value;
  } catch { throw new BusinessError("Expected a JSON object"); }
}
