# Implementation and continuation

## Requirements input

Write requirements JSON to a temporary file outside the project, then create a new directory with `create_project.py`:

```json
{
  "brand": "Example Services",
  "business": "Customer inquiries and service presentation",
  "locale": "en-GB",
  "region": "United Kingdom",
  "websiteType": "business",
  "adminRequired": true,
  "adminRequirementSource": "multi-page-default",
  "modules": ["services", "cases", "inquiries"],
  "notes": "Service pages, case publishing, customer inquiries and admin processing; no store needed"
}
```

Require `brand`, `business`, `locale`, and `modules`; transactions also require `currency`. Business/modules record requirements rather than restricting industries to a fixed enumeration. The script preserves additional nonsensitive requirement fields. Never include passwords, tokens, or payment secrets. It generates `.web-builder/project.json` with `schemaVersion`, `brief`, `foundation`, `templates`, `businessImplementation`, `templateIntegration`, and `checks`. Read it first when continuing. Template tools atomically update their own fields; record implementation acceptance results after doing the work.

Default `--foundation standard` includes administrator authentication, application, and database foundations only, **without products, cart, orders, stock, or payment models/pages**. Design domain entities, actions, and transitions first: appointments need services/slots/bookings; education needs courses/enrollment/capacity. Do not force all businesses into products/orders or replace clear domain models with a generic JSON table.

Use optional `--foundation commerce` only when selling/ordering is explicitly required, `modules` includes `orders`, and `currency` is confirmed. Commerce is an example module, not the universal project entry point. The agent implements and tests other selected modules; do not claim the generator already provides them.

The foundation pins tested dependencies and generates `package-lock.json`. Require Node.js >=22.12 and Python >=3.10, with system support for SQLite native modules. Run `npm install`, `npm run setup`, then `npm run dev`. Setup initializes schema and missing demo data without resetting existing orders.

`create_project.py` generates a random administrator password and Git-ignored `LOCAL_ACCESS.md` only when admin is enabled. Admin-free projects have neither administrator environment variables nor an access file. Commerce additionally generates a simulated payment secret. Do not copy credentials into requirements or commit them. Without real payment configuration, use local test flows only.

## Type and module continuation

Use [Website types](website-types.md) and [Functional modules](modules.md) to record websiteType, optional additionalWebsiteTypes, and actual brief.modules. Website types and modules resolve through [Executable composition](composition.md). `adminRequired` selects optional admin asset layers; other selected business modules remain pending unless their documented foundation is scaffolded. Type selection does not change `--foundation` automatically. Keep existing module IDs and schemaVersion 1 continuation compatible. Older projects without a type can infer it from their recorded brief; do not reinitialize or silently change admin, provider, or business choices. The generator preserves extra brief fields. Existing applications and schemaVersion 1 records are not rewritten or migrated by these new-project composition rules.

For selected modules, record source, dependencies, configuration state, implemented surfaces, remaining work, and acceptance evidence in additional nonsensitive continuation fields. Preserve templates, checks, and existing implementation statuses. Do not mark a module completed merely because it was selected or scaffolded.

## Template migration

Check `adminRequired` first: single-page sites require the user's answer, other sites include admin by default, and explicit opt-out takes precedence. The generator reads `adminRequired`: false omits admin assets, schema, seed imports, and credentials; true adds optional admin layers. Landing/single-page sites without that decision fail before writing output. Legacy briefs preserve their existing defaults. Generator defaults are not user choices. Migrate only selected templates. For admin-enabled projects, implement logo upload, automatic favicon generation, and required rich text under [Admin management](admin.md); these rules do not imply every feature is already generated.

### Separate frontend and admin entry points and layouts

Default to distinct areas within one app, with different shells. In Next.js, a frontend `app/(store)/layout.tsx` can contain navigation, footer, and customer providers; protected admin pages live in `app/admin/(protected)/` with their own workbench layout. Root layout contains only html/body, metadata, and shared styles, not store providers. Put `app/admin/login/page.tsx` outside the protected group to prevent redirect loops. An embedded workbench login form is not a separate login page.

Admin pages validate sessions on the server and redirect unauthenticated requests to `/admin/login`. APIs independently authenticate each request. Separate customer/admin cookies, permission checks, and login flows. Customers cannot use admin APIs; an admin session must not impersonate a customer. Logout revokes the server session and returns to admin login. Expiry removes visible business data and returns to the independent login entry point. Follow any explicit alternative architecture requirement.

After download, read the pack's `SKILL.md`, `references/design-spec.md`, `references/effects.md`, and `tokens.css` when present. Generators differ: inspect help and implementation before assuming shared parameters or substitution behavior.

