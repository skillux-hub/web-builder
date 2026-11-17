#!/usr/bin/env python3
"""Discover public Skillux templates and fetch only selected, entitled packs."""
import argparse
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
import webbrowser

MAX_TOTAL = 100 * 1024 * 1024
MAX_FILE = 40 * 1024 * 1024
MAX_ENTRIES = 500


class SkilluxError(Exception):
    pass


class AuthenticationRequired(SkilluxError):
    pass


class PurchaseRequired(SkilluxError):
    pass


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # Inspect every hop explicitly; never forward auth across origins.


def api_base():
    base = os.environ.get("SKILLUX_API_URL", "https://skillux.dev/api").rstrip("/")
    validate_url(base)
    return base


def validate_url(url):
    parsed = urllib.parse.urlsplit(url)
    if parsed.username or parsed.password or not parsed.hostname:
        raise SkilluxError("Invalid service URL")
    if parsed.scheme != "https" and not (parsed.scheme == "http" and parsed.hostname in ("localhost", "127.0.0.1", "::1")):
        raise SkilluxError("Use HTTPS, or HTTP on localhost only")
    return parsed


def credentials():
    path = Path.home() / ".skillux" / "credentials.json"
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        raise AuthenticationRequired("Not logged in. Run: npx skillux login") from None
    if not isinstance(data, dict) or not isinstance(data.get("token"), str) or not data["token"].strip() or data.get("mode") == "demo" or data["token"] == "demo-local-token":
        raise AuthenticationRequired("Not logged in. Run: npx skillux login")
    return data["token"]


def origin(url):
    parsed = validate_url(url)
    return parsed.scheme, parsed.hostname, parsed.port or (443 if parsed.scheme == "https" else 80)


def request(url, token=None, _redirects=0):
    validate_url(url)
    # JSON first returns version metadata; its downloadUrl then uses ?format=zip.
    headers = {"Accept": "application/json", "User-Agent": "Skillux-Web-Builder/1"}
    if token:
        headers["Authorization"] = "Bearer " + token
    try:
        with urllib.request.build_opener(NoRedirect).open(urllib.request.Request(url, headers=headers), timeout=30) as response:
            payload = response.read(MAX_TOTAL + 1)
            if len(payload) > MAX_TOTAL:
                raise SkilluxError("Response exceeds 100 MB limit")
            return payload, response.headers
    except urllib.error.HTTPError as error:
        if error.code in (301, 302, 303, 307, 308):
            location = error.headers.get("location")
            if not location or _redirects >= 4:
                raise SkilluxError("Invalid or excessive download redirects") from None
            next_url = urllib.parse.urljoin(url, location)
            if validate_url(url).scheme == "https" and validate_url(next_url).scheme != "https":
                raise SkilluxError("Refusing insecure download redirect") from None
            return request(next_url, token if origin(next_url) == origin(url) else None, _redirects + 1)
        if error.code == 401:
            raise AuthenticationRequired("Session expired. Run: npx skillux login") from None
        if error.code == 403:
            try:
                denial = json.loads(error.read(8192))
            except (ValueError, TypeError, AttributeError, OSError):
                denial = {}
            if isinstance(denial, dict) and denial.get("code") == "PURCHASE_REQUIRED":
                raise PurchaseRequired("No download entitlement. Purchase the selected template or a membership covering it") from None
            raise SkilluxError("Access denied; verify account access and selected template entitlement") from None
        if error.code == 404:
            raise SkilluxError("Not found: check template access, or deploy the Skillux template catalog endpoint") from None
        if error.code == 429:
            raise SkilluxError("Skillux download or request limit reached; retry later or choose a cached template") from None
        raise SkilluxError(f"Skillux request failed (HTTP {error.code})") from None
    except (urllib.error.URLError, TimeoutError, OSError):
        raise SkilluxError("Skillux is unreachable; choices were preserved. Retry when connected") from None


def parse_json(payload):
    try:
        return json.loads(payload)
    except (ValueError, UnicodeError):
        raise SkilluxError("Invalid JSON response") from None


