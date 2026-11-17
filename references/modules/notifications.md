# Notifications and delivery

Use for requested transactional email/SMS, in-app notices, reminders and delivery triggered by business events. Account verification/reset messages can reuse delivery infrastructure, while [Authentication](authentication.md) retains token/code rules. Establish actual channels, recipients, locale, templates, triggers and timing from the business workflow.

When SMS is selected, load [SMS](sms.md) for provider/region routing, sender/signature/template configuration, phone normalization, send limits and delivery receipts. Notifications remain the common orchestration layer; selecting notifications alone does not add SMS or activate a paid channel.

## Data and workflow

Record an event/idempotency key, recipient/channel, template/version, safe payload reference, scheduled time/timezone, attempts, provider message ID and delivery state. Persist the event/job with the triggering business change or use a reliable outbox so a restart cannot lose it. Separate reminder jobs from the original booking/order transition; cancellation/rescheduling must update the appropriate pending notices.

Track queued -> sending -> provider accepted -> delivered/failed/bounced where the provider supplies evidence. An API acceptance response does not prove inbox/SMS delivery. Retry transient errors with bounded attempts and reconcile timeout/duplicate callbacks before resending. Preserve attempts and a safe reason; do not expose secrets or private message bodies in general logs.

Respect selected preferences, suppression and opt-out rules by message purpose; distinguish essential account/transactional notices from optional marketing. Do not add campaigns or external recipients merely because notifications are selected. Attachments use [Files](files.md); in-app history uses [Lists](lists.md) when present.

## Acceptance

Exercise a real domain event -> one persisted job -> provider sandbox/test sink or actual in-app record. Cover duplicate events, restart/retry, failed delivery, template variables, recipient ownership, cancellation and timezone boundaries. Missing email/SMS configuration remains unavailable/pending; neither a cleared form nor a success toast proves delivery. Default verification uses local sinks/sandboxes, without sending real messages.
