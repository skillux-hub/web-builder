# Availability, reservations, and capacity

Use for appointments, service bookings, restaurant/travel reservations, and event registration when time or capacity matters. Model services/resources, slots or periods, capacity, bookings, necessary customer details, and status history. Keep domain names rather than forcing every reservation into a product order.

## Booking models

| Brief bookingModel | Availability rule | Checks |
| --- | --- | --- |
| slots | A resource/person is available for the full start/duration interval, including selected buffers | Reject overlap/invalid duration; test adjacent appointments, timezone and relevant daylight-saving boundaries. |
| date-range | Inventory is available across every included date/interval | Define arrival/departure inclusivity, nights and local timezone; test adjacent/overlapping stays and rollback if any day is unavailable. |
| capacity | A named event/session has a finite number of places | Validate participant quantity; reserve/release exactly once; concurrent requests cannot exceed capacity. |

Select the model from requirements, not template widgets. Hybrids can use separate resources/sessions. Date/quantity edits revalidate availability transactionally. These are implementation profiles, not separately generated booking engines.

Establish timezone, duration, booking window, capacity, cancellation/rescheduling rules, and confirmation method from requirements. Validate availability transactionally on the server; reject conflicting or past bookings. Repeated submissions must not consume capacity twice. Cancellation releases capacity exactly once. Do not invent a scheduling calendar when an inquiry is sufficient.

Ask whether online payment is required unless already known; load [Payments](payments.md) only if needed, and define hold expiry/payment/cancellation interaction. Customer accounts are optional; guest access needs a private token or equivalent proof. Notifications require real configured delivery.

Verify availability -> booking -> frontend confirmation -> admin processing -> cancel/reschedule, including concurrent attempts for the last place and correct displayed timezone after refresh. For courses, combine with [Learning](learning.md).
