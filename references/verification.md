# Verification

## Skill and download tools

- Verify the startup gate using fake services: an existing valid/empty-library session skips authorization; missing/demo/expired credentials trigger the official login flow and require a server recheck; denial/cancellation/offline responses cannot start catalog selection or later work. Do not open real authorization windows for automated tests.
- Verify selected-target gating: confirmed PURCHASE_REQUIRED opens the real detail page once, preserves the target, and waits for server-granted access; successful checkout text alone is insufficient. Cover delayed grants, timeout, browser-opening failure, session renewal and a disabled admin target. Unknown 403, quota exhaustion, missing targets and network failures must not open purchase prompts or fabricate success. Use mocks/local fixtures; do not buy templates or memberships in tests.

- Run `python -m unittest discover -s "<skill>/tests"`. Fake services cover catalog discovery, expired login, missing entitlement, ZIP/JSON download, versions/continuation records, dangerous paths, and unchanged state on failure.
- Copy the whole skill to another location and create a project there to establish independence from the original template directories or absolute workspace paths.
- Public discovery returns only LIVE templates from unfrozen authors, without pack keys, complete `previewJson`, tokens, or instruction bodies. Missing previews are unavailable, not invented links.

## Project

Select acceptance scope from the recorded [website type](website-types.md) and [modules](modules.md). Apply common visual/build/persistence checks where relevant; skip unselected commerce, accounts, shipping, and admin checks. Verify each selected module's workflow, dependencies, and failure cases. Old reference paths remain compatibility routers to the canonical module rules.

### Real interaction and completion criteria

- For every requested key business action, exercise at least one successful path through user action -> visible feedback -> server/persisted result. A button, attractive screenshot, HTTP 200, typecheck, or build alone does not prove usable behavior.
- Use isolated local data, temporary accounts, or provider sandboxes. Do not experiment on production data or trigger actual charges, label purchases, emails, or other irreversible external actions. Verify transactions locally/in sandbox and disclose live transaction status separately.
- Record a baseline for key controls, click/submit them, then inspect visible results and appropriate API/data changes. For Add to bag, verify selected SKU/quantity, bag count, line items, totals, and designed refresh persistence; button styling or handlers alone are insufficient. Check at least one accurate failure response with no incorrect side effect.
- For persistent features, refresh or reread the data. For permissions, request with an unauthorized session and verify rejection rather than just hidden controls.
- Prefer real-browser interactions and inspect relevant browser/server errors. Screenshots support visual checks, not behavioral acceptance. If a browser or external credentials are unavailable, mark unverified/blocked and identify the last completed step instead of inferring success.
- Clean up only test data created in this verification, recording the original baseline and checking restoration. Never delete/overwrite the user's existing data for cleanup. If safe restoration is impossible, repeat in an isolated database/temporary account.
- Record scope, execution method, and results in `.web-builder/project.json` under `checks`, distinguishing `typecheck/build`, `visual`, `interaction`, `persistence`, and `external-sandbox`. Do not mark business implementation `verified` before key interactions pass.

In generated projects, run `npm install`, `npm run setup`, `npm run typecheck`, `npm test`, and `npm run build`. Tests use a separate temporary SQLite database with real persistence/transactions, not Skillux or production databases. Foundation tests cover authentication/persistence; add meaningful tests for the actual business. A foundation pass does not establish every industry workflow. For noncommerce examples such as appointment services/content publishing, check there are no unrequested cart, stock, order, or payment features.

For a newly generated local test project with its server running, use `python "<skill>/tests/http_smoke.py" "<test-project>" http://localhost:<port>` to check real HTTP sessions, logout, and cross-origin-write rejection. Add `--commerce` for shared frontend/admin data and order/payment flow. This writes demonstration data, permits local addresses only, and must not target an existing business database.

### Payments

