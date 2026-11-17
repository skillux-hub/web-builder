# Catalog, inventory, cart, and orders

Use for actual selling/ordering. A product showcase or template cart is insufficient evidence. Keep existing module IDs such as products, inventory, cart, and orders in the brief.

Model categories, products, images, variants/SKUs, minor-unit prices, stock, cart, order lines/snapshots, and legal order transitions for the selected goods. Clothing needs independent size/color inventory. Guests can order without membership; use random order access keys. Add [Authentication](authentication.md) only when customer accounts are needed.

For admin-enabled stores, provide category/product/SKU maintenance, low-stock alerts, order state handling, shipment records when applicable, member status when membership is selected, and product SEO. Extend business permissions and logs for these operations; an admin menu alone is insufficient.

The server calculates prices/totals and reserves stock transactionally. Cart inputs contain SKU and quantity, not trusted prices. Repeated order submissions use persistent idempotency keys; conflicting payloads fail. Cancellation restores reserved stock exactly once. Verify last-unit concurrency and ownership, not just browsing.

Read [Payments](payments.md) for ecommerce defaults. Read [Shipping](shipping.md) only for physical fulfillment; digital goods need an authorized delivery workflow instead. Use [Content](content.md), [Media](media.md), [Lists](lists.md), and [SEO](seo.md) as applicable.

Optional --foundation commerce requires explicit orders and currency. The starter supplies example catalog/order/stock and simulated payments, not live providers, customer accounts, or template migration. Follow [Implementation](../implementation.md#optional-commerce-foundation-and-extensions) and verify admin change -> frontend variant/price -> cart -> checkout -> order -> permitted fulfillment/cancellation.
