# Files, storage, and authorized downloads

Use for reusable storage, document attachments, private uploads, exports, and tool inputs/results. [Media](media.md) owns image browsing, branding and image-specific processing; this module owns storage lifecycle and access. Do not place private files in the public image library.

## Data and workflow

Record storage key/provider, original display name, actual type/size, purpose, owner or verified guest access proof, optional tenant scope, visibility, references, timestamps and retention/expiry. Establish per-purpose limits; a document limit need not equal the shared image limit. Align frontend, request parsing, decoding, storage and proxy limits, preserving the existing [Media](media.md#upload-limits) image constants and Base64 overhead rules.

Upload/confirm/retrieve/download/delete operations validate authorization and actual content, not the extension or browser MIME alone. Keep storage credentials server-side. Private downloads require current ownership/permission; short-lived signed URLs must be scoped appropriately. Never accept an arbitrary filesystem path or another owner's storage key as authorization.

Use uploading -> ready/failed and deleting -> deleted as applicable. Associate files with records only after successful storage confirmation. Define cleanup of incomplete uploads, orphaned exports and expired results; do not delete a shared image still referenced by another record. Failed deletion remains retryable and must not be reported as completed.

## Dependencies and acceptance

Identity can be an account, a verified guest token, or a scoped operational identity; customer registration is not automatic. Use [Lists](lists.md) for selected file-manager surfaces and [Tenancy](tenancy.md) for actual organization isolation.

Upload a real allowed file, reopen/download it after restart, and test invalid/oversized input, cross-owner access, expired links, shared references and cleanup failure/retry. Without configured persistent storage, distinguish local verification from deployed durability.
