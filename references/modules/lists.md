# Lists, pagination, and bulk actions

Load for every frontend/admin list or picker, including public lists without admin.

## Pagination

All frontend and admin list pages require pagination: content, products, orders, inquiries, administrators, roles, logs, image libraries, and pickers. Show record count, current/total pages, numbered pages, previous/next, and page-size selection. Empty results show zero and an empty state; disable unavailable actions. Keep pagination information for a single page. Fixed featured/recommended summaries are not list pages, but their view-all destination must paginate. Support mobile controls, accessible names, and current-page state.

Validate page number, page size, and a maximum page size on the server. Query the actual page and total with identical search/filter/authorization criteria and a stable sort including a unique key. Do not silently truncate with a fixed `take: 200` or download all records and slice only in the UI. Public lists store pagination/filter state in the URL for refresh/back navigation; admin lists retain page and filter state. Search/filter/page-size changes reset to page one. After deletion/archive makes the page invalid, move to a valid page and refresh totals. Prevent stale asynchronous responses from replacing newer results and provide loading/error/retry states.

By default, multiselect applies to the current page and clears after paging/filtering. If offering selection across pages, show its scope and count and validate the same criteria on the server.

## Bulk actions

 provide row selection, select-all for the current page or explicitly scoped filtered results, count, clear, and suitable working actions. Examples include product publication/category moves, article publication/drafts, stock adjustment, valid order transitions, account activation, and image categorization. Read-only audit lists may export but must not offer destructive edits/deletion. Limit batch size, validate permissions and state per item, and reuse single-item business rules, including last-Owner protection, stock transactions, order state, and session revocation. Explain scope/impact for consequential batches, show individual successes/failures with reasons, allow retry, and log actions. Never silently act on invisible records after pagination/filter changes.
