import { extensionRoute } from "@/lib/extension-routes";
import { BusinessError } from "@/lib/errors";
import { body, checkOrigin } from "@/lib/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: Request, context: Context) {
  try {
    const { path } = await context.params;
    if (request.method !== "GET") checkOrigin(request);
    const reply = (value: unknown) => Response.json(value, { headers: { "cache-control": "no-store" } });
    const extension = await extensionRoute(request, path);
    if (extension) return extension;
    throw new BusinessError("Route not found", 404);
  } catch (error) {
    if (error instanceof BusinessError) return Response.json({ error: error.message }, { status: error.status });
    console.error("Request failed", error instanceof Error ? error.name : "UnknownError");
    return Response.json({ error: "Request failed" }, { status: 500 });
  }
}
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
