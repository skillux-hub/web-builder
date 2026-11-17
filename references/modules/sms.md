# SMS channels, templates, and delivery

Use for selected phone verification, transactional text messages and reminders. [Notifications](notifications.md) owns business events, scheduling, recipient preferences, durable jobs and retry history. This module owns SMS providers, region routing, sender/signature/template configuration, send requests and delivery receipts. [Authentication](authentication.md) owns verification challenges and the identity change after successful verification. Selecting SMS alone adds neither registration nor marketing campaigns.

## Configuration and provider boundary

For provider selection, read [Country-based SMS SDK recommendations](../sms-providers.md). Reuse the user's stated country/merchant country, keep recipient countries separate, and present two or three relevant candidates with official SDK references. Country/language guesses are not user choices; an existing selected provider takes precedence. Recommendations do not establish coverage, account eligibility or a configured sending channel.

Reuse an existing provider and sender configuration. Otherwise establish destination countries/regions, purpose (verification/transactional/marketing), required sender/signature and templates, language, environment and expected volume. During integration check current official provider documentation for supported destinations, template/signature approval, verification products, quotas, callback validation and pricing. Do not infer merchant approval or API access from a provider name.

Record nonsensitive route/provider IDs, supported country codes, sender/template mappings, per-purpose limits, enabled state and configuration/verification status in continuation state. Credentials stay server-side. Admin configuration, when present, requires permission and safe audit history; never return secrets or full message bodies/verification codes in logs. Distinguish unconfigured, disabled, test-ready and live-ready. Validate actual configuration server-side before each send; a toggle or hidden button cannot bypass it.

Use a small adapter boundary for sending, querying delivery and validating provider callbacks. Normalize phone numbers using the destination country code and a suitable phone parser; do not assume every recipient has a mainland-China number. Validate allowed purpose, template and variable shape on the server. Public clients cannot supply arbitrary recipients, template IDs or free-form message bodies to a generic relay. Authorized operational messages still enforce the actual tenant/order/booking/customer scope.

## Requests, limits, and delivery state

Persist the notification/job association, request/idempotency key, protected recipient reference, purpose/template version, route/provider, provider message ID, attempts, timestamps, delivery state and safe error codes. Show masked recipients in ordinary operational lists. Apply configurable recipient/IP/account/purpose send limits, resend cooldowns, attempt limits where applicable, and bounded spending/volume controls. A browser countdown is not server enforcement.

Track queued -> submitting -> accepted -> delivered/undeliverable, plus failed/unknown when needed. Provider acceptance is not handset delivery, and delivery is not phone verification. Validate callbacks according to provider rules and correlate message ID, route and current request; handle repeated/out-of-order events without duplicating business effects. After an ambiguous timeout, query/reconcile the original request before resending or switching providers, which can otherwise produce duplicate charges/messages. Keep retries bounded and distinguish retryable provider failures from invalid numbers or rejected templates.

For SMS verification, use the selected authentication challenge service or provider-managed verification API. Bind the challenge to normalized phone, purpose and flow; enforce expiry, attempt limits and one-time consumption. Resend must follow a defined challenge policy. Sending/delivering a code does not create a session or mark a number verified. Never expose a production code through response payloads, general logs or mock success states.

## Acceptance

Use a local sink/provider sandbox and isolated recipients by default. Exercise event/challenge -> one durable request -> adapter response -> authenticated delivery receipt/query -> correct visible state. Cover missing/disabled configuration, country routing, invalid numbers/templates/variables, unauthorized relay attempts, cooldown/server limits, timeout recovery, bounded retry and duplicate/out-of-order callbacks. Verification additionally tests wrong/expired/replayed codes, concurrent consumption and purpose/phone mismatch under authentication rules.

Record configured delivery separately from actual receipt and actual login verification. Missing credentials or unavailable provider test facilities remain pending/unverified. Do not send real texts or provision paid SMS resources as part of default local verification. Use [Lists](lists.md) for selected paginated send-record/admin screens; no admin UI is required merely to select an SMS adapter.
