# Website type routing

Select by the customer's primary task, not industry, template category, or visual style. A restaurant may be a presentation site, reservation site, or store. Infer from known requirements and ask only about a meaningful unresolved workflow.

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

Read one primary type. For a hybrid, record additional types and load their references only for the requested secondary workflow; share modules instead of duplicating systems. An unfamiliar domain can retain its own type ID and use the closest workflow guidance; this catalog is not a restriction on industries.

The single-page admin question overrides type defaults. Existing project decisions and explicit opt-outs override defaults. Type selection never authorizes commerce, accounts, or external services by itself. Use the [module index](modules.md) to turn the selected workflow into implementation scope.
