# Organizations, members, and tenant isolation

Use when users share an organization/workspace with scoped data and roles. A single-user account does not require tenancy. Use [Authentication](authentication.md) for identity and [Lists](lists.md) for organizations, members and invitations.

## Models and permissions

Model organizations, memberships, organization roles, invitations and membership status/history. Derive active tenant scope from a verified membership; switching a client-supplied tenantId alone is not authorization. Organization-owner/member permissions are independent of platform-admin roles and seller permissions. Define who can invite/remove members, manage roles, change billing and consume shared allowances.

Apply the same tenant scope to reads, writes, list totals, search indexes, exports, files, jobs, notifications and background processing. Record tenant identity in asynchronous work and recheck the relevant authority when it runs. Prevent role escalation and protect the last required organization owner. Removing/restricting a member must invalidate access through existing sessions and cached permissions.

## States and boundaries

Invitations progress pending -> accepted/declined/expired/revoked, with single-use acceptance and verified recipient binding. Membership can progress invited -> active -> suspended/removed. Establish ownership transfer and organization closure/retention from actual requirements; do not cascade-delete historical transactions by default. Use [Subscriptions](subscriptions.md) and [Entitlements](entitlements.md) only for selected organization billing, seat or feature policies.

## Acceptance

Use two organizations, overlapping users and a restricted member. Verify switching, invitation expiry/replay, permission changes, last-owner protection and immediate removal. Test cross-tenant details, writes, counts, exports, file URLs and jobs through direct requests. Tenant-themed navigation alone does not establish data isolation.
