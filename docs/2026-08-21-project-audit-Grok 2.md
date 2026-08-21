# Audit Anti-Workflow Ultimate — Thinking dump + báo cáo đầy đủ

- **Ngày:** 2026-08-21
- **Repo:** `D:\AntiGravity\Anti-Workflow-Ultimate`
- **HEAD:** `a512e2374de96441927f6e9212d19c1842021d37` (`main`)
- **Phiên bản:** `4.15.0-ultimate` (`VERSION`, `README.md`, `.brain/brain.json`)
- **Workflow:** `global_workflows/audit.md` (4-Layer Empirical Verification Matrix v4.13.0)
- **Agent:** Grok 4.6 (Grok Build TUI)
- **Index GitNexus:** Anti-Workflow-Ultimate, indexed `2026-08-21T07:20:28.814Z` @ `87d74c5` — **1 commit behind HEAD**

File này gồm **toàn bộ reasoning** (phần A) rồi **báo cáo audit** (phần B). Không thay thế source; không commit trên `main`.

---

# Phần A — THINKING (chuỗi suy luận đầy đủ)

## A.0 Khung đầu phiên — chọn skill / không chọn skill

User: **"audit dự án này. Sau đó xuất toàn bộ nội dung chi tiết của phần thinking và phần báo cáo audit ra file .md"**

Suy nghĩ đầu:

1. Skill `using-superpowers` bắt buộc đọc trước mọi task. Đã đọc (80 dòng đầu). Rule: invoke skill trước khi explore. Audit là task, không phải “câu hỏi đơn giản”.
2. Skill Grok bundled `/review` **không** khớp:
   - `/review` = reviewer subagent trên **diff** (local / branch / PR).
   - User muốn audit **toàn repo**, Stage 8 `AI_CODE_WORKFLOW.md`: `/audit` → live-test → `/deploy`.
   - Working tree gần như chỉ dirty ledger — review skill sẽ short-circuit sai phạm vi.
3. Skill `brainstorming` **không** áp dụng: không thiết kế feature mới. Hard-gate “không implement trước khi approve design” không chặn audit read-only.
4. Skill `gitnexus-exploring` áp dụng: phải hiểu kiến trúc trước khi đánh giá.
5. Skill `gitnexus-review` / taint / `detect_changes` / `impact` dùng cho **repo health**, không phải PR.
6. Skill `verification-before-completion` áp dụng khi tuyên bố PASS/FAIL: phải có stdout lệnh thật, không suy diễn từ exit code 0.
7. `AI_CODE_WORKFLOW.md` bắt buộc đọc trước modify. Audit chủ yếu read-only; vẫn đọc để bám 4-layer matrix, fail-closed, smoke probes, hypothesis elimination.
8. `Agents.md` / GitNexus: MUST `impact` trước khi **edit symbol**. Audit không sửa production code. Append ledger JSON + file docs không phải symbol Python.
9. Đã tồn tại `docs/2026-08-21-audit-thoughts_Grok.md` từ lượt audit **trước** (HEAD lúc đó `158cb54`, 13/47 tests FAIL, data probe FAIL). Không copy nguyên — phải **re-run empirical** trên HEAD hiện tại `a512e23` / v4.15.0.

Quyết định: **làm đúng `global_workflows/audit.md` từng lớp**, không spawn reviewer `/review`. Sau khi có evidence, xuất **thinking + report** vào một file `.md` mới (request hiện tại).

## A.1 Định vị workflow `/audit`

Grep `/audit` → `global_workflows/audit.md`, README, `AI_CODE_WORKFLOW.md` Session 4.

Ma trận 4 lớp:

| Lớp | Lệnh | Ý nghĩa |
|---|---|---|
| 1 | `.\scripts\schema-probe.ps1` | Schema vs template + live `.brain` |
| 2 | `.\scripts\data-probe.ps1` | Identity + foreign payload |
| 3 | GitNexus `context` + `query` | Runtime smoke, không tin file index tồn tại |
| 4 | `python guardrails/guardrail.py --mode all` | Secrets, pin version, hooks, unittest |

