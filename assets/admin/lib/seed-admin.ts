import { defaultRoles } from "./permissions";
import { db } from "./db";
import { hashPassword } from "./auth";
export async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error("Configure ADMIN_EMAIL and ADMIN_PASSWORD in .env");
  for (const role of defaultRoles) await db.role.upsert({where:{slug:role.slug},create:{slug:role.slug,name:role.name,permissionsJson:JSON.stringify(role.permissions)},update:{}});
  const owner=await db.role.findUniqueOrThrow({where:{slug:"owner"}});
  const admin=await db.admin.upsert({where:{email},create:{email,name:"Owner",roleId:owner.id,passwordHash:hashPassword(password)},update:{}});
  if(!admin.roleId) await db.admin.update({where:{id:admin.id},data:{roleId:owner.id}});

}
