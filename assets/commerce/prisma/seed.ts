import { defaultRoles } from "../lib/permissions";
import { db } from "../lib/db";
import { hashPassword } from "../lib/auth";
async function seed() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) throw new Error("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters in .env");
  for (const role of defaultRoles) await db.role.upsert({where:{slug:role.slug},create:{slug:role.slug,name:role.name,permissionsJson:JSON.stringify(role.permissions)},update:{}});
  const owner=await db.role.findUniqueOrThrow({where:{slug:"owner"}});
  const admin=await db.admin.upsert({where:{email},create:{email,name:"Owner",roleId:owner.id,passwordHash:hashPassword(password)},update:{}});
  if(!admin.roleId) await db.admin.update({where:{id:admin.id},data:{roleId:owner.id}});
  const category = await db.category.upsert({ where: { name: "Demo / 演示商品" }, create: { name: "Demo / 演示商品" }, update: {} });
  if (await db.product.count() === 0) await db.product.create({ data: {
    name: "Demo cotton shirt / 演示棉衬衫", description: "Sample product for local testing. Replace with your own catalogue.",
    categoryId: category.id, variants: { create: [
      { sku: "DEMO-S-WHITE", size: "S", color: "White", price: 9900, stock: 8 },
      { sku: "DEMO-M-WHITE", size: "M", color: "White", price: 9900, stock: 12 },
      { sku: "DEMO-M-BLACK", size: "M", color: "Black", price: 10900, stock: 4 },
    ] },
  } });
  console.log("Local database ready. Existing accounts, products and orders were preserved.");
}
seed().finally(() => db.$disconnect());
