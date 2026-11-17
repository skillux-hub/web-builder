# Tools and execution applications

Use for calculators, AI tools, converters, generators, and sites whose primary task is input -> execution -> usable result. Use dashboard for primarily inspecting/managing existing data; a tool's marketing page can be a secondary landing/business surface.

## Scope and modules

Read [Execution](../modules/execution.md). Select client-side synchronous, server-side synchronous, or asynchronous execution from actual requirements. The catalog requires execution and suggests SEO for public pages. Accounts, history, uploads, quotas, billing, and content editing are requirement-driven additions through the [module index](../modules.md).

## States and boundaries

For asynchronous work use queued -> running -> succeeded/failed, with cancellation/expiry where supported. An accepted request is not a completed result. Do not add a durable queue, registration, or payments to a stateless free calculator. Private input/output files must not use the public image library. Admin follows the single-page question or multi-page default, separately from customer execution/history.

## Acceptance

Test a known input/output pair and invalid input. For jobs, submit -> inspect real progress -> retrieve result -> refresh/reopen under the same authorized identity. Check failure/cancel/retry, duplicate submission, quota accounting when applicable, other-user denial, and expiration. Fabricated progress or a placeholder download fails acceptance. Follow [Verification](../verification.md).
