# Content publishing and rich text

Use for pages, services, cases, articles, portfolio items, and long product descriptions. Do not add a blog merely because a template has one.

## Data and publishing

Model the selected content types, categories, unique slugs, publication state, ordering, and relevant ownership. Define draft -> published -> archived transitions. Public queries must exclude drafts and unauthorized content; preview requires permission. Admin changes must affect actual frontend pages. Preserve existing URLs or record redirects when changing slugs.

Use [Taxonomy](taxonomy.md) when categories/tags are needed; do not force classification onto a plain standalone page. Use [Search](search.md) for selected search/index behavior and [Entitlements](entitlements.md) for actual paid/private-content grants. Private attachments use [Files](files.md); reusable public images stay in media.

## Rich text

 long product descriptions, articles, and service copy use a reusable editor such as Tiptap with headings, emphasis, lists, links, images, and undo/redo. Summaries, SEO descriptions, and addresses stay plain text. Sanitize allowed HTML, attributes, and URL protocols on the server, safely render frontend content, and supply responsive body styles. Preserve old plain text and derive searchable/SEO plain text. Claim upload support only when storage is connected; inserting image URLs is not uploading.

## Dependencies and acceptance

Use [Media](media.md) for embedded uploads, [Lists](lists.md) for listing/search, and [SEO](seo.md) for public detail metadata. Create a draft, confirm it is private, publish, inspect the real detail/list page, edit, refresh, archive, and confirm public removal. Check unsafe markup rejection and old plain-text content. These are workflows to implement, not generated features.