Verify [Payment requirements and channels](business.md#payment-requirements-and-channels). Ecommerce records payments as required without asking again; defaults are WeChat Pay/Alipay in China and Stripe/PayPal elsewhere, with explicit choices taking precedence. Noncommerce has a recorded whether-needed decision; if declined, no unrequested payment entry points/APIs/simulations remain.

Test admin-switch authorization, persistence, and frontend reflection. Disabled/invalidly configured channels cannot create payments even through direct API calls; all-unavailable states have accurate frontend feedback. Disabling preserves history and valid existing-payment callbacks. When payments are needed, test server-derived amount/currency, signed notifications, failure/cancellation, repeated/concurrent notifications, and business state advancing only once. Disclose missing credentials, sandbox passes, and unverified live collection separately.

### Admin, business, and commerce

#### Authenticated admin acceptance gate

For category-capable workflows, apply [classification implementation and hierarchy acceptance](modules/taxonomy.md#acceptance). Check the dedicated module against the recorded scope, including actual category operations and business associations. For hierarchical categories inspect populated parent/child/grandchild and sibling branches, named parent/path pickers, expansion, moves/order after refresh, and polished desktop/mobile layout. A flat display that conceals hierarchy or a category text field alone fails module acceptance.

Before checking pages, compare the recorded modules with actual admin entries and persisted workflows. When taxonomy is selected, require independent category/tag management and content association where applicable; a free-text category field alone is partial implementation. Verify creation, association, rename, disabled visibility, referenced deletion rejection and hierarchy cycles when hierarchy exists.

Apply this gate to every admin-enabled project, including template migrations and resumed projects:

1. In isolated local data, verify login -> workbench -> refresh -> logout -> rejected access. Use a temporary least-privilege account to verify both permitted actions and server-side 403 responses; an empty permission set must not crash the shell.
2. Inspect the actual session response contract. Keep account grants (a string array) separate from the permission-label dictionary. Validate the client boundary and add a regression test if a contract mismatch caused a failure; testing only a shared permission helper does not prove the HTTP contract.
3. Open every implemented management tab or route. Wait for its data-dependent content or explicit empty state after requests finish, inspect relevant browser/server errors, and verify expected records or counts. A heading rendered before an API request completes is not a pass.
4. Exercise representative key mutations for each selected module, then refresh/reopen and compare persisted values. For commerce include product/SKU save and storefront reflection; verify order/dispatch actions using isolated paid-order fixtures when payment credentials are absent. Verify governance/settings/SEO flows in temporary accounts/data. Verify uploads/pickers when selected. Do not change the user's credentials or existing business data to run checks.
5. Check the signed-in shell at desktop and narrow widths, including navigation and key forms. Capture evidence of the actual working backend. Fix observed runtime exceptions and repeat the failing path plus affected adjacent paths before delivery.
6. Record per-area results in `checks.admin`: execution method, expected/observed result, persistence and authorization evidence, cleanup, and any unexecuted/blocked paths. Distinguish page-loading checks from mutation checks and real provider sandbox checks. Mark overall admin acceptance partial until required paths pass; missing external credentials do not waive independent local admin checks.

For a backend error report, reproduce the original failing route and capture its error before editing; after fixing, reload that route with a valid session, check related tabs, and run focused regression tests plus appropriate existing checks. Do not substitute unrelated build success for reproducing and resolving the reported failure.

All projects require relevant authorization, persistence, and actual business checks. Admin rules apply when admin is enabled; commerce checks apply only to selected modules. For conditional generation, validate standard/commerce with and without admin: setup, typecheck, tests, build, public settings/commerce persistence, omitted administrator artifacts, and actual 404 responses for disabled management routes. Exercise enabled admin login/authorization separately.

- Separate `/admin/login` exists; unauthenticated `/admin` redirects and unauthorized admin APIs return 401/403. Frontend/admin navigation, footer, and providers do not leak across shells. Customer sessions do not grant admin rights. Logout/expiry removes access to workbench data.
- Verify roles, permissions, administrators, logs, settings, SEO, and password changes under [Admin management](admin.md), then each actual business module. Menus alone are insufficient.
- For sidebars, repeatedly collapse/expand and verify content resizing without overlap/horizontal overflow, recognizable icons, tooltips, and current item. On narrow screens, open the drawer and close by overlay/Escape. Check keyboard behavior, accessible name, and `aria-expanded`.
- Unauthenticated management requests fail; authenticated admins can maintain products/process orders; logout invalidates sessions.
- Size/color stock is independent. Admin updates appear publicly and orders appear in admin. Browser edits cannot override prices/totals.
- Insufficient stock, noninteger/duplicate SKUs, repeated orders, or concurrent purchase of the last unit cannot oversell. Reject a different payload using the same idempotency key.
- Payment tests cover success, failure, duplicate events, and cancellation. Restore inventory only once; repeated payment events must not deduct again.
- For shipping selection, check [Country-and-route recommendations](shipping-providers.md): record the user/merchant country separately from warehouse origin and destinations, qualify candidates against actual route/product/account capabilities, and preserve existing choices. A Chinese-speaking merchant dispatching US warehouse orders within the US uses a US-origin shortlist; a European merchant dispatching from mainland China uses the actual China-origin/cross-border route. Distinguish official SDKs/REST adapters and Shipping/label products from Tracking-only products; do not claim unimplemented quotes/labels/tracking.
- Exercise [Shipping verification](shipping.md#verification): domestic label request -> tracking number/print data -> preview/print; China cross-border/markets outside China order submission -> tracking-number return. All routes require manual entry/editing, dispatch confirmation, tracking, and persistence. Cover authorization, missing fields, provider failure, timeout queries, duplicates, out-of-order callbacks, stale callbacks after edits, and no label recreation on reprint. Label creation must not mark dispatch; labels must not expose private addresses. Check customer ownership. Disclose absent credentials/events and blocked provider/printing checks separately.
- Order lookup requires its access key. Products, sessions, and orders survive a server restart.
- After real template migration, inspect home, product details, cart, checkout, admin products/orders as relevant. Desktop/mobile screenshots reflect real pages; assets have no 404 and there are no business console errors.
- Explain missing configuration. Simulated success is not live payment, and selecting a template is not completed visual migration.

## Delivery

### Readability

Inspect actual text/background combinations on frontend home/inner pages, expanded navigation, admin login/workbench, lists/forms, media library, and empty states on desktop/mobile, including hover/selection/focus. Require 4.5:1 ordinary and 3:1 large text, compositing transparency over real backgrounds. Pay particular attention to secondary gray, gold headings on light backgrounds, state labels, inherited colors on dark panels, transparent navigation, and image scrims. Record before/after colors and ratios and confirm real mobile overrides/crops. Static color calculations alone are partial verification, not site-wide visual acceptance.

### Pagination

Inventory every frontend/admin list and image picker. Use more than two pages of data to test first/middle/last without omissions/duplicates and consistent pages/counts/page sizes/filters. Search/filter/page-size changes reset to page one; refresh/back restores state. Cover empty/exactly-one-page results, invalid page/size, invalidated last pages after deletion/archive, rapid navigation, and failed requests/retries. Apply authorization to queries/totals and cross-page selection. Check mobile controls/current-page accessibility and selection clearing or explicit cross-page scope. Fixed truncation, full downloads with UI slicing, and decorative controls fail acceptance.

### Uploads and SEO

Upload/read/reuse after refresh a real image larger than 128 KB but below the file limit. Check a Base64 payload at the exact file limit parses, oversized upload requests fail, and ordinary JSON retains its smaller limit. Count actual UTF-8 bytes. Tiny images alone do not prove uploads work.

For content SEO, save/refresh and inspect actual HTML title, keywords, and description. No separate SEO-title submission is required. Title derives from content name, updates on rename, and follows `title - Site name` with one centrally appended suffix. Site-name changes update it. Reject blank/overlong keywords/descriptions server-side, mark forms required, preserve existing migrated values, and prevent SEO controls from bypassing private/test indexing policy.

### Media, bulk operations, branding, and accounts

Verify local upload, category creation/rename/moves, filter/pagination, selection into products/body/branding, alt text, and persistence. Test unauthorized access, forged MIME, oversized images, and unsupported formats. For bulk operations, test scope, select-all/clear, permission/state validation, partial failure/retry, sensitive business constraints, and logs. Do not force bulk deletion onto read-only lists.

Confirm the admin decision was recorded for single-page projects and defaults/explicit choices were respected elsewhere. For admin-enabled projects, test logo permission, invalid/oversized rejection, persistence, frontend logo/favicon updates, and reset. Rich text checks include save/reopen, frontend layout, old plain text, script/dangerous-link sanitization, plain-text SEO, and mobile image containment.

For account features, follow [Authentication](authentication.md). Record market/provider/customer/admin methods and distinguish explicit choices from market defaults. Enable only selected/configured methods and disclose missing credentials or unverified real-platform login.

Provide absolute project path, startup commands, access-file location, template sources/versions, completed work, and blockers. Record checks in `.web-builder/project.json`. Complete independent work when credentials or entitlements block an integration and clearly identify what remains. Do not automatically deploy or purchase templates before delivery.