def auth_status():
    """Verify credentials with the server without disclosing them or interpreting ownership."""
    try:
        token = credentials()
        payload, _ = request(api_base() + "/me/skills", token)
    except AuthenticationRequired:
        return {"authenticated": False, "state": "login_required"}
    result = parse_json(payload)
    items = result if isinstance(result, list) else result.get("skills", result.get("items")) if isinstance(result, dict) else None
    if not isinstance(items, list):
        raise SkilluxError("Skillux did not return a valid authenticated library response")
    return {"authenticated": True, "state": "authenticated"}


def ensure_login():
    status = auth_status()
    if status["authenticated"]:
        return status
    npx = shutil.which("npx")
    if not npx:
        raise SkilluxError("Node.js/npx is required to open official authorization. Install Node.js, then rerun login")
    print("Opening official Skillux authorization. Complete approval in the browser; waiting for login...", file=sys.stderr, flush=True)
    # The official CLI opens its device approval URL and waits for authorization.
    # Keep its public approval instructions visible; credentials are written by the CLI.
    completed = subprocess.run([npx, "--yes", "skillux", "login"], stdout=sys.stderr, stderr=sys.stderr)
    if completed.returncode:
        raise SkilluxError("Skillux authorization was not completed; no next step was started")
    status = auth_status()
    if not status["authenticated"]:
        raise AuthenticationRequired("Browser login did not establish a verified session; complete authorization before continuing")
    return status


def template_detail_url(slug):
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,127}", slug):
        raise SkilluxError("Invalid template slug")
    return urllib.parse.urljoin(api_base() + "/", "/skills/" + urllib.parse.quote(slug, safe=""))


def wait_for_access(slug, timeout=900):
    """Open a confirmed purchase-required detail page once; continue only on server approval."""
    if not 0 < timeout <= 3600:
        raise SkilluxError("Access wait timeout must be between 1 and 3600 seconds")
    detail_url = template_detail_url(slug)
    deadline = time.monotonic() + timeout
    opened, renewed = False, False
    while True:
        try:
            return check_access(slug)
        except AuthenticationRequired:
            if renewed:
                raise
            ensure_login()
            renewed = True
        except PurchaseRequired:
            if not opened:
                print(f"Purchase required for {slug}. Opening {detail_url}\nBuy the selected template or a membership that covers it, then return here. Waiting for server-confirmed access; this tool does not purchase anything.", file=sys.stderr, flush=True)
                try:
                    browser_opened = webbrowser.open(detail_url, new=1)
                except (webbrowser.Error, OSError):
                    browser_opened = False
                if not browser_opened:
                    raise SkilluxError(f"Could not open template details. Open {detail_url} in your browser and rerun check after purchase")
                opened = True
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise SkilluxError(f"Access is still unconfirmed for {slug}. Choices were preserved; complete authorization/purchase and rerun check. Details: {detail_url}")
        time.sleep(min(10, remaining))


def safe_relative(name):
    value = name.replace("\\", "/")
    parts = PurePosixPath(value).parts
    if not value or value.startswith("/") or any(part in ("..", ".") or ":" in part for part in parts):
        raise SkilluxError("Unsafe archive path")
    # Avoid Windows aliases / devices, independent of the machine doing validation.
    if any(part.rstrip(". ") != part or re.match(r"^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)", part, re.I) for part in parts):
        raise SkilluxError("Unsafe archive filename")
    return Path(*parts)


def unpack(payload, target):
    try:
        with zipfile.ZipFile(io.BytesIO(payload)) as archive:
            entries = archive.infolist()
            if len(entries) > MAX_ENTRIES or sum(item.file_size for item in entries) > MAX_TOTAL:
                raise SkilluxError("Archive exceeds file count or size limit")
            seen = set()
            for item in entries:
                rel = safe_relative(item.filename)
                if item.file_size > MAX_FILE or stat.S_ISLNK(item.external_attr >> 16):
                    raise SkilluxError("Oversized file or archive symlink")
                key = rel.as_posix().casefold()
                if key in seen:
                    raise SkilluxError("Duplicate archive path")
                seen.add(key)
                destination = target / rel
                if item.is_dir():
                    destination.mkdir(parents=True, exist_ok=True)
                else:
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    with archive.open(item) as source, destination.open("xb") as output:
                        shutil.copyfileobj(source, output)
    except (zipfile.BadZipFile, RuntimeError):
        raise SkilluxError("Invalid or encrypted template archive") from None


