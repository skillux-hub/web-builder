#!/usr/bin/env python3
"""Create a relocatable local full-stack business foundation; never overwrite work."""
import argparse
import json
from pathlib import Path
import secrets
import shutil
import importlib.util


def composition(brief, foundation):
    spec = importlib.util.spec_from_file_location("web_builder_composition", Path(__file__).with_name("composition.py"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.resolve(brief, foundation)


def create(output, brief, foundation="standard"):
    if not isinstance(brief, dict):
        raise ValueError("brief must be a JSON object")
    for field in ("brand", "business", "locale"):
        if not isinstance(brief.get(field), str) or not brief[field].strip():
            raise ValueError(f"Missing brief field: {field}")
    if not isinstance(brief.get("modules"), list) or not all(isinstance(item, str) for item in brief["modules"]):
        raise ValueError("modules must be a list of strings")
    if "currency" in brief and (not isinstance(brief["currency"], str) or len(brief["currency"]) != 3 or not brief["currency"].isalpha()):
        raise ValueError("currency must be a three-letter currency code")
    output = Path(output).resolve()
    skill = Path(__file__).resolve().parent.parent
    if output == skill or output.is_relative_to(skill) or skill.is_relative_to(output):
        raise ValueError("Output must be outside the skill")
    if output.exists() and (not output.is_dir() or any(output.iterdir())):
        raise ValueError("Output is not empty; existing content was preserved")
    plan = composition(brief, foundation)
    admin_required = plan["adminRequired"]
    for layer in plan["assetLayers"]:
        shutil.copytree(skill / "assets" / layer, output, dirs_exist_ok=True)
    if admin_required:
        schema = output / "prisma/schema.prisma"
        schema.write_text(schema.read_text(encoding="utf-8") + "\n" + (skill / "assets/admin/schema.prisma.inc").read_text(encoding="utf-8"), encoding="utf-8")
        (output / "schema.prisma.inc").unlink()
    seed_imports = ['import { db } from "../lib/db";']
    seed_calls = []
    if admin_required:
        seed_imports.append('import { seedAdmin } from "../lib/seed-admin";')
        seed_calls.append("await seedAdmin();")
    if foundation == "commerce":
        seed_imports.append('import { seedCatalog } from "../lib/seed-catalog";')
        seed_calls.append("await seedCatalog();")
    (output / "prisma/seed.ts").write_text("\n".join(seed_imports) + "\nasync function seed() {\n" + "\n".join(seed_calls) + '\n}\nseed().finally(() => db.$disconnect());\n', encoding="utf-8")
    payment_env = f'TEST_PAYMENT_SECRET="{secrets.token_hex(32)}"\n' if foundation == "commerce" else ""
    password = secrets.token_urlsafe(18) if admin_required else None
    admin_env = f'ADMIN_EMAIL="admin@local.test"\nADMIN_PASSWORD="{password}"\n' if admin_required else ""
    (output / ".env").write_text(
        'DATABASE_URL="file:./prisma/dev.db"\n' + admin_env + payment_env, encoding="utf-8")
    (output / ".env.example").write_text(
        'DATABASE_URL="file:./prisma/dev.db"\n' + ('ADMIN_EMAIL="admin@local.test"\nADMIN_PASSWORD=""\n' if admin_required else "") +
        ('TEST_PAYMENT_SECRET=""\n' if foundation == "commerce" else ""), encoding="utf-8")
    if admin_required:
        (output / "LOCAL_ACCESS.md").write_text(
            "# Local test access\n\nEmail: admin@local.test\n\nPassword: " + password +
            "\n\nThese are local test credentials. Do not publish this file or .env.\n", encoding="utf-8")
    config = {"brand": brief["brand"], "locale": brief["locale"], "modules": brief["modules"], "adminRequired": admin_required}
    if "websiteType" in brief:
        config["websiteType"] = brief["websiteType"]
    if "region" in brief:
        config["region"] = brief["region"]
    if "currency" in brief:
        config["currency"] = brief["currency"].upper()
    (output / "site.config.json").write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    state_dir = output / ".web-builder"
    state_dir.mkdir()
    state = {"schemaVersion": 1, "brief": brief, "foundation": foundation, "templates": {},
             "templateIntegration": "pending", "businessImplementation": "pending",
             "composition": plan,
             "adminArchitecture": {"entry": "/admin", "login": "/admin/login", "separateLayout": True,
                                   "coreModules": ["roles", "permissions", "administrators", "audit", "settings", "seo", "password"]} if admin_required else None, "checks": {}}
    (state_dir / "project.json").write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output")
    parser.add_argument("--brief", required=True)
    parser.add_argument("--foundation", choices=("standard", "commerce"), default="standard")
    args = parser.parse_args()
    try:
        output = create(args.output, json.loads(Path(args.brief).read_text(encoding="utf-8-sig")), args.foundation)
    except (ValueError, OSError) as error:
        parser.exit(1, str(error) + "\n")
    print(f"Created business foundation: {output}\nNext: npm install; npm run setup; npm run dev\nTemplate migration remains pending.")


if __name__ == "__main__":
    main()
