---
name: web-builder
description: Guide clients from business requirements through choosing Skillux frontend and admin templates to building a working full-stack website with shared data, authentication, and business workflows. Use for template-based website creation or continuing a project created with this skill.
---

# Web Builder

Turn a business brief into a working website: understand the requirements, choose a frontend, choose an admin interface and features, download from Skillux, then implement and verify the connected application. Communicate in the user's current language or explicit preference. Website language and multilingual requirements follow the user's choices, independently of conversation language or target market. Do not present a static template as an integrated business system.

## Start or continue

Use explicit country and region names, such as China, mainland China, or markets outside China. Determine shipping routes from the actual origin and destination, rather than relative descriptions based on the user's location.

- Check for `.web-builder/project.json` and an existing application first. When continuing, read recorded choices and checks; avoid repeated questions, reinitialization, or overwriting existing code.
- Ask about the business, audience, brand, market, and website language, then the features that affect implementation. Ecommerce requires payments without asking whether payments are needed; confirm payment requirements for other businesses. Ask only the questions needed for the current step and reuse known answers. The agent handles technical decisions; do not ask the client to choose a database or framework.
- Follow [Payment requirements and channels](references/business.md#payment-requirements-and-channels): ecommerce defaults to WeChat Pay and Alipay for China, Stripe and PayPal for markets outside China. Do not ask again whether to integrate them. Admins control each channel independently; both frontend and server accept only enabled, validly configured channels. Explicit user choices take precedence.
- Use [Business requirements and modules](references/business.md) to translate a request such as selling clothing into variants, inventory, checkout, and other concrete workflows. Confirm genuine open decisions without unnecessary approval steps.
- For ecommerce with shipping, follow [Shipping service selection](references/business.md#shipping-service-selection). If a Chinese-speaking user's route is unclear, distinguish domestic China from cross-border ecommerce first. Default to Kuaidi100 for domestic China, with Kdniao as an alternative; Easyship for cross-border, with AfterShip or Shippo as alternatives; Shippo for other users or markets, with ShipStation as an alternative. Reuse established routes and providers; conversation language alone does not determine the route. Skip shipping when unnecessary. Follow [Shipping fulfillment](references/shipping.md): domestic China aggregators require electronic labels, tracking-number return, and printing; China cross-border and markets outside China require order submission and tracking-number return. All routes retain manual entry/editing and shipment tracking.

## Choose the frontend, then the admin

For single-page sites, ask whether an admin area is needed before selecting an admin template. Other sites include one by default unless the user explicitly opts out. Skip admin selection and management modules when unnecessary. Sites with an admin area must provide logo upload and automatic favicon generation; see [Admin management](references/admin.md). Use rich text editing and safe rendering for long content such as product details and articles, rather than a plain textarea.

Use a shared image picker supporting uploaded-image browsing, local upload, and categories at real product, rich text, and branding entry points. Management lists support multiselect and appropriate bulk actions, with per-item server validation and results; see [Admin management](references/admin.md).

Every frontend and admin list page requires real pagination: content, products, orders, inquiries, accounts, roles, logs, image libraries, and similar lists. Show page numbers, previous/next, total records, and page size even for one-page results. Query the current page and count with identical filters. Fixed truncation or decorative controls do not implement pagination. Reset to page one after search, filter, or page-size changes; make selection scope across pages explicit. See [Admin management](references/admin.md) and [Verification](references/verification.md).

For image uploads, use the bundled shared size constants and explicitly set the upload route's request parsing limit. Base64 requests need encoding overhead and metadata allowance; do not apply the ordinary JSON request limit of 128 KB. Verify large images and boundary sizes using [Verification](references/verification.md).

Content pages require independent SEO. Derive the title from the product, article, or page name and generate `title - Site name`; do not ask for a separate SEO title. Keywords and description are required. Connect admin forms, server validation, persistence, and actual page metadata; see [Admin management](references/admin.md).

Read [Skillux discovery and downloads](references/skillux.md). Search the public catalog and recommend 3-5 suitable packs, showing names, real previews, covers, style, fit, and purchase status. Offer another selection when requested. A cover is product artwork, not a website screenshot. Disclose missing previews rather than inventing screenshots.

```bash
python "<skill>/scripts/skillux.py" catalog --role frontend --industry fashion
python "<skill>/scripts/skillux.py" catalog --role admin
```

After the frontend is selected, recommend admin interfaces and explain relevant product, order, member, or other modules. Admin templates are usually industry-neutral; do not exclude them with an irrelevant clothing filter. The user chooses the appearance unless they authorize the agent to choose. Before downloading, check entitlement: `owned` lists individual and bundle licenses, not a catalog pass. Run `skillux.py check <slug>` for every selected template. Offer a Skillux acquisition link or alternative only when the check establishes missing entitlement; do not purchase automatically. See [Skillux discovery and downloads](references/skillux.md).

## Automated implementation

For registration, membership, or third-party login, follow [Authentication](references/authentication.md) and the market defaults rather than asking about every common method. Recommend Casdoor for mainland China and Better Auth for markets outside mainland China; preserve explicit choices. Keep administrator and customer authentication and sessions separate. Ask only when the market, shared identity service, or explicit requirements leave a meaningful unresolved choice.

1. Record confirmed requirements as JSON; see [Implementation](references/implementation.md). Create the foundation and continuation record in a new directory using the commands below. The generator refuses to overwrite a nonempty directory.
2. Download selected templates into a private directory inside the project. The downloader records actual versions. Projects without an admin area download only the frontend. Do not install hundreds of separate skill entry points or publish entire downloaded packages.
3. Follow [Implementation](references/implementation.md): inspect template instructions, generators, and assets, then migrate the real frontend and `/admin` pages. Preserve the chosen visual design while connecting controls to shared backend services. An HTML iframe or a brand-name replacement is not a completed integration.
4. Default to Next.js, TypeScript, Prisma, and SQLite; keep a compatible existing architecture. Start with industry-neutral authentication and application foundations, then implement the business models, APIs, frontend, and admin actions. Use optional `--foundation commerce` only when selling and ordering are explicitly required, not because a template includes a cart.
   By default, use separate paths and layouts in one app: frontend `/`, admin `/admin`, and independent admin login `/admin/login`. Store navigation, footer, cart, and customer context must not wrap admin pages; the login page must not render the workbench sidebar. Protect admin pages on the server with login redirects, and independently authenticate management APIs with 401/403 responses. Customer sessions cannot grant admin access. Split into separate apps only when explicitly requested.
   Admin-enabled projects include roles, permissions, administrators, activity logs, settings, SEO, and password changes. The foundation supplies shared services and page components; a menu alone is insufficient. Extend permissions, roles, and modules for the actual business, such as categories/products/SKU stock, low-stock alerts, orders/shipping, and member status for a store. Do not force ecommerce models onto unrelated businesses. See [Admin management](references/admin.md).
5. Remove template draft downloads and fake-data handlers from connected features. Clearly disclose unconfigured payments, email, and shipping; do not simulate real delivery or charges.

```bash
python "<skill>/scripts/create_project.py" "<new-project>" --brief "<brief.json>"
python "<skill>/scripts/skillux.py" fetch <frontend-slug> --role frontend --project "<project>"
python "<skill>/scripts/skillux.py" fetch <admin-slug> --role admin --project "<project>"
```

Template assets must not overwrite foundation server code, credentials, or existing work. The bundled foundation is an executable starting point, **not the completed business implementation or selected template integration**. `businessImplementation` and `templateIntegration` start as `pending`; mark each `verified` only after its corresponding workflow or visual checks pass.

## Verification and delivery

After template migration or theme changes, check text contrast against actual frontend and admin backgrounds, including secondary text, table headers, hints, status labels, navigation, and image overlays. Fix unreadable combinations. See [Text and background readability](references/implementation.md#text-and-background-readability) and [Verification](references/verification.md) for thresholds and methods.

Follow [Verification](references/verification.md) for selection, permissions, persistence, stock, repeated requests, and mobile behavior. Exercise key business actions in local/isolated data or a sandbox and check both visible feedback and server/persisted results. Screenshots, typechecks, and builds do not replace interaction checks. Record verification and cleanup results. Deliver the complete local project by default; do not deploy by default. Real payments need confirmed channels and configuration. Distinguish verified, compile/visual-only, unexecuted, and blocked work; do not mark business workflows `verified` when key interactions have not run successfully.

This skill does not bundle the template library, remove original skills, or change Skillux purchase records. If the remote catalog is unavailable, preserve requirements and selections and report the blocker. Reuse local templates only when the user specifies them and they are legitimately available.
