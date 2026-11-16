# Business requirements and modules

Collect requirements through a business conversation rather than a technical questionnaire. Establish the main workflow first, then decisions affecting data and pages. Record actual answers and accepted defaults. Clothing commerce is only an example; model other industries from their requirements. Do not add a store, payments, inventory, or membership to a nontransactional site by default.

## Payment requirements and channels

Ecommerce requires payment integration: record `paymentRequired: true` with the ecommerce business rule as its source. Do not ask whether payments are needed. Use the confirmed market defaults without first asking the user to select channel switches:

- China: **WeChat Pay and Alipay**.
- Markets outside China: **Stripe and PayPal**.

Provide independent admin enable/disable controls. Record integration capability separately from the current enabled state. Explicit channel requirements take precedence; support the actual coverage of a cross-market business. Confirm only missing market, currency, or one-time/subscription decisions that affect implementation. Check current official documentation for merchant eligibility, regions, currencies, and channel capabilities; do not promise availability to every merchant.

For non-ecommerce businesses such as appointments, courses, subscriptions, or paid content, first establish whether online payments are needed, reusing any existing answer. If not, record `paymentRequired: false` and skip payment integrations, buttons, APIs, and simulated payment flows; retain actual inquiry or appointment workflows. If needed, recommend market-appropriate channels and confirm the real requirements. A template checkout button is not a confirmed payment requirement.

Record the payment requirement and source, market, currency, integrated channels, individual enabled states, collection model, and test/live status in `.web-builder/project.json`, never merchant secrets. Without credentials, complete ecommerce adapters and channel management, but keep incompletely configured channels unavailable. A toggle cannot bypass configuration validation. Distinguish unconfigured, disabled, test-ready, and live-ready states. Sandbox or simulated checks do not establish live collection. When all channels are unavailable, explain this at checkout; do not fake success or silently substitute another method. Changes to existing systems must preserve historical orders, payments, and confirmed channel settings.

## Clothing store conversation example

Ask what clothing is sold, which market it serves, the website language and multilingual needs, and the currency.

Recommend frontend designs, then ask which product/inventory, order, and member management features are needed, including size/color variants and delivery when relevant.

The optional basic commerce foundation supports categories, product images, size/color SKUs, integer minor-unit prices, stock, browsing/filtering, cart, shipping address, checkout, and order access keys. Admins can log in, maintain products/variants, and handle orders. Payment test results are explicitly simulated. The foundation does not include live payments, email, shipping integrations, or customer accounts.

## Shipping service selection

When ecommerce needs delivery, shipment lookup, or fulfillment, first read existing route and provider choices. If a Chinese-speaking user's scenario is unclear, ask whether it is domestic China or cross-border ecommerce, then clarify origin and destination as necessary. Chinese conversation or site language alone does not imply domestic China delivery. Reuse known answers. Record domestic and cross-border routes separately when both apply; use the other-market policy for routes outside these scenarios.

Use the following recommended defaults and show alternatives. Explicit provider choices take precedence; updated defaults do not authorize migrating existing projects or shipment history.

| User/business scenario | Default | Alternatives |
| --- | --- | --- |
| Chinese-speaking user, domestic China ecommerce | **Kuaidi100** | **Kdniao** |
| Chinese-speaking user, cross-border ecommerce | **Easyship** | **AfterShip, Shippo** |
| Other users or markets | **Shippo** | **ShipStation** |

Record whether the selection came from the user or a default and its actual route coverage. Do not describe an inferred default as an explicit user confirmation. Skip this module when unnecessary; a default does not establish an account or API access.

Implement [Shipping fulfillment, labels, and tracking](shipping.md): domestic China aggregators require electronic label requests, tracking numbers, print data, and printing. China cross-border and markets outside China require order submission and tracking-number return. All routes retain manual entry/editing and tracking. A tracking number or printed label is not proof of dispatch; confirm actual shipping separately.

Record routes, providers, product capabilities, and implementation status. Tracking-only or number-entry support is not full fulfillment. Use current official SDK/API documentation for fields, carriers, fees, account permissions, and callback verification. Without credentials, show the unconfigured state and allow manual recording without invented numbers, labels, or tracking events. Buying real labels or services is outside default local verification.

Membership, coupons, refunds, tax, multiple currencies/warehouses, rate calculation, third-party login, and upload storage are requirement-driven additions. Implement selected modules with real models and complete workflows, not merely template pages. Use guest checkout without membership requirements; guest order lookup is not a membership system.

## Other industries

Determine whether the site is single-page. Ask about an admin area for a single-page presentation or landing page; otherwise include one by default unless explicitly declined. Record `adminRequired` and its source, then skip admin recommendations if unnecessary. Admin-enabled projects include logo upload and automatic favicon generation. Use rich text for long product, article, or service content; add content modules only when needed, not an automatic blog.

| Business | Frontend workflow | Admin and real data |
| --- | --- | --- |
| Business services/presentation | Services, cases, contact | Service/case maintenance and inquiry processing |
| Appointments/healthcare/repairs | Services, times, bookings | Services, slots, booking status; collect necessary information only |
| Education | Courses, teachers, enrollment | Courses, enrollments, capacity |
| Food/travel | Menus/products, reservations | Menu/product maintenance, reservations, capacity |
| Content/portfolio | Lists, details, search | Publishing, categories, draft/published states |
| Data console | Metrics, filters, actions | Data sources, queries, business permissions |

These map intentions to implementation, not prebuilt backend promises. Define core models, admin actions, frontend submissions, and state transitions for the chosen industry, then verify shared data across frontend and admin.

## Defaults

For accounts, read [Authentication](authentication.md), reuse established choices, and apply its market defaults and meaningful follow-up rules. Distinguish customer and admin methods. Recommend Casdoor for mainland China and Better Auth elsewhere; clarify shared identity or custom requirements when necessary rather than repeatedly asking about known methods.

New projects default to local SQLite and one admin role. Website language and multilingual support follow requirements, with no fixed Chinese or English requirement. Transactional sites default to one currency. Obtain business-sensitive language, currency, and shipping-cost choices from requirements or clearly label provisional values. Do not ask nontransactional businesses about currency or delivery. A template's original English does not lock the site language. The client need not select a stack. Prefer supplied brand assets; label demonstration products and data and do not invent credentials, qualifications, or real business metrics.
