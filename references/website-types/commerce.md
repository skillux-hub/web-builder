# Ecommerce and online stores

Use for: Retail, physical/digital goods, direct online ordering. For transactions involving independent sellers and platform commissions/settlement, use [Marketplace](marketplace.md).

## Scope and workflow

Browse -> variants -> cart -> checkout -> order access -> fulfillment/cancellation.

## Module selection

commerce, payments, content, media, lists, seo; shipping only for shipped goods; authentication only for customer accounts.

Resolve these module names through the [module index](../modules.md); load only selected modules and their applicable dependencies. Suggested modules describe requirements, not prebuilt features.

## Admin and boundaries

Admin by default unless explicitly declined; define an alternative operational path if declined.

Record paymentRequired true without asking again. Confirm market/currency and physical/digital delivery; apply provider defaults in the modules. A showcase-only catalog belongs to business or directory.

## Acceptance

Admin SKU change -> public price/stock -> order -> payment sandbox -> permitted fulfillment, including duplicate and last-unit cases.

Use [Verification](../verification.md) for execution evidence and completion status.
