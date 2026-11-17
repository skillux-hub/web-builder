# Appointments, reservations, and events

Use for: Healthcare/repair appointments, restaurant/travel reservations, event registration.

## Scope and workflow

Service/resource -> availability -> reservation -> confirmation -> processing -> cancel/reschedule.

## Module selection

bookings, content, lists, seo; media when images are used; inquiries if inquiry-only conversion is selected.

Resolve these module names through the [module index](../modules.md); load only selected modules and their applicable dependencies. Suggested modules describe requirements, not prebuilt features.

## Admin and boundaries

Admin by default unless explicitly declined; respect the single-page exception.

Confirm booking versus inquiry-only intent and payment need. No mandatory store or customer membership. Add payment and authentication modules only when selected.

## Acceptance

Concurrent bookings cannot exceed capacity; admin changes availability; confirmation/cancellation persist and display in the correct timezone.

Use [Verification](../verification.md) for execution evidence and completion status.
