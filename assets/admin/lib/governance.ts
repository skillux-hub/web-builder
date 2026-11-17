import { db } from "./db";
import { adminIdentity, digest, hashPassword, verifyPassword } from "./auth";
import { allowed, permissionLabels, permissionList, type Permission } from "./permissions";
import { BusinessError, text } from "./errors";
import { defaultSettings, settings } from "./settings";
export { defaultSettings, settings } from "./settings";
export type Actor = Awaited<ReturnType<typeof adminIdentity>>;
export function authorize(actor: Actor, permission: Permission) { if (!allowed(actor.permissions,permission)) throw new BusinessError("You do not have permission for this action",403); }
export async function audit(actor: Actor, action: string, target = "", details: Record<string,unknown> = {}) {
  await db.auditLog.create({ data: { actorId: actor.id, actor: actor.email, action, target, details: JSON.stringify(details) } });
}
function grantable(actor: Actor, raw: unknown) {
  if (!Array.isArray(raw) || raw.some(p=>typeof p!=="string" || !(p==="*" || Object.hasOwn(permissionLabels,p)))) throw new BusinessError("Invalid permission list");
  const list=[...new Set(raw)] as string[];
  if (list.some(p=>!allowed(actor.permissions,p))) throw new BusinessError("You cannot grant a permission you do not hold",403);
  return list;
}
export async function saveRole(actor:Actor,input:Record<string,unknown>) {
  authorize(actor,"roles.manage"); const name=text(input.name,"role name",80); const permissions=grantable(actor,input.permissions);
  const id=typeof input.id==="string"?input.id:undefined;
  if(id){const existing=await db.role.findUnique({where:{id}});if(!existing)throw new BusinessError("Role not found",404);if(existing.slug==="owner")throw new BusinessError("The Owner role is protected",409);}
  const role=id?await db.role.update({where:{id},data:{name,permissionsJson:JSON.stringify(permissions)}}):await db.role.create({data:{slug:"custom-"+crypto.randomUUID(),name,permissionsJson:JSON.stringify(permissions)}});
  await audit(actor,"role.save",role.id,{name,permissions}); return role;
}
export async function removeRole(actor:Actor,id:string){authorize(actor,"roles.manage");const role=await db.role.findUnique({where:{id},include:{_count:{select:{admins:true}}}});if(!role)throw new BusinessError("Role not found",404);if(role.slug==="owner"||role._count.admins)throw new BusinessError("Protected or assigned roles cannot be deleted",409);await db.role.delete({where:{id}});await audit(actor,"role.delete",id);}
export async function saveAdministrator(actor:Actor,input:Record<string,unknown>){
  if(input.active!==undefined&&typeof input.active!=="boolean")throw new BusinessError("Invalid account status");
  authorize(actor,"admins.manage"); const id=typeof input.id==="string"?input.id:undefined;
  const email=text(input.email,"email",254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new BusinessError("Invalid email");
  const name=text(input.name,"name",100);const roleId=text(input.roleId,"role");const role=await db.role.findUnique({where:{id:roleId}});if(!role)throw new BusinessError("Role not found",404);grantable(actor,permissionList(role.permissionsJson));
  const active=input.active!==false;const password=typeof input.password==="string"?input.password:"";
  if((!id||password)&&(password.length<12||password.length>256))throw new BusinessError("Password must be 12–256 characters");
  try {const result=await db.$transaction(async tx=>{
    if(id){const previous=await tx.admin.findUnique({where:{id},include:{role:true}});if(!previous)throw new BusinessError("Administrator not found",404);
      if(previous.role?.slug==="owner"&&previous.active&&(!active||role.slug!=="owner")){
        const owners=await tx.admin.count({where:{active:true,role:{slug:"owner"}}});if(owners<=1)throw new BusinessError("Keep at least one active Owner",409);
      }
    }
    const data={email,name,roleId,active,...(password?{passwordHash:hashPassword(password)}:{})};
    const admin=id?await tx.admin.update({where:{id},data}):await tx.admin.create({data:{...data,passwordHash:hashPassword(password)}});
    if(id&&(!active||password))await tx.adminSession.deleteMany({where:{adminId:id}});
    return {id:admin.id,email:admin.email,name:admin.name,active:admin.active,roleId:admin.roleId};
  });await audit(actor,"administrator.save",result.id,{email,name,roleId,active,passwordChanged:!!password});return result;
  }catch(error){if((error as {code?:string}).code==="P2002")throw new BusinessError("This administrator email is already in use",409);throw error;}
}
export async function changePassword(actor:Actor,input:Record<string,unknown>){
  const old=text(input.currentPassword,"current password",256),next=text(input.newPassword,"new password",256);if(next.length<12)throw new BusinessError("Use at least 12 characters");if(old===next)throw new BusinessError("Choose a different password");
  const admin=await db.admin.findUniqueOrThrow({where:{id:actor.id}});if(!verifyPassword(old,admin.passwordHash))throw new BusinessError("Current password is incorrect",400);
  await db.$transaction([db.admin.update({where:{id:actor.id},data:{passwordHash:hashPassword(next)}}),db.adminSession.deleteMany({where:{adminId:actor.id}})]);
  await audit(actor,"administrator.password",actor.id,{sessionsRevoked:true});
}
export async function saveSettings(actor:Actor,input:Record<string,unknown>,seo=false){
  authorize(actor,seo?"seo.manage":"settings.manage");const current=await settings();const next={...current};
  if(seo){next.seoTitle=text(input.seoTitle,"SEO title",120);next.seoDescription=text(input.seoDescription,"SEO description",320);next.siteUrl=typeof input.siteUrl==="string"?input.siteUrl.trim():"";if(next.siteUrl){try{if(new URL(next.siteUrl).protocol!=="https:")throw new Error();}catch{throw new BusinessError("Site URL must use HTTPS");}}next.allowIndexing=input.allowIndexing===true;}
  else{next.storeName=text(input.storeName,"store name",100);next.contactEmail=typeof input.contactEmail==="string"?input.contactEmail.trim():"";if(next.contactEmail&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.contactEmail))throw new BusinessError("Invalid contact email");next.maintenance=input.maintenance===true;const n=Number(input.lowStockThreshold);if(!Number.isInteger(n)||n<0||n>1000)throw new BusinessError("Invalid low-stock threshold");next.lowStockThreshold=n;}
  await db.systemSetting.upsert({where:{key:"site"},create:{key:"site",value:JSON.stringify(next)},update:{value:JSON.stringify(next)}});await audit(actor,seo?"seo.save":"settings.save","site",{fields:seo?["seoTitle","seoDescription","siteUrl","allowIndexing"]:["storeName","contactEmail","maintenance","lowStockThreshold"]});return next;
}
