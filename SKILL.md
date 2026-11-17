---
name: web-builder
description: Build or continue template-based websites with Skillux designs, routing business requirements by website type and composing only the needed functional modules into a working application.
---

# Web Builder

Turn a business brief into a working local website with selected Skillux designs and connected workflows. Communicate in the user's language; website language and market follow their own requirements. A static template, generated foundation, or menu is not an implemented business system.

## 1. Establish or resume scope

Check the existing app and `.web-builder/project.json` first. Reuse choices, downloaded versions, and check results; do not reinitialize or overwrite work. Follow [Business requirements](references/business.md) for the brief and defaults. Ask only questions whose missing answers change the current work.

Classify by primary customer workflow using [Website types](references/website-types.md):

| Type | Read when |
| --- | --- |
| [Landing](references/website-types/landing.md) | Single-page campaigns and simple presentations |
| [Business](references/website-types/business.md) | Company, services, cases and multi-page portfolios |
| [Commerce](references/website-types/commerce.md) | Actual online selling/ordering |
| [Content](references/website-types/content.md) | Publishing, articles, magazines, portfolios |
| [Booking](references/website-types/booking.md) | Appointments, reservations, event registration |
| [Education](references/website-types/education.md) | Courses, enrollment, learning delivery |
| [Directory](references/website-types/directory.md) | Searchable listings and publisher submissions |
| [Dashboard](references/website-types/dashboard.md) | Data consoles, SaaS workspaces, internal tools |
| [Tool](references/website-types/tool.md) | Calculators, AI tools, conversion and execution workflows |
| [Community](references/website-types/community.md) | Forums, questions/answers and member-generated discussions |
| [Marketplace](references/website-types/marketplace.md) | Independent sellers/providers transacting through a platform |

Read one primary type; add a secondary type only for a requested hybrid workflow. Industry and template appearance do not determine type. Record `websiteType` and optional `additionalWebsiteTypes` in the brief without changing existing module IDs. Unlisted domains can compose the nearest applicable workflows.

Determine admin need before admin selection: ask for single-page sites unless already answered; otherwise include admin by default unless explicitly declined. Record `adminRequired` and its source. Preserve an existing decision.

## 2. Compose functional modules

Use [Functional modules](references/modules.md) to select and load only relevant rules. Each module owns its data, actions, states, dependencies, and acceptance:

- Shared capabilities: admin governance, lists/bulk operations, media/branding, files/storage, content/rich text, taxonomy, search, SEO, customer/workspace authentication and organization tenancy.
- Business capabilities: commerce, inquiries, bookings, learning, directories, analytics, tool execution, community moderation, multi-seller marketplaces.
- Service lifecycle: notifications, subscriptions, access entitlements and after-sales, only for selected workflows. Paid subscriptions use payments when confirmed; identity, subscription periods and actual access have separate responsibilities.
- Integrations: payments, shipping and SMS, only for workflows that need them. SMS reuses notification orchestration; verification challenges and login remain in authentication.

For SMS selection, use [Country-based SDK recommendations](references/sms-providers.md) to suggest two or three providers from the user's/merchant's known country and actual recipient destinations, preserving existing provider choices.

For shipping selection, use [Country-and-route SDK/API recommendations](references/shipping-providers.md). Start from the user's/merchant's known country, then qualify warehouse origin -> destination and required fulfillment capabilities. Distinguish official SDKs from official REST adapters and preserve established provider choices.

Use [Executable composition](references/composition.md) and `scripts/composition.py --brief <brief.json>` to preview resolved scope. [config/catalog.json](config/catalog.json) owns presets, dependencies, exclusions, and asset layers. Record selection sources; planned modules are not implemented features. Ecommerce requires [Payments](references/modules/payments.md) without asking again whether payments are needed. Establish payment need for other businesses. [Shipping](references/modules/shipping.md) follows actual origin/destination and fulfillment needs. Template widgets do not authorize either module. Admin-only login does not require customer accounts.

## 3. Select designs and acquire templates

Read [Skillux discovery and downloads](references/skillux.md). Recommend 3–5 suitable frontend packs with real covers/previews, style/fit, and purchase status. A cover is product artwork; disclose missing previews. Offer another selection when requested. The user chooses appearance unless they authorize agent selection.

After frontend selection, recommend an industry-neutral admin design if admin is needed and explain selected management modules. If the requested dashboard already is the management interface, avoid selecting a duplicate workbench for the same purpose. Check every selected slug with `check`; `owned` lists licenses, not a catalog pass. Offer acquisition links/alternatives only after missing entitlement is established; never purchase automatically.

```bash
python "<skill>/scripts/skillux.py" catalog --role frontend --industry fashion
python "<skill>/scripts/skillux.py" catalog --role admin
python "<skill>/scripts/skillux.py" check <slug>
```

## 4. Implement the composed application

Read [Implementation and continuation](references/implementation.md). Save nonsensitive requirements JSON, generate only for new projects, and download selected templates privately. Default to Next.js, TypeScript, Prisma, and SQLite; retain compatible existing architecture. `standard` is industry-neutral; choose `commerce` only for explicit selling/ordering with `orders` and a confirmed currency.

```bash
python "<skill>/scripts/create_project.py" "<new-project>" --brief "<brief.json>"
python "<skill>/scripts/skillux.py" fetch <frontend-slug> --role frontend --project "<project>"
python "<skill>/scripts/skillux.py" fetch <admin-slug> --role admin --project "<project>"
```

Skip admin downloads when not needed. Set `adminRequired: false` before generation to omit admin assets, routes, models, and credentials. Single-page generation requires an explicit admin decision. Existing projects are not automatically migrated. Read template instructions/generators and migrate real pages/assets; an iframe or brand replacement is insufficient. Protect shared backend code, credentials, and existing work.

For each selected module, connect frontend -> server validation -> persisted data -> admin/operational workflow when applicable. Keep `/`, `/admin`, and `/admin/login` layouts and customer/admin sessions independent. Load the module rules while implementing its surfaces: real pagination for lists, shared image uploads/pickers with proper request limits, rich text with safe rendering, derived page SEO, and working admin governance. Do not create unrequested commerce features in other types.

The generator supplies foundations, not selected business modules or template integration. Keep `businessImplementation` and `templateIntegration` pending until their actual checks pass. Remove fake handlers from connected features; disclose missing payment, shipping, identity, email, and storage configuration.

## 5. Verify and deliver

Read [Verification](references/verification.md), applying shared checks plus only selected module/type checks. Exercise key actions in isolated local data or sandboxes and verify visible feedback, server results, persistence, authorization, failure cases, and relevant concurrency. Build/typechecks/screenshots alone do not prove working behavior. Inspect actual desktop/mobile pages and text/background contrast after design migration.

Record checks and cleanup in continuation state, distinguishing verified interaction, compile/visual-only, unexecuted, and blocked work. Deliver the complete local project with absolute path, startup/access instructions, template versions, results, and remaining configuration. Deployment and purchases are not default delivery actions.

Do not bundle the remote template library or alter purchase records. If the catalog is unavailable, preserve requirements/selections and report the blocker. Use legitimate local templates when specified by the user.
