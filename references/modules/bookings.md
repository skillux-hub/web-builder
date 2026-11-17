# Availability, reservations, and capacity

Use for appointments, service bookings, restaurant/travel reservations, and event registration when time or capacity matters. Model services/resources, slots or periods, capacity, bookings, necessary customer details, and status history. Keep domain names rather than forcing every reservation into a product order.

Establish timezone, duration, booking window, capacity, cancellation/rescheduling rules, and confirmation method from requirements. Validate availability transactionally on the server; reject conflicting or past bookings. Repeated submissions must not consume capacity twice. Cancellation releases capacity exactly once. Do not invent a scheduling calendar when an inquiry is sufficient.

Ask whether online payment is required unless already known; load [Payments](payments.md) only if needed, and define hold expiry/payment/cancellation interaction. Customer accounts are optional; guest access needs a private token or equivalent proof. Notifications require real configured delivery.

Verify availability -> booking -> frontend confirmation -> admin processing -> cancel/reschedule, including concurrent attempts for the last place and correct displayed timezone after refresh. For courses, combine with [Learning](learning.md).
