# Lịch sử THOUGHTS — Audit Anti-Workflow Ultimate

- **Phiên:** `/audit` toàn dự án (không phải `/review` diff)
- **Ngày:** 2026-08-21
- **Repo:** `D:\AntiGravity\Anti-Workflow-Ultimate`
- **HEAD:** `158cb54e01472f6dffd8ace9403eda2846bd0e4c` (`main`)
- **Phiên bản:** `4.14.0-ultimate`
- **Nguồn:** chuỗi suy luận nội bộ của agent trong lượt audit ngay trước request xuất file này

File này **không** phải báo cáo audit (báo cáo nằm ở tin nhắn trước). Đây là dump reasoning: vì sao chọn skill, vì sao gọi tool, đọc output ra sao, kết luận nào bị loại.

---

## 0. Khung đầu phiên — chọn skill / không chọn skill

User hỏi: **"audit dự án này"**.

Suy nghĩ đầu:

1. Skill `using-superpowers` bắt buộc đọc trước mọi task. Đã đọc.
2. Skill `review` (Grok bundled) match từ khóa "review" nhưng **không** match "audit dự án":
   - `/review` = reviewer subagent trên **diff** (local / branch / PR).
   - User muốn audit **toàn repo**, Stage 8 của `AI_CODE_WORKFLOW.md`: `/audit` → live-test → `/deploy`.
   - Nếu chạy review skill sẽ short-circuit vì working tree gần như không phải "thay đổi tính năng" — chỉ dirty `verification_ledger.json` + untracked `test_probes.py`. Sai phạm vi.
3. Skill `brainstorming` **không** áp dụng: đây không phải thiết kế feature mới. Hard-gate "không implement trước khi approve design" không chặn audit read-only.
4. Skill `gitnexus-exploring` áp dụng vì phải hiểu kiến trúc trước khi đánh giá.
5. Skill `gitnexus-review` áp dụng một phần (taint / detect_changes / impact) nhưng target là **repo health**, không phải PR.
6. Skill `verification-before-completion` áp dụng khi tuyên bố PASS/FAIL: phải có output lệnh thật, không suy diễn từ exit code.
7. `AI_CODE_WORKFLOW.md` bắt buộc đọc trước modify. Audit chủ yếu read-only; vẫn đọc để bám 4-layer matrix và stop conditions.
8. `Agents.md` / GitNexus: MUST `impact` trước khi **edit symbol**. Audit không sửa production code. Sau này chỉ append ledger (data JSON, không phải symbol).

Quyết định: **làm theo `global_workflows/audit.md` đúng từng lớp**, không spawn reviewer subagent của skill `/review`.

---

## 1. Định vị workflow `/audit`

Grep `/audit` → 22 hits. File nguồn: `global_workflows/audit.md`.

Ma trận 4 lớp (v4.13.0):

| Lớp | Lệnh | Ý nghĩa |
|---|---|---|
| 1 | `.\scripts\schema-probe.ps1` | Schema vs template + live `.brain` |
| 2 | `.\scripts\data-probe.ps1` | Identity + foreign payload |
| 3 | GitNexus `context` + `query` | Runtime smoke, không tin index file tồn tại |
| 4 | `python guardrails/guardrail.py --mode all` | Secrets, pin version, hooks, unittest |

Next-steps trong workflow: xanh → `/deploy`; bẩn → `/debug`; phức tạp → `/refactor`.

Tạo todo 6 bước: đọc workflow + GitNexus → L1 → L2/security → L3 architecture → L4 smoke → báo cáo + ledger.

---

## 2. Parallel fan-out lần 1

Cùng lúc:

- `schema-probe.ps1`
- `data-probe.ps1`
- `guardrail.py --mode all`
- `gitnexus__list_repos`
- `gitnexus__query` (không `repo`)
- `gitnexus__explain` (không `repo`)
- `README.md` (80 dòng đầu)
- `VERSION`

### 2.1 GitNexus MCP fail đầu tiên

`query` và `explain` fail: **"Multiple repositories indexed. Specify repo."**

Danh sách: `codegraph-main`, `dify-main`, `VTN-Marketing-Hub`, `dsn-v5-tran_ngoc`, `Anti-Workflow-Ultimate`, nhiều worktree GoTube, `brows-er`, `hermes-agent-main`, `A++`.

