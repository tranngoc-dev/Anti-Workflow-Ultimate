# ⚡ Anti-Workflow Ultimate (v4.6.0)

> **Khung Phát Triển Ứng Dụng Tự Trị Toàn Diện trên Antigravity 2.0.**  
> Tích hợp 5 trong 1: **AWF Orchestrator** + **Superpowers Subagent TDD Engine** + **GitNexus Relational Intelligence** + **Strict Physical Guardrails** + **Cổng Kiểm Thử E2E Thật Sự (Mandatory E2E Gate)** + **Giao Thức Modular Conversation**.

---

## 🌟 5 Trụ Cột Kiến Trúc (The 5-Pillar Architecture)

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
│ • Cổng E2E Bắt Buộc: E2E PASS 100% mới được chuyển task                     │
│ • Luật chống vá mò: Failed-first-fix rule, Explicit FK Hint Policy          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 3. EXECUTION ENGINE (Superpowers Subagents)                                 │
│ • Subagent-Driven Development (chạy nền đa tác vụ tự trị theo task 2-5 phút)│
│ • Strict TDD: RED ➔ GREEN ➔ REFACTOR ➔ E2E VERIFICATION                    │
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

## 🚨 Cổng Kiểm Thử E2E Thật Sự (Mandatory E2E Gate)

> **Nguyên tắc bất biến: Test E2E Thật Sự PASS 100% mới được làm tiếp!**

* **Không Shallow Mocking:** Không được phép chỉ dùng Unit Test giả lập dữ liệu để báo hoàn thành.
* **Tự động Spin-up Server:** Khởi chạy Dev/API Server ngầm và dùng **Playwright / Real API Probes** để thao tác trực tiếp trên giao diện và Database thật.
* **Zero Network Errors:** Bắt và chặn ngay lập tức nếu có bất kỳ request API nào trả về mã $\ge 400$ (phát hiện ngay lỗi PostgREST Ambiguous FK, CORS, lỗi 500).
* **Bắt buộc sau mỗi Bug Fix:** Mọi lần sửa lỗi đều phải có kịch bản E2E tái hiện và chứng minh lỗi đã biến mất hoàn toàn trên môi trường thật.

---

## 🚀 Giao Thức Hội Thoại Độc Lập theo Module (Modular Conversation)

> **Bí quyết để AI không bao giờ bị loạn thông tin, không bị suy thoái ngữ cảnh (Context Rot) và tiết kiệm 90% chi phí Token:**

Thay vì giữ một cuộc trò chuyện dài hàng trăm tin nhắn, toàn bộ quá trình phát triển được cắt lát thành các Session độc lập:

1. **Session 1 (Thiết kế & Lập Plan):**
   * `/init` $\to$ `/brainstorm` $\to$ `/visualize` $\to$ `/plan`.
   * Chạy `/save-brain` $\to$ Đóng gói Spec & Plan vào `docs/superpowers/`.
2. **Session 2 (Code Backend & DB):**
   * **Mở Thread Chat MỚI** $\to$ Gõ `/recap` (AI chỉ nạp ~800 token ngữ cảnh tinh gọn).
   * Chạy `/code phase-01` $\to$ Subagent code TDD + E2E Gate $\to$ Chạy `/save-brain`.
3. **Session 3 (Code Frontend UI):**
   * **Mở Thread Chat MỚI** $\to$ Gõ `/recap` $\to$ Chạy `/code phase-02` (TDD + E2E Gate).
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

## 🎮 Bảng Lệnh Slash Commands (/commands) & Ngôn Ngữ Tự Nhiên

Anh có thể **gõ trực tiếp Slash Command** hoặc **nói bằng ngôn ngữ tự nhiên**, AI sẽ tự động hiểu và kích hoạt đúng quy trình tương ứng:

| Lệnh Slash | Chức năng | 🗣️ Hoặc nói tự nhiên | Hành động thực tế của AI |
| :--- | :--- | :--- | :--- |
| `/init` | 🏁 Khởi tạo dự án | *"Tạo dự án mới...", "Bắt đầu làm app mới..."* | Tạo workspace, cài Git & Pre-commit Guardrail hook, tạo cấu trúc `.brain/`. |
| `/brainstorm` | 💡 Phỏng vấn ý tưởng | *"Bàn ý tưởng...", "Lên ý tưởng tính năng..."* | Phỏng vấn Socratic câu hỏi đơn, xuất bản Spec chi tiết vào `docs/superpowers/specs/`. |
| `/visualize` | 🎨 Mockup UI/UX | *"Thiết kế giao diện...", "Dựng mockup UI..."* | Tạo prototype HTML/CSS trực quan, trích xuất bảng Design Tokens. |
| `/plan` | 📋 Kế hoạch TDD | *"Lên kế hoạch làm...", "Phân rã task cho tính năng..."* | Gọi GitNexus tính Blast Radius $\to$ Chia nhỏ task 2–5 phút TDD & E2E Scenarios. |
| `/code` | 💻 Lập trình Subagent | *"Bắt đầu code...", "Lập trình phase 1 đi em"* | Tạo Git Worktree $\to$ Subagents chạy RED-GREEN-REFACTOR $\to$ **Cổng Test E2E Bắt Buộc**. |
| `/debug` | 🐛 Sửa lỗi khoa học | *"Sửa lỗi này...", "Fix bug này giúp anh"* | 4 Phase Root-Cause $\to$ Dùng GitNexus `trace` $\to$ **Kịch bản E2E xác minh fix dứt điểm**. |
| `/test` | 🧪 Kiểm thử toàn diện | *"Chạy kiểm thử...", "Test app xem chạy ổn không"* | Chạy Unit Test + Database Integration + Headless Browser Network Smoke Test. |
| `/review` | 👀 Review 2 lớp | *"Review lại code...", "Kiểm tra chất lượng code"* | Reviewer độc lập duyệt Spec Compliance + Code Quality + GitNexus shape check. |
| `/audit` | 🔒 Kiểm toán toàn diện | *"Khám bệnh app...", "Kiểm tra bảo mật và DB"* | Quét Bảo mật, Code Quality, Dependencies và **Database Relationship Integrity**. |
| `/deploy` | 🚀 Triển khai Production | *"Đưa app lên mạng...", "Deploy lên Vercel/VPS"* | Vượt qua Cổng Live-Test $\to$ Deploy lên Vercel, Cloudflare, VPS, Docker. |
| `/recap` | 📖 Khôi phục ngữ cảnh | *"Tiếp tục dự án hôm trước...", "Nhớ lại bối cảnh"* | Nạp Clean Context (< 1.000 tokens) cho Session Chat Mới theo 3 tầng. |
| `/save-brain` | 🧠 Lưu bộ nhớ vĩnh cửu | *"Lưu lại tiến độ...", "Đóng gói bộ nhớ hôm nay"* | Lưu trữ quyết định kỹ thuật, checkpoint tiến độ và chuẩn bị Handover. |

---

## 🛡️ Cổng Kiểm Soát Vật Lý (Strict Guardrails)

Hệ thống pre-commit hook tại `guardrails/` đảm bảo:
* ❌ **Cấm tuyệt đối commit lên `main` và `master`** (phải làm việc trên feature branch).
* ❌ **Cấm commit nếu các lệnh thật bị lỗi:** `tests`, `lint`, `typecheck`, `build`, `e2e`.
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
