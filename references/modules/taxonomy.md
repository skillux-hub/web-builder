# Categories, tags, and reusable classification

Use when products, articles, courses, listings, community content or images need classification. [Lists](lists.md) supplies paginated management/pickers and bulk association changes. Model categories and tags separately: categories express hierarchy/placement; tags are independent cross-category labels. A product variant, user role or permission-bearing community space is not automatically a taxonomy category.

## Models and scope

Record vocabulary/business scope and optional tenant, category ID/name/slug, parent, sort order, enabled/publication state, description and optional cover. Tags have their own identity, slug and associations without category parentage. Establish per-content single/multiple category rules, primary category and allowed vocabularies; do not force every content type into one global tree. Slug uniqueness is scoped to the actual vocabulary/URL policy.

Create/edit/move/reorder/enable/disable/merge/delete actions validate ownership/permission server-side. Parent and child must share the permitted scope; reject self-parenting and descendant cycles, including concurrent moves. Persist ordering and define whether an inactive parent hides descendants from navigation/filtering. Public counts must follow content visibility, not reveal draft/private items.

## References and lifecycle

When children or content associations exist, default to rejecting deletion with a useful explanation, or perform an explicitly selected reassignment/merge transaction. Never cascade-delete associated business records. Preserve historical transaction references. Renamed/moved slugs retain stable identity and use redirects where public URLs change; bulk changes follow per-item validation and results.

Use [Media](media.md) only for selected covers/images and [SEO](seo.md) for actual public category/tag pages. These are conditional companions, not unconditional taxonomy dependencies. Category pickers, frontend navigation, filtering and admin forms share the same persisted classification.

## Acceptance

Create parent/child and tags -> assign content -> verify navigation/filter/detail -> rename/reorder/move -> refresh. Test cycles, duplicate slugs in scope, cross-tenant moves, disabled categories, primary/multiple-category constraints, deletion with references and migration/merge failure. Verify meaningful empty states, paginated pickers and counts excluding inaccessible content.
