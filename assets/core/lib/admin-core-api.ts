import { cookies } from "next/headers";
import { db } from "./db";
import { body, sessionCookie } from "./http";
import { authorize, saveRole, removeRole, saveAdministrator, changePassword, settings, saveSettings, type Actor } from "./governance";
import { permissionLabels, permissionList, allowed } from "./permissions";
import { BusinessError } from "./errors";
export async function adminCore(request:Request,path:string[],actor:Actor):Promise<Response|null>{
  const route=path.join("/"),method=request.method;
  const reply=(value:unknown)=>Response.json(value,{headers:{"cache-control":"no-store"}});
      if (route === "admin/roles" && method === "GET") { if(!allowed(actor.permissions,"roles.manage")&&!allowed(actor.permissions,"admins.manage"))throw new BusinessError("Permission denied",403); return reply({ roles: (await db.role.findMany({include:{_count:{select:{admins:true}}}})).map(r=>({...r,permissions:permissionList(r.permissionsJson)})), permissions:permissionLabels }); }
      if (route === "admin/roles" && method === "POST") return reply({ role:await saveRole(actor,await body(request)) });
      if (path.length===3 && path[1]==="roles" && method==="DELETE") { await removeRole(actor,path[2]);return reply({ok:true}); }
      if (route === "admin/administrators" && method === "GET") { authorize(actor,"admins.manage");return reply({administrators:await db.admin.findMany({select:{id:true,name:true,email:true,active:true,roleId:true,role:{select:{name:true}},createdAt:true}})}); }
      if (route === "admin/administrators" && method === "POST") return reply({administrator:await saveAdministrator(actor,await body(request))});
      if (route === "admin/password" && method === "POST") {await changePassword(actor,await body(request));(await cookies()).delete(sessionCookie);return reply({ok:true,signInRequired:true});}
      if (route === "admin/logs" && method === "GET") {authorize(actor,"logs.view");const q=(new URL(request.url).searchParams.get("q")||"").slice(0,100);return reply({logs:await db.auditLog.findMany({where:q?{OR:[{action:{contains:q}},{actor:{contains:q}},{target:{contains:q}}]}:{},orderBy:{createdAt:"desc"},take:100})});}
      if (route === "admin/settings" && method === "GET") {if(!allowed(actor.permissions,"settings.manage")&&!allowed(actor.permissions,"seo.manage"))throw new BusinessError("Permission denied",403);return reply({settings:await settings()});}
      if (route === "admin/settings" && method === "PATCH") return reply({settings:await saveSettings(actor,await body(request))});
      if (route === "admin/seo" && method === "PATCH") return reply({settings:await saveSettings(actor,await body(request),true)});
  return null;
}
