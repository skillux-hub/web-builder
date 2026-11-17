# Dashboards, metrics, and business actions

Use for data consoles, SaaS workspaces, and reporting. Establish real data sources, metric definitions, units, timezone/range, refresh policy, and record/tenant scope. Demo charts must be labeled; do not invent revenue or activity. A backend template is a visual shell, not a connected data source.

Compute aggregates and queries server-side within the user's permission/tenant scope. Apply the same filters to summaries, charts, details, and exports. Show loading, empty, stale, unavailable, and failure states. Use [Lists](lists.md) for record tables; add [Authentication](authentication.md) for workspace accounts and [Admin](admin.md) only for a separate management area. Charts alone do not require commerce or billing.

Define and implement any business actions behind the dashboard with authorization, validation, persistence, and audit requirements. Verify filters against known source records, aggregates against detail totals, export scope, denied cross-tenant queries, and refresh after a real data/action change.
