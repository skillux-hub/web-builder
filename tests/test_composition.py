import importlib.util
import json
import os
from pathlib import Path
import stat
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("create_composed_project", ROOT / "scripts/create_project.py")
creator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(creator)


class CompositionTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.brief = {"brand": "Example", "business": "Services", "locale": "en-GB", "modules": []}

    def generate(self, brief, foundation="standard"):
        path = creator.create(self.root / "project", brief, foundation)
        return path, json.loads((path / ".web-builder/project.json").read_text(encoding="utf-8"))

    def test_public_landing_has_no_admin_artifacts_or_credentials(self):
        path, state = self.generate({**self.brief, "websiteType": "landing", "adminRequired": False})
        for rel in ["app/admin", "components/Admin.tsx", "components/AdminSystem.tsx", "lib/auth.ts", "lib/governance.ts", "lib/admin-core-api.ts", "lib/seed-admin.ts", "LOCAL_ACCESS.md"]:
            self.assertFalse((path / rel).exists(), rel)
        schema = (path / "prisma/schema.prisma").read_text()
        for name in ["Admin", "AdminSession", "Role", "AuditLog", "LoginThrottle"]:
            self.assertNotIn(f"model {name} {{", schema)
        for rel in [".env", ".env.example", "prisma/seed.ts"]:
            self.assertNotIn("ADMIN_", (path / rel).read_text())
        self.assertIsNone(state["adminArchitecture"])
        self.assertEqual(state["composition"]["assetLayers"], ["core", "standard"])
        self.assertNotIn("admin", state["composition"]["modules"])

    def test_public_commerce_retains_orders_without_admin(self):
        brief = {**self.brief, "websiteType": "commerce", "adminRequired": False, "modules": ["orders"], "currency": "GBP"}
        path, state = self.generate(brief, "commerce")
        self.assertTrue((path / "lib/commerce.ts").is_file())
        self.assertFalse((path / "app/admin").exists())
        schema = (path / "prisma/schema.prisma").read_text()
        self.assertIn("model Order {", schema)
        self.assertNotIn("model Admin {", schema)
        self.assertIn("TEST_PAYMENT_SECRET", (path / ".env.example").read_text())
        self.assertNotIn("lib/auth", (path / "tests/business.test.ts").read_text())
        self.assertEqual(state["composition"]["modules"]["payments"]["status"], "pending")

    def test_admin_download_is_rejected_before_credentials_or_network(self):
        path, _ = self.generate({**self.brief, "adminRequired": False})
        spec = importlib.util.spec_from_file_location("composition_skillux", ROOT / "scripts/skillux.py")
        client = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(client)
        with patch.object(client, "credentials") as credentials, self.assertRaisesRegex(client.SkilluxError, "disabled"):
            client.fetch_pack("example", "admin", path)
        credentials.assert_not_called()

    def test_default_business_has_admin_and_preserves_original_brief(self):
        brief = {**self.brief, "websiteType": "business", "modules": ["services", "cases", "inquiries"]}
        path, state = self.generate(brief)
        self.assertTrue((path / "app/admin/login/page.tsx").is_file())
        self.assertTrue((path / "lib/seed-admin.ts").is_file())
        self.assertTrue((path / "LOCAL_ACCESS.md").is_file())
        self.assertEqual(state["brief"], brief)
        self.assertEqual(state["schemaVersion"], 1)
        self.assertEqual(state["businessImplementation"], "pending")
        self.assertEqual(state["composition"]["modules"]["content"]["status"], "pending")
        self.assertEqual(state["composition"]["modules"]["admin"]["status"], "scaffolded")
        self.assertNotIn("commerce", state["composition"]["modules"])

    def test_single_page_missing_decision_fails_before_writing(self):
        for fields in [{"websiteType": "landing"}, {"websiteType": "business", "singlePage": True}]:
            with self.subTest(fields=fields), self.assertRaisesRegex(ValueError, "adminRequired"):
                self.generate({**self.brief, **fields})
            self.assertFalse((self.root / "project").exists())

    def test_generated_secrets_are_private_and_resolved_modules_are_recorded(self):
        path, _ = self.generate({**self.brief, "websiteType": "business", "adminRequired": True, "modules": ["services"]})
        config = json.loads((path / "site.config.json").read_text(encoding="utf-8"))
        self.assertIn("content", config["modules"])
        self.assertIn("admin", config["modules"])
        if os.name != "posix":
            return
        for name in (".env", "LOCAL_ACCESS.md"):
            self.assertEqual(stat.S_IMODE((path / name).stat().st_mode), 0o600, name)

    def test_commerce_foundation_accepts_canonical_module_id(self):
        brief = {**self.brief, "websiteType": "commerce", "adminRequired": False, "modules": ["commerce"], "currency": "GBP"}
        path, state = self.generate(brief, "commerce")
        self.assertIn("commerce", state["composition"]["modules"])
        self.assertEqual(state["brief"]["modules"], ["commerce"])
        self.assertIn("commerce", json.loads((path / "site.config.json").read_text(encoding="utf-8"))["modules"])

    def test_invalid_admin_and_type_fields_fail_before_writing(self):
        for fields in [{"adminRequired": "false"}, {"singlePage": 1}, {"websiteType": []}, {"additionalWebsiteTypes": "booking"}]:
            with self.subTest(fields=fields), self.assertRaises(ValueError):
                self.generate({**self.brief, **fields})
            self.assertFalse((self.root / "project").exists())

    def test_dependencies_cannot_silently_override_exclusions(self):
        for fields in [
            {"websiteType": "commerce", "excludedModules": ["payments"]},
            {"websiteType": "commerce", "excludedModules": ["commerce"]},
            {"adminRequired": True, "excludedModules": ["media"]},
            {"adminRequired": False, "modules": ["admin"]},
        ]:
            with self.subTest(fields=fields), self.assertRaisesRegex(ValueError, "excluded"):
                self.generate({**self.brief, **fields})
            self.assertFalse((self.root / "project").exists())

    def test_hybrid_aliases_share_modules_without_enabling_commerce(self):
        brief = {**self.brief, "websiteType": "business", "additionalWebsiteTypes": ["booking"], "modules": ["appointments", "services", "custom-approval"], "adminRequired": False}
        _, state = self.generate(brief)
        modules = state["composition"]["modules"]
        self.assertIn("bookings", modules)
        self.assertIn("brief:appointments", modules["bookings"]["sources"])
        self.assertEqual(state["composition"]["customModules"], ["custom-approval"])
        self.assertNotIn("commerce", modules)
        self.assertNotIn("payments", modules)

    def test_catalog_conflicts_and_cycles_are_rejected(self):
        for change, message in [("cycle", "Cyclic"), ("conflict", "conflicts")]:
            catalog = json.loads((ROOT / "config/catalog.json").read_text())
            if change == "cycle":
                catalog["modules"]["seo"]["requires"] = ["content"]
            else:
                catalog["modules"]["content"]["conflicts"] = ["seo"]
            with self.subTest(change=change), patch("json.loads", return_value=catalog), self.assertRaisesRegex(ValueError, message):
                creator.composition({**self.brief, "modules": ["services"], "adminRequired": False}, "standard")

    def test_new_types_resolve_distinct_workflows(self):
        for kind, required in [
            ("tool", {"execution", "seo"}),
            ("community", {"community", "authentication", "lists", "seo"}),
            ("marketplace", {"marketplace", "directory", "authentication", "commerce", "payments"}),
        ]:
            with self.subTest(kind=kind):
                plan = creator.composition({**self.brief, "websiteType": kind, "adminRequired": False}, "standard")
                self.assertTrue(required <= plan["modules"].keys())
                self.assertEqual(plan["assetLayers"], ["core", "standard"])
                self.assertTrue(all(m["status"] == "pending" for m in plan["modules"].values()))
                if kind != "marketplace":
                    self.assertNotIn("commerce", plan["modules"])
                    self.assertNotIn("payments", plan["modules"])
                if kind == "tool":
                    self.assertNotIn("authentication", plan["modules"])

    def test_marketplace_required_capabilities_cannot_be_excluded(self):
        for module in ["marketplace", "authentication", "commerce", "payments"]:
            with self.subTest(module=module), self.assertRaisesRegex(ValueError, "excluded"):
                self.generate({**self.brief, "websiteType": "marketplace", "adminRequired": False, "excludedModules": [module]})
            self.assertFalse((self.root / "project").exists())

    def test_marketplace_foundation_does_not_claim_seller_workflows(self):
        brief = {**self.brief, "websiteType": "marketplace", "modules": ["orders"], "currency": "GBP"}
        path, state = self.generate(brief, "commerce")
        modules = state["composition"]["modules"]
        self.assertEqual(modules["marketplace"]["status"], "pending")
        self.assertEqual(modules["authentication"]["status"], "pending")
        self.assertEqual(modules["payments"]["status"], "pending")
        self.assertEqual(modules["commerce"]["status"], "scaffolded")
        self.assertEqual(state["businessImplementation"], "pending")
        self.assertNotIn("model Seller", (path / "prisma/schema.prisma").read_text())

    def test_profiles_preserve_scope_without_forcing_accounts_or_payments(self):
        for kind, field, values in [
            ("booking", "bookingModel", ["slots", "date-range", "capacity"]),
            ("education", "educationMode", ["presentation", "enrollment", "learning"]),
        ]:
            for value in values:
                with self.subTest(kind=kind, value=value):
                    brief = {**self.brief, "websiteType": kind, field: value, "adminRequired": False}
                    path = creator.create(self.root / (kind + "-" + value), brief)
                    state = json.loads((path / ".web-builder/project.json").read_text(encoding="utf-8"))
                    self.assertEqual(state["brief"][field], value)
                    self.assertNotIn("authentication", state["composition"]["modules"])
                    self.assertNotIn("payments", state["composition"]["modules"])
                    self.assertFalse((path / "app/cart").exists())

    def test_all_catalog_references_and_asset_layers_exist(self):
        catalog = json.loads((ROOT / "config/catalog.json").read_text())
        for name, module in catalog["modules"].items():
            self.assertTrue((ROOT / f"references/modules/{name}.md").is_file())
            for dependency in module["requires"]:
                self.assertIn(dependency, catalog["modules"])
        for name, kind in catalog["websiteTypes"].items():
            self.assertTrue((ROOT / f"references/website-types/{name}.md").is_file())
            for module in kind.get("required", []) + kind["defaults"] + kind["optional"]:
                self.assertIn(module, catalog["modules"])
        for foundation in catalog["foundations"].values():
            for layer in foundation["assets"] + foundation["adminAssets"]:
                self.assertTrue((ROOT / "assets" / layer).is_dir())

    def test_taxonomy_aliases_reuse_one_module_without_creating_a_store(self):
        brief = {**self.brief, "modules": ["categories", "tags"], "adminRequired": False}
        _, state = self.generate(brief)
        modules = state["composition"]["modules"]
        self.assertEqual(set(modules), {"taxonomy", "lists"})
        self.assertEqual(modules["taxonomy"]["status"], "pending")
        self.assertIn("brief:categories", modules["taxonomy"]["sources"])
        self.assertIn("brief:tags", modules["taxonomy"]["sources"])
        self.assertEqual(state["brief"], brief)
        self.assertEqual(state["composition"]["customModules"], [])

    def test_shared_services_do_not_force_registration_or_paid_collection(self):
        requested = ["files", "notifications", "subscriptions", "entitlements", "search", "after-sales", "taxonomy"]
        plan = creator.composition({**self.brief, "modules": requested, "adminRequired": False}, "standard")
        self.assertEqual(set(plan["modules"]), set(requested) | {"lists"})
        self.assertTrue(all(value["status"] == "pending" for value in plan["modules"].values()))
        self.assertNotIn("payments", plan["modules"])
        self.assertNotIn("commerce", plan["modules"])
        self.assertNotIn("authentication", plan["modules"])
        self.assertEqual(plan["assetLayers"], ["core", "standard"])

    def test_organization_membership_requires_identity_without_platform_admin(self):
        plan = creator.composition({**self.brief, "modules": ["tenancy"], "adminRequired": False}, "standard")
        self.assertEqual(set(plan["modules"]), {"tenancy", "authentication", "lists"})
        self.assertNotIn("admin", plan["modules"])
        self.assertNotIn("subscriptions", plan["modules"])

    def test_shared_service_dependencies_respect_explicit_exclusions(self):
        for module, dependency in [("tenancy", "authentication"), ("commerce", "taxonomy"), ("media", "files"), ("subscriptions", "entitlements"), ("directory", "search")]:
            with self.subTest(module=module), self.assertRaisesRegex(ValueError, "excluded"):
                creator.composition({**self.brief, "modules": [module], "excludedModules": [dependency], "adminRequired": False}, "standard")

    def test_tool_optional_services_remain_unselected_until_requested(self):
        plan = creator.composition({**self.brief, "websiteType": "tool", "adminRequired": False}, "standard")
        for module in ["files", "notifications", "subscriptions", "entitlements", "tenancy", "search"]:
            self.assertNotIn(module, plan["modules"])

    def test_sms_resolves_delivery_without_customer_login_or_paid_collection(self):
        brief = {**self.brief, "modules": ["sms"], "adminRequired": False}
        path, state = self.generate(brief)
        plan = state["composition"]
        self.assertEqual(set(plan["modules"]), {"sms", "notifications"})
        self.assertEqual(plan["modules"]["sms"]["status"], "pending")
        self.assertEqual(plan["assetLayers"], ["core", "standard"])
        self.assertEqual(state["brief"], brief)
        self.assertNotIn("SMS_", (path / ".env").read_text())
        self.assertFalse((path / "lib/auth.ts").exists())

    def test_notifications_and_identity_do_not_implicitly_activate_sms(self):
        for module in ["notifications", "authentication"]:
            with self.subTest(module=module):
                plan = creator.composition({**self.brief, "modules": [module], "adminRequired": False}, "standard")
                self.assertNotIn("sms", plan["modules"])

    def test_sms_cannot_exclude_its_notification_dependency(self):
        with self.assertRaisesRegex(ValueError, "excluded"):
            self.generate({**self.brief, "modules": ["sms"], "excludedModules": ["notifications"], "adminRequired": False})
        self.assertFalse((self.root / "project").exists())


if __name__ == "__main__":
    unittest.main()
