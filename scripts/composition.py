"""Resolve requirement scope without claiming that planned modules are implemented."""
import json
import argparse
from pathlib import Path


def resolve(brief, foundation="standard"):
    if not isinstance(brief, dict):
        raise ValueError("brief must be a JSON object")
    catalog = json.loads((Path(__file__).resolve().parents[1] / "config/catalog.json").read_text(encoding="utf-8"))
    if foundation not in catalog["foundations"]:
        raise ValueError("Unknown foundation")
    types = catalog["websiteTypes"]
    modules = catalog["modules"]
    if not isinstance(brief.get("modules"), list) or any(not isinstance(m, str) or not m.strip() for m in brief["modules"]):
        raise ValueError("modules must be a list of nonempty strings")
    primary = brief.get("websiteType")
    if primary is not None and (not isinstance(primary, str) or not primary.strip()):
        raise ValueError("websiteType must be a nonempty string")
    additional = brief.get("additionalWebsiteTypes", [])
    if not isinstance(additional, list) or any(not isinstance(t, str) or not t.strip() for t in additional):
        raise ValueError("additionalWebsiteTypes must be a list of type IDs")
    for field in ("adminRequired", "singlePage"):
        if field in brief and not isinstance(brief[field], bool):
            raise ValueError(f"{field} must be a boolean")
    if "adminRequired" in brief:
        admin = brief["adminRequired"]
        admin_source = brief.get("adminRequirementSource", "brief")
    elif brief.get("singlePage") is True or types.get(primary, {}).get("admin") == "ask":
        raise ValueError("Single-page sites require an explicit adminRequired decision")
    else:
        admin, admin_source = True, "multi-page-default" if primary else "legacy-default"
    aliases = {alias: key for key, value in modules.items() for alias in value.get("aliases", [])}
    canonical = lambda name: aliases.get(name, name)
    excluded = brief.get("excludedModules", [])
    if not isinstance(excluded, list) or any(not isinstance(m, str) for m in excluded):
        raise ValueError("excludedModules must be a list of module IDs")
    excluded = set(map(canonical, excluded))
    if "admin" in excluded and admin:
        raise ValueError("Set adminRequired false to exclude admin")
    if not admin:
        excluded.add("admin")
    selected, custom = {}, []

    def add(name, source, stack=()):
        name = canonical(name)
        if name in excluded:
            raise ValueError(f"Module {name} is excluded but required by {source}")
        if name not in modules:
            if name not in custom:
                custom.append(name)
            return
        if name in stack:
            raise ValueError("Cyclic module dependency: " + " -> ".join((*stack, name)))
        if name in selected:
            if source not in selected[name]["sources"]:
                selected[name]["sources"].append(source)
            return
        selected[name] = {"sources": [source], "status": "pending", "reference": f"references/modules/{name}.md"}
        for dependency in modules[name]["requires"]:
            add(dependency, f"dependency:{name}", (*stack, name))

    for type_id in dict.fromkeys(([primary] if primary else []) + additional):
        for name in types.get(type_id, {}).get("required", []):
            add(name, f"type-required:{type_id}")
        for name in types.get(type_id, {}).get("defaults", []):
            if name not in excluded:
                add(name, f"type-default:{type_id}")
    for name in brief["modules"]:
        add(name, f"brief:{name}")
    if admin:
        add("admin", f"admin:{admin_source}")
    foundation_spec = catalog["foundations"][foundation]
    for name in foundation_spec.get("requiredBriefModules", []):
        if name not in brief["modules"]:
            raise ValueError(f"{foundation} foundation requires an explicitly requested {name} module")
    for field in foundation_spec.get("requiredFields", []):
        if not brief.get(field):
            raise ValueError(f"{foundation} foundation requires {field}")
    if foundation == "commerce":
        add("commerce", "foundation:commerce")
    for name in selected:
        conflicts = set(modules[name]["conflicts"]) & selected.keys()
        if conflicts:
            raise ValueError(f"Module {name} conflicts with {', '.join(sorted(conflicts))}")
    # Only these coarse foundations have executable assets; other selected modules remain planned.
    for name in ("admin", "commerce"):
        if name in selected and (name == "admin" and admin or name == "commerce" and foundation == "commerce"):
            selected[name]["status"] = "scaffolded"
    layers = foundation_spec["assets"] + (foundation_spec["adminAssets"] if admin else [])
    return {"catalogVersion": catalog["version"], "websiteType": primary,
            "additionalWebsiteTypes": additional, "adminRequired": admin,
            "adminRequirementSource": admin_source, "assetLayers": layers,
            "modules": selected, "customModules": custom}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--brief", required=True)
    parser.add_argument("--foundation", choices=("standard", "commerce"), default="standard")
    args = parser.parse_args()
    try:
        print(json.dumps(resolve(json.loads(Path(args.brief).read_text(encoding="utf-8-sig")), args.foundation), ensure_ascii=False, indent=2))
    except (ValueError, OSError) as error:
        parser.exit(1, str(error) + "\n")