Next-steps: xanh → `/deploy`; bẩn → `/debug`; phức tạp → `/refactor`.

Hypothesis ban đầu (từ thoughts file cũ, phải **bác hoặc giữ bằng evidence mới**):

| H | Nội dung cũ | Kỳ vọng 2026-08-21 chiều |
|---|---|---|
| H1 | Schema probe PASS nhưng schema không reject unknown keys | v4.15.0 ghi “Schema Hardened” + tests `rejects_unknown_top_level_key` — có thể đã đóng |
| H2 | Data probe FAIL / self-poison fixtures | commit `87d74c5` “Scanner-Test Isolation” |
| H3 | Unittest 13/47 FAIL | README/ledger sau nói 38/38 |
| H4 | FTS DEGRADED | list_repos hiện 598 embeddings — có thể đã repair |
| H5 | Index stale | list_repos: 1 commit behind |
| H6 | Làm việc trên `main` protected | vẫn đúng nếu `git branch` = main |

Không được kết luận PASS chỉ vì VERSION = 4.15.0.

## A.2 Khảo sát cấu trúc repo (list_dir)

Root: docs, global_workflows, guardrails, schemas, scripts, skills, templates, install.ps1/sh, VERSION, AGENTS/CLAUDE/GEMINI.md, AI_CODE_WORKFLOW.md. Không có app web runtime — đây là **framework/OS cho agent**, không phải sản phẩm UI. Browser verification user-rule **không áp dụng** (không có UI).

`.brain/`: brain.json, session.json, preferences.json, verification_ledger.json, learnings.md, handover.

`docs/2026-08-21-audit-thoughts_Grok.md` là dump reasoning cũ, **không** phải báo cáo chính thức.

## A.3 GitNexus list_repos

Nhiều repo indexed. **Phải** truyền `repo: Anti-Workflow-Ultimate`. Stats: 148 files, 5580 nodes, 14669 edges, 35 communities, 205 processes, 598 embeddings. Staleness: 1 commit behind HEAD. Indexed lastCommit `87d74c5`; HEAD `a512e23` = chore ledger — khớp 1 commit.

Thought: Layer 3 **không FAIL** chỉ vì stale 1 commit chore; **cũng không PASS tuyệt đối**. Flag STALE_1_COMMIT.

`explain` không repo → error “Multiple repositories indexed”. Retry với repo.

## A.4 Layer 1 schema-probe (empirical)