Thought: MCP GitNexus là **global registry**, không phải single-repo. Mọi call sau **phải** `repo: "Anti-Workflow-Ultimate"`. Không được tin default.

`list_repos` cho Anti-Workflow-Ultimate:

- `indexedAt`: 2026-08-21T04:40:04.926Z
- `lastCommit`: `158cb54…` — **trùng HEAD** → index không stale theo commit
- stats: 147 files, 5607 nodes, 14715 edges, 37 communities, 205 processes, **0 embeddings**
- AGENTS.md banner: 1871 symbols / 3231 rels / 157 flows → **stale documentation**, không phải stale index

Thought phụ: các repo khác (brows-er 13 commits behind) không thuộc scope audit này. Không lan sang.

### 2.2 Layer 1 — PASS thật

Schema probe exit 0, 6 artifact:

- templates: `brain` / `session` / `preferences` example
- live: `.brain\brain.json` / `session.json` / `preferences.json`

Zero errors. Thought: **không** kết luận "toàn audit xanh" từ lớp này. Workflow cấm silent success.

### 2.3 Layer 2 — FAIL

Data probe exit 1:

```
Forbidden Data: guardrails\tests\test_probes.py contains Foreign project keyword 'Tulanh' (2 match(es))
```

Identity vẫn đúng: `'Anti-Workflow Ultimate' (tranngoc-dev/Anti-Workflow-Ultimate)`. Scanned 144 files.

Thought tức thì:

- `Tulanh` là **foreign project cũ** (blacklist trong data-probe).
- Path là **test file**, không phải `.brain`.
- Git status lúc đầu phiên: `?? guardrails/tests/test_probes.py` → **untracked**.
- Có thể: (a) leftover thật, hoặc (b) fixture test tự đầu độc live scan.

Chưa kết luận cho đến khi đọc `test_probes.py` + `data-probe.py`.

### 2.4 Layer 4 — FAIL, truncated

`guardrail.py --mode all` exit 1. Output cắt: `AssertionError: 0 == 0` trên schema probe stdout "ALL 6 … PASSED".

Giải mã:

- Một test **kỳ vọng probe FAIL** (`assertNotEqual(returncode, 0)`).
- Probe **PASS trên repo gốc** → `0 == 0` → test FAIL.
- `Ran 47 tests … FAILED (failures=13)`.

Thought: 13 fail có thể cùng một nguyên nhân isolation, hoặc nhiều cụm. Cần `unittest discover -v` đầy đủ.

`python3` từng fail exit 9009 trên Windows (ledger cũ) — policy.json vẫn list `python3` trước. Không phải finding chính lần này vì `python.exe` chạy được.

---

## 3. Parallel fan-out lần 2 — đào bằng chứng

### 3.1 Unittest đầy đủ

47 tests. 13 FAIL, tất cả trong `test_probes.py`:

1. `test_init_treats_codegraph_as_optional` — `'optional'` không có trong `init.md`; vẫn có `codegraph init`
2. `test_clean_identity_passes` — data-probe FAIL vì `Tulanh` trong chính test file
3. `test_forbidden_keyword_in_markdown_fails_closed` — tìm `focustimer`, output chỉ ra `Tulanh` trước / không match
4. `test_installers_use_consistent_step_counts` — mix `[2/6] [4/7] [5/8] [6/8]`
5. `test_posix_installer_invokes_physical_hook_install`
6. `test_windows_installer_invokes_physical_hook_install`
7. `test_brain_schema_rejects_unknown_top_level_key` — `errors == []`
8. `test_preferences_schema_rejects_empty_object`
9. `test_preferences_schema_rejects_unknown_top_level_key`
10. `test_session_schema_rejects_unknown_top_level_key`
11. `test_invalid_live_brain_fails_closed` — probe vẫn PASS repo gốc
12. `test_missing_live_brain_state_fails_closed`
13. `test_missing_schemas_directory_fails_closed`

Các test **committed** (`test_guardrail`, `test_install`, `test_artifacts`) + một số test_probes (CI pin SHA, foreign identity, missing project name, no pip install, live brain matches schema, valid templates pass) = **34 PASS**.

Thought: đây không phải "guardrail engine gãy". Đây là **test contract mới (untracked) vs implementation cũ**.

