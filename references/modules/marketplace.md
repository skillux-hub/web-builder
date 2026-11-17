# Seller onboarding, transaction allocation, and settlement

Reuse [Directory](directory.md) for searchable offers, [Authentication](authentication.md) for buyer/seller identities, and [Commerce](commerce.md) for server-authoritative transactions. Offer models follow actual goods/services; the single-store scaffold does not supply seller partitioning or settlements.

Use [After-sales](after-sales.md) for selected cases/refunds, [Notifications](notifications.md) for requested notices and [Files](files.md) for private seller documents/evidence. [Tenancy](tenancy.md) applies when sellers have real multi-member organizations; a seller ID alone does not require or implement a tenant system. Directory/commerce share [Taxonomy](taxonomy.md) and [Search](search.md) rules within seller/public visibility constraints.

## Models and actions

Define sellers/businesses, seller-workspace membership, onboarding/review state, owned offers, buyer orders and seller allocations/suborders, fulfillment/refunds, fee rules with historical snapshots, ledger entries, settlement batches, payout attempts, and reconciliation references as needed. Preserve historical seller/offer/order associations. Establish cross-seller checkout and shipping/discount/tax/refund/fee allocation from actual requirements.

Buyer, seller, and platform-admin APIs have independent permissions. Derive seller scope from verified workspace membership, not a client sellerId. Apply ownership to reads, writes, counts, reports, exports, files, and customer details. Suspension prevents the selected new activity while preserving legitimate processing of existing orders.

## States and money handling

Onboarding progresses submitted -> under review -> approved/rejected/suspended. Offers follow draft/review/published/unpublished rules. Buyer collection follows [Payments](payments.md); fulfillment follows selected [Shipping](shipping.md) or [Bookings](bookings.md) rules.

Use immutable allocation snapshots and idempotent ledger entries for platform fees and seller amounts. Distinguish collected, pending release, available, payout requested/processing/paid/failed, and refund/reversal states according to the actual provider/business model. Buyer payment success is not seller payout success. Retries, repeated callbacks, partial refunds, disputes, and timeouts reconcile once without duplicate transfers or overwritten history. During implementation verify marketplace/payout capabilities in current official provider documentation; ordinary checkout support does not establish them.

## Acceptance

Use two sellers and a buyer to exercise onboarding, publication, allocation, isolation, fees, fulfillment, refunds, and payout/reconciliation. Compare ledger/allocations with the server-derived order amount and agreed fee/refund policy. Missing provider configuration leaves external disbursement unverified; local/sandbox verification must not send real payouts. Seller menus or a sellerId column alone do not implement a marketplace.
