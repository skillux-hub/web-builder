"""Optional local-only HTTP acceptance check against a generated dev project."""
import argparse
import http.cookiejar
import json
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request
import uuid


def check(project, base, commerce=False):
    if urllib.parse.urlsplit(base).hostname not in ("localhost", "127.0.0.1", "::1"):
        raise ValueError("Smoke tests are restricted to local generated test projects")
    env = dict(line.split("=", 1) for line in (Path(project) / ".env").read_text().splitlines() if "=" in line and not line.startswith("#"))
    env = {key: value.strip('"') for key, value in env.items()}
    admin = json.loads((Path(project) / "site.config.json").read_text(encoding="utf-8")).get("adminRequired", True)
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

    def call(path, method="GET", data=None, headers=None, expected=200):
        request = urllib.request.Request(base + path, method=method, data=json.dumps(data).encode() if data is not None else None,
                                         headers={"Content-Type": "application/json", **(headers or {})})
        try:
            response = opener.open(request, timeout=60)
        except urllib.error.HTTPError as error:
            response = error
        assert response.code == expected, f"{method} {path}: expected {expected}, got {response.code}"
        payload = response.read()
        if "application/json" in response.headers.get("content-type", ""):
            return json.loads(payload)
        return payload

    home = call("/")
    if admin:
        call("/admin")
        call("/api/admin/session", expected=401)
        call("/api/admin/products", expected=401)
        call("/api/admin/session", "POST", {"email": env["ADMIN_EMAIL"], "password": "incorrect"}, expected=401)
        call("/api/admin/session", "POST", {"email": env["ADMIN_EMAIL"], "password": env["ADMIN_PASSWORD"]})
        call("/api/admin/session")
        call("/api/admin/session", "DELETE", headers={"Origin": "https://untrusted.example"}, expected=403)
        call("/api/admin/session")
    else:
        assert "ADMIN_EMAIL" not in env and "ADMIN_PASSWORD" not in env
        assert not (Path(project) / "LOCAL_ACCESS.md").exists()
        assert b'href="/admin"' not in home
        call("/admin", expected=404)
        call("/admin/login", expected=404)
        call("/api/admin/session", expected=404)
        call("/api/admin/session", "POST", {}, expected=404)
        call("/api/admin/products", expected=404)
    if commerce:
        sku = "HTTP-" + uuid.uuid4().hex[:12]
        if admin:
            result = call("/api/admin/products", "POST", {"name": "HTTP smoke test", "category": "Test", "variants": [{"sku": sku, "size": "M", "color": "Blue", "price": 1234, "stock": 2}]})
            product = next(item for item in call("/api/products")["products"] if item["id"] == result["product"]["id"])
        else:
            product = call("/api/products")["products"][0]
        variant = product["variants"][0]
        order_input = {"customerName": "Local test", "email": "smoke@example.test", "address": "Test address", "items": [{"variantId": variant["id"], "quantity": 1}], "total": 1}
        key = uuid.uuid4().hex
        receipt = call("/api/orders", "POST", order_input, {"Idempotency-Key": key}, 201)
        retry = call("/api/orders", "POST", order_input, {"Idempotency-Key": key}, 201)
        assert retry["order"]["id"] == receipt["order"]["id"]
        assert receipt["order"]["total"] == variant["price"]
        order_id = receipt["order"]["id"]
        call("/api/orders/" + order_id, expected=404)
        token_header = {"X-Order-Token": receipt["accessToken"]}
        call("/api/orders/" + order_id, headers=token_header)
        result = call("/api/orders/" + order_id + "/test-payment", "POST", {"eventId": uuid.uuid4().hex, "outcome": "success"}, token_header)
        assert result["order"]["status"] == "PAID"
        if admin:
            assert any(order["id"] == order_id for order in call("/api/admin/orders")["orders"])
            call("/api/admin/orders/" + order_id, "PATCH", {"status": "SHIPPED"})
        else:
            assert call("/api/orders/" + order_id, headers=token_header)["order"]["status"] == "PAID"
            call("/api/admin/orders/" + order_id, "PATCH", {"status": "SHIPPED"}, expected=404)
        call("/cart")
        call("/orders")
    else:
        call("/api/products", expected=404)
        call("/cart", expected=404)
    if admin:
        call("/api/admin/session", "DELETE")
        call("/api/admin/session", expected=401)
    print("Local HTTP smoke passed: " + ("optional commerce" if commerce else "industry-neutral foundation") + (" with admin" if admin else " without admin"))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("project")
    parser.add_argument("base")
    parser.add_argument("--commerce", action="store_true")
    args = parser.parse_args()
    check(args.project, args.base.rstrip("/"), args.commerce)
