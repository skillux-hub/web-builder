# Multi-seller transactional marketplaces

Use when a platform hosts independent sellers/providers and processes transactions. Listings that only forward inquiries remain directory; one operator selling its own goods remains commerce.

## Scope and modules

Read [Marketplace](../modules/marketplace.md). Its dependencies include directory, authentication, and commerce, including payment requirements. Shipping is selected for shipped goods; bookings for scheduled services. Confirm the actual offer/order model and fee/settlement rules. Do not force service transactions into size/color SKU models.

## States and boundaries

Separate buyer access, seller workspaces, and platform administration. Onboarding follows submitted -> under review -> approved/rejected/suspended. Offers need ownership/publication rules; orders need seller-scoped fulfillment and platform oversight. Commission allocation and payout reconciliation are distinct from buyer payment success.

Admin follows the normal default unless declined. A seller workspace never grants platform-admin access. When admin is declined, identify the actual onboarding, moderation, dispute, and settlement workflow that replaces it.

## Acceptance

Approve seller -> publish offer -> buyer orders -> correct seller sees its portion -> platform fee allocation -> permitted fulfillment/refund and settlement reconciliation. A second seller cannot access another seller's offers, orders, customer details, payouts, counts, or exports. Verify retry/callback idempotency and suspension. The commerce foundation remains a single-store scaffold; seller isolation and settlements stay pending until implemented and verified. Follow [Verification](../verification.md).
