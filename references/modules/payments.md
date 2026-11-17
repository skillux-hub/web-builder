# Payments and channel management

Use [Subscriptions](subscriptions.md) for recurring service periods, [Entitlements](entitlements.md) for actual access effects, and [After-sales](after-sales.md) for selected refund/return cases. This module retains server payment creation, provider transaction verification and callback/reconciliation rules; payment success alone does not prove subscription renewal, entitlement delivery or refund completion.

Ecommerce requires payment integration: record `paymentRequired: true` with the ecommerce business rule as its source. Do not ask whether payments are needed. Use the confirmed market defaults without first asking the user to select channel switches:

- China: **WeChat Pay and Alipay**.
- Markets outside China: **Stripe and PayPal**.

Provide independent admin enable/disable controls. Record integration capability separately from the current enabled state. Explicit channel requirements take precedence; support the actual coverage of a cross-market business. Confirm only missing market, currency, or one-time/subscription decisions that affect implementation. Check current official documentation for merchant eligibility, regions, currencies, and channel capabilities; do not promise availability to every merchant.

For non-ecommerce businesses such as appointments, courses, subscriptions, or paid content, first establish whether online payments are needed, reusing any existing answer. If not, record `paymentRequired: false` and skip payment integrations, buttons, APIs, and simulated payment flows; retain actual inquiry or appointment workflows. If needed, recommend market-appropriate channels and confirm the real requirements. A template checkout button is not a confirmed payment requirement.

Record the payment requirement and source, market, currency, integrated channels, individual enabled states, collection model, and test/live status in `.web-builder/project.json`, never merchant secrets. Without credentials, complete ecommerce adapters and channel management, but keep incompletely configured channels unavailable. A toggle cannot bypass configuration validation. Distinguish unconfigured, disabled, test-ready, and live-ready states. Sandbox or simulated checks do not establish live collection. When all channels are unavailable, explain this at checkout; do not fake success or silently substitute another method. Changes to existing systems must preserve historical orders, payments, and confirmed channel settings.

## Admin channel controls

Ecommerce admin must manage payments, defaulting to WeChat Pay/Alipay in China and Stripe/PayPal elsewhere, with explicit choices taking priority. Independently enable/disable each channel, show unconfigured/disabled/test-ready/live-ready status, and name missing configuration fields. The server validates configuration; incomplete channels cannot be enabled. Secrets never return to the browser or enter logs. Protect changes with payment-configuration permission, audit them, and persist across restarts. Frontend shows only available channels; payment creation rechecks status. Disabling affects new payments, preserving history and valid notifications for payments already created. See [Implementation](../implementation.md) and [Verification](../verification.md).
