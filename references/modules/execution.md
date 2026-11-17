# Tool execution, jobs, and results

Establish inputs, real outputs, processing location, synchronous/asynchronous behavior, and persistence requirements. Ordinary client-side arithmetic does not require durable jobs.

For selected capabilities use [Files](files.md) for private inputs/results and retention, [Entitlements](entitlements.md) for usage allowances, [Subscriptions](subscriptions.md) for recurring access, [Notifications](notifications.md) for completion/failure notices, and [Tenancy](tenancy.md) for organization-owned jobs. Execution retains its own job state; selecting it alone does not add these services.

## Models and actions

For durable jobs, record owner/access proof, normalized input reference/hash, executor/version, state, timestamps, result references, safe failure details, and expiry. Submit, inspect, cancel, retry, and retrieve/download APIs enforce server authorization and legal transitions. Keep credentials server-side. Retain an external request ID so timeouts can be reconciled without duplicate paid work.

Validate actual file type, size, and processing limits server-side; specify retention/deletion and authorized downloads. The [Media](media.md) library holds explicitly public reusable images, not arbitrary confidential job files. Sanitize rendered results; do not execute uploaded content as application code.

## States and accounting

Asynchronous work follows queued -> running -> succeeded/failed, with cancelled/expired where supported. Retries retain attempt history or follow a documented provider retry contract. Duplicate submit/completion requests must not duplicate jobs, quota deductions, or charges. Reserve/consume/release quota exactly once under the agreed failure/cancel policy. Report actual progress or an unknown-progress state; acceptance alone does not prove completion.

Use [Authentication](authentication.md) for durable accounts; guests need unguessable access proof for private results. Load [Payments](payments.md) only for confirmed paid usage. Credit purchases, subscriptions, and execution outcomes are separate states. Apply [Lists](lists.md) to selected history/admin lists.

## Acceptance

Check result correctness, invalid input, failures, duplicate/concurrent requests, ownership, and expiration. For jobs, test restart recovery and stale completion after cancellation. Quota/charge reconciliation must match actual execution. Missing executor credentials remain unavailable/pending, without simulated completion presented as real work.
