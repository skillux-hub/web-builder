# Executable type and module configuration

The source of executable presets is [config/catalog.json](../config/catalog.json). It contains website type required/default/optional modules, module dependencies/conflicts/legacy aliases, and foundation asset layers. Prose type/module references explain the workflows; the catalog resolves scope and asset selection. Keep both consistent when changing a preset.

## Input and preview

```json
{
  "brand": "Example Services",
  "business": "Services and appointment requests",
  "locale": "en-GB",
  "websiteType": "business",
  "additionalWebsiteTypes": ["booking"],
  "adminRequired": false,
  "adminRequirementSource": "user",
  "modules": ["services", "appointments", "inquiries"],
  "excludedModules": []
}
```

```bash
python "<skill>/scripts/composition.py" --brief "<brief.json>"
python "<skill>/scripts/create_project.py" "<new-project>" --brief "<brief.json>"
```

Preview resolves a plan without creating a project or contacting a service. `--foundation commerce` is explicit for both commands and requires `orders` in the brief and a currency. Website type defaults do not silently select a different executable foundation. A commerce type with standard foundation records commerce work as pending rather than claiming it was generated.

Use `adminRequired` as a boolean. A `landing` type or `singlePage: true` requires an explicit admin decision; do not invent the answer. Other new multi-page sites default to admin. Briefs without type/admin fields retain legacy admin defaults. `additionalWebsiteTypes` contributes secondary defaults, not duplicate systems.

`modules` retains original business IDs. Known aliases (services -> content, appointments -> bookings, orders -> commerce) resolve to reference modules without rewriting the brief. Unknown IDs are retained as custom modules; unknown website types use explicit module choices. `optional` modules are suggestions, not auto-selected features. Showcase products do not imply commerce.

`excludedModules` removes default suggestions; it cannot remove an explicit requested module or a dependency. Contradictions fail before output is written. Ecommerce requires commerce/payments; excluding them fails. Set `adminRequired: false` to omit admin; explicitly requesting admin while false fails. The catalog supports conflicts and dependency-cycle checks for future additions.

## Asset layers and continuation

- Always copy `core` and the selected `standard` or `commerce` foundation.
- Add `admin` and `admin-standard` or `admin-commerce` only when admin is enabled. Append the common admin schema fragment only in that case. Seed imports and local credentials follow the same decision.
- Without admin, no admin pages/components, authentication/governance services, administrator tables, or administrator credentials are generated. Public settings, database support, and selected commerce APIs remain available. Navigation respects `site.config.json.adminRequired`.
- `.web-builder/project.json.composition` records catalog version, types/admin source, asset layers, module sources/status/reference, and custom module IDs. `adminArchitecture` is null when disabled. Existing schemaVersion 1 and brief/module IDs remain compatible.

`scaffolded` means an executable foundation exists for admin or commerce; it does not mean a complete business module or chosen design passed acceptance. Other modules remain `pending`, including payment providers, media library, and SEO forms. The catalog is not an installer for all selected modules. Implement their remaining workflows under their references and verify them before marking completion.

The generator only creates new empty directories. Catalog or adminRequired changes do not migrate an existing application, delete data, or remove administrator access. Existing projects require a deliberate code/data migration within the requested scope.


## Additional website workflows

The tool, community, and marketplace types resolve through execution, community, and marketplace modules respectively. These modules remain pending; they do not add executable asset layers. Marketplace composes commerce/payment rules, but even --foundation commerce does not generate seller isolation, commissions, or payouts. Catalog version 2 adds these presets; existing version 1 plans remain historical records and are not rewritten.

Record bookingModel (slots/date-range/capacity) and educationMode (presentation/enrollment/learning) in the brief when applicable. These scope decisions are preserved as requirements, not implemented engines or automatic module installers. Read their type/module references before implementation.


## Shared service modules

Catalog version 3 adds files, notifications, subscriptions, entitlements, tenancy, search, after-sales, and taxonomy. These modules remain pending and add no executable asset layers. Media reuses files/taxonomy; commerce reuses taxonomy; directory reuses search/taxonomy. Existing version 1/2 continuation plans remain historical records and are not silently rewritten.

Category/tag brief IDs (categories, tags) resolve to taxonomy while the original brief is preserved. Taxonomy requires lists; category covers and public category SEO are conditional companions. Subscriptions require entitlements; online paid collection adds payments only after that requirement is established. Tenancy requires authentication/lists; free/manual entitlement grants, guest-file access and offline after-sales do not automatically create a storefront, paid provider or customer registration.

Presets list optional services relevant to each type. Only explicit selection or an actual dependency resolves them into the plan. During implementation read conditional companions when their workflow applies: notices -> delivery configuration, private files -> authorized storage, paid renewals -> payments, organization grants -> tenancy, returns -> shipping, and refunds -> the selected payment/business transaction model. Selecting any of these modules is not evidence of provider configuration or successful business operations.


## SMS channel selection

Catalog version 4 adds sms as an optional channel for website workflows. Explicit modules: ["sms"] resolves sms plus notifications, with both remaining pending and no new executable asset layer. Selecting notifications or authentication alone does not activate SMS. Select sms together with authentication when phone verification/login is actually required; ordinary transactional SMS does not require customer registration. See [SMS](modules/sms.md) for configuration, country/provider/template routing, limits, delivery and verification boundaries. Existing version 1/2/3 plans are not silently rewritten, and no credentials or sending capability are inferred from module selection.
