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
    print("[WARN] jsonschema library is not installed. Installing...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "jsonschema", "-q"], check=False)
    import jsonschema

schemas_dir = Path("schemas")
templates_dir = Path("templates")

if not schemas_dir.is_dir():
    if Path("../schemas").is_dir():
        schemas_dir = Path("../schemas")
        templates_dir = Path("../templates")
    elif Path("../../schemas").is_dir():
        schemas_dir = Path("../../schemas")
        templates_dir = Path("../../templates")

if not schemas_dir.is_dir():
    print("INFO: No schemas directory found to validate.")
    sys.exit(0)

total_checked = 0
total_errors = 0

print("🔍 [SCHEMA PROBE] Validating all Schemas against Templates/Examples...\n")

for schema_file in sorted(schemas_dir.glob("*.schema.json")):
    base_name = schema_file.name.replace(".schema.json", "")
    example_file = templates_dir / f"{base_name}.example.json"
    
    if not example_file.is_file():
        example_file = templates_dir / f"{base_name}.json"
        
    if not example_file.is_file():
        print(f"  ⚪ {schema_file.name}: No matching template found in {templates_dir} (Skipped)")
        continue
        
    total_checked += 1
    try:
        with open(schema_file, "r", encoding="utf-8") as sf:
            schema = json.load(sf)
        with open(example_file, "r", encoding="utf-8") as ef:
            data = json.load(ef)
            
        validator = jsonschema.Draft7Validator(schema)
        errors = list(validator.iter_errors(data))
        
        if errors:
            total_errors += len(errors)
            print(f"  ❌ {schema_file.name} vs {example_file.name}: FAILED ({len(errors)} errors)")
            for i, err in enumerate(errors, 1):
                path_str = " -> ".join(str(p) for p in err.path) if err.path else "root"
                print(f"     [{i}] Path: {path_str} | Message: {err.message}")
        else:
            print(f"  ✅ {schema_file.name} vs {example_file.name}: PASSED (0 errors)")
    except Exception as exc:
        total_errors += 1
        print(f"  ❌ {schema_file.name}: Exception during validation - {exc}")

print(f"\n=======================================================")
if total_errors == 0:
    print(f"  🎉 ALL {total_checked} SCHEMA(S) VALIDATED PERFECTLY! (0 ERRORS)")
    print("=======================================================")
    sys.exit(0)
else:
    print(f"  ⚠️ SCHEMA VALIDATION FAILED WITH {total_errors} TOTAL ERROR(S)!")
    print("=======================================================")
    sys.exit(1)
