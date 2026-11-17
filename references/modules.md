# Functional module routing

Choose modules from confirmed workflows and the [website type](website-types.md). Preview the machine-readable plan using [Executable composition](composition.md); its catalog owns defaults, dependencies, and asset selection. Read only relevant module files. Reuse one module across website types; do not copy payment, account, media, or pagination rules into each type. Module labels here are reference IDs, not an enforced brief.modules enum.

| Reference ID | Module | Load when | Scope and dependencies |
| --- | --- | --- | --- |
| `admin` | [Admin governance](modules/admin.md) | adminRequired true | Role/permission/admin/audit/settings/password; compose lists, media, SEO and selected business modules. |
| `lists` | [Lists and bulk operations](modules/lists.md) | Any frontend/admin collection or picker | Real server pagination; stable count/filter/scope; appropriate per-item batch validation. |
| `media` | [Media and branding](modules/media.md) | Images/uploads/pickers or admin enabled | Shared image library, request/file limits; logo and favicon for admin-enabled sites. |
| `content` | [Content publishing](modules/content.md) | Editable/public long content, pages, articles, products, services | Publishing visibility and safe rich text; media, lists and SEO where used. |
| `seo` | [SEO](modules/seo.md) | Public pages | Derived detail title, keywords/description, actual metadata and indexing rules. |
| `authentication` | [Customer/workspace accounts](modules/authentication.md) | Registration, membership, login, private workspace | Market defaults; customer/admin session separation. Admin-only password login uses the optional admin asset layer. |
| `commerce` | [Catalog, stock, cart, orders](modules/commerce.md) | Explicit selling/ordering | Server-authoritative totals and stock; payments; shipping for shipped goods. |
| `payments` | [Payment channels](modules/payments.md) | Required for ecommerce; confirmed need elsewhere | Independent channel switches, valid configuration, server payment/notification state. |
| `shipping` | [Shipping fulfillment](modules/shipping.md) | Shipped goods or requested shipment workflows | Actual route/provider, submission/labels, manual edits, dispatch, tracking. |
| `inquiries` | [Inquiries and leads](modules/inquiries.md) | Forms, contact, quote/demo requests | Persisted submission and actual handling/delivery destination. |
| `bookings` | [Bookings and capacity](modules/bookings.md) | Appointments, reservations, scheduled registration | Availability, concurrency, timezone, cancel/reschedule; payment only when needed. |
| `learning` | [Courses and enrollment](modules/learning.md) | Education workflow | Courses/cohorts/enrollment; protected lessons only when learning delivery selected. |
| `directory` | [Listings and moderation](modules/directory.md) | Searchable listings or publisher submissions | Visibility, ownership, moderation; no assumed settlement system. |
| `analytics` | [Data and dashboards](modules/analytics.md) | Metrics, reports, operational consoles | Real source/metric definitions, scoped aggregates, filters and business actions. |
| `execution` | [Tool execution and results](modules/execution.md) | Input -> execution -> result is primary | Client/server/job mode; optional private files, history, quota, accounts and paid usage. |
| `community` | [Community and moderation](modules/community.md) | Member discussions, answers and replies | Authentication and lists; author ownership, reports, visibility and moderation. |
| `marketplace` | [Multi-seller transactions](modules/marketplace.md) | Independent sellers transact on a platform | Directory, authentication, commerce/payments; seller scopes, allocations, commissions and settlements. |
| `files` | [Files and storage](modules/files.md) | Attachments, private uploads, downloads, reusable storage | File lifecycle, purpose limits, ownership and retention; media retains image-specific UI/processing. |
| `notifications` | [Notifications](modules/notifications.md) | Requested event delivery or reminders | Templates, recipients, preferences, durable jobs, delivery evidence and retry. |
| `sms` | [SMS channels](modules/sms.md) | Selected verification codes, text notices or reminders | Notifications; country/provider/sender/template routes, send limits, receipts and configuration. Authentication only for actual identity verification. |
| `subscriptions` | [Plans and subscriptions](modules/subscriptions.md) | Recurring service periods, free trials or paid plans | Entitlements; payments only for confirmed online paid collection, identity according to actual subscriber model. |
| `entitlements` | [Access and allowances](modules/entitlements.md) | Content/features/downloads/usage require grants | Subject/scope, source, expiry/revocation and atomic quota accounting; no forced paid provider or registration. |
| `tenancy` | [Organizations and tenants](modules/tenancy.md) | Shared organizational workspaces | Authentication and lists; member invitations/roles and data isolation across services. |
| `search` | [Search and indexes](modules/search.md) | Search/filter/relevance across business records | Lists, scoped counts/facets, update/delete propagation; external search services only when needed. |
| `after-sales` | [After-sales](modules/after-sales.md) | Selected returns, refunds, exchanges, warranty or disputes | Lists; reuse actual transaction model and selected payment/shipping/access workflows. |
| `taxonomy` | [Categories and tags](modules/taxonomy.md) | Reusable classification and category/tag filters | Lists; scoped category trees, separate tags, ordering, associations, cycle prevention and safe deletion/migration. |

For every selected business module, define frontend entry, data model, server actions/API, admin/operational handling if needed, legal state changes, and acceptance evidence. Record why it is selected (user, workflow requirement, or default). Include meaningful source/permission/data dependencies; unused UI widgets do not create module requirements.

Read conditional companions only when used: public taxonomy pages add SEO; covers add media; private attachments add files; paid recurring collection adds payments; organization grants add tenancy. The catalog encodes unconditional dependencies only. Subscriptions manage periods, payments manage transactions, and entitlements enforce actual access. Optional presets do not activate external providers or add every module to each website.

Keep existing brief.modules IDs (for example services, cases, appointments, products, orders) when continuing. Do not rename them to match filenames or invalidate existing state. Record websiteType and optional additionalWebsiteTypes in the brief; module source/configuration/verification details may be additional nonsensitive fields. The generator preserves them but implements only its documented foundations.
