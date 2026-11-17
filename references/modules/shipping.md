# Shipping fulfillment, labels, and tracking

Read when enabling ecommerce shipping. Market/provider defaults are in [Shipping service selection](#shipping-service-selection); explicit user choices take precedence. These are workflows to implement, not capabilities already provided by the generator.

## Shipping service selection

When ecommerce needs delivery, shipment lookup, or fulfillment, first read existing route and provider choices. If a Chinese-speaking user's scenario is unclear, ask whether it is domestic China or cross-border ecommerce, then clarify origin and destination as necessary. Chinese conversation or site language alone does not imply domestic China delivery. Reuse known answers. Record domestic and cross-border routes separately when both apply; use the other-market policy for routes outside these scenarios.

Use the following recommended defaults and show alternatives. Explicit provider choices take precedence; updated defaults do not authorize migrating existing projects or shipment history.

| User/business scenario | Default | Alternatives |
| --- | --- | --- |
| Chinese-speaking user, domestic China ecommerce | **Kuaidi100** | **Kdniao** |
| Chinese-speaking user, cross-border ecommerce | **Easyship** | **AfterShip, Shippo** |
| Other users or markets | **Shippo** | **ShipStation** |

Record whether the selection came from the user or a default and its actual route coverage. Do not describe an inferred default as an explicit user confirmation. Skip this module when unnecessary; a default does not establish an account or API access.

Implement [Shipping fulfillment, labels, and tracking](#aggregator-integration-by-route): domestic China aggregators require electronic label requests, tracking numbers, print data, and printing. China cross-border and markets outside China require order submission and tracking-number return. All routes retain manual entry/editing and tracking. A tracking number or printed label is not proof of dispatch; confirm actual shipping separately.

Record routes, providers, product capabilities, and implementation status. Tracking-only or number-entry support is not full fulfillment. Use current official SDK/API documentation for fields, carriers, fees, account permissions, and callback verification. Without credentials, show the unconfigured state and allow manual recording without invented numbers, labels, or tracking events. Buying real labels or services is outside default local verification.


## Aggregator integration by route

- **Domestic shipping within China for the China market:** when binding Kuaidi100, Kdniao, or another aggregator SDK/API, implement electronic labels. Request a shipment from an admin order through the server with order, sender/recipient, and required parcel details. Receive provider document ID, carrier, tracking number, and print data; return them to admin with preview, printing, and reprinting. Complete asynchronous responses through polling or verified callbacks. Acceptance of a request is not receipt of a tracking number.
- **China cross-border and markets outside China:** submit orders to the chosen aggregator and receive tracking numbers. Persist mappings between local orders and provider orders/parcels. Supply route-specific sender/recipient, parcel, and required customs data, prompting for missing business fields. Map synchronous results, polling, and callbacks to the correct order/parcel. Update carrier/tracking and enable tracking. If the product provides labels, save their reference and printing entry point. Order submission alone does not satisfy the domestic China label requirement.
- **All routes:** always allow manual carrier/tracking-number entry and editing, rather than making provider APIs the only fulfillment path. Both automatic and manual shipments support tracking. Without credentials, permit manual records while accurately showing unconfigured/unavailable tracking.

Check selected products, SDK versions, merchant contracts, and account permissions for order submission, electronic labels, tracking-number retrieval, print data, and tracking events separately. A tracking-only product is not full fulfillment. Disclose missing required capabilities and confirm a compatible product or supplementary service. Without credentials, implement adapters/controls and disclose untested integration without inventing numbers or labels. Rate quotes are not a mandatory added module. Label requests may incur fees: verify in isolated data/provider sandboxes, not by automatically purchasing live labels.

## Admin actions and states

Order details provide Request electronic label for domestic China aggregator shipping, Submit shipping order for China cross-border/markets outside China, Check synchronization, Enter/edit manually, Confirm dispatch, and Track shipment. Domestic China provides preview/print/reprint; other routes offer printing when the provider supports it. Without a valid label, do not report fake printing success. Do not assume a particular printer brand; browser/PDF printing is acceptable, with specialist printer integrations only when required.

Before submission/request, validate order eligibility, sender/recipient, parcel, and provider-required fields. Distinguish submitting, accepted, awaiting tracking number, printable label, failed/needs correction, and actually dispatched. Tracking-number assignment and label generation/printing do not mean handover to a carrier. Advance dispatch state and record dispatch time only after explicit confirmation or a verified actual-dispatch event.

Protect manual edits with admin permission, validate carrier/number, and record before/after values, actor, time, and reason. Customers cannot edit. Preserve original provider IDs and label versions; do not relabel an old document with a new tracking number. If edits affect provider state, use its official update or cancel/recreate process. If unsupported, show pending divergence rather than claiming both sides match. After changing the active tracking record, old callbacks must not overwrite it. Reprinting reuses the existing label without a new request or duplicate charge.

## Persistence and API consistency

Use suitable Shipment/request/label models. Persist order/parcel association, route, provider, provider order/parcel IDs, carrier code/name, tracking number, automatic/manual source, current version, request/sync status, label reference/format, dispatch time, tracking status/events/last successful sync, and safe error summaries. Secrets stay in secure server configuration, not requirements, browsers, or logs.

Use persistent idempotency keys/unique constraints and concurrency handling for submissions, shipment requests, provider events, and dispatch confirmation. Keep external requests separate from local transactions and reconcile with provider request IDs and query APIs. After timeout, query the original result before creating another order or requesting another label. Verify callback signatures and prevent replay using provider rules, validating provider order/parcel, current version, and legal transitions. Trust neither a browser-submitted tracking number nor just a local order ID in a callback. Synchronize cancellation/voiding when supported; preserve history.

Labels contain sender/recipient details. Preview/download/print endpoints require admin authorization. Provider signed links or print credentials must not enter the public media library. Customers access their own shipments/tracking through verified membership ownership or an order access key, without direct access to other orders' labels or personal details.

Call tracking providers server-side, normalize events/times, support refresh/subscription, caching, and rate limits. After a number change, bind the right provider/carrier. Retain old history without mixing it into the new shipment. Display last successful sync, no events yet, failure, and unconfigured states without fabricated nodes.

## Verification

Exercise with local isolated data/provider sandboxes: domestic China shipment request -> tracking number/label return -> preview/print; China cross-border and markets outside China order submission -> tracking-number return/sync -> dispatch confirmation. For all routes, test manual entry, editing, persistence after refresh, and tracking, checking visible feedback, server responses, and data changes.

Also test missing fields, unauthorized access, provider failure, timeout/query recovery, duplicate requests/submissions, duplicate/out-of-order callbacks, old callbacks after manual changes, reprinting without recreation, and label creation not automatically marking dispatch. Without credentials or verified print output, mark blocked/unverified components separately. Buttons, screenshots, or compilation do not establish working fulfillment.
