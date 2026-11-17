# Authentication providers and methods

Read before implementing registration, membership, or third-party login for any website, not just stores.

For selected email/SMS verification/reset delivery, reuse [Notifications](notifications.md) while keeping token/code generation, expiry and identity checks here. Use [Entitlements](entitlements.md) for feature/content grants and [Tenancy](tenancy.md) for organizational membership; login alone does not establish either. Password-only or external-provider login need not add a notification service.

For actual phone-code login/verification, also select [SMS](sms.md) and use its configured delivery adapter or provider-managed verification product. Authentication retains challenge binding, expiry, attempt limits, one-time consumption and session creation. SMS acceptance/delivery alone cannot mark a phone verified. Mainland-China login defaults describe the chosen methods; they do not establish a configured SMS service or justify simulated verification.

## Market defaults and minimal questions

Read existing requirements first; explicit user choices take precedence. When the target market is known and there are no conflicting requirements, use these customer login defaults without asking about each common method:

| Target market | Default customer login methods |
| --- | --- |
| Mainland China | Phone verification code, email and password |
| Other markets | Email and password, Google, Apple |

Recommend Casdoor for mainland China and Better Auth for markets outside mainland China. These recommendations do not override the user's selected technology or identity system. Ask briefly about a unified solution only when a cross-market business needs one shared identity service and a meaningful choice remains. Do not automatically deploy duplicate identity stores.

Customers and administrators always have separate identity boundaries, sessions, and permissions. Default admin login to username/email and password when unspecified. Ask only for a requested alternative admin experience or an identity policy that cannot safely be inferred. Preserve an established admin method rather than replacing it with customer defaults.

Defaults do not mean external services are configured. Phone codes require SMS; email verification/reset requires email delivery; Google and Apple require developer credentials and callbacks. Implement selected methods and clear setup entry points, labeling missing credentials as pending/unavailable. Do not send fake codes or claim verification. Ask about a provider, region, or cost when activating an external service genuinely requires that choice; recording defaults should not block independent implementation.

Do not add customer registration without membership requirements. For nondefault platforms such as WeChat, clarify the scenario only when selected: desktop QR, in-app web, native app, and mini program are different flows. Establish OAuth 2.0/OIDC or private API capabilities for custom platforms. Distinguish customer email login from a branded sending address.

Record defaults and explicit choices accurately in requirements and continuation state, for example `authentication: { market, provider, customerMethods, adminMethods, scenarios, status }`. An optional `selectionSource: "market-default" | "user"` distinguishes their sources. Record credential configuration and remaining tasks, never secrets, and do not present defaults as explicit user choices.

## Integration and delivery

- Casdoor for mainland China: run it as a separate identity service and integrate through supported SDKs or OAuth/OIDC. Preserve business membership and order ownership. The Casdoor identity console is not the business admin interface. Check capabilities of the chosen open-source or commercial edition.
- Better Auth for other markets: integrate with the application server and existing database. Check the selected version's framework/Prisma compatibility and use supported providers or a verified generic OAuth adapter.
- Before changing an existing project, inspect accounts, password hashes, sessions, and business associations and plan compatible integration or migration. Do not overwrite users or merge identities based only on an unverified matching email. Third-party login does not confer admin permissions.
- Complete code, pages, environment examples, and setup instructions. External platforms need developer apps, scopes, callbacks, and possibly review; email/SMS needs delivery services and branded sending domains need verification. Store secrets only in secure server configuration, not chat or source control.
- Open-source software does not make hosting, email, SMS, or platform verification free. Do not purchase services, provision paid remote resources, or change running authentication by default.
- Keep unconfigured methods disabled or explain their unavailability without fake success. Distinguish code integrated, configuration complete, and actual login verified. Admin entry points, authorization, and logging remain independent.

## Verification

Check success/rejection/cancellation, callback and redirect validation, identity-link conflicts, logout invalidation, disabled users, and customer/admin isolation. Verify profile and business-data ownership. For verification codes, test expiry, replay prevention, and send/attempt rate limits. Without external configuration, complete local checks and mark real-platform end-to-end verification unexecuted.

During implementation, check current official documentation: [Casdoor](https://casdoor.org/), [Better Auth](https://better-auth.com/docs/introduction).
