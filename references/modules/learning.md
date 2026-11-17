# Courses, enrollment, and learning access

Use for education and training. Distinguish a course marketing page, enrollment management, and an actual learning platform; implement only the requested level.

| Brief educationMode | Required workflow | Acceptance |
| --- | --- | --- |
| presentation | Publish course/teacher information and the actual contact destination | Draft/public visibility, detail metadata and real contact; no automatic enrollment, accounts, payments or lesson access. |
| enrollment | Course/cohort -> application/enrollment -> review/confirmation -> cancellation | Persist enrollment, capacity and legal transitions; deny unauthorized application access. |
| learning | Enrollment/entitlement -> protected lessons/materials -> requested progress | Learner ownership, revoked/expired access and genuine progress; no other-learner access. |

Record the selected level and paid/free requirements. Selecting this module does not authorize all three levels. Clarify a meaningful unresolved level before implementing dependent account/payment/learning services.

For selected capabilities, reuse [Taxonomy](taxonomy.md) for course classification, [Files](files.md) for private materials, [Entitlements](entitlements.md) for lesson/download access, [Subscriptions](subscriptions.md) for recurring plans, and [Notifications](notifications.md) for requested course/enrollment notices. Presentation-only sites do not automatically select these modules.

For presentation, model only the selected published course/teacher information. For enrollment or learning, add sessions/cohorts, capacity, enrollments, and enrollment states. Add lessons, learning materials, progress, and access rules only when learning delivery is requested. A course card and payment success page do not provide learning access. Protect paid/private materials using enrollment/entitlement checks on the server.

Use [Bookings](bookings.md) for dated capacity, [Content](content.md) for course publishing, [Authentication](authentication.md) for learner accounts when needed, and [Payments](payments.md) for confirmed paid enrollment. Handle approval, cancellation, refunds, and access revocation according to actual requirements.

Verify the selected level: publishing/contact for presentation; published course -> enrollment -> admin review/capacity for enrollment; add permitted material access and other-learner denial for learning. Track progress only from implemented learning actions, not fabricated percentages.
