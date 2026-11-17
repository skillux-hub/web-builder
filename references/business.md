# Business requirements and scope

Collect brand, business, audience, market, website language/multilingual requirements, and the primary customer task. Reuse existing answers and distinguish user choices from defaults. Choose technical architecture without asking the client to select a database/framework.

Select a [website type](website-types.md), then relevant [functional modules](modules.md). A clothing store uses commerce with size/color SKUs; a clothing brand showcase can use business/content/inquiries without cart or payments. Other industries follow the actual workflow.

Determine single-page versus multi-page scope. Ask whether admin is needed for a single page unless already answered; other sites include admin by default unless explicitly declined. Record adminRequired and its source. Skip admin template selection/management features when not needed.

## Payment requirements and channels

Read [Payments](modules/payments.md) only for ecommerce or a noncommerce payment decision. Ecommerce requires payments, defaulting to WeChat Pay/Alipay for China and Stripe/PayPal elsewhere; explicit choices take precedence. For other businesses establish whether payments are needed. The module owns channel configuration, switching, and verification rules.

## Shipping service selection

Read [Shipping](modules/shipping.md#shipping-service-selection) only when fulfillment is needed. Establish actual origin/destination; conversation language alone does not establish a route. Reuse existing route/provider choices. The module owns route defaults, labels, tracking, and manual operations.

## Defaults

Use explicit region/country names. Website language is independent of conversation language and market. Nontransactional projects need no currency/shipping questionnaire. Transactions require a confirmed currency; record shipping-cost rules when applicable. Follow [Authentication](modules/authentication.md) when customer accounts or a private workspace are required; admin login alone does not imply customer membership.

Default new implementation foundations to SQLite, one initial admin role, and the documented stack while preserving compatible existing architecture. Prefer supplied brand assets. Label demonstration data and provisional values; do not invent credentials, qualifications, metrics, or confirmed choices. Membership, coupons, tax, refunds, multi-currency/warehouse, notifications, and integrations remain requirement-driven additions.