def write_files(files, target):
    if not isinstance(files, dict) or len(files) > MAX_ENTRIES:
        raise SkilluxError("Invalid file tree")
    total = 0
    seen = set()
    for name, content in files.items():
        if not isinstance(content, str):
            raise SkilluxError("File tree values must be text")
        rel = safe_relative(name)
        key = rel.as_posix().casefold()
        if key in seen:
            raise SkilluxError("Duplicate file path")
        seen.add(key)
        encoded = content.encode("utf-8")
        total += len(encoded)
        if len(encoded) > MAX_FILE or total > MAX_TOTAL:
            raise SkilluxError("File tree exceeds size limit")
        path = target / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(encoded)


def normalize_root(target):
    if (target / "SKILL.md").is_file():
        return target
    entries = list(target.iterdir())
    if len(entries) == 1 and entries[0].is_dir() and (entries[0] / "SKILL.md").is_file():
        return entries[0]
    raise SkilluxError("Downloaded pack has no root SKILL.md")


def save_json(path, data):
    # Same-filesystem atomic replacement; never truncate the previous project state.
    handle, temp = tempfile.mkstemp(prefix=".state-", suffix=".json", dir=path.parent)
    try:
        with os.fdopen(handle, "w", encoding="utf-8") as output:
            json.dump(data, output, ensure_ascii=False, indent=2)
            output.write("\n")
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)


def fetch_preflight(slug, role, project):
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,127}", slug):
        raise SkilluxError("Invalid template slug")
    if role not in ("frontend", "admin"):
        raise SkilluxError("Invalid template role")
    project = Path(project).resolve()
    state_path = project / ".web-builder" / "project.json"
    if not state_path.is_file():
        raise SkilluxError("Initialize the project with create_project.py first")
    if any(path.is_symlink() for path in (project / ".web-builder", state_path)):
        raise SkilluxError("Project state cannot be a symlink")
    state = parse_json(state_path.read_bytes())
    if state.get("schemaVersion") != 1:
        raise SkilluxError("Unsupported project state version")
    if role == "admin" and (state.get("composition", {}).get("adminRequired") is False or state.get("brief", {}).get("adminRequired") is False):
        raise SkilluxError("Admin is disabled for this project; preserve the choice and skip admin downloads")
    parent = project / ".web-builder" / "templates" / role
    destination = parent / slug
    if not destination.resolve().is_relative_to(project / ".web-builder"):
        raise SkilluxError("Template destination escapes project workspace")
    if destination.exists():
        raise SkilluxError("Template cache already exists; preserving it. Read the recorded choice or choose a new slug")
    return project, state_path, state, parent, destination


def fetch_pack(slug, role, project):
    project, state_path, state, parent, destination = fetch_preflight(slug, role, project)
    token = credentials()
    base = api_base()
    payload, headers = request(f"{base}/me/skills/{slug}/download", token)
    version = headers.get("x-skillux-version", "0.0.0")
    meta = None
    if "application/json" in headers.get("content-type", ""):
        meta = parse_json(payload)
        if not isinstance(meta, dict):
            raise SkilluxError("Invalid download metadata")
        version = str(meta.get("version", version))
        if "files" not in meta:
            url = meta.get("downloadUrl")
            if not isinstance(url, str):
                raise SkilluxError("Download response has neither files nor downloadUrl")
            same_origin = origin(url) == origin(base)
            payload, _ = request(url, token if same_origin else None)
    parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".download-", dir=parent) as temp:
        staging = Path(temp)
        if meta is not None and "files" in meta:
            write_files(meta["files"], staging)
        else:
            unpack(payload, staging)
        root = normalize_root(staging)
        # Rename complete download before touching project choices.
        if root == staging:
            bundle = staging / ".complete"
            bundle.mkdir()
            for item in list(staging.iterdir()):
                if item != bundle:
                    item.rename(bundle / item.name)
            root = bundle
        root.rename(destination)
    record = {"slug": slug, "version": version, "path": destination.relative_to(project).as_posix()}
    state.setdefault("templates", {})[role] = record
    state["templateIntegration"] = "pending"
    try:
        save_json(state_path, state)
    except OSError:
        # Cache is complete and recoverable; do not pretend the choice was saved.
        raise SkilluxError("Template downloaded, but project state could not be saved; inspect cache before retrying") from None
    return record


