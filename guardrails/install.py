#!/usr/bin/env python3
"""Install the versioned guardrail hook in the current Git repository."""

from __future__ import annotations

import argparse
import os
import subprocess
from pathlib import Path


class InstallError(RuntimeError):
    pass


def _git(repo: Path, *args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(["git", *args], cwd=repo, text=True, capture_output=True, check=check)


def install(repo: Path) -> Path:
    repo = repo.resolve()
    probe = _git(repo, "rev-parse", "--show-toplevel", check=False)
    if probe.returncode or Path(probe.stdout.strip()).resolve() != repo:
        raise InstallError("Run the installer from the root of a Git repository.")
    hook = repo / "guardrails" / "hooks" / "pre-commit"
    engine = repo / "guardrails" / "guardrail.py"
    policy = repo / "guardrails" / "policy.json"
    missing = [str(path.relative_to(repo)) for path in (hook, engine, policy) if not path.is_file()]
    if missing:
        raise InstallError(f"Guardrail kit is incomplete; missing: {', '.join(missing)}")
    state_rel = _git(repo, "rev-parse", "--git-path", "guardrails/previous-hooks-path").stdout.strip()
    state = repo / state_rel
    state.parent.mkdir(parents=True, exist_ok=True)
    current = _git(repo, "config", "--local", "--get", "core.hooksPath", check=False).stdout.strip()
    if not state.exists():
        state.write_text(current, encoding="utf-8")
    hook.chmod(hook.stat().st_mode | 0o111)
    _git(repo, "config", "--local", "core.hooksPath", "guardrails/hooks")
    return state


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args(argv)
    try:
        state = install(Path.cwd())
    except InstallError as exc:
        print(f"Installation blocked: {exc}")
        return 1
    print(f"Guardrails installed. Previous hook setting recorded at {state}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
