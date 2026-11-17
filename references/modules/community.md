# Community publishing, interaction, and moderation

Use [Authentication](authentication.md) for durable identity/ownership and [Lists](lists.md) for threads, replies, reports, and moderation queues. Public reading can remain anonymous; private spaces have independent access rules.

Use selected [Taxonomy](taxonomy.md) categories/tags, [Search](search.md), [Files](files.md) attachments, [Notifications](notifications.md), and [Entitlements](entitlements.md) for actual member-only access. Permission-bearing spaces/groups retain their own community scope; a taxonomy category must not grant membership or moderation authority.

## Models and actions

Model selected spaces/topics, threads/questions, posts/answers/replies, authorship, publication/moderation state, reports, and moderation history. Add votes, follows, notifications, messages, and reputation only when requested. Do not invent activity or member counts.

Create/read/edit/remove and selected review/report APIs validate server-side. Enforce author-only edits and space-scoped moderator permissions, including direct requests. Reuse [Content](content.md) safe rich text without substituting administrator CMS records for member posts. Use [Media](media.md) for selected image attachments; private attachments require authorized downloads.

## States and permissions

Select premoderation or immediate publication from requirements. Content progresses submitted -> pending/published -> hidden/removed. Reports progress open -> reviewed -> resolved/dismissed with safe audit records. Preserve thread structure after reply removal; supply reasons/appeals when required.

Membership, moderation, and platform administration have separate scopes. Restrictions/suspension affect existing sessions and server writes. Handle abuse limits and duplicate submissions. Visibility/group permissions apply to details, search, counts, feeds, and exports. Paid membership requires separately specified payment/access rules.

## Acceptance

Use distinct identities for posting/replying/editing/reporting/moderation. Verify other-author denial, scoped-moderator denial, suspension, private/unpublished exclusion, pagination after removal, and safe markup. A report button without a persisted queue and actual handling is incomplete.