Command: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\schema-probe.ps1`

Stdout (rút gọn): 6/6 PASSED (templates + live brain/session/preferences), 0 errors, exit 0.

Không tin slogan “VALIDATED PERFECTLY” một mình. Đọc `schemas/brain.schema.json`: `additionalProperties: false` ở top-level (line 316). session + preferences cũng false. Tests `test_brain_schema_rejects_unknown_top_level_key` tồn tại.

H1 **bác** trên HEAD hiện tại: gap “schema open” của audit sáng đã được đóng ở v4.15.0.

brain.json live: name Anti-Workflow Ultimate, repo `tranngoc-dev/Anti-Workflow-Ultimate`, awf_version 4.15.0-ultimate, type framework, status development. Nested `tech_stack.languages` array — schema properties khác shape docs vs live? Probe vẫn PASS → schema hiện cho phép các key đã khai báo; additionalProperties false chỉ chặn **unknown top-level**. Nested objects có thể vẫn open. MEDIUM residual: nested `additionalProperties` không siết hết (không fail Layer 1).

## A.5 Layer 2 data-probe

Stdout: identity `'Anti-Workflow Ultimate' (tranngoc-dev/Anti-Workflow-Ultimate)`, scanned 158 files, 0 errors, exit 0.

H2 **bác** cho working tree hiện tại: payload sạch theo scanner. Không kết luận “mọi URL trong skills GitNexus đều in-scope” — probe chỉ foreign project IDs theo implementation.

## A.6 Layer 3 GitNexus smoke

### Context probe 1

`context({name: "validate_schema"})` → **not found**. Hypothesis: tên symbol đoán sai (không có hàm đó). Không được gọi Layer 3 FAIL vì typo.

### Query probe

`query({search_query: "schema probe guardrail install"})` → 8 processes, BM25 1559ms + vector 1258ms, wall 1587ms. Symbols: `execute_commands`, `integrity_findings`, `scan_repository`, `install`, ProbeIsolationTests, schema-probe.py.

H4 **bác một phần**: FTS/hybrid **có chạy** (không còn “FTS missing”). Process labels generic (`Execute_commands → Git`) — chất lượng community heuristic thấp, không phải outage.

### Context probe 2 (primary function)

`execute_commands` in `guardrails/guardrail.py`: status **found**, incoming `run`, outgoing `_record_ledger` + `run`, 5 processes. Đúng contract audit.md “status found + call graphs populated”.

### explain / taint

`explain({repo, limit:50})`: findings `[]`, totalFindings 0, note về model limits (không có câu “no taint layer”). Suy ra PDG/taint layer **có**, empty. Absence ≠ safety. LOW informational.

### impact

`impact execute_commands upstream summaryOnly`: risk **CRITICAL**, 11 impacted, 9 processes, module Guardrails. **Không edit** symbol này. Cảnh báo GitNexus chỉ mang tính “nếu sửa thì nguy hiểm”. Báo cáo ghi blast radius, không chặn audit.

### detect_changes

scope all: 1 changed file (ledger), 0 symbols, risk low. Khớp git status.

## A.7 Layer 4 guardrail + unittest

`python guardrails/guardrail.py --mode all` → `Guardrail passed: every required check succeeded.` exit 0.

`python -m unittest discover -s guardrails/tests -v` → **Ran 38 tests in 12.224s OK**.

H3 **bác**: 38/38, không còn 13/47. Số 47 là suite cũ / đếm nhầm trước isolation.

Supply-chain grep `@latest` / `"*"`: chỉ docs (`AI_CODE_WORKFLOW.md`, `audit.md`, gitnexus-cli SKILL bunx fallback). `.gemini/mcp_config.json`: `gitnexus@1.6.9` pinned. requirements.txt `jsonschema==4.25.1`, requirements-dev ruff pinned.

Secrets grep: không có private key thật; allowlist trong policy.json cho test fixtures.

policy `commands.tests` dùng `python3` — ledger lịch sử exit **9009** (Windows không có python3 trên PATH) rồi PASS khi engine resolve full python.exe. MEDIUM: default policy không portable Windows nếu ai đó chạy đúng argv policy mà không qua engine.

`sandbox_enabled: false` — chấp nhận rủi ro process isolation.

## A.8 Git / process findings

- Branch: **main** (protected). Audit không được commit tại chỗ.
- Dirty: `.brain/verification_ledger.json` (guardrail ghi + audit append).
- Commits gần: `a512e23` chore ledger 100% PASSED; `87d74c5` v4.15.0; `158cb54` ci cache path.

H5 giữ: index 1 commit behind (chore, không đổi code).
H6 giữ: làm việc trên nhánh cấm commit.

## A.9 Ledger

Entry cũ FAILED layers (data FAIL, FTS DEGRADED, 13/47). Entry sau DEGRADED rồi PASSED tuyên bố “0 commits behind” — **mâu thuẫn** với list_repos lúc này (1 behind). Ledger “PASSED READY FOR /deploy” lúc 07:20 **overclaim** so với stale index. Audit này ghi `PASSED_WITH_WARNINGS`.

Append entry 27: layers như empirical hiện tại.

## A.10 Hypothesis elimination (tóm tắt)

| H | Kết luận |
|---|---|
| H1 schema open | **Bác** top-level; residual nested |
| H2 data dirty | **Bác** (0 errors, 158 files) |
| H3 tests đỏ | **Bác** (38/38) |
| H4 FTS chết | **Bác** (BM25+vector populated) |
| H5 index stale | **Giữ** (1 commit) |
| H6 audit trên main | **Giữ** |
| Silent-green từ exit 0 | **Bác** — đã đọc payload từng lớp |

## A.11 Cấu trúc deliverable

User muốn **thinking + report** trong `.md`. Một file `docs/2026-08-21-project-audit-Grok.md` (file này). Không sửa Python/schema. Ledger append OK.

Không dùng skill review “no emoji” cứng; `audit.md` vốn có icon. Báo cáo phần B dùng bảng.

## A.12 One-liner nội bộ

> v4.15.0 đã đóng fail-open probes, schema top-level, isolation tests và FTS; đừng biến Layer 1–4 xanh thành “deploy ngay” khi index lệch 1 commit, policy `python3` Windows, và đang đứng trên `main`.

---

# Phần B — BÁO CÁO AUDIT

## B.1 Executive verdict

**PASSED WITH WARNINGS** — đủ điều kiện kỹ thuật của 4 lớp probe trên HEAD `a512e23` / v4.15.0, **chưa** đủ để tuyên bố “Everything Green → `/deploy`” không điều kiện.

Không deploy production mutation khi chưa:

1. User live-test (gate `AI_CODE_WORKFLOW.md`).
2. `gitnexus analyze` để index bắt kịp HEAD.
3. Làm việc / release từ **feature branch**, không commit thẳng `main`.

## B.2 Ma trận 4 lớp (empirical)

| Lớp | Lệnh | Exit | Payload | Kết quả |
|---|---|---|---|---|
| 1 Structural schema | `.\scripts\schema-probe.ps1` | 0 | 6/6 template + live artifacts, 0 errors | **PASSED** |
| 2 Data / identity | `.\scripts\data-probe.ps1` | 0 | Identity khớp; 158 files; 0 foreign | **PASSED** |
| 3a Graph context | MCP `context(execute_commands)` | n/a | `status: found`, callers/callees, 5 processes | **PASSED** |
| 3b Query / FTS | MCP `query("schema probe guardrail install")` | n/a | 8 processes; BM25+vector; wall ~1.6s | **PASSED** (hybrid sống) |
| 3c Index freshness | `list_repos` | n/a | 1 commit behind (`87d74c5` vs `a512e23`) | **WARNING** |
| 3d Taint | MCP `explain` | n/a | 0 findings; layer note không phải “missing PDG” | **INFO** (empty ≠ safe) |
| 4 Guardrail engine | `python guardrails/guardrail.py --mode all` | 0 | “every required check succeeded” | **PASSED** |
| 4 Unit suite | `python -m unittest discover -s guardrails/tests -v` | 0 | **38/38** in 12.224s | **PASSED** |

## B.3 Kiến trúc (ngắn)

Anti-Workflow Ultimate là **governance OS cho agent** (5 trụ: AWF orchestration, guardrails, Superpowers SDD, GitNexus+CodeGraph, testing pyramid). Không có app HTTP/UI trong repo. Runtime chính: Python 3.11+ probes/guardrails, PowerShell/Bash wrappers, MCP `gitnexus@1.6.9`.

Luồng enforcement: hook `guardrails/hooks/pre-commit` → `guardrail.py` (`run` → `execute_commands` / `scan_repository` / `integrity_findings`) → ledger `.brain/verification_ledger.json`. Impact upstream `execute_commands`: **CRITICAL** nếu sửa (9 processes, module Guardrails).

## B.4 Findings

### WARNING — GitNexus index lệch 1 commit

- Indexed: `87d74c5`; HEAD: `a512e23` (chỉ ledger chore).
- Smoke graph vẫn đúng code guardrail; process map có thể lệch metadata.
- Sửa: `node .gitnexus/run.cjs analyze` (hoặc `npx gitnexus@1.6.9 analyze`) từ root. **Không** dùng `@latest` trong MCP.

### WARNING — Audit/engine chạy trên protected branch `main`

- `policy.json` `protected_branches: ["main", "master"]`.
- Direct commit trên `main` bị chặn đúng thiết kế.
- Dirty: `.brain/verification_ledger.json`.
- Sửa process: branch `audit/*` hoặc `chore/ledger` rồi PR.

### LOW — Policy tests argv `python3` trên Windows

- Ledger 2026-08-20: `python3 -m unittest ...` **FAILED exit 9009**.
- Engine sau đó resolve `Python312\python.exe` và PASS.
- Rủi ro: script/CI copy nguyên `policy.json.commands.tests` mà không qua `guardrail.py`.
- Sửa: argv portable (`py -3` / `python`) hoặc document “chỉ chạy qua engine”.

### LOW — Nested schema vẫn có thể open

- Top-level `additionalProperties: false` trên 3 schema — đóng finding v4.14.
- Nested objects (ví dụ `tech_stack` trong brain.json live dùng `languages[]` / `frameworks[]`) không được audit này chứng minh reject-unknown ở mọi tầng.
- Không fail Layer 1; ghi residual cho `/refactor` schema nếu muốn Zero Discrepancies sâu hơn.

### INFO — `sandbox_enabled: false`

- Process isolation tắt. Timeout 30s + auto_kill_orphans bù một phần.
- Chấp nhận được cho framework local; không harden OS-level.

### INFO — Taint 0 findings

- Không mô hình closure/field/implicit flows. Không chứng minh không có secret leak.
- Secrets scan Layer 4 + allowlist fixtures: không thấy credential production trong tree (grep pattern).

### INFO — `gitnexus@latest` chỉ trong docs skill CLI

- Không có trong `.gemini/mcp_config.json`.
- Giữ docs như hướng dẫn phục hồi runner; không copy vào MCP.

## B.5 So với audit trước (cùng ngày, HEAD cũ)

| Mục | Audit sớm (HEAD `158cb54` / thoughts file) | Audit này (`a512e23` / v4.15.0) |
|---|---|---|
| Schema unknown keys | HIGH/MEDIUM gap | Top-level **đóng**; tests PASS |
| Data probe | FAILED | **PASSED** 158 files |
| Tests | 13/47 FAIL | **38/38** |
| FTS | DEGRADED | **BM25+vector** |
| Index | stale | stale **1** commit |
| Verdict | FAILED | **PASSED_WITH_WARNINGS** |

Commit `87d74c5` (“Zero Fail-Open Probes, Schema Hardened, Scanner-Test Isolation”) khớp việc đóng các gap đó. Ledger entry tuyên bố “0 commits behind / READY FOR /deploy” lúc 07:20 **lạc** so với `list_repos` hiện tại.

## B.6 Supply-chain & guardrail integrity

- MCP: `npx -y gitnexus@1.6.9 mcp` — pinned.
- Python deps: `jsonschema==4.25.1`, `ruff==0.12.10`.
- Installer tests: idempotent, uninstall restore, POSIX/Windows step counts consistent — **ok** trong 38 tests.
- Hook: invokes engine from repository root — **ok**.

## B.7 detect_changes (working tree)

- 1 file: `.brain/verification_ledger.json`
- 0 symbols / 0 processes
- risk_level: **low**

## B.8 Next steps (đúng `audit.md`)

1. **Không** `/deploy` cho đến khi user live-test + re-analyze GitNexus.
2. Warning-only → có thể `/debug` nhẹ: refresh index; cân nhắc portable `python` trong policy.
3. Nested schema / sandbox → `/refactor` nếu muốn siết tiếp.
4. Mọi code change: feature branch, không `--no-verify`, chạy `detect_changes` trước commit.

## B.9 Evidence ledger

Append `.brain/verification_ledger.json`:

- `type`: `project_audit`
- `status`: `PASSED_WITH_WARNINGS`
- `commit`: `a512e2374de96441927f6e9212d19c1842021d37`
- layers: schema PASSED 6/6; data PASSED 158; context PASSED; query FTS PASSED; taint 0 findings; index STALE_1_COMMIT; guardrail PASSED; tests 38/38.

## B.10 Phạm vi không kiểm

- Không chạy installer thật trên máy sạch (chỉ unit tests installer).
- Không chạy GitHub Actions CI live.
- Không browser (không có UI).
- Không CodeGraph watcher live.
- Không pentest MCP server ngoài `explain`/`query`/`context`.
- GitNexus index không rebuild trong lượt này (read-only audit + tránh đụng `main`).

---

*Hết file. Thinking (A) + báo cáo (B) đủ để handover `/recap` hoặc `/debug`.*