def check_access(slug):
    """Check effective entitlement without downloading or recording a download."""
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,127}", slug):
        raise SkilluxError("Invalid template slug")
    token = credentials()
    base = api_base()
    payload, _ = request(
        f"{base}/me/skills/{urllib.parse.quote(slug, safe='')}/download?check=1",
        token,
    )
    result = parse_json(payload)
    if not isinstance(result, dict) or result.get("ok") is not True:
        raise SkilluxError("Skillux did not confirm download access")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    catalog = sub.add_parser("catalog")
    catalog.add_argument("--role", choices=("frontend", "admin"))
    catalog.add_argument("--industry")
    catalog.add_argument("--q")
    catalog.add_argument("--page", type=int, default=1)
    catalog.add_argument("--page-size", type=int, default=5)
    sub.add_parser("owned")
    sub.add_parser("status", help="Verify the current Skillux session with the server")
    sub.add_parser("login", help="Verify login, opening official browser authorization when needed")
    check = sub.add_parser("check", help="Verify access; open purchase-required details and wait when needed")
    check.add_argument("slug")
    check.add_argument("--timeout", type=int, default=900, help="Maximum access wait in seconds (1-3600)")
    fetch = sub.add_parser("fetch")
    fetch.add_argument("slug")
    fetch.add_argument("--role", required=True, choices=("frontend", "admin"))
    fetch.add_argument("--project", required=True)
    fetch.add_argument("--timeout", type=int, default=900, help="Maximum access wait in seconds (1-3600)")
    args = parser.parse_args()
    try:
        base = api_base()
        if args.command == "status":
            result = auth_status()
        elif args.command == "login":
            result = ensure_login()
        else:
            if args.command == "fetch":
                fetch_preflight(args.slug, args.role, args.project)
            if args.command in ("check", "fetch"):
                template_detail_url(args.slug)
                if not 0 < args.timeout <= 3600:
                    raise SkilluxError("Access wait timeout must be between 1 and 3600 seconds")
            ensure_login()
        if args.command == "catalog":
            query = {"page": args.page, "pageSize": args.page_size}
            query.update({key: getattr(args, key) for key in ("role", "industry", "q") if getattr(args, key)})
            result = parse_json(request(base + "/templates?" + urllib.parse.urlencode(query))[0])
            if not isinstance(result, dict) or not isinstance(result.get("items"), list):
                raise SkilluxError("Invalid template catalog response")
            for item in result["items"]:
                for field in ("coverUrl", "previewUrl", "detailUrl"):
                    if item.get(field):
                        item[field] = urllib.parse.urljoin(base + "/", item[field])
        elif args.command == "owned":
            result = parse_json(request(base + "/me/skills", credentials())[0])
        elif args.command == "check":
            result = wait_for_access(args.slug, args.timeout)
        elif args.command == "fetch":
            wait_for_access(args.slug, args.timeout)
            try:
                result = fetch_pack(args.slug, args.role, args.project)
            except (AuthenticationRequired, PurchaseRequired):
                # Permission can change between preflight and download. Retry once,
                # only after the same gates pass; never retry ambiguous paid/network work.
                ensure_login()
                wait_for_access(args.slug, args.timeout)
                result = fetch_pack(args.slug, args.role, args.project)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except (SkilluxError, OSError, ValueError) as error:
        parser.exit(1, str(error) + "\n")
    except KeyboardInterrupt:
        parser.exit(130, "Authorization/access wait cancelled; no next step was started.\n")


if __name__ == "__main__":
    main()
