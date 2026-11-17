# Categories, tags, and reusable classification

Use when products, articles, courses, listings, community content or images need classification. [Lists](lists.md) supplies paginated management/pickers and bulk association changes. Model categories and tags separately: categories express hierarchy/placement; tags are independent cross-category labels. A product variant, user role or permission-bearing community space is not automatically a taxonomy category.

## Required implementation

When classification is selected or required by the business workflow, implement it end to end. In admin-enabled projects provide a dedicated Categories management entry with create, edit, rename, visibility, ordering, safe deletion and assignment to the selected business records. Hierarchical categories also need create-child, change-parent and move operations. Persist these actions through authorized server APIs and connect them to the same category identities used by product/content forms and public navigation or filters. A free-text field that creates names implicitly is not a replacement for category management.

Implement a separate Tags management entry and many-to-many assignment when tags are included in scope; tags do not inherit category hierarchy. Do not activate unrelated vocabularies solely because the taxonomy module is selected. Document whether each record has one category, multiple categories, or a primary category.

## Hierarchy and visual presentation

- For hierarchical categories, use an interactive tree as the required management structure, with consistent indentation, expand/collapse controls, recognizable parent/child relationships and a clear selected node. Show category names prominently, with status and associated-record counts as secondary information. Provide an obvious top-level action and an add-child action on each appropriate node. Do not replace the tree with a flat table or present raw parent IDs as the main parent label.
- Use names and ancestor paths in parent selectors and business-record pickers, especially when names repeat across branches. Keep the current parent visible while editing. Exclude the edited node and its descendants as destination choices, while retaining server-side cycle validation. A flat vocabulary can use a clean list; do not invent hierarchy that the business does not use.
- Search results and pagination must preserve context: display ancestor paths or retain the containing branch. For large trees, load children or search/paginate branches rather than downloading the full taxonomy just to slice it in the browser. Indicate whether counts include descendants.
- Match the selected admin design: consistent spacing, aligned columns and actions, readable typography and contrast, restrained icons/status badges, and balanced tree/editor regions. Keep destructive actions visually distinct. Supply loading, empty, error and success states without layout jumps or overlapping controls.
- Verify keyboard-accessible expansion and selection, visible focus and accessible expanded state. On narrow screens stack tree and editor or use a clear drill-down view; preserve hierarchy context, readable labels and usable touch targets without horizontal overflow.

## Models and scope

Record vocabulary/business scope and optional tenant, category ID/name/slug, parent, sort order, enabled/publication state, description and optional cover. Tags have their own identity, slug and associations without category parentage. Establish per-content single/multiple category rules, primary category and allowed vocabularies; do not force every content type into one global tree. Slug uniqueness is scoped to the actual vocabulary/URL policy.

Create/edit/move/reorder/enable/disable/merge/delete actions validate ownership/permission server-side. Parent and child must share the permitted scope; reject self-parenting and descendant cycles, including concurrent moves. Persist ordering and define whether an inactive parent hides descendants from navigation/filtering. Public counts must follow content visibility, not reveal draft/private items.

## References and lifecycle

When children or content associations exist, default to rejecting deletion with a useful explanation, or perform an explicitly selected reassignment/merge transaction. Never cascade-delete associated business records. Preserve historical transaction references. Renamed/moved slugs retain stable identity and use redirects where public URLs change; bulk changes follow per-item validation and results.

Use [Media](media.md) only for selected covers/images and [SEO](seo.md) for actual public category/tag pages. These are conditional companions, not unconditional taxonomy dependencies. Category pickers, frontend navigation, filtering and admin forms share the same persisted classification.

## Acceptance

When hierarchy is supported, use an isolated fixture with at least three levels and sibling branches. Verify that the actual browser makes the structure and current location clear; expand/collapse, search and picker results retain ancestry. Create a child, assign content, move/reorder it, rename a parent and refresh; confirm the new path/order and stable associations. Verify root/leaf states, cycle rejection, referenced deletion rejection and the chosen disabled-parent behavior.

Capture desktop and narrow-screen evidence of populated management and pickers, not only empty forms. Check visual spacing/alignment, name wrapping, state contrast, keyboard focus and absence of clipping/overlap. Record functional, persistence, authorization and hierarchy/visual results in `checks.taxonomy`; unexecuted checks remain explicit. Do not mark taxonomy implemented/verified from schema fields, a menu, or compilation alone.

Create parent/child and tags -> assign content -> verify navigation/filter/detail -> rename/reorder/move -> refresh. Test cycles, duplicate slugs in scope, cross-tenant moves, disabled categories, primary/multiple-category constraints, deletion with references and migration/merge failure. Verify meaningful empty states, paginated pickers and counts excluding inaccessible content.
