# Skillux discovery and entitlement

## Startup login gate

For every actual Web Builder website creation/continuation run, verify login before starting requirements, template recommendations, generation or implementation:

```bash
python "<skill>/scripts/skillux.py" login
```

This checks local CLI credentials and makes an authenticated request to `/me/skills`. A credentials file or `npx skillux status` alone is not proof of a valid server session. An authenticated empty library is valid login and says nothing about catalog-pass entitlement.

When credentials are missing, legacy demo or expired, the helper starts `npx --yes skillux login`. The official CLI opens its browser device-authorization page and waits for approval, then stores credentials under `~/.skillux/credentials.json`. The helper revalidates with the server before reporting success. Proactively run this flow; do not ask whether to open authorization again when the user has invoked this workflow. Let the user choose the account and complete login/approval in the official page; never ask for passwords or tokens in chat.

Use a yielded/background tool session while the CLI waits and keep the user informed. If automatic browser opening fails, use an available browser tool to open the actual verification URL printed by the CLI, show its public approval code if supplied, and keep waiting. If browser access is unavailable, provide that exact URL/code and wait for the user to finish. Approval text, a closed window, or elapsed time does not establish authentication: require successful CLI completion and the server recheck. Cancelled, expired or denied authorization stops this run before the next step; restart a challenge only when retrying is appropriate, not in an endless popup loop.

`python "<skill>/scripts/skillux.py" status` is a noninteractive diagnostic returning only authentication state. Offline, malformed or unknown-access responses remain explicit failures; they must not trigger fabricated login success or a purchase prompt. The building skill's gate does not require opening live authorization merely to edit/test this skill itself.

## Discovery

`scripts/skillux.py` uses the Python standard library. Default API: `https://skillux.dev/api`; `SKILLUX_API_URL` selects a development environment. Only HTTPS or localhost HTTP is allowed. Do not read production secrets from the repository.

- `catalog --role frontend|admin --industry fashion --q minimal --page 1 --page-size 5` anonymously calls `GET /api/templates`. Use English search terms for `q`; map user intent from any language to catalog industries only for discovery, without constraining conversation/site language. Mappings include clothing -> fashion, food/restaurants -> food, healthcare -> healthcare, education -> education, travel -> travel, home/furnishings -> property, services -> services, finance/law -> finance, fitness -> fitness, pets -> pets, technology -> technology, portfolios -> creative, events -> events, automotive -> automotive, and other retail -> retail.
- Response: `items: [{slug,name,summary,version,role,industries,priceCents,coverUrl,previewUrl,detailUrl}]`, `total`, `page`, `pageSize`, `industries`. Resolve relative URLs against the API site's origin. Frontend/admin are presentation labels, not proof of implemented workflows.
- If results are empty, remove keywords before broadening the industry. Increment pages for another selection and explain the end of results. Network failures are not an empty catalog.
- Open real previews in a browser and show actual screenshots or preview links according to available tools. Do not create another gallery website just to select templates. Do not bypass entitlements to obtain packages.

The public discovery endpoint remains anonymous at the API level, but the Web Builder workflow and catalog/owned/check/fetch CLI commands first pass the verified login gate.

## Login and entitlement

The startup helper uses the official `npx skillux login` browser flow and reuses verified CLI credentials at `~/.skillux/credentials.json`. Never print tokens or ask for passwords in chat/requirements. Send credentials only to authenticated requests at the Skillux origin, not cross-origin redirects.

Discovery is anonymous. `owned` calls `GET /me/skills` and lists individually purchased/claimed and bundled packs. **Catalog passes are not included**, so absence from this list does not prove the account lacks download access.

## Selected-template entitlement gate

After the user chooses a target, run `python "<skill>/scripts/skillux.py" check <slug>` for each selected frontend/admin template before generation, download or implementation. It calls `GET /me/skills/:slug/download?check=1` without downloading or counting a download. Only `ok: true` grants continuation. Existing entitlement, including a pass, proceeds without opening another purchase window.

When that endpoint returns 403 with `code: PURCHASE_REQUIRED`, the helper opens the real `/skills/<slug>` detail page once. Explain that the selected template needs access and the user can buy it or obtain an applicable membership/pass offered by Skillux. Use the real detail page/catalog URL; do not invent a checkout, assume any paid membership covers it, or purchase on the user's behalf. Keep the chosen target recorded and wait rather than silently substituting another template.

The helper checks access every ten seconds for up to fifteen minutes (configure `--timeout` from 1 to 3600 seconds). It returns only after the server grants access; timeout is a pending/blocking result, not payment success. If automatic detail opening fails, open the returned real URL using the available browser tool or hand it to the user; after the user completes purchase, rerun `check` and require success. Do not keep opening tabs while polling. A browser checkout success page or the user's completion message prompts a server recheck and cannot replace it. Repeat the gate for any other selected template still denied.

401 restarts verified authorization once; an unknown 403, 404, 429, network failure or malformed response is not proof of missing purchase. In particular, an exhausted daily allowance must not prompt the user to buy the same target again. Preserve the selection and report the actual blocker. Free prices and the absence of an item in `owned` do not replace the authoritative check.

## Download and version

`fetch <slug> --role frontend|admin --project <path>` calls existing `GET /me/skills/:slug/download`, supporting ZIP and current JSON responses. Download only selected content to `.web-builder/templates/<role>/<slug>`, not global skill directories.

The fetch CLI first validates the local target, verifies login and passes the same entitlement wait gate. If authentication or purchase access changes before download, it retries once only after the gates pass again. A disabled admin target is rejected before any purchase prompt. No download or continuation record is written while purchase remains unconfirmed.

Validate paths, expanded size, and root `SKILL.md`. Only a complete download updates the `templates` record in `.web-builder/project.json` with slug, actual version, and path. Existing caches are not overwritten. Preserve requirements/status in the project without copying credentials. Git-ignore `.web-builder/templates` and never copy it to `public`. Publish only assets needed by the running site and preserve their licenses.

A 404 from `/api/templates` means that Skillux environment has not deployed the catalog endpoint. Report this without pretending selection succeeded. This workflow does not authorize deploying Skillux itself.
