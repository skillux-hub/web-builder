# Dashboards, SaaS workspaces, and internal tools

Use for: Data/reporting consoles, customer portals, operational workspaces.

## Scope and workflow

Authenticate when needed -> scoped data -> filters/charts/details -> authorized business action.

## Module selection

analytics, lists; authentication for workspace accounts; admin for separate management. Add actual domain modules as required.

Resolve these module names through the [module index](../modules.md); load only selected modules and their applicable dependencies. Suggested modules describe requirements, not prebuilt features.

## Admin and boundaries

Management by default unless declined; distinguish the primary workspace from a separate /admin area. Avoid duplicate admin template selection for the same workbench.

Dashboard appearance does not establish SaaS billing, multi-tenancy, or ecommerce. Implement tenant isolation only when required; private workspaces are noindex.

## Acceptance

Known data -> consistent aggregates/details -> filter/export -> permitted action -> refresh; reject unauthorized record/tenant access.

Use [Verification](../verification.md) for execution evidence and completion status.
