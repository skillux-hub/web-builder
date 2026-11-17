# Courses, enrollment, and learning access

Use for education and training. Distinguish a course marketing page, enrollment management, and an actual learning platform; implement only the requested level.

Model courses, teachers, sessions/cohorts, capacity, enrollments, and enrollment states. Add lessons, learning materials, progress, and access rules only when learning delivery is requested. A course card and payment success page do not provide learning access. Protect paid/private materials using enrollment/entitlement checks on the server.

Use [Bookings](bookings.md) for dated capacity, [Content](content.md) for course publishing, [Authentication](authentication.md) for learner accounts when needed, and [Payments](payments.md) for confirmed paid enrollment. Handle approval, cancellation, refunds, and access revocation according to actual requirements.

Verify published course -> enrollment -> admin review/capacity update -> permitted material access, with denial for other learners and unpublished materials. Track progress only from implemented learning actions, not fabricated percentages.
