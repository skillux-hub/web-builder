# Skillux discovery and entitlement

## Discovery

`scripts/skillux.py` uses the Python standard library. Default API: `https://skillux.dev/api`; `SKILLUX_API_URL` selects a development environment. Only HTTPS or localhost HTTP is allowed. Do not read production secrets from the repository.

- `catalog --role frontend|admin --industry fashion --q minimal --page 1 --page-size 5` anonymously calls `GET /api/templates`. Use English search terms for `q`; map user intent from any language to catalog industries only for discovery, without constraining conversation/site language. Mappings include clothing -> fashion, food/restaurants -> food, healthcare -> healthcare, education -> education, travel -> travel, home/furnishings -> property, services -> services, finance/law -> finance, fitness -> fitness, pets -> pets, technology -> technology, portfolios -> creative, events -> events, automotive -> automotive, and other retail -> retail.
- Response: `items: [{slug,name,summary,version,role,industries,priceCents,coverUrl,previewUrl,detailUrl}]`, `total`, `page`, `pageSize`, `industries`. Resolve relative URLs against the API site's origin. Frontend/admin are presentation labels, not proof of implemented workflows.
- If results are empty, remove keywords before broadening the industry. Increment pages for another selection and explain the end of results. Network failures are not an empty catalog.
- Open real previews in a browser and show actual screenshots or preview links according to available tools. Do not create another gallery website just to select templates. Do not bypass entitlements to obtain packages.

## Login and entitlement

The user signs in through the browser using `npx skillux login`. Reuse CLI credentials at `~/.skillux/credentials.json`; never print tokens or ask for passwords in chat/requirements. Send credentials only to authenticated requests at the Skillux origin, not cross-origin redirects.

Discovery is anonymous. `owned` calls `GET /me/skills` and lists individually purchased/claimed and bundled packs. **Catalog passes are not included**, so absence from this list does not prove the account lacks download access.

Before downloading, run `python "<skill>/scripts/skillux.py" check <slug>` for each selected template. It calls `GET /me/skills/:slug/download?check=1` for authoritative entitlement without downloading or counting a download. `ok: true` means currently downloadable; 403 means no valid entitlement; 401 means expired login; 429 means the daily download allowance is exhausted, not missing entitlement. A zero price does not establish entitlement. If checking is unavailable or ambiguous, do not infer nonownership; attempt `fetch` when authorized so the download endpoint decides, or disclose the specific blocker. Do not purchase automatically.

## Download and version

`fetch <slug> --role frontend|admin --project <path>` calls existing `GET /me/skills/:slug/download`, supporting ZIP and current JSON responses. Download only selected content to `.web-builder/templates/<role>/<slug>`, not global skill directories.

Validate paths, expanded size, and root `SKILL.md`. Only a complete download updates the `templates` record in `.web-builder/project.json` with slug, actual version, and path. Existing caches are not overwritten. Preserve requirements/status in the project without copying credentials. Git-ignore `.web-builder/templates` and never copy it to `public`. Publish only assets needed by the running site and preserve their licenses.

A 404 from `/api/templates` means that Skillux environment has not deployed the catalog endpoint. Report this without pretending selection succeeded. This workflow does not authorize deploying Skillux itself.
