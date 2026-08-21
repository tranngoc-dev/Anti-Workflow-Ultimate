import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PYTHON = sys.executable


class ProbeIsolationTests(unittest.TestCase):
    def setUp(self):
        self.tmp_dir = tempfile.mkdtemp(prefix="awf_probe_test_")
        self.repo_root = Path(self.tmp_dir)

    def tearDown(self):
        shutil.rmtree(self.tmp_dir, ignore_errors=True)

    def _setup_valid_repo(self):
        # Copy schemas and templates
        shutil.copytree(ROOT / "schemas", self.repo_root / "schemas")
        shutil.copytree(ROOT / "templates", self.repo_root / "templates")
        
        # Create valid live .brain directory
        brain_dir = self.repo_root / ".brain"
        brain_dir.mkdir(parents=True, exist_ok=True)
        
        # Valid brain.json
        brain_data = {
            "meta": {
                "schema_version": "1.1.0",
                "awf_version": "4.15.0-ultimate",
                "created_at": "2026-08-20T00:00:00Z",
                "updated_at": "2026-08-21T11:00:00Z"
            },
            "updated_at": "2026-08-21T11:00:00Z",
            "project": {
                "name": "Test Project",
                "type": "webapp",
                "status": "development"
            }
        }
        (brain_dir / "brain.json").write_text(json.dumps(brain_data), encoding="utf-8")
        
        # Valid session.json
        session_data = {
            "updated_at": "2026-08-21T11:00:00Z",
            "summary": {
                "project": "Test Project",
                "status": "in_progress"
            }
        }
        (brain_dir / "session.json").write_text(json.dumps(session_data), encoding="utf-8")
        
        # Valid preferences.json
        pref_data = {
            "updated_at": "2026-08-21T11:00:00Z",
            "communication": {
                "tone": "friendly",
                "persona": "assistant"
            },
            "technical": {
                "detail_level": "simple",
                "autonomy": "ask_often",
                "quality": "production"
            }
        }
        (brain_dir / "preferences.json").write_text(json.dumps(pref_data), encoding="utf-8")

    def test_schema_probe_passes_on_valid_repo(self):
        self._setup_valid_repo()
        res = subprocess.run(
            [PYTHON, str(ROOT / "scripts" / "schema-probe.py"), "--root", str(self.repo_root)],
            capture_output=True, text=True, encoding="utf-8"
        )
        self.assertEqual(res.returncode, 0, f"Expected 0, got {res.returncode}: {res.stdout}\n{res.stderr}")
        self.assertIn("ALL 6 TEMPLATE & LIVE ARTIFACT(S) VALIDATED PERFECTLY", res.stdout)

    def test_schema_probe_fails_closed_when_schemas_missing(self):
        self._setup_valid_repo()
        shutil.rmtree(self.repo_root / "schemas")
        res = subprocess.run(
            [PYTHON, str(ROOT / "scripts" / "schema-probe.py"), "--root", str(self.repo_root)],
            capture_output=True, text=True, encoding="utf-8"
        )
        self.assertNotEqual(res.returncode, 0)
        self.assertIn("FAIL-CLOSED ERROR: Schemas directory not found", res.stdout)

    def test_schema_probe_fails_closed_when_live_brain_missing(self):
        self._setup_valid_repo()
        (self.repo_root / ".brain" / "brain.json").unlink()
        res = subprocess.run(
            [PYTHON, str(ROOT / "scripts" / "schema-probe.py"), "--root", str(self.repo_root)],
            capture_output=True, text=True, encoding="utf-8"
        )
        self.assertNotEqual(res.returncode, 0)
        self.assertIn("Missing live state file", res.stdout)

    def test_brain_schema_rejects_unknown_top_level_key(self):
        self._setup_valid_repo()
        brain_file = self.repo_root / ".brain" / "brain.json"
        data = json.loads(brain_file.read_text(encoding="utf-8"))
        data["unknown_rogue_key"] = "malicious_payload"
        brain_file.write_text(json.dumps(data), encoding="utf-8")
        
        res = subprocess.run(
            [PYTHON, str(ROOT / "scripts" / "schema-probe.py"), "--root", str(self.repo_root)],
            capture_output=True, text=True, encoding="utf-8"
        )
        self.assertNotEqual(res.returncode, 0)
        self.assertIn("FAILED (1 errors)", res.stdout)
        self.assertIn("Additional properties are not allowed", res.stdout)

    def test_preferences_schema_rejects_unknown_top_level_key(self):
        self._setup_valid_repo()
        pref_file = self.repo_root / ".brain" / "preferences.json"
        data = json.loads(pref_file.read_text(encoding="utf-8"))
        data["rogue_key"] = "test"
        pref_file.write_text(json.dumps(data), encoding="utf-8")
        
        res = subprocess.run(
            [PYTHON, str(ROOT / "scripts" / "schema-probe.py"), "--root", str(self.repo_root)],
            capture_output=True, text=True, encoding="utf-8"
        )
        self.assertNotEqual(res.returncode, 0)
        self.assertIn("Additional properties are not allowed", res.stdout)

    def test_brain_schema_rejects_unknown_nested_key(self):
        self._setup_valid_repo()
        brain_file = self.repo_root / ".brain" / "brain.json"
        data = json.loads(brain_file.read_text(encoding="utf-8"))
        data["project"]["rogue_nested_key"] = "bad_val"
        brain_file.write_text(json.dumps(data), encoding="utf-8")
        
        res = subprocess.run(
            [PYTHON, str(ROOT / "scripts" / "schema-probe.py"), "--root", str(self.repo_root)],
            capture_output=True, text=True, encoding="utf-8"
        )
        self.assertNotEqual(res.returncode, 0)
        self.assertIn("Additional properties are not allowed", res.stdout)

    def test_preferences_schema_rejects_unknown_nested_key(self):
        self._setup_valid_repo()
        pref_file = self.repo_root / ".brain" / "preferences.json"
        data = json.loads(pref_file.read_text(encoding="utf-8"))
        data["communication"]["rogue_comm_key"] = "bad_val"
        pref_file.write_text(json.dumps(data), encoding="utf-8")
        
        res = subprocess.run(
            [PYTHON, str(ROOT / "scripts" / "schema-probe.py"), "--root", str(self.repo_root)],
            capture_output=True, text=True, encoding="utf-8"
        )
        self.assertNotEqual(res.returncode, 0)
        self.assertIn("Additional properties are not allowed", res.stdout)

    def test_data_probe_passes_on_clean_repo(self):
        self._setup_valid_repo()
        res = subprocess.run(
            [PYTHON, str(ROOT / "scripts" / "data-probe.py"), "--root", str(self.repo_root)],
            capture_output=True, text=True, encoding="utf-8"
        )
        self.assertEqual(res.returncode, 0, f"Expected 0, got {res.returncode}: {res.stdout}\n{res.stderr}")
        self.assertIn("DATA & PAYLOAD PROBE PASSED", res.stdout)

    def test_data_probe_catches_foreign_payload(self):
        self._setup_valid_repo()
        rogue_file = self.repo_root / "src" / "notes.md"
        rogue_file.parent.mkdir(parents=True, exist_ok=True)
        rogue_file.write_text("Reference to focustimer app and tulanh project.", encoding="utf-8")
        
        res = subprocess.run(
            [PYTHON, str(ROOT / "scripts" / "data-probe.py"), "--root", str(self.repo_root)],
            capture_output=True, text=True, encoding="utf-8"
        )
        self.assertNotEqual(res.returncode, 0)
        self.assertIn("Forbidden Data", res.stdout)

    def test_data_probe_ignores_test_directories_and_fixtures(self):
        self._setup_valid_repo()
        test_fixture = self.repo_root / "guardrails" / "tests" / "fixture.py"
        test_fixture.parent.mkdir(parents=True, exist_ok=True)
        test_fixture.write_text("def test(): return 'Tulanh and focustimer'", encoding="utf-8")
        
        res = subprocess.run(
            [PYTHON, str(ROOT / "scripts" / "data-probe.py"), "--root", str(self.repo_root)],
            capture_output=True, text=True, encoding="utf-8"
        )
        self.assertEqual(res.returncode, 0, f"Test fixture should be excluded: {res.stdout}")


class InstallerContractTests(unittest.TestCase):
    def test_windows_installer_step_counts_are_consistent(self):
        ps1_text = (ROOT / "install.ps1").read_text(encoding="utf-8")
        expected_steps = ["[1/7]", "[2/7]", "[3/7]", "[4/7]", "[5/7]", "[6/7]", "[7/7]"]
        for step in expected_steps:
            self.assertIn(step, ps1_text, f"install.ps1 missing step label {step}")
        self.assertNotIn("[1/6]", ps1_text)
        self.assertNotIn("[4/7]", ps1_text.replace("[4/7]", "", 1)) # exactly once
        self.assertNotIn("[5/8]", ps1_text)

    def test_posix_installer_step_counts_are_consistent(self):
        sh_text = (ROOT / "install.sh").read_text(encoding="utf-8")
        expected_steps = ["[1/7]", "[2/7]", "[3/7]", "[4/7]", "[5/7]", "[6/7]", "[7/7]"]
        for step in expected_steps:
            self.assertIn(step, sh_text, f"install.sh missing step label {step}")
        self.assertNotIn("[1/6]", sh_text)
        self.assertNotIn("[5/8]", sh_text)


if __name__ == "__main__":
    unittest.main()
