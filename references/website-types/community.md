# Communities, forums, and question-and-answer sites

Use for user-created discussions, answers, replies, and community interaction. Editorial publishing belongs to content; member publishing with moderation and ownership belongs here.

## Scope and modules

Read [Community](../modules/community.md), with authentication and lists as dependencies. Public pages suggest SEO; media is selected for images and content for separate editorial pages. Paid membership, advertising, and private messaging are optional requirements.

## States and boundaries

Separate member, moderator, and platform-admin capabilities. Model submission -> pending review/published -> hidden/removed, and report open -> reviewed -> resolved/dismissed as applicable. Match pre/post-publication moderation to requirements. Suspension must affect existing sessions and write checks. Admin follows the normal scope decision; opting out requires an actual moderation/operational alternative.

## Acceptance

Member publishes -> another member replies -> owner edits -> report is reviewed -> visibility updates. Reject other-author edits and unauthorized moderation through direct APIs. Check published-only search/counts, thread/reply consistency after removal, pagination, and suspended-account behavior. Verify selected public/private-group access. Follow [Verification](../verification.md).
