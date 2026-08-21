# ⚡ Anti-Workflow Ultimate (v4.14.0)

[English](README.md) | [Tiếng Việt](README_VN.md)

> **Hệ Điều Hành & Khung Quản Trị Phát Triển Phần Mềm Tự Trị trên Antigravity 2.0.**  
> Tích hợp tinh hoa: **AWF Orchestrator** + **Superpowers Subagent TDD** + **Hybrid Code-Intelligence (GitNexus Graph DB + CodeGraph Single-Shot & Watcher)** + **Dify-Inspired Production Capabilities** *(Semantic Brain Micro RAG, Pre-flight Contract Gate, Multi-Model Fallback & Observability Ledger)* + **Strict Physical Guardrails** + **Smart Testing Pyramid & Process Guard**.

---

## 🌟 5 Trụ Cột Kiến Trúc (The 5-Pillar Architecture)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. ORCHESTRATION & TRẢI NGHIỆM TỰ TRỊ (AWF)                                 │
│ • Giao tiếp đa nhân cách (PM, Dev, Designer, QA)                            │
│ • Vòng đời khép kín: /init, /visualize (UI Mockup), /deploy, /save-brain    │
│ • Bộ nhớ vĩnh cửu: .brain/ (Semantic Micro RAG, Sổ cái kiểm thử)           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 2. QUẢN TRỊ & CỔNG GÁC VẬT LÝ (Strict Guardrails & Resilience)              │
│ • Hiến pháp kỹ thuật: AI_CODE_WORKFLOW.md & GEMINI.md                       │
│ • Cổng gác vật lý: guardrails/ (Pre-commit hook, Chặn commit nhánh chính)   │
│ • Tự động phục hồi Model: Fallback linh hoạt khi gặp lỗi HTTP 429/503       │
│ • Sacred Prompt Caching: Giữ nguyên tiền tố byte-stable -> Cache Hit 90%+   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 3. ĐỘNG CƠ THỰC THI (Superpowers Subagents)                                 │
│ • Subagent-Driven Development (chạy nền độc lập theo task nhỏ 2-5 phút)    │
│ • Pre-flight Task Validation (thẩm định tiêu chí nghiệm thu trước khi code) │
│ • Smart TDD: RED ➔ GREEN ➔ REFACTOR (Smallest Scoped Unit Test < 1s)        │
│ • Sổ Cái Đo Lường: .brain/verification_ledger.json (Duration, Token metric) │
│ • Git Worktree Isolation & 2-Stage Code Review độc lập                      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 4. HYBRID CODE-INTELLIGENCE & MCP (GitNexus + CodeGraph)                    │
│ • GitNexus: Đồ thị tri thức (LadybugDB / Cypher), Luồng thực thi & Tác động │
│ • CodeGraph: Live Watcher (Tự động đồng bộ), Single-shot Explore, Web Routes│
│ • Smart Test Selector (codegraph affected qua git diff)                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 5. KIM TỰ THÁP KIỂM THỬ THÔNG MINH & PROCESS GUARD                          │
│ • Kiểm thử đa tầng: Unit (< 1s) ➔ Targeted E2E Smoke (30s) ➔ Full Suite Gate│
│ • Tiêu chuẩn nghiệm thu: Zero Network Errors (HTTP >= 400)                  │
│ • Process Tree Auto-Kill: Diệt sạch tiến trình rác khi timeout               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Các Cải Tiến Kiến Trúc Đột Phá (Hermes & Dify Inspired)

1. **⚡ Sacred Prompt Caching (Bảo Vệ Bộ Đệm Tiền Tố):**
   - Giữ nguyên vẹn tính **byte-stable** cho System Prompts, Core Rules (`GEMINI.md`, `AI_CODE_WORKFLOW.md`), và Tool Schemas.
   - Giúp Gemini và Claude đạt **90%+ Prefix Caching**, tiết kiệm 70–85% chi phí token và tăng tốc phản hồi tối đa.
2. **🧠 Semantic Brain Micro RAG (`scripts/brain-query.ps1`):**
   - Đánh chỉ mục bài học kinh nghiệm trong `.brain/learnings.md`. Chỉ nạp đúng 1-2 bài học liên quan nhất (~100 tokens) thay vì đọc toàn bộ tài liệu, tránh loãng ngữ cảnh.
3. **🛡️ Pre-flight Task Contract Gate (`scripts/task-brief.ps1 -Validate`):**
   - Thẩm định tính đầy đủ của Task (Mục tiêu, Tiêu chí nghiệm thu, File test) **trước khi** Subagent viết code, chặn đứng ảo giác từ sớm.
4. **📜 Sổ Cái Đo Lường & Bằng Chứng (`.brain/verification_ledger.json`):**
   - Ghi nhận chi tiết kết quả test, exit code, thời gian chạy (`duration_ms`) vào JSON thay vì in tràn stdout ra khung chat.
5. **🛠️ Tổng Hợp Kỹ Năng Tự Trị (Autonomous Skill Synthesis):**
   - Tự động đóng gói các giải pháp kỹ thuật phức tạp từ `/debug` thành file `skills/custom/[skill-name]/SKILL.md` chuẩn `agentskills.io`.

---

## 📦 Hướng Dẫn Cài Đặt Nhanh (Một Lần Duy Nhất)

### Trên Windows (PowerShell):
```powershell
& ".\install.ps1"
```

### Trên Linux / macOS (Bash):
```bash
bash "./install.sh"
```

---

