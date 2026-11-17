# Website type routing

Use [Executable composition](composition.md) for preset resolution and conditional generation. Select by the customer's primary task, not industry, template category, or visual style. A restaurant may be a presentation site, reservation site, or store. Infer from known requirements and ask only about a meaningful unresolved workflow.

| ID | Type reference | Typical requests |
| --- | --- | --- |
| `landing` | [Landing pages and single-page campaigns](website-types/landing.md) | Product launch, campaign, event presentation, simple one-page portfolio. |
| `business` | [Business websites and service portfolios](website-types/business.md) | Company sites, agencies, professional services, multi-page portfolios. |
| `commerce` | [Ecommerce and online stores](website-types/commerce.md) | Retail, physical/digital goods, direct online ordering. |
| `content` | [Content, publishing, and portfolios](website-types/content.md) | Blogs, news, magazines, knowledge bases, author/creative portfolios. |
| `booking` | [Appointments, reservations, and events](website-types/booking.md) | Healthcare/repair appointments, restaurant/travel reservations, event registration. |
| `education` | [Education and training](website-types/education.md) | Schools, course catalogs, cohort enrollment, online learning. |
| `directory` | [Directories, listings, and classified platforms](website-types/directory.md) | Property, jobs, service directories, listing marketplaces. |
| `dashboard` | [Dashboards, SaaS workspaces, and internal tools](website-types/dashboard.md) | Data/reporting consoles, customer portals, operational workspaces. |
| `tool` | [Tools and execution applications](website-types/tool.md) | Calculators, AI tools, converters, generators, execution jobs. |
| `community` | [Communities, forums, and Q&A](website-types/community.md) | Member-created threads, replies, answers, reports and moderation. |
| `marketplace` | [Multi-seller transactional marketplaces](website-types/marketplace.md) | Seller onboarding, buyer transactions, commissions and settlements. |

Read one primary type. For a hybrid, record additional types and load their references only for the requested secondary workflow; share modules instead of duplicating systems. An unfamiliar domain can retain its own type ID and use the closest workflow guidance; this catalog is not a restriction on industries.

Choose tool for execution/results and dashboard for primarily inspecting/managing data. Choose content for editorial publishing and community for member publishing/interaction. Directory covers discovery/contact without platform transactions; marketplace adds independent sellers and transaction allocation/settlement; commerce covers a single operator's selling workflow. SaaS billing, tenancy, subscriptions, access entitlements, and industry-specific application forms remain requirement-driven modules/workflows rather than top-level types.

The single-page admin question overrides type defaults. Existing project decisions and explicit opt-outs override defaults. Type presets describe workflow requirements; they do not activate external services, authorize purchases, or migrate existing choices. Use the [module index](modules.md) to turn the selected workflow into implementation scope.
