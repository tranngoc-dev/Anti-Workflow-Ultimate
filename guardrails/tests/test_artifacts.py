import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


class ArtifactTests(unittest.TestCase):
    def test_github_workflow_uses_shared_engine_without_deployment_environment(self):
        text = (ROOT / ".github" / "workflows" / "guardrails.yml").read_text(encoding="utf-8")
        self.assertIn("pull_request:", text)
        self.assertIn("push:", text)
        self.assertIn("python3 guardrails/guardrail.py --mode all", text)
        self.assertNotIn("environment:", text)
        self.assertNotIn("deploy", text.lower())

    def test_guide_documents_install_branch_protection_limits_and_rollback(self):
        text = (ROOT / "GUARDRAILS.md").read_text(encoding="utf-8").lower()
        for phrase in ("python3 guardrails/install.py", "branch protection", "--no-verify", "rollback", "never deploys"):
            self.assertIn(phrase, text)

    def test_core_workflow_requires_automated_guardrail(self):
        text = (ROOT / "AI_CODE_WORKFLOW.md").read_text(encoding="utf-8").lower()
        self.assertIn("automated guardrails", text)
        self.assertIn("must not bypass", text)


if __name__ == "__main__":
    unittest.main()
