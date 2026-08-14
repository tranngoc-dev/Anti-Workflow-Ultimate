# ⚡ Anti-Workflow Ultimate (v4.5.0)

> **Khung Phát Triển Ứng Dụng Tự Trị Toàn Diện trên Antigravity 2.0.**  
> Tích hợp 4 trong 1: **AWF Orchestrator** + **Superpowers Subagent TDD Engine** + **GitNexus Relational Intelligence** + **Strict Physical Guardrails** + **Giao Thức Hội Thoại Độc Lập theo Module (Modular Conversation)**.

---

## 🌟 4 Trụ Cột Kiến Trúc (The 4-Layer Architecture)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. ORCHESTRATION & TRẢI NGHIỆM (AWF)                                        │
│ • Giao tiếp tiếng Việt, Multi-persona (PM Hà, Dev Tuấn, Designer Mai, QA)   │
│ • Vòng đời khép kín: /init, /visualize (UI Mockup), /deploy, /save-brain    │
│ • Bộ nhớ dài hạn vĩnh cửu (.brain/ Eternal Context)                         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 2. GOVERNANCE & GUARDRAILS (Strict Enforcement)                             │
│ • Luật kỹ thuật: AI_CODE_WORKFLOW.md & GEMINI.md                            │
│ • Cổng gác vật lý: guardrails/ (Pre-commit hook, chặn commit main, test thật)│
│ • Luật chống vá mò: Failed-first-fix rule, Live-test Deployment Gate        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 3. EXECUTION ENGINE (Superpowers Subagents)                                 │
│ • Subagent-Driven Development (chạy nền đa tác vụ tự trị theo task 2-5 phút)│
│ • Strict TDD (RED-GREEN-REFACTOR bắt buộc)                                   │
│ • Git Worktree Isolation (cô lập môi trường làm việc trên từng feature)     │
│ • 2-Stage Code Review (Spec Compliance + Code Quality)                      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 4. RELATIONAL INTELLIGENCE & MCP (GitNexus)                                 │
│ • Đồ thị tri thức Codebase (Knowledge Graph: LadybugDB + Tree-sitter AST)    │
│ • Blast Radius / Impact Analysis (tính toán chính xác vùng ảnh hưởng)       │
│ • 17 MCP Tools hỗ trợ AI tra cứu 360 độ (query, context, impact, trace)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Giao Thức Hội Thoại Độc Lập theo Module (Modular Conversation)

> **Bí quyết để AI không bao giờ bị loạn thông tin, không bị suy thoái ngữ cảnh (Context Rot) và tiết kiệm 90% chi phí Token:**

Thay vì giữ một cuộc trò chuyện dài hàng trăm tin nhắn, toàn bộ quá trình phát triển được cắt lát thành các Session độc lập:

1. **Session 1 (Thiết kế & Lập Plan):**
   * `/init` $\to$ `/brainstorm` $\to$ `/visualize` $\to$ `/plan`.
   * Chạy `/save-brain` $\to$ Đóng gói Spec & Plan vào `docs/superpowers/`.
2. **Session 2 (Code Backend & DB):**
   * **Mở Thread Chat MỚI** $\to$ Gõ `/recap` (AI chỉ nạp ~800 token ngữ cảnh tinh gọn).
   * Chạy `/code phase-01` $\to$ Subagent code TDD $\to$ Chạy `/save-brain`.
3. **Session 3 (Code Frontend UI):**
   * **Mở Thread Chat MỚI** $\to$ Gõ `/recap` $\to$ Chạy `/code phase-02`.
4. **Session 4 (Kiểm toán & Deploy):**
   * **Mở Thread Chat MỚI** $\to$ Gõ `/audit` $\to$ User Live-Test $\to$ Gõ `/deploy`.

---

## 📦 Cài Đặt 1 Chạm (Quick Install)

### Trên Windows (PowerShell):
```powershell
& "D:\AntiGravity\Anti-Workflow-Ultimate\install.ps1"
```

