# Admin governance and workbench

Load only when adminRequired is true. Include roles, permissions, administrators, audit logs, settings, password changes, and business-specific operations.

A sidebar must have a working collapse/expand button with an accessible name and `aria-expanded`. Adjust the main content with the sidebar, preserve recognizable icons, accessible labels/tooltips, and the current item, and avoid overlap. On narrow screens, use a drawer that closes via its overlay or Escape. A static collapse icon is not implemented behavior.

## Governance

- Roles/permissions: create/edit/delete roles, assign permission points, and show member counts. Check permissions on every server operation; filter menus/actions accordingly. Permission changes take effect immediately; do not grant beyond the operator's own authority. Protect Owner, keep at least one enabled Owner, and do not directly delete assigned roles.
- Administrators: create/edit, assign roles, enable/disable, and reset passwords. Disable/reset revokes sessions. Never return password hashes/session tokens or log initial passwords.
- Activity logs: record successful/failed admin login, logout, roles/permissions, account/settings changes, and business writes. Include time, actor, action, target, and a safe change summary; support search. Never log passwords, payment secrets, cookies, tokens, or complete sensitive request bodies.
- System settings: site name, contact details, maintenance state, and business parameters must actually take effect. Maintenance mode prevents new business submissions, not just a banner. Preserve existing data and historical records.
- Password change: verify the current password, validate new and confirmation values, store a secure hash, revoke admin sessions, and require login again. Customer authentication/sessions cannot access admin APIs.

The bundled `AdminSystem` provides shared page components; `adminCore` dispatches shared APIs; `permissions` and `governance` handle authorization and data operations. Initialize roles for the actual business. Add permissions and meaningful checks for new modules rather than making orders/stock default models for every site.

## Required companion modules

Read [Lists](lists.md) for each management list; [Media](media.md) for shared images, logo upload and generated favicon; [SEO](seo.md) for metadata; [Content](content.md) when long content is editable. Load [Payments](payments.md) and [Shipping](shipping.md) only when selected. Keep frontend, workbench, and independent login layouts and sessions separate under [Implementation](../implementation.md#separate-frontend-and-admin-entry-points-and-layouts).

## Acceptance

Verify role/permission changes, 403 for unauthorized requests, immediate revocation, last-Owner protection, disabled-account invalidation, credential-free logs, settings affecting frontend/business behavior, SEO updates, rejection of incorrect current passwords, and old-session invalidation after successful password changes. Then verify actual frontend/admin business workflows.
