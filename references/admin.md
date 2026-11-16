# Admin management

Projects with an admin area need working common management features and business-specific modules. Template charts and tables are not completed backend features.

A sidebar must have a working collapse/expand button with an accessible name and `aria-expanded`. Adjust the main content with the sidebar, preserve recognizable icons, accessible labels/tooltips, and the current item, and avoid overlap. On narrow screens, use a drawer that closes via its overlay or Escape. A static collapse icon is not implemented behavior.

## Common management features

### Pagination

All frontend and admin list pages require pagination: content, products, orders, inquiries, administrators, roles, logs, image libraries, and pickers. Show record count, current/total pages, numbered pages, previous/next, and page-size selection. Empty results show zero and an empty state; disable unavailable actions. Keep pagination information for a single page. Fixed featured/recommended summaries are not list pages, but their view-all destination must paginate. Support mobile controls, accessible names, and current-page state.

Validate page number, page size, and a maximum page size on the server. Query the actual page and total with identical search/filter/authorization criteria and a stable sort including a unique key. Do not silently truncate with a fixed `take: 200` or download all records and slice only in the UI. Public lists store pagination/filter state in the URL for refresh/back navigation; admin lists retain page and filter state. Search/filter/page-size changes reset to page one. After deletion/archive makes the page invalid, move to a valid page and refresh totals. Prevent stale asynchronous responses from replacing newer results and provide loading/error/retry states.

By default, multiselect applies to the current page and clears after paging/filtering. If offering selection across pages, show its scope and count and validate the same criteria on the server.

### Upload limits

Align frontend, request parsing, decoding, and deployment-proxy limits. Images default to 7 MiB using shared constants from `lib/media-limits.ts`. Base64 JSON requests need at least `4 * ceil(maxFileBytes / 3)` plus metadata allowance. Admin upload routes authenticate first, then call `body(request, MAX_MEDIA_REQUEST_BYTES)`. Ordinary JSON keeps its default 128000-byte limit; do not call default `body(request)` for image uploads. Read streams with actual byte limits, then revalidate decoded size, true format, and pixels. If changing the file limit, update constants and UI copy together. Proxy limits must accommodate encoded requests.

### Images and bulk actions

- Shared image picker/library: all content-image fields support browsing uploaded images by category, local upload, preview, and reuse. Products, rich text, and logos use the same component, not URL-only fields. Support category creation/rename, assignment, alt text, pagination, and search when appropriate. Validate authorization, size, true format, and pixels on the server and safely re-encode images. Persist media and reusable URLs and show failures. Explain when uploaded images are public; private attachments require separate authorized downloads. Choose persistent local or object storage for the actual deployment.
- Bulk list actions: provide row selection, select-all for the current page or explicitly scoped filtered results, count, clear, and suitable working actions. Examples include product publication/category moves, article publication/drafts, stock adjustment, valid order transitions, account activation, and image categorization. Read-only audit lists may export but must not offer destructive edits/deletion. Limit batch size, validate permissions and state per item, and reuse single-item business rules, including last-Owner protection, stock transactions, order state, and session revocation. Explain scope/impact for consequential batches, show individual successes/failures with reasons, allow retry, and log actions. Never silently act on invisible records after pagination/filter changes.

### Branding and content

- Branding: upload a logo in admin, persist it, update the real frontend brand, and generate a favicon wired to page icon metadata. Validate size, actual format, and pixels through decoding/re-encoding rather than trusting extensions/MIME. Use writable persistent or configured object storage, not temporary production-build files. Provide preview/replacement/reset, enforce settings permission, log changes, and version assets to avoid stale caches.
- Rich text: long product descriptions, articles, and service copy use a reusable editor such as Tiptap with headings, emphasis, lists, links, images, and undo/redo. Summaries, SEO descriptions, and addresses stay plain text. Sanitize allowed HTML, attributes, and URL protocols on the server, safely render frontend content, and supply responsive body styles. Preserve old plain text and derive searchable/SEO plain text. Claim upload support only when storage is connected; inserting image URLs is not uploading.

