import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path

from guardrails import guardrail


ROOT = Path(__file__).resolve().parents[2]


class RepoCase(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.repo = Path(self.temp.name)
        subprocess.run(["git", "init", "-q", "-b", "feature/test"], cwd=self.repo, check=True)
        subprocess.run(["git", "config", "user.email", "test@example.invalid"], cwd=self.repo, check=True)
        subprocess.run(["git", "config", "user.name", "Guardrail Test"], cwd=self.repo, check=True)
        for name, text in {
            "AGENTS.md": "Read and follow AI_CODE_WORKFLOW.md in full.\n",
            "GEMINI.md": "Read and follow AI_CODE_WORKFLOW.md in full.\n",
            "AI_CODE_WORKFLOW.md": (
                "Root cause evidence is required. Failed first fix returns to investigation. "
                "Never deploy or mutate production without explicit approval after live testing.\n"
            ),
        }.items():
            (self.repo / name).write_text(text, encoding="utf-8")
        (self.repo / "guardrails").mkdir()
        policy = json.loads((ROOT / "guardrails" / "policy.json").read_text(encoding="utf-8"))
        policy["commands"] = {"tests": [[os.environ.get("PYTHON", "python3"), "-c", "raise SystemExit(0)"]]}
        (self.repo / "guardrails" / "policy.json").write_text(json.dumps(policy), encoding="utf-8")
        subprocess.run(["git", "add", "."], cwd=self.repo, check=True)
        subprocess.run(["git", "commit", "-qm", "fixture"], cwd=self.repo, check=True)

    def tearDown(self):
        self.temp.cleanup()

    def run_gate(self, mode="all"):
        return guardrail.run(self.repo, mode=mode)


class IntegrityTests(RepoCase):
    def test_missing_workflow_file_blocks(self):
        (self.repo / "GEMINI.md").unlink()
        result = self.run_gate()
        self.assertFalse(result.ok)
        self.assertIn("GEMINI.md", result.render())

    def test_adapter_must_reference_core_workflow(self):
        (self.repo / "AGENTS.md").write_text("No repository instructions.\n", encoding="utf-8")
        result = self.run_gate()
        self.assertFalse(result.ok)
        self.assertIn("AI_CODE_WORKFLOW.md", result.render())

    def test_core_requires_safety_language(self):
        (self.repo / "AI_CODE_WORKFLOW.md").write_text("A workflow without safety gates.\n", encoding="utf-8")
        result = self.run_gate()
        self.assertFalse(result.ok)
        self.assertIn("deployment approval", result.render().lower())

    def test_protected_branch_blocks(self):
        subprocess.run(["git", "branch", "-m", "main"], cwd=self.repo, check=True)
        result = self.run_gate(mode="staged")
        self.assertFalse(result.ok)
        self.assertIn("protected branch", result.render().lower())


class DetectionTests(RepoCase):
    def _clear_commands(self):
        path = self.repo / "guardrails" / "policy.json"
        policy = json.loads(path.read_text(encoding="utf-8"))
        policy["commands"] = {}
        path.write_text(json.dumps(policy), encoding="utf-8")

    def test_unknown_project_fails_closed(self):
        self._clear_commands()
        result = self.run_gate()
        self.assertFalse(result.ok)
        self.assertIn("project type", result.render().lower())

    def test_guardrail_only_repository_runs_its_self_tests(self):
        self._clear_commands()
        (self.repo / "guardrails" / "tests").mkdir()
        (self.repo / "guardrails" / "tests" / "test_smoke.py").write_text("import unittest\nclass T(unittest.TestCase):\n def test_ok(self): self.assertTrue(True)\n", encoding="utf-8")
        commands, findings = guardrail.resolve_commands(self.repo, guardrail.load_policy(self.repo))
        self.assertFalse(findings)
        self.assertEqual(["python3", "-m", "unittest", "discover", "-s", "guardrails/tests", "-v"], commands[0].argv)

    def test_node_declared_scripts_are_resolved(self):
        self._clear_commands()
        (self.repo / "package.json").write_text(json.dumps({"scripts": {"test": "x", "lint": "x", "typecheck": "x", "build": "x"}}), encoding="utf-8")
        commands, findings = guardrail.resolve_commands(self.repo, guardrail.load_policy(self.repo))
        self.assertFalse(findings)
        self.assertEqual(["tests", "lint", "typecheck", "build"], [c.category for c in commands])
        self.assertEqual(["npm", "run", "test"], commands[0].argv)

    def test_python_without_explicit_commands_is_ambiguous(self):
        self._clear_commands()
        (self.repo / "pyproject.toml").write_text("[project]\nname='sample'\n", encoding="utf-8")
        _, findings = guardrail.resolve_commands(self.repo, guardrail.load_policy(self.repo))
        self.assertTrue(findings)
        self.assertIn("declare", findings[0].remedy.lower())

    def test_go_and_rust_use_standard_commands(self):
        self._clear_commands()
        (self.repo / "go.mod").write_text("module example.invalid/app\n", encoding="utf-8")
        commands, findings = guardrail.resolve_commands(self.repo, guardrail.load_policy(self.repo))
        self.assertFalse(findings)
        self.assertIn(["go", "test", "./..."], [c.argv for c in commands])
        (self.repo / "go.mod").unlink()
        (self.repo / "Cargo.toml").write_text("[package]\nname='app'\nversion='0.1.0'\n", encoding="utf-8")
        commands, findings = guardrail.resolve_commands(self.repo, guardrail.load_policy(self.repo))
        self.assertFalse(findings)
        self.assertIn(["cargo", "test", "--all-targets"], [c.argv for c in commands])


class ScanTests(RepoCase):
    def stage(self, name, text):
        path = self.repo / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        subprocess.run(["git", "add", name], cwd=self.repo, check=True)

    def assert_rule(self, rule, name, text):
        self.stage(name, text)
        findings = guardrail.scan_repository(self.repo, guardrail.load_policy(self.repo), mode="staged")
        self.assertIn(rule, [f.rule for f in findings])
        self.assertIn(name, "\n".join(f.path for f in findings))

    def test_private_key_blocks(self):
        self.assert_rule("secret.private-key", "key.pem", "-----BEGIN PRIVATE KEY-----\nabc\n")

    def test_high_confidence_credential_blocks(self):
        self.assert_rule("secret.credential", "config.js", "const token = 'ghp_abcdefghijklmnopqrstuvwxyz1234567890';\n")

    def test_conflict_marker_blocks(self):
        self.assert_rule("source.conflict-marker", "app.py", "<<<<<<< ours\na\n=======\nb\n>>>>>>> theirs\n")

    def test_new_disabled_test_blocks(self):
        self.assert_rule("test.disabled", "test_app.py", "@unittest.skip('later')\ndef test_x(): pass\n")

    def test_debug_marker_blocks(self):
        self.assert_rule("source.debug-marker", "app.py", "print('DEBUG_ONLY investigate')\n")

    def test_narrow_allowlist_requires_matching_rule_path_and_reason(self):
        self.stage("fixture.txt", "DEBUG_ONLY documented fixture\n")
        policy_path = self.repo / "guardrails" / "policy.json"
        policy = json.loads(policy_path.read_text(encoding="utf-8"))
        policy["allowlist"] = [{"rule": "source.debug-marker", "path": "fixture.txt", "reason": "Intentional scanner fixture"}]
        policy_path.write_text(json.dumps(policy), encoding="utf-8")
        findings = guardrail.scan_repository(self.repo, policy, mode="staged")
        self.assertNotIn("source.debug-marker", [f.rule for f in findings])

    def test_binary_staged_file_does_not_crash(self):
        (self.repo / "image.bin").write_bytes(b"\x00\xff\x01")
        subprocess.run(["git", "add", "image.bin"], cwd=self.repo, check=True)
        guardrail.scan_repository(self.repo, guardrail.load_policy(self.repo), mode="staged")

    def test_preexisting_disabled_test_is_not_a_new_violation(self):
        self.stage("test_existing.py", "@unittest.skip('known')\ndef test_x(): pass\n")
        subprocess.run(["git", "commit", "-qm", "existing skip"], cwd=self.repo, check=True)
        self.stage("test_existing.py", "@unittest.skip('known')\ndef test_x(): pass\n\ndef helper(): return 1\n")
        findings = guardrail.scan_repository(self.repo, guardrail.load_policy(self.repo), mode="staged")
        self.assertNotIn("test.disabled", [f.rule for f in findings])


class ExecutionTests(RepoCase):
    def write_commands(self, commands):
        path = self.repo / "guardrails" / "policy.json"
        policy = json.loads(path.read_text(encoding="utf-8"))
        policy["commands"] = commands
        path.write_text(json.dumps(policy), encoding="utf-8")

    def test_failing_command_blocks_and_names_category(self):
        self.write_commands({"tests": [[os.environ.get("PYTHON", "python3"), "-c", "raise SystemExit(7)"]]})
        result = self.run_gate()
        self.assertFalse(result.ok)
        self.assertIn("tests", result.render())

    def test_missing_executable_blocks_as_configuration_failure(self):
        self.write_commands({"tests": [["definitely-not-installed-guardrail-tool"]]})
        result = self.run_gate()
        self.assertFalse(result.ok)
        self.assertIn("not available", result.render().lower())

    def test_successful_explicit_command_allows_feature_branch(self):
        result = self.run_gate()
        self.assertTrue(result.ok, result.render())


if __name__ == "__main__":
    unittest.main()