### 3.2 GitNexus với `repo` đúng

**`query("guardrail security secrets install hooks")`:**

- `processes: []`
- Warning: **FTS indexes missing — keyword search degraded. Run: gitnexus analyze --repair-fts**

Thought: Layer 3 query probe **DEGRADED**, đúng tinh thần audit.md ("If FTS missing, flag degradation"). Không được gọi là PASS dù context hoạt động.

**`explain` (taint, no target):** `findings: []`, `totalFindings: 0`, kèm caveat "absence is not proof of safety".

Thought: 0 taint ≠ an toàn. PDG/taint có thể mỏng trên repo Python nhỏ, hoặc analyze không `--pdg`. Ghi LOW/context, không ghi "no vulns".

**`context({name: "scan_repository"})`:**

- `status: found`
- uid: `Function:guardrails/guardrail.py:scan_repository`
- incoming: `run`
- outgoing: `_allowed`, `_files_for_scan`, `_text_for_scan`, `_staged_added_lines`
- Nhiều process `Scan_repository → …`

Thought: Graph symbol probe **PASS**. Index usable cho symbol lookup; FTS là lớp hỏng riêng.

**`detect_changes(scope: all)`:**

- `changed_count: 0`, `affected_count: 0`, `changed_files: 1`, `risk: low`
- `changed_symbols: []`

Thought: GitNexus không map tốt untracked Python test / JSON ledger. Graph-backed review của dirty tree **không đủ**. Phải đọc file trực tiếp — khớp gitnexus-review: "Untracked files are not guaranteed to appear in Git diff or graph mapping."

### 3.3 Supply-chain / secrets grep

- `@latest` / `*` chỉ trong `AI_CODE_WORKFLOW.md`, `audit.md`, và docs `gitnexus-cli` (hướng dẫn bunx). **Không** trong MCP config.
- Secret-like: template env names (`RESEND_API_KEY`), test fixtures `ghp_` / `BEGIN PRIVATE KEY`, policy allowlist. Không có credential thật.

Thought: Layer 4 secrets + pinning **xanh trên committed tree**.

---

## 4. Root-cause — đọc source, không đoán

### 4.1 `test_probes.py` vs probes

Test helper:

```python
subprocess.run([PYTHON, ROOT / "scripts" / script_name, "--root", str(repo_root)])
```

`schema-probe.py`:

```python
repo_root = Path(__file__).resolve().parents[1]  # luôn repo chứa script
if not schemas_dir.is_dir():
    print("INFO: No schemas directory found to validate.")
    sys.exit(0)  # FAIL-OPEN
```

`--root` **không được parse**. Temp fixture bị bỏ qua. Missing schemas → exit 0.

Live file missing: vòng lặp `if live_file.is_file()` — skip, không error.

`data-probe.py`: cùng pattern, `repo_root` hardcode. Skip duy nhất: path chứa `"data-probe"`. **Không skip `test_probes.py`.**

`FORBIDDEN_PATTERNS`: `tulanh`, supabase id, email, `qa-setup.sql`.

`foreign_names` (chỉ `.brain/brain.json` identity): thêm `focustimer`, `focus-timer`, `pomodoro`, `qa-app`.

Thought: `test_forbidden_keyword_in_markdown_fails_closed` viết `notes.md` với `focustimer` rồi assert output chứa `focustimer`. Dù `--root` có hoạt động, **file-scan không có pattern focustimer** → test vẫn fail. Hai bug chồng: isolation + blacklist lệch identity vs file scan.

`Tulanh` trong test: `{"name": "Tulanh Fridge", "repository": "acme/tulanh"}` — 2 match đúng output probe. Fixture tự poison live scan. Data-probe skip chính nó nhưng không skip test fixtures — thiết kế scanner vs TDD va nhau.

### 4.2 Schema `additionalProperties`

Grep `additionalProperties` trong `schemas/*.json`: **0 hits**.

`brain.schema.json` có `required: ["meta", "project", "updated_at"]` nhưng JSON Schema mặc định **cho phép key lạ**. `Draft7Validator({}).iter_errors({})` trên preferences cũng `[]` nếu schema không `required` top-level đủ chặt / không `additionalProperties: false`.

