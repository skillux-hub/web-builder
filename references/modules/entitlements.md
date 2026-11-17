# Access entitlements and usage allowances

Use for access to paid/private content, lessons, product features, downloads or usage quotas. [Authentication](authentication.md) proves identity; this module decides which resources/actions/allowances that identity currently has. Ordinary public pages do not require an entitlement system.

## Data and enforcement

Record subject (account, organization or verified guest), resource/feature scope, source (purchase, enrollment, subscription, manual grant), effective/expiry times, grant/revocation state and quantity/usage where applicable. Preserve source IDs and history. Subscription renewal can extend a valid grant; refunds, suspension and cancellation affect it according to the recorded business policy, not an assumed blanket rule.

Check active grants server-side on protected queries, downloads and execution actions. Hiding a button or trusting a stale session claim is insufficient. Cache invalidation must respect revocation/expiry. Use [Files](files.md) for private download access and [Tenancy](tenancy.md) when grants belong to an organization; seats and organization-wide grants are distinct policies.

For limited usage, model reserve -> consume/release with atomic quantity validation and idempotent request keys. Failed/cancelled execution follows the agreed release policy. Concurrent requests cannot spend the last allowance twice. Free/manual grants need neither a payment integration nor a subscription.

## Acceptance

Verify a permitted action, other-subject denial, source-based grant creation, expiry, revocation and any renewal/refund effects. Check direct APIs and signed-download creation, not just menus. For quotas, exercise concurrency, retries and failure release, and compare persisted usage with actual completed work.
