# Listings, directories, and submissions

Use for searchable directories, property/service listings, jobs, and classified information. Model listings, categories, structured attributes, location if needed, publisher ownership, and moderation/publication states. Search/filter/count queries must share public visibility and authorization criteria.

Reuse [Taxonomy](taxonomy.md) for category/tag structures and [Search](search.md) for queries, counts/facets and publication/index synchronization. These modules share the listing's visibility and ownership rather than keeping independent competing rules.

Distinguish a read-only managed directory from user submissions. Add [Authentication](authentication.md) and moderation only when users publish; enforce owner-only edits on the server. Use [Inquiries](inquiries.md) for contact workflows and [Bookings](bookings.md) for actual reservations. Add [Payments](payments.md) only for a confirmed paid-listing or transactional model. Multi-vendor settlements are separate explicit requirements, not a directory default.

Use [Lists](lists.md), [Content](content.md), [Media](media.md), and [SEO](seo.md) for their relevant surfaces. Verify create -> approve/publish -> searchable detail -> owner edit -> unpublish, including other-user edit rejection and private listing exclusion from totals.