Thought: test viết contract **chặt hơn schema đang ship**. Đây là gap sản phẩm, không phải test sai — trừ khi team cố ý schema open. Audit ghi HIGH/MEDIUM: schema không reject unknown keys, đi ngược "Zero Discrepancies Rule" trong audit.md.

### 4.3 Installer

`install.ps1` / `install.sh`:

- Labels: `[1/6]` … `[4/7]` … `[5/8]` … `[6/8]` … `[7/8]`
- Copy workflows, scripts, skills, schemas, templates, guardrails kit, constitution, MCP
- **Không** có `python guardrails/install.py`
- Step 8 ghi version `4.14.0-ultimate`

Thought: installer là **copy kit vào `~/.gemini/antigravity`**, không phải gắn hook vào **repo đang làm việc**. Hook xảy ra ở `/init` (`python guardrails/install.py`). Test kỳ vọng installer one-shot gắn hook — mismatch product vs test. Vẫn là finding: step count hỗn loạn là bug UX thật; thiếu hook trên target repo là gap onboarding nếu user chỉ chạy `install.ps1` rồi commit.

### 4.4 `/init` CodeGraph

`global_workflows/init.md` vẫn:

```
gitnexus analyze
codegraph init
```

Version heading **v4.11.0** trong khi product **v4.14.0**. Test muốn CodeGraph optional + không `codegraph init`. Docs drift.

### 4.5 Data probe trên committed tree vs working tree

Grep `\bTulanh\b`: chỉ `data-probe.py` (blacklist) và `test_probes.py` (fixture).

Thought quan trọng để không overclaim:

- **Working tree:** Layer 2 FAIL vì untracked test file.
- **Committed tree (HEAD):** Layer 2 sẽ PASS.
- **Nếu commit `test_probes.py` nguyên trạng:** CI data-probe + unittest đỏ.

Audit phải tách 2 bề mặt. Verdict NOT READY vì working tree + contract tests đang đỏ, và implementation thật sự fail-open dù committed tests cũ xanh.

### 4.6 MCP pin

`.gemini/mcp_config.json`: `npx -y gitnexus@1.6.9 mcp` — pin đúng rule v4.13.0.

CI `guardrails.yml`: checkout/setup-python pin SHA, comment `# v4` / `# v5`; test `assertNotIn("actions/checkout@v4")` PASS vì file dùng hash không floating tag.

`requirements.txt` / `requirements-dev.txt` pin exact.

---

## 5. Smoke query lần 2

`query("schema-probe")` vẫn `processes: []`, FTS warning, wall ~10ms (nhanh vì BM25 rỗng).

Thought: không phải query string xấu. FTS thật sự hỏng. `context` theo symbol name không cần FTS nên vẫn sống.

Embeddings 0: hybrid ranking (BM25 + vector) yếu cả hai phía. Ghi DEGRADED, không CRITICAL — graph symbol vẫn query được bằng `context`.

---

## 6. Ledger, git, policy

`git status`: `M .brain/verification_ledger.json`, `?? guardrails/tests/test_probes.py`. Đúng snapshot đầu phiên.

Log: đang **trên `main`**. Policy `protected_branches: ["main", "master"]`. Finding LOW/process: audit diễn ra trên nhánh cấm commit; dirty files không được commit tại chỗ.

Ledger: nhiều PASS lịch sử rồi FAILED gần đây tại `158cb54` (04:47 và 05:10). Pattern: thêm `test_probes.py` vào discover → suite gãy. Ledger không phải source of truth cho "hiện tại xanh".

`/audit` yêu cầu ghi metadata. Append entry `type: project_audit`, `status: FAILED`, layers schema PASS / data FAIL / context PASS / FTS DEGRADED / tests 13/47. Không sửa source.

---

## 7. Những giả thuyết bị loại

| Giả thuyết | Vì sao loại |
|---|---|
| Toàn bộ guardrail engine hỏng | 34 test committed PASS |
| Data probe bắt nhầm identity project | Identity in đúng Anti-Workflow Ultimate |
| 13 fail là flake | Cùng assertion deterministic, reproduce 2 lần |
| GitNexus index stale | `lastCommit` == HEAD |
| Query rỗng vì sai concept | Hai query khác nhau, cùng FTS warning |
| 0 taint = không có lỗ hổng | Tool tự caveat; repo chủ yếu Python CLI không phải web sink |
| Schema probe PASS = fail-closed | Missing schemas exit 0; ignore `--root` |
| Nên `/deploy` vì Layer 1 xanh | Workflow: mọi lớp; Layer 2+4 đỏ |
| Chạy skill `/review` local | Sai target; empty-ish diff; không phải audit 4 lớp |
| Sửa code trong lượt audit | User chỉ audit; workflow next step là `/debug` |