### Trên Linux / macOS:
```bash
bash "D:\AntiGravity\Anti-Workflow-Ultimate/install.sh"
```

---

## 🎮 Bảng Lệnh Slash Commands (/commands)

| Lệnh | Chức năng | Hành động thực tế của AI |
| :--- | :--- | :--- |
| `/init` | 🏁 Khởi tạo dự án | Tạo workspace, cài Git & Pre-commit Guardrail hook, tạo cấu trúc `.brain/`. |
| `/brainstorm` | 💡 Phỏng vấn ý tưởng | Phỏng vấn Socratic câu hỏi đơn, xuất bản Spec chi tiết vào `docs/superpowers/specs/`. |
| `/visualize` | 🎨 Mockup UI/UX | Tạo prototype HTML/CSS trực quan, trích xuất bảng Design Tokens. |
| `/plan` | 📋 Kế hoạch TDD | Gọi GitNexus tính Blast Radius $\to$ Chia nhỏ task 2–5 phút TDD $\to$ Modular Handover. |
| `/code` | 💻 Lập trình Subagent | Tạo Git Worktree $\to$ Điều phối Subagents chạy RED-GREEN-REFACTOR $\to$ Cổng Guardrail. |
| `/debug` | 🐛 Sửa lỗi khoa học | 4 Phase Root-Cause $\to$ Dùng GitNexus `trace` $\to$ Luật Failed-First-Fix. |
| `/test` | 🧪 Kiểm thử toàn diện | Chạy toàn bộ test suites, linter, typechecker và build validation. |
| `/review` | 👀 Review 2 lớp | Reviewer độc lập duyệt Spec Compliance + Code Quality + GitNexus shape check. |
| `/audit` | 🔒 Kiểm toán bảo mật | Quét lỗ hổng dependency, rò rỉ secret, CSRF/XSS, SQL Injection. |
| `/deploy` | 🚀 Triển khai Production | Vượt qua Cổng Live-Test $\to$ Deploy lên Vercel, Cloudflare, VPS, Docker. |
| `/recap` | 📖 Khôi phục ngữ cảnh | Nạp Clean Context (< 1.000 tokens) cho Session Chat Mới theo 3 tầng. |
| `/save-brain` | 🧠 Lưu bộ nhớ vĩnh cửu | Lưu trữ quyết định kỹ thuật, checkpoint tiến độ và chuẩn bị Handover. |

---

## 🛡️ Cổng Kiểm Soát Vật Lý (Strict Guardrails)

Hệ thống pre-commit hook tại `guardrails/` đảm bảo:
* ❌ **Cấm tuyệt đối commit lên `main` và `master`** (phải làm việc trên feature branch).
* ❌ **Cấm commit nếu 4 lệnh thật bị lỗi:** `tests`, `lint`, `typecheck`, `build`.
* ❌ **Cấm để sót debug marker:** Tự động phát hiện `DEBUG_ONLY`, `console.log` thừa.
* ❌ **Cấm lách cổng:** Chặn mọi hành vi dùng `git commit --no-verify`.

---

## 📂 Cấu Trúc Dự Án Tiêu Chuẩn

```
{project}/
├── .brain/                     # Eternal Memory & Modular Checkpoints
│   ├── preferences.json        # Technical level & Persona
│   ├── session.json            # State hiện tại
│   └── session_log.txt         # Append-only log
├── .gemini/                    # Antigravity 2.0 MCP & Hooks
├── docs/
│   └── superpowers/
│       ├── specs/              # Feature Specs
│       └── plans/              # Implementation Plans (TDD)
├── guardrails/                 # Engine cổng kiểm soát
├── AGENTS.md                   # Multi-agent directives
├── AI_CODE_WORKFLOW.md         # Quy tắc kỹ thuật bất biến
└── README.md
```

---

**Chúc anh kiến tạo những ứng dụng đỉnh cao cùng Antigravity 2.0!** 🚀
