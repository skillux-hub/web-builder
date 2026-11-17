import contextlib
import importlib.util
import io
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import tempfile
import threading
import types
import unittest
from unittest.mock import MagicMock, patch
import urllib.error
import zipfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("skillux_gates", ROOT / "scripts/skillux.py")
client = importlib.util.module_from_spec(spec)
spec.loader.exec_module(client)


class SkilluxGatesTest(unittest.TestCase):
    def setUp(self):
        self.stderr = io.StringIO()
        self.addCleanup(self.stderr.close)
        self.output = contextlib.redirect_stderr(self.stderr)
        self.output.__enter__()
        self.addCleanup(self.output.__exit__, None, None, None)

    def test_missing_credentials_requires_login_without_network(self):
        with patch.object(client, "credentials", side_effect=client.AuthenticationRequired("missing")), patch.object(client, "request") as request:
            self.assertFalse(client.auth_status()["authenticated"])
        request.assert_not_called()

    def test_expired_credentials_are_not_authenticated(self):
        with patch.object(client, "credentials", return_value="private-token"), patch.object(client, "request", side_effect=client.AuthenticationRequired("expired")):
            self.assertEqual(client.auth_status()["state"], "login_required")

    def test_empty_library_is_authenticated_without_implying_entitlement(self):
        with patch.object(client, "credentials", return_value="private-token"), patch.object(client, "request", return_value=(b'{"skills": []}', {})) as request:
            result = client.auth_status()
        self.assertTrue(result["authenticated"])
        self.assertNotIn("token", result)
        self.assertTrue(request.call_args.args[0].endswith("/me/skills"))

    def test_network_or_unknown_access_failure_does_not_start_login(self):
        for message in ["offline", "access denied"]:
            with self.subTest(message=message), patch.object(client, "auth_status", side_effect=client.SkilluxError(message)), patch.object(client.subprocess, "run") as run:
                with self.assertRaises(client.SkilluxError):
                    client.ensure_login()
                run.assert_not_called()

    def test_valid_session_does_not_open_authorization_again(self):
        with patch.object(client, "auth_status", return_value={"authenticated": True}), patch.object(client.subprocess, "run") as run:
            self.assertTrue(client.ensure_login()["authenticated"])
        run.assert_not_called()

    def test_missing_session_waits_for_official_cli_and_revalidates(self):
        with patch.object(client, "auth_status", side_effect=[{"authenticated": False}, {"authenticated": True}]) as status, patch.object(client.shutil, "which", return_value="npx.cmd"), patch.object(client.subprocess, "run", return_value=types.SimpleNamespace(returncode=0)) as run:
            self.assertTrue(client.ensure_login()["authenticated"])
        self.assertEqual(status.call_count, 2)
        self.assertEqual(run.call_args.args[0], ["npx.cmd", "--yes", client.SKILLUX_CLI, "login"])

    def test_cancelled_login_or_unverified_cli_success_cannot_continue(self):
        for returncode in [1, 0]:
            with self.subTest(returncode=returncode), patch.object(client, "auth_status", return_value={"authenticated": False}), patch.object(client.shutil, "which", return_value="npx.cmd"), patch.object(client.subprocess, "run", return_value=types.SimpleNamespace(returncode=returncode)):
                with self.assertRaises(client.SkilluxError):
                    client.ensure_login()

    def test_purchase_error_requires_explicit_server_code(self):
        for code, expected in [("PURCHASE_REQUIRED", client.PurchaseRequired), ("ACCOUNT_DISABLED", client.SkilluxError)]:
            response = io.BytesIO(json.dumps({"code": code}).encode())
            error = urllib.error.HTTPError("https://skillux.dev/api/me/skills/example/download?check=1", 403, "denied", {}, response)
            with self.subTest(code=code), patch.object(client.urllib.request.OpenerDirector, "open", side_effect=error):
                with self.assertRaises(expected) as raised:
                    client.request(error.url, "private-token")
                if code != "PURCHASE_REQUIRED":
                    self.assertNotIsInstance(raised.exception, client.PurchaseRequired)

    def test_purchase_wait_opens_detail_once_then_requires_real_access(self):
        with patch.object(client, "check_access", side_effect=[client.PurchaseRequired("buy"), client.PurchaseRequired("buy"), {"ok": True}]) as check, patch.object(client.webbrowser, "open", return_value=True) as browser, patch.object(client.time, "sleep") as sleep, patch.object(client.time, "monotonic", return_value=0):
            self.assertEqual(client.wait_for_access("example"), {"ok": True})
        self.assertEqual(check.call_count, 3)
        browser.assert_called_once_with("https://skillux.dev/skills/example", new=1)
        self.assertEqual(sleep.call_count, 2)
        self.assertNotIn("private-token", self.stderr.getvalue())

    def test_existing_entitlement_skips_purchase_window(self):
        with patch.object(client, "check_access", return_value={"ok": True}), patch.object(client.webbrowser, "open") as browser:
            self.assertTrue(client.wait_for_access("example")["ok"])
        browser.assert_not_called()

    def test_quota_network_and_unknown_denials_never_open_purchase(self):
        for message in ["download allowance exhausted", "offline", "account denied", "not found"]:
            with self.subTest(message=message), patch.object(client, "check_access", side_effect=client.SkilluxError(message)), patch.object(client.webbrowser, "open") as browser, patch.object(client.time, "sleep") as sleep:
                with self.assertRaises(client.SkilluxError):
                    client.wait_for_access("example")
                browser.assert_not_called()
                sleep.assert_not_called()

    def test_purchase_timeout_is_not_success(self):
        with patch.object(client, "check_access", side_effect=client.PurchaseRequired("buy")), patch.object(client.webbrowser, "open", return_value=True) as browser, patch.object(client.time, "monotonic", side_effect=[0, 900]), patch.object(client.time, "sleep") as sleep:
            with self.assertRaisesRegex(client.SkilluxError, "still unconfirmed"):
                client.wait_for_access("example")
        browser.assert_called_once()
        sleep.assert_not_called()

    def test_browser_failure_returns_real_detail_url_without_continuing(self):
        with patch.object(client, "check_access", side_effect=client.PurchaseRequired("buy")), patch.object(client.webbrowser, "open", return_value=False), patch.object(client.time, "sleep") as sleep:
            with self.assertRaisesRegex(client.SkilluxError, "https://skillux.dev/skills/example"):
                client.wait_for_access("example")
        sleep.assert_not_called()

    def test_access_session_expiry_reauthenticates_without_purchase(self):
        with patch.object(client, "check_access", side_effect=[client.AuthenticationRequired("expired"), {"ok": True}]), patch.object(client, "ensure_login", return_value={"authenticated": True}) as login, patch.object(client.webbrowser, "open") as browser, patch.object(client.time, "sleep"):
            self.assertTrue(client.wait_for_access("example")["ok"])
        login.assert_called_once()
        browser.assert_not_called()

    def test_download_streams_to_disk_and_caps_size(self):
        response = MagicMock()
        response.__enter__.return_value = response
        response.headers = {"content-type": "application/zip", "x-skillux-version": "2.1.0"}
        response.read.side_effect = [b"chunk-one", b"chunk-two", b""]
        with tempfile.TemporaryDirectory() as temp, patch.object(client, "open_response", return_value=response):
            target = Path(temp) / "pack.zip"
            self.assertEqual(client.download("https://skillux.dev/api/me/skills/example/download", "private-token", target), ("application/zip", "2.1.0"))
            self.assertEqual(target.read_bytes(), b"chunk-onechunk-two")
        oversized = MagicMock()
        oversized.__enter__.return_value = oversized
        oversized.headers = {}
        oversized.read.side_effect = [b"x" * (client.MAX_TOTAL + 1)]
        with tempfile.TemporaryDirectory() as temp, patch.object(client, "open_response", return_value=oversized):
            with self.assertRaisesRegex(client.SkilluxError, "100 MB"):
                client.download("https://skillux.dev/api/me/skills/example/download", "private-token", Path(temp) / "pack.zip")

    def test_download_urls_are_limited_to_the_service_origin(self):
        base = "https://skillux.dev/api"
        self.assertTrue(client.trusted_download("https://skillux.dev/skills/example.zip", base))
        self.assertTrue(client.trusted_download("https://cdn.skillux.dev/skills/example.zip", base))
        for url in ["https://skillux.dev.evil.example/pack.zip", "https://evilskillux.dev/pack.zip", "http://skillux.dev/pack.zip"]:
            with self.subTest(url=url):
                self.assertFalse(client.trusted_download(url, base))

    def test_unpack_reads_a_downloaded_file(self):
        with tempfile.TemporaryDirectory() as temp:
            source = Path(temp) / "pack.zip"
            with zipfile.ZipFile(source, "w") as archive:
                archive.writestr("SKILL.md", "# Example\n")
                archive.writestr("references/guide.md", "Guide\n")
            target = Path(temp) / "out"
            target.mkdir()
            client.unpack(source, target)
            self.assertEqual((target / "SKILL.md").read_text(), "# Example\n")
            self.assertTrue((target / "references/guide.md").is_file())

    def test_fetch_pack_rejects_server_download_urls_outside_the_service(self):
        with tempfile.TemporaryDirectory() as temp:
            project = Path(temp)
            (project / ".web-builder").mkdir()
            (project / ".web-builder/project.json").write_text(json.dumps({"schemaVersion": 1}))

            def fake_download(url, token, destination):
                destination.write_bytes(json.dumps({"downloadUrl": "https://evil.example/pack.zip"}).encode())
                return "application/json", "1.0.0"

            with patch.object(client, "credentials", return_value="private-token"), patch.object(client, "api_base", return_value="https://skillux.dev/api"), patch.object(client, "download", side_effect=fake_download):
                with self.assertRaisesRegex(client.SkilluxError, "outside the Skillux service"):
                    client.fetch_pack("example", "frontend", project)

    def test_catalog_does_not_proceed_if_login_is_not_verified(self):
        with patch.object(client.sys, "argv", ["skillux.py", "catalog"]), patch.object(client, "ensure_login", side_effect=client.AuthenticationRequired("not approved")), patch.object(client, "request") as request:
            with self.assertRaises(SystemExit) as exited:
                client.main()
        self.assertEqual(exited.exception.code, 1)
        request.assert_not_called()

    def test_disabled_admin_target_cannot_trigger_purchase(self):
        with tempfile.TemporaryDirectory() as temp:
            project = Path(temp)
            (project / ".web-builder").mkdir()
            (project / ".web-builder/project.json").write_text(json.dumps({"schemaVersion": 1, "brief": {"adminRequired": False}}))
            with patch.object(client.sys, "argv", ["skillux.py", "fetch", "example", "--role", "admin", "--project", temp]), patch.object(client, "ensure_login") as login, patch.object(client, "wait_for_access") as access:
                with self.assertRaises(SystemExit):
                    client.main()
            login.assert_not_called()
            access.assert_not_called()

    def test_cli_checks_real_local_http_denial_then_grant_before_continuing(self):
        calls = []

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                calls.append(self.path)
                if self.path == "/api/me/skills":
                    status, body = 200, {"skills": []}
                elif calls.count(self.path) == 1:
                    status, body = 403, {"code": "PURCHASE_REQUIRED"}
                else:
                    status, body = 200, {"ok": True, "slug": "example"}
                payload = json.dumps(body).encode()
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload)

            def log_message(self, *args):
                pass

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            base = f"http://127.0.0.1:{server.server_port}/api"
            output = io.StringIO()
            with patch.object(client.sys, "argv", ["skillux.py", "check", "example"]), patch.object(client, "api_base", return_value=base), patch.object(client, "credentials", return_value="fixture-private-token"), patch.object(client.webbrowser, "open", return_value=True) as browser, patch.object(client.time, "sleep"), contextlib.redirect_stdout(output):
                client.main()
            self.assertEqual(json.loads(output.getvalue()), {"ok": True, "slug": "example"})
            self.assertEqual(calls, ["/api/me/skills", "/api/me/skills/example/download?check=1", "/api/me/skills/example/download?check=1"])
            browser.assert_called_once_with(f"http://127.0.0.1:{server.server_port}/skills/example", new=1)
            self.assertNotIn("fixture-private-token", output.getvalue() + self.stderr.getvalue())
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)

    def test_download_access_race_rechecks_gates_before_one_retry(self):
        output = io.StringIO()
        with patch.object(client.sys, "argv", ["skillux.py", "fetch", "example", "--role", "frontend", "--project", "fixture"]), patch.object(client, "fetch_preflight"), patch.object(client, "ensure_login", return_value={"authenticated": True}) as login, patch.object(client, "wait_for_access", return_value={"ok": True}) as access, patch.object(client, "fetch_pack", side_effect=[client.PurchaseRequired("changed"), {"slug": "example"}]) as fetch, contextlib.redirect_stdout(output):
            client.main()
        self.assertEqual(fetch.call_count, 2)
        self.assertEqual(access.call_count, 2)
        self.assertEqual(login.call_count, 2)
        self.assertEqual(json.loads(output.getvalue()), {"slug": "example"})


if __name__ == "__main__":
    unittest.main()
