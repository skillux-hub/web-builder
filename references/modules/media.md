# Media library, uploads, and branding

Load for image upload/picking or an admin-enabled site. Image fields share one library.

## Upload limits

Align frontend, request parsing, decoding, and deployment-proxy limits. Images default to 7 MiB using shared constants from `lib/media-limits.ts`. Base64 JSON requests need at least `4 * ceil(maxFileBytes / 3)` plus metadata allowance. Admin upload routes authenticate first, then call `body(request, MAX_MEDIA_REQUEST_BYTES)`. Ordinary JSON keeps its default 128000-byte limit; do not call default `body(request)` for image uploads. Read streams with actual byte limits, then revalidate decoded size, true format, and pixels. If changing the file limit, update constants and UI copy together. Proxy limits must accommodate encoded requests.

## Image library

- Shared image picker/library: all content-image fields support browsing uploaded images by category, local upload, preview, and reuse. Products, rich text, and logos use the same component, not URL-only fields. Support category creation/rename, assignment, alt text, pagination, and search when appropriate. Validate authorization, size, true format, and pixels on the server and safely re-encode images. Persist media and reusable URLs and show failures. Explain when uploaded images are public; private attachments require separate authorized downloads. Choose persistent local or object storage for the actual deployment.

## Branding

- Branding: upload a logo in admin, persist it, update the real frontend brand, and generate a favicon wired to page icon metadata. Validate size, actual format, and pixels through decoding/re-encoding rather than trusting extensions/MIME. Use writable persistent or configured object storage, not temporary production-build files. Provide preview/replacement/reset, enforce settings permission, log changes, and version assets to avoid stale caches.

For list queries and selection scope, follow [Lists](lists.md). Verify large and boundary-size uploads under [Verification](../verification.md#uploads-and-seo).
