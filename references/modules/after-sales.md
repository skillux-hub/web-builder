# After-sales cases, returns, refunds, and disputes

Use for selected post-purchase services: refund requests, returns, exchanges, warranty or disputes. Adapt the source record to the actual order, booking or enrollment; do not force a product/cart model onto service refunds. [Lists](lists.md) supports case queues. Monetary refunds use [Payments](payments.md); physical returns use selected [Shipping](shipping.md) rules.

## Data and workflow

Record source transaction/line, claimant/access proof, requested type/reason/quantity/amount, attachments, eligibility-policy snapshot, decisions, return inspection, refund/provider IDs, status and safe audit history. Derive refundable amounts and remaining quantities from server history. Enforce customer/seller/platform scopes; a seller cannot approve another seller's case. Private evidence uses [Files](files.md).

Define requested -> under review -> approved/rejected -> waiting return/processing refund -> resolved, with cancellation/failure states where relevant. Approval, receiving a returned item and successful money refund are separate facts. Payment callbacks/reconciliation establish refund completion. Repeated requests/callbacks cannot refund, restore stock or revoke access twice; partial cases must preserve previously processed quantities and amounts.

Specify when returns affect stock, fees, seller settlement and digital access. Use [Marketplace](marketplace.md) for seller/platform allocation and [Entitlements](entitlements.md) for the agreed access effect. Do not assume every refund permits restocking or every dispute immediately revokes access. Notifications are added only for selected case updates.

## Acceptance

Exercise eligibility -> request -> authorized review -> applicable return/inspection -> refund/reconciliation -> final state. Cover partial refunds, duplicate/concurrent events, rejection, provider failure/retry, ownership and previously refunded amounts. A local CANCELLED status or successful browser return does not prove a provider refund. Use isolated data and provider sandboxes without issuing real refunds by default.
