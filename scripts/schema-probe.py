import argparse
import json
import sys
from pathlib import Path

# Ensure UTF-8 output on all terminal environments
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

try:
    import jsonschema
except ImportError:
    print("❌ ERROR: 'jsonschema' is not installed.")
    print("   Please install pinned dependencies: python -m pip install -r requirements-dev.txt")
    sys.exit(1)

parser = argparse.ArgumentParser(description="Empirical JSON Schema Probe Validator")
parser.add_argument("--root", type=str, default=None, help="Repository root directory to probe")
args = parser.parse_args()

if args.root:
    repo_root = Path(args.root).resolve()
else:
    repo_root = Path(__file__).resolve().parents[1]

schemas_dir = repo_root / "schemas"
templates_dir = repo_root / "templates"
brain_dir = repo_root / ".brain"

if not schemas_dir.is_dir():
    print(f"❌ FAIL-CLOSED ERROR: Schemas directory not found at: {schemas_dir}")
    sys.exit(1)

total_checked = 0
total_errors = 0

print(f"🔍 [SCHEMA PROBE] Validating Templates AND Live .brain States (Root: {repo_root})...\n")

# Map of schema to template and live state files
SCHEMA_MAPPINGS = {
    "brain.schema.json": {
        "template": templates_dir / "brain.example.json",
        "live": brain_dir / "brain.json"
    },
    "session.schema.json": {
        "template": templates_dir / "session.example.json",
        "live": brain_dir / "session.json"
    },
    "preferences.schema.json": {
        "template": templates_dir / "preferences.example.json",
        "live": brain_dir / "preferences.json"
    }
}

for schema_name, targets in SCHEMA_MAPPINGS.items():
    schema_file = schemas_dir / schema_name
    if not schema_file.is_file():
        print(f"  ❌ Required schema file missing: {schema_name}")
        total_errors += 1
        continue
        
    try:
        with open(schema_file, "r", encoding="utf-8") as sf:
            schema = json.load(sf)
        validator = jsonschema.Draft7Validator(schema)
    except Exception as exc:
        print(f"  ❌ {schema_name}: Schema syntax error - {exc}")
        total_errors += 1
        continue

    # 1. Validate Template
    template_file = targets.get("template")
    if not template_file or not template_file.is_file():
        print(f"  ❌ [TEMPLATE] Missing template file: {template_file}")
        total_errors += 1
    else:
        total_checked += 1
        try:
            with open(template_file, "r", encoding="utf-8") as tf:
                t_data = json.load(tf)
            t_errors = list(validator.iter_errors(t_data))
            if t_errors:
                total_errors += len(t_errors)
                print(f"  ❌ [TEMPLATE] {template_file.name}: FAILED ({len(t_errors)} errors)")
                for i, err in enumerate(t_errors, 1):
                    p = " -> ".join(str(x) for x in err.path) if err.path else "root"
                    print(f"     [{i}] Path: {p} | Message: {err.message}")
            else:
                print(f"  ✅ [TEMPLATE] {template_file.name}: PASSED (0 errors)")
        except Exception as exc:
            total_errors += 1
            print(f"  ❌ [TEMPLATE] {template_file.name}: Read/Validate error - {exc}")

    # 2. Validate Live State (.brain)
    live_file = targets.get("live")
    if not live_file or not live_file.is_file():
        print(f"  ❌ [LIVE STATE] Missing live state file: {live_file}")
        total_errors += 1
    else:
        total_checked += 1
        try:
            with open(live_file, "r", encoding="utf-8") as lf:
                l_data = json.load(lf)
            l_errors = list(validator.iter_errors(l_data))
            if l_errors:
                total_errors += len(l_errors)
                print(f"  ❌ [LIVE STATE] {live_file.name}: FAILED ({len(l_errors)} errors)")
                for i, err in enumerate(l_errors, 1):
                    p = " -> ".join(str(x) for x in err.path) if err.path else "root"
                    print(f"     [{i}] Path: {p} | Message: {err.message}")
            else:
                print(f"  ✅ [LIVE STATE] {live_file.name}: PASSED (0 errors)")
        except Exception as exc:
            total_errors += 1
            print(f"  ❌ [LIVE STATE] {live_file.name}: Read/Validate error - {exc}")

print(f"\n=======================================================")
if total_errors == 0:
    print(f"  🎉 ALL {total_checked} TEMPLATE & LIVE ARTIFACT(S) VALIDATED PERFECTLY! (0 ERRORS)")
    print("=======================================================")
    sys.exit(0)
else:
    print(f"  ⚠️ SCHEMA PROBE FAILED WITH {total_errors} TOTAL ERROR(S)!")
    print("=======================================================")
    sys.exit(1)
