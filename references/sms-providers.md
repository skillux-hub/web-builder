# SMS provider and SDK recommendations by country

Read when SMS is selected and a provider choice is needed. These are practical shortlists of established services, not measured popularity, deliverability or price rankings. SDK availability does not prove account eligibility or a permitted sender route. Official documentation was checked on 2026-11-17; recheck versions, product availability and destination rules when implementing.

## Country selection

1. Reuse the user's stated country/region, merchant or operating entity country, existing SMS account and selected provider. Do not infer country from conversation language, site locale, timezone or IP. If a country is missing and changes recommendations, ask only for that missing fact while independent work continues.
2. Record the recipient country/country codes separately. Use the user's/merchant's country to present the initial shortlist; validate actual destination coverage and sender/account eligibility before choosing an integration. For cross-border or mixed destinations, explain local and international routes separately rather than treating the home-country shortlist as universal coverage.
3. Preserve explicit provider choices and working integrations. Recommend two or three candidates from the applicable row, with reasons tied to the actual route, existing cloud account and requested verification/transactional purpose. A multi-provider capability is optional; do not enable every recommendation or switch providers automatically after a timeout.

## Initial shortlists

| User/merchant country or region | Initial candidates | How to narrow the choice |
| --- | --- | --- |
| Mainland China | Alibaba Cloud SMS, Tencent Cloud SMS | Start here for domestic mainland-China recipients, particularly with an existing account. Verify account eligibility, sender/signature and templates. For recipients outside mainland China, evaluate the selected product's international route or an international candidate separately. |
| United States or Canada | Twilio, Vonage, AWS End User Messaging SMS | Compare the actual destination/sender route and existing infrastructure. Include AWS especially when the application already uses AWS/IAM. Country-specific sender registration and account approval must be verified in current provider documentation. |
| United Kingdom and European countries | Twilio, Vonage, Sinch Conversation API with SMS channel | Compare destination countries, sender identity options, delivery reporting and actual account/region requirements. Do not equate a European merchant with a requirement to send only within Europe. |
| Australia, New Zealand, Japan, Singapore and other Asia-Pacific markets outside mainland China | Twilio, Vonage, AWS End User Messaging SMS | Use these as international candidates, then verify the actual destination and sender constraints. An existing local provider can take precedence; do not invent its SDK or assume a regional route is available. |
| Other countries or mixed international destinations | Twilio, Vonage, Sinch Conversation API with SMS channel | Use as a provisional international shortlist, then filter against destination coverage, account eligibility and sender rules. Consider AWS as an alternative for an existing AWS environment. |

These rows are selection heuristics, not claims that each service accepts every merchant or supports every destination/purpose. If only one or two candidates can be verified for the route, disclose the limitation rather than padding the list. Do not invent numeric market shares, cheapest-provider claims, live prices or delivery guarantees.

## Official Node.js/TypeScript SDK entry points

Use these for the default Node.js backend. For an existing Python/Java/PHP/.NET application, follow the provider's current official SDK for that language instead of changing the stack. Select and test a compatible version during implementation; do not pin an unverified latest version in the skill or install all candidates.

| Provider | Official npm SDK | Official reference and integration detail |
| --- | --- | --- |
| Alibaba Cloud SMS | `@alicloud/dysmsapi20170525` | [TypeScript/Node.js SDK](https://help.aliyun.com/en/sms/developer-reference/using-typescript-openapi-example). Select the correct product, endpoint and domestic/international operation; do not mix older international examples with a domestic API client. |
| Tencent Cloud SMS | `tencentcloud-sdk-nodejs` | [SMS Node.js SDK](https://cloud.tencent.com/document/product/382/43197). The official example uses the SMS client namespace; preserve the selected API version and actual region/endpoint requirements. |
| Twilio | `twilio` | [Messaging quickstart](https://www.twilio.com/docs/messaging/quickstart). Use the selected Messaging route/sender for transactional messages. For a managed verification product, check the separate verification workflow before integrating; messaging delivery alone is not verification. |
| Vonage | `@vonage/server-sdk` | [Official Node SDK installation](https://developer.vonage.com/en/tutorials/send-sms-with-messages/prerequisites) and [Messages Server SDK](https://developer.vonage.com/en/messages/code-snippets/server-sdk). Match credentials and operations to the actual Messages/SMS/verification product rather than mixing their examples. |
| Sinch | `@sinch/sdk-core` | [Current Node SDK guide](https://developers.sinch.com/docs/sdks/node). For new integrations use the Conversation API's SMS channel: the standalone SMS REST API reached end of sale on 2026-04-15 and is for existing integrations. Check the chosen SDK version's Node runtime requirement against the project's current runtime before installation. |
| AWS End User Messaging SMS | `@aws-sdk/client-pinpoint-sms-voice-v2` | [Official JavaScript v3 package](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/Package/-aws-sdk-client-pinpoint-sms-voice-v2) and [current service overview](https://docs.aws.amazon.com/sms-voice/latest/userguide/what-is-sms-mms.html). The current SMS service retains the pinpoint-sms-voice-v2 API namespace; do not select a legacy campaign API merely because the package name contains Pinpoint. |

## Present and record the decision

Show each candidate's service name, relevant official SDK, why it fits the known country/route, and the configuration still needed. Recommend an order only as a scenario-based preference; distinguish it from a user-selected provider. Record user/merchant country and its source, destination countries, candidates with official references, selected provider/product, selection source and remaining coverage/configuration checks in nonsensitive SMS continuation fields. Never record credentials.

If the user has authorized the agent to choose, select the suitable verified candidate; otherwise let the user choose among the concrete options. Do not repeatedly ask for known countries or reapprove an established provider. Recommend first without purchasing credits, creating accounts, provisioning numbers, sending texts, or modifying existing routes. Implement and verify the selected channel under [SMS](modules/sms.md).
