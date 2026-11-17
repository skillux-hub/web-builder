import { cookies } from "next/headers";
import { adminIdentity, login, logout } from "./auth";
import { adminCore } from "./admin-core-api";
import { body } from "./http";
import { sessionCookie, sessionToken } from "./admin-http";
import { permissionLabels } from "./permissions";
import { businessAdmin } from "./business-admin";
export async function extensionRoute(request: Request, path: string[]): Promise<Response | null> {
  if (path[0] !== "admin") return null;
  const reply = (value: unknown) => Response.json(value, { headers: { "cache-control": "no-store" } });
  if (path.join("/") === "admin/session") {
    if (request.method === "POST") {
      const input = await body(request); const token = await login(input.email, input.password);
      (await cookies()).set(sessionCookie, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 3600 });
      return reply({ authenticated: true });
    }
    if (request.method === "DELETE") { await logout(await sessionToken()); (await cookies()).delete(sessionCookie); return reply({ authenticated: false }); }
    if (request.method === "GET") return reply({ authenticated: true, admin: await adminIdentity(await sessionToken()), permissions: permissionLabels });
  }
  const actor = await adminIdentity(await sessionToken());
  return await adminCore(request, path, actor) ?? await businessAdmin(request, path, actor);
}