> [!IMPORTANT]
> ## 🎯 ĐỐI VỚI DỰ ÁN ĐÃ CÓ SẴN (ONBOARDING):
> **Khi mở Antigravity 2.0 trong bất kỳ thư mục dự án nào, bạn chỉ cần gõ:**
> ```text
> /init
> ```
> **👉 Anti-Workflow-Ultimate sẽ TỰ ĐỘNG CẤU HÌNH toàn bộ dự án mà không gặp bất kỳ trở ngại nào!**
> 
> * **Không Mất Mã Nguồn:** Giữ nguyên 100% code, nhánh git và lịch sử commit hiện có.
> * **Tự Động Cài Đặt:** Thiết lập Git Pre-commit Guardrails và tự động nhận diện lệnh test chuẩn của dự án.
> * **Xây Dựng Đồ Thị Mã Nguồn:** Tự động index toàn bộ codebase qua GitNexus & CodeGraph trong vài giây.
> * **Kiểm Tra Sức Khỏe Dự Án:** Gợi ý chạy ngay `/audit` để phát hiện các lỗ hổng tiềm ẩn và xung đột cơ sở dữ liệu trước khi code!

---

## 🛡️ Kim Tự Tháp Kiểm Thử Thông Minh & Process Guard

> *"Mục tiêu không phải là chạy ít test hơn. Mục tiêu là chạy ĐÚNG test, ở ĐÚNG tầng, tại ĐÚNG thời điểm."*

```
        / \
       /   \      3. FULL SUITE (Cổng phát hành trước khi Deploy)
      /  ▲  \
     /───┼───\    2. TARGETED E2E SMOKE (Kiểm thử 1 tính năng - Timeout 30s)
    /    │    \
   /─────┴─────\  1. UNIT & COMPONENT TESTS (Siêu nhanh < 1s mỗi task)
```

1. **Chỉ Test Những Gì Ứng Dụng Sở Hữu:** Không bao giờ test lại những gì framework hay database engine đã cam kết (ví dụ: tính duy nhất của UUID hay tính ACID của Postgres).
2. **Smallest Scoped Unit Test (< 1s):** Chạy liên tục trong vòng lặp TDD của từng task trong `/code`.
3. **Targeted E2E Smoke Test (Timeout 30s):** Chạy khi hoàn thành toàn bộ feature với tiêu chuẩn **Zero Network Errors (HTTP $\ge 400$)** và tự động dọn dẹp tiến trình ngầm.
4. **Chọn Lọc Test Thông Minh:** Dùng `git diff --name-only | codegraph affected --stdin` để chỉ chạy những test bị ảnh hưởng trực tiếp bởi thay đổi code.

---

## 📋 Danh Sách Workflows Đầy Đủ

| Lệnh | Workflow | Mô Tả Chức Năng |
| :--- | :--- | :--- |
| `/init` | `init.md` | ✨ Khởi tạo mới hoặc Onboard dự án có sẵn |
| `/brainstorm` | `brainstorm.md` | 💡 Khám phá yêu cầu theo phương pháp Socratic |
| `/visualize` | `visualize.md` | 🖼️ Thiết kế UI mockup tương tác & trích xuất design tokens |
| `/plan` | `plan.md` | 📋 Lập kế hoạch Smart TDD kèm phân tích vùng ảnh hưởng (Blast Radius) |
| `/design` | `design.md` | 🎨 Thiết kế kiến trúc, Database schema & API Routes |
| `/code` | `code.md` | 💻 Thực thi tasks qua Subagents & Vòng lặp Smart TDD |
| `/test` | `test.md` | 🧪 Chạy kiểm thử đa tầng theo kim tự tháp thông minh |
| `/debug` | `debug.md` | 🐛 Truy vết nguyên nhân gốc rễ, Failed-First-Fix & Đúc kết bài học |
| `/review` | `review.md` | 👀 Review code 2 giai đoạn độc lập (Spec Compliance + Code Quality) |
| `/audit` | `audit.md` | 🔒 Kiểm tra bảo mật, toàn vẹn quan hệ DB & phụ thuộc |
| `/deploy` | `deploy.md` | 🚀 Triển khai production với cổng kiểm thử trực tiếp bắt buộc |
| `/rollback` | `rollback.md` | ⏪ Khôi phục phiên bản an toàn khi có sự cố |
| `/recap` | `recap.md` | 📖 Khôi phục ngữ cảnh cho phiên chat mới (~800 tokens) |
| `/save-brain` | `save_brain.md` | 🧠 Lưu trạng thái, quyết định kiến trúc & bộ nhớ vĩnh cửu |
| `/next` | `next.md` | ➡️ Gợi ý hành động tiếp theo dựa trên ngữ cảnh |
| `/help` | `help.md` | ❓ Trợ giúp tương tác & hướng dẫn sử dụng framework |
| `/customize` | `customize.md` | ⚙️ Tùy chỉnh persona, độ sâu kỹ thuật & cấu hình |
| `/refactor` | `refactor.md` | 🔧 Tái cấu trúc code mà không đổi hành vi |
| `/run` | `run.md` | ▶️ Chạy ứng dụng an toàn với bộ quản lý tiến trình |

---

## 🔒 Cổng Kiểm Soát Vật Lý (Pre-Commit Guardrails)

* Chặn đứng mọi hành vi commit trực tiếp lên các nhánh được bảo vệ (`main`, `master`).
* Bắt buộc chạy kiểm tra thật (test, linter, typechecker, build) trước khi cho phép commit.
* Quét sạch API keys, credentials (`sk-...`, `ghp_...`), conflict markers và debug markers (`DEBUG_ONLY`).
* Cấm tuyệt đối lách cổng bằng `--no-verify`.

---

## 📄 Bản Quyền & Chuẩn Quốc Tế

* Tương thích hoàn toàn với chuẩn mở `agentskills.io`.
* Phát hành theo giấy phép mã nguồn mở MIT License.
