# Strict AI Coding Guardrails - Physical Execution Gate

This system establishes a deterministic physical pre-commit gate for Git repositories. It prevents invalid commits by executing real verification checks (tests, linter, typechecker, and build). It enforces zero-dependency creep, prevents data leakage, and **never deploys** without explicit human authorization.

---

## 1. Local Installation (Windows & POSIX)

Run the installer from your repository root:

```bash
# Windows / Linux / macOS
python guardrails/install.py
```

*(On Linux / macOS, you can run `python3 guardrails/install.py`).*

The installer configures the repository to use versioned hooks from `guardrails/hooks` and safely records the previous `core.hooksPath` for clean rollback at any time.

> ⚠️ **Important (Branch Protection):** Always work on dedicated feature branches. The branch protection mechanism strictly blocks direct commits to `main` and `master`.

---

## 2. Declaring Verification Commands in `guardrails/policy.json`

Declare commands as arrays of argument strings (no fake/mock commands):

```json
{
  "protected_branches": ["main", "master"],
  "commands": {
    "tests": [["npm", "test"]],
    "lint": [["npm", "run", "lint"]],
    "typecheck": [["npx", "tsc", "--noEmit"]],
    "build": [["npm", "run", "build"]]
  },
  "debug_markers": ["DEBUG_ONLY"],
  "allowlist": []
}
```

* **Python:** `pytest`, `ruff`, `mypy`, `build`.
* **Node.js / TypeScript:** auto-detects `test`, `lint`, `typecheck`, `build` from `package.json`.
* **Go / Rust:** `go test`, `cargo test`, `cargo check`.

---

## 3. Handling Blocked Commits

When a commit is blocked, the output explicitly indicates the violated rule, file/line location, and recommended remediation.
**Never use `--no-verify`** to bypass the gate. Every guardrail failure is technical evidence that must be investigated and resolved properly.

---

## 4. Rollback Guardrails

To rollback and restore previous Git hook configurations:

```bash
# Reset local hooks path:
git config --local --unset core.hooksPath

# Or restore original value recorded at:
# .git/guardrails/previous-hooks-path
```
