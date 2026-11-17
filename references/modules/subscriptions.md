# Plans, subscription periods, and renewal

Use for recurring service access, including free plans/trials and confirmed paid subscriptions. Define subscriber identity, plan features/limits, billing period, trial, renewal, cancellation timing and grace policy. A subscriber can be a verified account, organization or other explicitly supported customer identity; selecting subscriptions does not automatically add customer registration or a paid provider.

## Data and transitions

Record plan/version and price/currency snapshots when paid, subscriber/provider IDs, subscription state, period start/end, trial/grace dates, scheduled changes, cancellation timing and event history. Model trialing/active/past-due/paused/cancelled/ended only as supported by the real business/provider. Separate a subscription's current state, the payment for an invoice/renewal, and the user's current access.

Use [Payments](payments.md) for confirmed online paid collection. Map verified provider events idempotently; repeated or late renewal/failure/cancellation notifications cannot extend a period twice or reverse a newer state. Query/reconcile provider state after ambiguous timeouts. Scheduled period-end cancellation and immediate revocation have different effects; implement the agreed policy. Plan changes, proration, coupons and tax are added only when required.

## Dependencies and acceptance

Use [Entitlements](entitlements.md) for actual feature/content/quota grants and expiry, and [Notifications](notifications.md) for requested notices. Protect billing changes with subscriber/organization authority; do not allow one member to change another organization's subscription.

Verify trial/start -> active -> renewal -> selected failed-payment/grace behavior -> cancellation/expiry and the corresponding access change. Test duplicate/out-of-order events, plan changes and persisted periods. A payment return page does not establish a renewed subscription; missing provider configuration remains unverified.
