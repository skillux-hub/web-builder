import { adminCore } from "@/lib/admin-core-api";
import { adminIdentity } from "@/lib/auth";
import { audit, authorize, settings } from "@/lib/governance";
import { permissionLabels } from "@/lib/permissions";
import { cookies } from "next/headers";
import { login, logout, requireAdmin } from "@/lib/auth";
import { BusinessError } from "@/lib/errors";
import { body, checkOrigin, sessionCookie, sessionToken } from "@/lib/http";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: Request, context: Context) {
  try {
    const { path } = await context.params;
    if (request.method !== "GET") checkOrigin(request);
    const reply = (value: unknown) => Response.json(value, { headers: { "cache-control": "no-store" } });
    if (path.join("/") === "admin/session") {
      if (request.method === "POST") {
        const input = await body(request); const token = await login(input.email, input.password);
        (await cookies()).set(sessionCookie, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 3600 });
        return reply({ authenticated: true });
      }
      if (request.method === "DELETE") { await logout(await sessionToken()); (await cookies()).delete(sessionCookie); return reply({ authenticated: false }); }
      if (request.method === "GET") return reply({ authenticated:true, admin:await adminIdentity(await sessionToken()), permissions:permissionLabels });
    }
    // Add domain routes here. Every admin handler must verify the session server-side.
    if(path[0]==="admin"){const actor=await adminIdentity(await sessionToken());const result=await adminCore(request,path,actor);if(result)return result;}
    throw new BusinessError("Route not found", 404);
  } catch (error) {
    if (error instanceof BusinessError) return Response.json({ error: error.message }, { status: error.status });
    console.error("Request failed", error instanceof Error ? error.name : "UnknownError");
    return Response.json({ error: "Request failed" }, { status: 500 });
  }
}
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
