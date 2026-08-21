import json
import os
import re
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows / POSIX terminals
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

repo_root = Path(__file__).resolve().parents[1]
brain_dir = repo_root / ".brain"
templates_dir = repo_root / "templates"

errors = []
warnings = []

print("🔍 [DATA PROBE] Deep Payload Semantic & Project Identity Verification...\n")

# 1. Verify Project Identity in .brain/brain.json
brain_json_path = brain_dir / "brain.json"
if brain_json_path.is_file():
    try:
        data = json.loads(brain_json_path.read_text(encoding="utf-8"))
        proj_name = data.get("project", {}).get("name", "")
        repo_name = data.get("project", {}).get("repository", "")
        
        # Check against foreign project names
        foreign_names = ["tulanh", "focustimer", "focus-timer", "pomodoro", "qa-app"]
        for fn in foreign_names:
            if fn in proj_name.lower():
                errors.append(f".brain/brain.json: Foreign project name detected: '{proj_name}'")
            if fn in repo_name.lower():
                errors.append(f".brain/brain.json: Foreign repository detected: '{repo_name}'")
                
        if not proj_name:
            errors.append(".brain/brain.json: Missing project.name payload.")
        else:
            print(f"  ✅ Project Identity: '{proj_name}' ({repo_name})")
    except Exception as exc:
        errors.append(f".brain/brain.json: JSON read error - {exc}")
else:
    warnings.append("Missing .brain/brain.json in target directory.")

# 2. Blacklist / Foreign Keyword Deep Scan across entire repo (excluding git and caches)
FORBIDDEN_PATTERNS = [
    (re.compile(r"\btulanh\b", re.I), "Foreign project keyword 'Tulanh'"),
    (re.compile(r"xywmdsieytqsxqpqvcwj", re.I), "Foreign Supabase Project ID 'xywmdsieytqsxqpqvcwj'"),
    (re.compile(r"vutrongvtv24@gmail\.com", re.I), "Personal/Foreign email 'vutrongvtv24@gmail.com'"),
    (re.compile(r"\bqa-setup\.sql\b", re.I), "Foreign database script 'qa-setup.sql'"),
]

scan_extensions = {".json", ".md", ".py", ".ps1", ".sh", ".yml", ".yaml", ".txt"}
ignored_dirs = {".git", ".gitnexus", ".superpowers", "node_modules", "__pycache__"}

total_files_scanned = 0
found_forbidden_count = 0

for root, dirs, files in os.walk(repo_root):
    dirs[:] = [d for d in dirs if d not in ignored_dirs]
    for file in files:
        file_path = Path(root) / file
        if file_path.suffix.lower() in scan_extensions:
            total_files_scanned += 1
            try:
                content = file_path.read_text(encoding="utf-8", errors="replace")
                for pattern, desc in FORBIDDEN_PATTERNS:
                    matches = list(pattern.finditer(content))
                    if matches:
                        rel_path = file_path.relative_to(repo_root)
                        # Skip if it's the data-probe script itself
                        if "data-probe" in str(rel_path):
                            continue
                        found_forbidden_count += len(matches)
                        errors.append(f"Forbidden Data: {rel_path} contains {desc} ({len(matches)} match(es))")
            except Exception as exc:
                warnings.append(f"Cannot read {file_path.relative_to(repo_root)}: {exc}")

print(f"  ✅ Scanned {total_files_scanned} files across repository payload tree.")

# 3. Summary
print(f"\n=======================================================")
if errors:
    print(f"  ❌ DATA PROBE FAILED WITH {len(errors)} ERROR(S):")
    for err in errors:
        print(f"     • {err}")
    print("=======================================================")
    sys.exit(1)
else:
    print("  🎉 DATA & PAYLOAD PROBE PASSED! 100% PRISTINE CLEAN! (0 ERRORS)")
    if warnings:
        for w in warnings:
            print(f"     ⚪ Warning: {w}")
    print("=======================================================")
    sys.exit(0)
