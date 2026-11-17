# Web Builder

**English** | [简体中文](README.zh-CN.md)

A business website-building skill for AI coding agents. Define the scope through **website types × functional modules**, choose Skillux design templates, generate an application foundation, connect business workflows, and verify the result.

Use it to create template-based websites or continue projects built with this skill. Start with [SKILL.md](SKILL.md); executable presets and dependencies live in [config/catalog.json](config/catalog.json).

## How it works

**Skillux login → Business requirements → Website type → Functional modules → Frontend/admin templates → Implementation → Verification and delivery**

- Compose modules around real workflows, including hybrid sites, without adding commerce or membership to every project.
- Generate admin features only when needed. Admin-free projects omit management pages/APIs, administrator models, and administrator credentials.
- Select templates with previews, entitlement checks, and version records that support continuing existing work.
- Recommend SMS SDKs using the user/merchant country and recipient destinations; recommend shipping SDKs/APIs using merchant country, warehouse origin, and destination.
- Record implementation status separately from verification evidence, distinguishing planned work, scaffolding, verified behavior, and configuration blockers.

## Install and get started

Install through the Skills CLI and choose your agent and installation scope as prompted:

```bash
npx skills add https://github.com/skillux-hub/web-builder --skill web-builder
```

Alternatively, clone the repository and install the complete directory using your agent's skill installation method. Preserve the relative structure of `SKILL.md`, `references`, `config`, `scripts`, and `assets`.

Example request:

```text
Use $web-builder to build a website for a repair company serving the UK.
The site should be in English, with services, case studies, bookings,
customer inquiries, and an admin area. Help me choose frontend and admin
templates, implement and verify the workflows, and deliver a local project first.
```

For an existing project, describe the change you need. The agent first reads `.web-builder/project.json` and the application code, reusing recorded language, template, module, and provider decisions.

## 11 website types

| Type ID | Workflow |
| --- | --- |
| `landing` | Single-page presentations, campaigns, and product launches |
| `business` | Company sites, services, case studies, and multi-page portfolios |
| `commerce` | Product sales and fulfillment for a single operator |
| `content` | Blogs, publications, knowledge content, and portfolios |
| `booking` | Appointment slots, date-range reservations, and event capacity |
| `education` | Course presentation, enrollment, and online learning |
| `directory` | Categorized listings, discovery, and contact |
| `dashboard` | Data consoles, operations, and workspaces |
| `tool` | Calculators, AI tools, file conversion, and execution results |
| `community` | Forums, Q&A, member content, and moderation |
| `marketplace` | Seller onboarding, transactions, commissions, and settlement |

See the [website type index](references/website-types.md) for scope, module mappings, and acceptance scenarios. A listing directory does not automatically include multi-seller transactions; a course presentation site does not automatically include a full learning platform.

## 26 functional modules

| Capability group | Module IDs |
| --- | --- |
| Administration and identity | `admin`, `authentication`, `tenancy` |
| Content and organization | `content`, `taxonomy`, `search`, `seo` |
| Lists and resources | `lists`, `media`, `files` |
| Transactions and fulfillment | `commerce`, `payments`, `shipping`, `after-sales` |
| Customers and learning | `inquiries`, `bookings`, `learning` |
| Periods and access | `subscriptions`, `entitlements` |
| Notifications and channels | `notifications`, `sms` |
| Platforms and execution | `directory`, `execution`, `community`, `marketplace`, `analytics` |

The [module index](references/modules.md) defines selection criteria, dependencies, and acceptance rules. Categories and tags use `taxonomy`; payments manage transactions, subscriptions manage periods, and entitlements control access to features, content, and usage allowances.

Provider guides: [SMS SDK recommendations](references/sms-providers.md) · [Shipping SDK/API recommendations](references/shipping-providers.md). A recommendation does not establish an active account, route coverage, or a completed integration.

## What is executable today

| Component | Current scope |
| --- | --- |
| Composition resolver | Website types, explicit modules, dependencies, exclusions, aliases, and admin decisions; supports plan previews |
| `standard` foundation | Next.js, TypeScript, Prisma, SQLite, site settings, and optional admin scaffolding |
| `commerce` foundation | Example products, SKUs, stock, cart, orders, access keys, simulated payments, and optional admin scaffolding |
| Skillux tools | Catalog discovery, entitlement checks, selected template downloads, and version recording |
| Other business modules | Instructions loaded as needed for implementation and verification, rather than completed installable plugins |