1. Run template generators in private temporary directories and inspect real pages and resource dependencies. Preserve source, version, and licenses. Do not publish template instructions or Python scripts.
2. Migrate frontend layouts to React. For commerce, connect products/details/variants/cart/checkout/order lookup to `/api/products` and `/api/orders`; use server-authoritative prices, stock, and totals. Use the actual business APIs for other industries.
3. Migrate admin sidebars, tables, forms, and charts to `/admin` and protected management APIs. Product updates in admin must appear in frontend queries.
4. Scope frontend styles to `.storefront` and admin styles to `.admin-shell`, or use CSS Modules. Do not load duplicate global Bootstrap/jQuery stacks. Preserve required animation without duplicate initialization and replace direct-DOM controllers with CSS/React where appropriate.
5. Copy only used images, fonts, icons, and licenses to `public`; update relative paths and remove fake login, draft submissions, and external template-source links.
6. Apply branding to titles, navigation, footer, and placeholder email/address data. Use the chosen language/currency consistently and remove misleading demo claims.

Foundation pages are workflow verification interfaces; selected templates must actually replace their visual structure. Preserve backend services, database, and authorization boundaries. Static admin HTML is not a protected admin system.

## Text and background readability

After migration or theme/shared-style changes, inspect actual rendered foreground/background pairs across frontend and admin. Ordinary text needs at least 4.5:1 contrast; large text (at least 24px, or 18.66px and bold) needs 3:1. Check secondary copy, placeholders, empty states, and table headers too; secondary status does not justify nearly invisible gray. Preserve brand character while choosing sufficiently dark gold on light backgrounds. Explicitly set headings and secondary copy on dark login panels instead of inheriting dark workbench headings.

Check transparent navigation over actual home/inner-page backgrounds and expanded menus. Image overlays must remain readable over bright regions after responsive crops; use sufficient scrims or independent text backgrounds. Do not calculate from average image color alone. Composite transparent colors before computing ratios. Cover default, hover, selected, focus, and status labels; do not communicate state by color alone. Scope fixes to frontend/admin, place overrides in the effective cascade, and check mobile media rules. Avoid mechanical global color replacement that breaks dark panels, buttons, or status semantics.

Calculate candidate combinations, then inspect real desktop/mobile rendering. Record page, element, foreground/background, and ratio. Code-level calculations are partial evidence, not proof that every page, image background, and interaction state passed.

## Optional commerce foundation and extensions

Commerce includes hashed admin credentials, database sessions, login-failure rate limiting, categories/products/SKUs, order snapshots, stock reservation, cancellation/restocking, and idempotent simulated payment events. Order creation accepts `Idempotency-Key`: repeat key/same payload returns the original order; different payload returns 409. Payment failure does not consume stock twice; cancelling a pending order restores stock, and a paid order may advance only to shipped.

For shipping, select routes/providers under [Shipping service selection](business.md#shipping-service-selection), then implement models, adapters, admin actions, and customer tracking under [Shipping fulfillment](shipping.md). Domestic China requires electronic labels, tracking-number/print-data return, and printing; China cross-border and markets outside China require order submission and tracking-number return. All routes retain manual entry/editing. Handle provider mapping, idempotency, signed callbacks, version conflicts, label access, and tracking. Document creation or printing must not be mistaken for dispatch.

Cart stores only SKU and quantity; the server reads current prices and validates availability/stock in a transaction. Order lookup requires the random access key returned at creation, not merely a guessable order number exposing another customer's address.

Follow [Payment requirements and channels](business.md#payment-requirements-and-channels): ecommerce integrates payments without another whether-needed question, defaulting to WeChat Pay/Alipay for China and Stripe/PayPal elsewhere; explicit choices take priority. Confirm non-ecommerce payment needs. With `paymentRequired: false`, remove unused payment entry points and simulated APIs. Persist channel switches with admin authorization and reflect them on the frontend. On every payment creation, validate enabled state, credentials, and environment server-side, not just hidden buttons. Disabling rejects new requests while preserving history and valid callbacks for existing payments.

When needed, integrate server payment creation, frontend result display, and server notifications in the provider's test/sandbox environment first. Derive amount/currency from server business data; validate signatures, amount/currency, replay, and concurrency. A successful browser return does not mark a business record paid. Keep secrets server-side and separate test/live environments; missing credentials remain unconfigured. Customer membership needs separate authentication and order ownership. Claim live email, shipping, and storage only when configured.

Previously checked official references: [Prisma SQLite](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/sqlite), [Next.js cookies](https://nextjs.org/docs/app/api-reference/functions/cookies). Recheck compatibility and tests when upgrading; do not unconditionally use latest.