---

## 8. Cách xếp severity (calibration)

**HIGH — fail-open `--root` / missing artifacts:**  
Cổng "empirical verification" có thể PASS khi không có schema hoặc live brain invalid. Đi ngược rule v4.13.0 "No Exit-Code Only" và "fail-closed". Reachable ngay khi test isolation hoặc CI copy thiếu file.

**HIGH — untracked tests vs implementation:**  
Không phải style. Nếu merge, CI gãy. Đồng thời chỉ ra installer/schema/init drift thật.

**MEDIUM — FTS:**  
`context` còn; `/audit` Layer 3 query bắt buộc. Agent explore bằng `query()` sẽ mù.

**MEDIUM — installer không gọi `install.py`:**  
Onboarding một nửa. Hook vẫn có đường `/init`. Không RCE.

**LOW — docs stats, `init.md` version 4.11.0, làm việc trên `main`:**  
Không chặn runtime ngay, nhưng vi phạm governance.

Không nâng secrets lên HIGH vì không có leak thật.

---

## 9. Cấu trúc câu trả lời user (lượt audit)

- User hỏi tiếng Việt → báo cáo tiếng Việt, thuật ngữ kỹ thuật giữ EN.
- Lead with verdict: **NOT READY `/deploy`**.
- Bảng 4 lớp trước, findings sau.
- Tách working tree vs committed tree để không nói dối "payload bẩn" trên HEAD.
- Next steps đúng `audit.md`: `/debug`, repair FTS, feature branch.
- Hỏi có muốn chuyển `/debug` không — không tự implement.

Không dùng skill review "no emoji" cứng; `audit.md` vốn có icon. Báo cáo dùng bảng, ít emoji.

---

## 10. Timeline tool (thứ tự thật)

1. Đọc `using-superpowers`, `review/SKILL.md`, `AI_CODE_WORKFLOW.md` (150 dòng), `brainstorming` (80 dòng)
2. Grep `/audit`, `list_dir` root, đọc `gitnexus-exploring`, `search_tool` GitNexus
3. Đọc `audit.md`, `gitnexus-review`, `verification-before-completion`; `todo_write`
4. Chạy schema-probe, data-probe, guardrail --mode all; GitNexus list/query/explain (query/explain fail thiếu repo); đọc README, VERSION
5. Unittest -v; query/explain/context/detect_changes với repo; grep @latest và secrets
6. Đọc `test_probes.py`, `schema-probe.py`, `data-probe.py`, `brain.schema.json`, `install.ps1`, `.brain/brain.json`; `git status` + log
7. Ledger, mcp_config, requirements, `install.sh`, grep additionalProperties, `init.md`, grep install.py, query schema-probe, `guardrails.yml`
8. Đọc mcp_config, ledger phần sau, policy.json, schema-probe.ps1, grep focustimer, GUARDRAILS.md
9. Grep Tulanh; confirm chỉ test file + blacklist
10. Đếm `def test_`; append ledger
11. Báo cáo user
12. (lượt này) xuất thoughts ra file

---

## 11. Thought meta — lượt xuất file này

User: **"xuất toàn bộ chi tiết lịch sử THOUGHTS của em ở phía trên ra file .md"**

- Đây là dump reasoning, không phải audit mới.
- Không bịa thoughts không có: mọi nhánh trên đều xuất hiện trong lượt trước (skill gate, 4 lớp, fail `--root`, FTS, 13 test, Tulanh self-poison, installer step mix, verdict NOT READY).
- Không dump system prompt / tool schema.
- Đặt file dưới `docs/` vì user xin artifact đọc được; không commit trừ khi user yêu cầu.

---

## 12. One-liner nội bộ (không nói với user lúc audit)

> Probes không isolate, tests mới siết contract chưa ship, FTS chết, installer đếm bước loạn; committed suite cũ vẫn xanh — đừng để Layer 1 PASS biến thành "audit sạch".
