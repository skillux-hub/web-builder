import { db } from "./db";
export async function seedCatalog() {
  const category = await db.category.upsert({ where: { name: "Demo / 演示商品" }, create: { name: "Demo / 演示商品" }, update: {} });
  if (await db.product.count() === 0) await db.product.create({ data: {
    name: "Demo cotton shirt / 演示棉衬衫", description: "Sample product for local testing. Replace with your own catalogue.",
    categoryId: category.id, variants: { create: [
      { sku: "DEMO-S-WHITE", size: "S", color: "White", price: 9900, stock: 8 },
      { sku: "DEMO-M-WHITE", size: "M", color: "White", price: 9900, stock: 12 },
      { sku: "DEMO-M-BLACK", size: "M", color: "Black", price: 10900, stock: 4 },
    ] },
  } });

}
