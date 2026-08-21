import argparse
import json
import re
import sys
from pathlib import Path

# Ensure UTF-8 output on all terminal environments
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

parser = argparse.ArgumentParser(description="Empirical Deep Data & Payload Semantic Probe")
parser.add_argument("--root", type=str, default=None, help="Repository root directory to probe")
parser.add_argument("--exclude", nargs="*", default=[], help="Additional directories/files to exclude from content scan")
args = parser.parse_args()

if args.root:
    repo_root = Path(args.root).resolve()
else:
    repo_root = Path(__file__).resolve().parents[1]

brain_json_path = repo_root / ".brain" / "brain.json"

if not brain_json_path.is_file():
    print(f"❌ FAIL-CLOSED ERROR: .brain/brain.json not found at: {brain_json_path}")
    sys.exit(1)

total_errors = 0

print(f"🔍 [DATA PROBE] Deep Payload Semantic & Project Identity Verification (Root: {repo_root})...\n")

# 1. Project Identity Verification
try:
    with open(brain_json_path, "r", encoding="utf-8") as f:
        brain_data = json.load(f)
    
    project_name = brain_data.get("project", {}).get("name", "")
    repo_name = brain_data.get("project", {}).get("repository", "")
    
    foreign_names = ["tulanh", "focustimer", "focus-timer", "pomodoro", "qa-app"]
    if any(fn in project_name.lower() for fn in foreign_names):
        print(f"  ❌ FAIL: Project name '{project_name}' is identified as a foreign application name!")
        total_errors += 1
    elif project_name == "":
        print("  ❌ FAIL: Project name is empty in .brain/brain.json!")
        total_errors += 1
    else:
        print(f"  ✅ Project Identity: '{project_name}' ({repo_name})")

except Exception as exc:
    print(f"  ❌ Error reading {brain_json_path}: {exc}")
    total_errors += 1

# 2. Deep Content & Payload Cleanliness Scan
FORBIDDEN_PATTERNS = [
    (r"\b[Tt]ulanh\b", "Foreign project keyword 'Tulanh'"),
    (r"\bfocustimer\b", "Foreign project keyword 'focustimer'"),
    (r"\bfocus-timer\b", "Foreign project keyword 'focus-timer'"),
    (r"\bpomodoro\b", "Foreign project keyword 'pomodoro'"),
    (r"\bqa-app\b", "Foreign project keyword 'qa-app'"),
    (r"xywmdsieytqsxqpqvcwj", "Foreign Supabase Project ID"),
    (r"vutrongvtv24@gmail\.com", "Foreign personal contact email"),
    (r"qa-setup\.sql", "Foreign DB schema file reference")
]

# Excluded directories to prevent self-poisoning from test fixtures and tools
DEFAULT_EXCLUDES = [
    ".git", ".gitnexus", ".superpowers", "node_modules", "dist",
    "tests", "guardrails/tests", "guardrails\\tests", "__pycache__"
]
EXCLUDE_DIRS = set(DEFAULT_EXCLUDES + args.exclude)

scanned_files = 0
for file_path in repo_root.rglob("*"):
    if not file_path.is_file():
        continue
    
    # Check if inside excluded directory
    rel_path_str = str(file_path.relative_to(repo_root)).replace("\\", "/")
    parts = rel_path_str.split("/")
    
    if any(part in EXCLUDE_DIRS for part in parts):
        continue
    if "tests" in parts or "guardrails/tests" in rel_path_str:
        continue
    if file_path.name.startswith("test_") or file_path.name.endswith("_test.py"):
        continue
    if "audit-thoughts" in file_path.name or "audit_report" in file_path.name:
        continue
    if file_path.name in ["data-probe.py", "data-probe.ps1", "data-probe"]:
        continue
    if file_path.suffix in [".png", ".jpg", ".jpeg", ".ico", ".woff", ".woff2", ".exe", ".node", ".pyc"]:
        continue

    scanned_files += 1
    try:
        content = file_path.read_text(encoding="utf-8", errors="replace")
        for pattern, label in FORBIDDEN_PATTERNS:
            matches = list(re.finditer(pattern, content, re.IGNORECASE))
            if matches:
                total_errors += len(matches)
                print(f"  ❌ Forbidden Data: {rel_path_str} contains {label} ({len(matches)} match(es))")
    except Exception as exc:
        print(f"  ⚠️ Warning: Could not read {rel_path_str} - {exc}")

print(f"  ✅ Scanned {scanned_files} files across repository payload tree.")

print(f"\n=======================================================")
if total_errors == 0:
    print(f"  🎉 DATA & PAYLOAD PROBE PASSED! 100% PRISTINE CLEAN! (0 ERRORS)")
    print("=======================================================")
    sys.exit(0)
else:
    print(f"  ⚠️ DATA PROBE FAILED WITH {total_errors} FORBIDDEN REFERENCE(S)!")
    print("=======================================================")
    sys.exit(1)