**Selecting a module does not implement it, and generating a foundation does not complete a website.** Selected templates still require real migration. Payments, SMS, email, shipping, and other external services require valid configuration and verification. Simulated payments do not charge money. The generator does not automatically supply seller isolation, settlements, or booking engines.

## Developer quickstart

The generation tools require Python 3.10+. Generated applications require Node.js 22.12+, npm, and an environment that supports SQLite native dependencies. Additional SDKs may have higher runtime requirements; check the chosen version before integration.

```bash
git clone https://github.com/skillux-hub/web-builder.git
cd web-builder
```

Save a brief outside the repository, for example as `../brief.json`:

```json
{
  "brand": "Example Services",
  "business": "Service presentation, case studies, and customer inquiries",
  "locale": "en-GB",
  "region": "United Kingdom",
  "websiteType": "business",
  "adminRequired": true,
  "adminRequirementSource": "user",
  "modules": ["services", "cases", "inquiries", "categories"]
}
```

From the repository root, pass the login gate, preview the composition, and generate into an empty directory outside the repository. When using selected templates, their access checks must pass before generation:

```bash
python scripts/skillux.py login
python scripts/composition.py --brief ../brief.json
python scripts/create_project.py ../example-site --brief ../brief.json
```

```bash
cd ../example-site
npm install
npm run setup
npm run dev
```

Open the local URL shown in the terminal. If admin is enabled, visit `/admin`; generated credentials are in the project's `LOCAL_ACCESS.md`. Keep that file and `.env` private.

For the commerce foundation, explicitly include `orders` and a three-letter `currency` code in the brief, and add `--foundation commerce` to the preview/generation commands. Setting `websiteType: "commerce"` alone does not switch the executable foundation. Single-page sites require an explicit `adminRequired` decision; set it to `false` for an admin-free project.

The generator refuses to overwrite nonempty directories and does not automatically migrate existing applications. See [composition configuration](references/composition.md) and [implementation guidance](references/implementation.md) for full input and continuation rules.

## Templates and entitlement

Web Builder verifies the Skillux session before starting. Missing or expired login opens official browser authorization and waits for approval. Once a template is selected, confirmed missing entitlement opens its detail page so the user can buy the template or an applicable membership/pass. The workflow continues only after server-side access is granted. The underlying public catalog endpoint remains anonymous:

```bash
python scripts/skillux.py login
python scripts/skillux.py catalog --role frontend --industry services
python scripts/skillux.py catalog --role admin
python scripts/skillux.py check <template-slug>
python scripts/skillux.py fetch <template-slug> --role frontend --project ../example-site
```

Skip admin templates when no admin area is needed. The Skillux CLI manages login credentials; do not put them in briefs or project records. Downloads remain in the project's private template directory. This repository does not bundle the remote template library or purchase templates automatically. See [Skillux discovery and entitlement](references/skillux.md).

## Project records and verification

`.web-builder/project.json` records the original brief, composition plan, actual template versions, implementation status, and checks. `pending` means implementation is still required; `scaffolded` means a foundation exists. Business implementation and template integration can be marked complete only after their corresponding checks pass.

Run Python checks from the skill repository:

```bash
python -B -m unittest discover -s tests -v
```

Run application checks inside a generated project:

```bash
npm run typecheck
npm test
npm run build
```

Key workflows also need verification of user actions, server results, persistence, permissions, and failures. A successful build does not prove every business workflow works. Use HTTP checks only against isolated local test projects, and prefer provider sandboxes or local sinks for external services. See [verification guidance](references/verification.md). Local project delivery is the default; deployment and real external operations follow the user's request.

## Repository structure

```text
web-builder/
├── SKILL.md              Skill entry point and routing
├── agents/               Agent interface metadata
├── config/               Website types, module dependencies, and asset layers
├── references/           Types, modules, implementation, and provider guides
├── assets/               core / standard / commerce / optional admin layers
├── scripts/              Composition preview, generation, and Skillux tools
└── tests/                Composition and local HTTP checks
```

## License

This repository is licensed under the [MIT License](LICENSE). Separately acquired templates, images, fonts, and third-party components retain their own license terms; the repository license does not replace them.