### Governance, settings, and SEO

- Roles/permissions: create/edit/delete roles, assign permission points, and show member counts. Check permissions on every server operation; filter menus/actions accordingly. Permission changes take effect immediately; do not grant beyond the operator's own authority. Protect Owner, keep at least one enabled Owner, and do not directly delete assigned roles.
- Administrators: create/edit, assign roles, enable/disable, and reset passwords. Disable/reset revokes sessions. Never return password hashes/session tokens or log initial passwords.
- Activity logs: record successful/failed admin login, logout, roles/permissions, account/settings changes, and business writes. Include time, actor, action, target, and a safe change summary; support search. Never log passwords, payment secrets, cookies, tokens, or complete sensitive request bodies.
- System settings: site name, contact details, maintenance state, and business parameters must actually take effect. Maintenance mode prevents new business submissions, not just a banner. Preserve existing data and historical records.
- SEO: manage site name, site SEO title, keywords, description, production origin, and indexing, producing real metadata. Product/article/service detail pages and informational pages have independent editing. Their title is always `content title - Site name`, derived from the actual product/article/page name, without a separate per-page SEO-title input. Append the site name centrally exactly once and propagate site-name changes; individual pages cannot choose separator formats. Keywords and descriptions are required with UI requirements, server nonempty/length checks, persistence, and actual `meta keywords`/`meta description`. Comma-separated keywords are allowed; descriptions are plain text, not body HTML. Provide explicit migration or incomplete states for old missing fields and preserve existing user values. Test projects default to no indexing; admin/account/private pages remain noindex. SEO fields do not guarantee ranking or indexing.
- Password change: verify the current password, validate new and confirmation values, store a secure hash, revoke admin sessions, and require login again. Customer authentication/sessions cannot access admin APIs.

The bundled `AdminSystem` provides shared page components; `adminCore` dispatches shared APIs; `permissions` and `governance` handle authorization and data operations. Initialize roles for the actual business. Add permissions and meaningful checks for new modules rather than making orders/stock default models for every site.

## Business-specific modules

For stores, address categories, product data/images, SKU sizes/colors/prices, low-stock alerts, order states, shipment records, member status, and product SEO. Follow [Shipping fulfillment](shipping.md): domestic China aggregators need label requests, tracking-number return, preview/printing; China cross-border and markets outside China need order submission and tracking-number return. All routes need manual entry/editing, dispatch confirmation, and tracking. Protect shipment edits and retain before/after values and logs. Reprinting must not request another label. Distinguish pending sync, label ready, and actually dispatched. Support querying/correcting/retrying failures safely. A tracking-number text field is not an aggregator integration.

Appointments manage services, slots, capacity, booking states, and customers. Content sites manage content, categories, publication state, and detail SEO. Education manages courses, enrollment, capacity, and status. Choose real business metrics, not invented revenue, sales, or member counts.

## Acceptance

Verify role/permission changes, 403 for unauthorized requests, immediate revocation, last-Owner protection, disabled-account invalidation, credential-free logs, settings affecting frontend/business behavior, SEO updates, rejection of incorrect current passwords, and old-session invalidation after successful password changes. Then verify actual frontend/admin business workflows.

## Payment channel management

Ecommerce admin must manage payments, defaulting to WeChat Pay/Alipay in China and Stripe/PayPal elsewhere, with explicit choices taking priority. Independently enable/disable each channel, show unconfigured/disabled/test-ready/live-ready status, and name missing configuration fields. The server validates configuration; incomplete channels cannot be enabled. Secrets never return to the browser or enter logs. Protect changes with payment-configuration permission, audit them, and persist across restarts. Frontend shows only available channels; payment creation rechecks status. Disabling affects new payments, preserving history and valid notifications for payments already created. See [Implementation](implementation.md) and [Verification](verification.md).
