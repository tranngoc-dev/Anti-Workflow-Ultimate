import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from guardrails import install


ROOT = Path(__file__).resolve().parents[2]


class InstallerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.repo = Path(self.temp.name)

    def tearDown(self):
        self.temp.cleanup()

    def init_repo(self):
        subprocess.run(["git", "init", "-q", "-b", "feature/install"], cwd=self.repo, check=True)
        (self.repo / "guardrails").mkdir()
        shutil.copytree(ROOT / "guardrails" / "hooks", self.repo / "guardrails" / "hooks")
        shutil.copy2(ROOT / "guardrails" / "guardrail.py", self.repo / "guardrails" / "guardrail.py")
        shutil.copy2(ROOT / "guardrails" / "policy.json", self.repo / "guardrails" / "policy.json")

    def test_non_git_directory_is_refused(self):
        with self.assertRaises(install.InstallError):
            install.install(self.repo)

    def test_install_sets_versioned_hooks_path(self):
        self.init_repo()
        install.install(self.repo)
        value = subprocess.run(["git", "config", "--local", "--get", "core.hooksPath"], cwd=self.repo, text=True, capture_output=True, check=True).stdout.strip()
        self.assertEqual("guardrails/hooks", value)
        import sys
        if sys.platform != "win32":
            self.assertTrue((self.repo / "guardrails" / "hooks" / "pre-commit").stat().st_mode & 0o111)

    def test_install_is_idempotent_and_preserves_previous_value(self):
        self.init_repo()
        subprocess.run(["git", "config", "--local", "core.hooksPath", "custom-hooks"], cwd=self.repo, check=True)
        install.install(self.repo)
        install.install(self.repo)
        state = subprocess.run(["git", "rev-parse", "--git-path", "guardrails/previous-hooks-path"], cwd=self.repo, text=True, capture_output=True, check=True).stdout.strip()
        self.assertEqual("custom-hooks", (self.repo / state).read_text(encoding="utf-8"))

    def test_hook_invokes_engine_from_repository_root(self):
        self.init_repo()
        hook = (self.repo / "guardrails" / "hooks" / "pre-commit").read_text(encoding="utf-8")
        self.assertIn("rev-parse --show-toplevel", hook)
        self.assertIn("guardrails/guardrail.py --mode staged", hook)


if __name__ == "__main__":
    unittest.main()
