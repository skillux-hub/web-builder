# Search, filters, indexes, and result scope

Use for requested public/business search across content, products, directories, communities or operational data. Start with database queries when sufficient; selecting search does not require a separate search service. [Lists](lists.md) owns real pagination, stable sorting, counts, URL state and selection behavior.

## Query and indexing workflow

Specify searchable fields, normalization/language needs, filter/sort semantics, facets and any relevance expectations. Keep the same visibility, ownership and tenant criteria across result queries, totals, facets and exports. Apply permissions before counting; querying globally then hiding private results in the UI can leak records and distort pagination.

For an external or derived index, define publish/edit/unpublish/delete propagation, versioned updates, retry/rebuild and stale-result behavior. Revalidate current access/visibility before returning protected records even when an index is stale. Background indexing and rebuilds retain the source's tenant scope. Use [Taxonomy](taxonomy.md) for category/tag filters when selected; search must not define a separate competing category hierarchy.

Validate query length, supported filters, page size and sort fields server-side. Parameterize database queries. Provide empty, loading, unavailable and retry states. An autocomplete/recommendation widget is not a complete search-results workflow.

## Acceptance

Use known records to verify terms, combinations of filters, relevance/sort expectations, first/last pages and matching totals. Publish/edit/unpublish and check propagation; test missing/failed indexes and rebuild where applicable. Verify private/draft/cross-tenant exclusion from both records and counts/facets. Do not claim typo tolerance, semantic search or multilingual segmentation unless implemented and exercised.
