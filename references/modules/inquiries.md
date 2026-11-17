# Contact, inquiries, and lead processing

Use for contact forms, quote requests, demo requests, and other lead capture. Define necessary fields and consent language from the actual business; do not invent mandatory sensitive fields.

Persist submissions with submission time, source, processing state, and safe internal notes. Validate on the server, prevent accidental duplicates and abusive submission rates, and provide usable success/error feedback. Private messages must not appear in public list APIs. With admin, support new -> assigned/in progress -> resolved/closed and authorized search/filter/export as required. Apply [Lists](lists.md).

Without admin, agree on the real destination: connected form service, email delivery, or another existing workflow. Local persistence alone does not mean somebody receives the inquiry. Report missing delivery configuration separately; never show delivery success on a failed or unconfigured send.

Verify submission -> persisted record -> actual handling/destination, rejection of invalid input, duplicate behavior, and unauthorized access. A form that only clears its fields fails acceptance.
