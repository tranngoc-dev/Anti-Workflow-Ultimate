# AI Code Workflow - Anti-Workflow Ultimate

Tài liệu này là **Nguồn Sự Thật Tối Cao (Single Source of Truth)** cho mọi AI Agent làm việc trong dự án này trên **Antigravity 2.0**. Quy chuẩn này áp dụng cho mọi loại thay đổi: tính năng mới, sửa lỗi, refactor, UI/UX, cấu hình, dependencies, cơ sở dữ liệu và triển khai.

---

## 1. Nguyên Tắc Vận Hành Cốt Lõi (Operating Model)

1. **Người dùng sở hữu Ý đồ Sản phẩm (Product Intent):** Quyết định tính năng, trải nghiệm người dùng (UX), mức độ ưu tiên và phê duyệt rủi ro nhìn thấy được.
2. **AI sở hữu Thực thi Kỹ thuật (Technical Execution):** Điều tra kiến trúc, lập bản đồ quan hệ (GitNexus), chia nhỏ task TDD (Superpowers), điều phối Subagents, kiểm tra và bảo vệ mã nguồn.
3. **Không hỏi vặt quyết định kỹ thuật:** AI tự chọn giải pháp an toàn nhất, có thể đảo ngược (reversible) và giải thích tác động bằng ngôn ngữ đơn giản.
4. **Thực thi tự trị liên tục (Continuous Autonomous Execution):** Khi người dùng đã chốt spec/plan, AI tự động hoàn thành công việc đến trạng thái sẵn sàng để kiểm thử trực tiếp (Live-test), trừ khi chạm phải *Điều kiện Dừng Bắt buộc (Mandatory Stop Conditions)*.

---

## 2. Giao Thức Hội Thoại Độc Lập theo Module (Modular Conversation & Session Slicing)

> **Mục tiêu:** Giữ cho Context Window luôn sạch sẽ 100%, chống hiện tượng suy thoái ngữ cảnh (Context Rot) và đạt tốc độ suy luận tối đa.

1. **Chia nhỏ dự án thành các Phase độc lập:**
   * **Session 1 (Thiết kế & Spec):** `/init` $\to$ `/brainstorm` $\to$ `/visualize` $\to$ `/plan` $\to$ Chạy `/save-brain` đóng gói Phase 1.
   * **Session 2 (Backend & DB):** Mở thread chat mới $\to$ `/recap` nạp gọn cấu trúc $\to$ `/code phase-01` (TDD + Targeted E2E) $\to$ `/save-brain`.
   * **Session 3 (Frontend UI & Integration):** Mở thread chat mới $\to$ `/recap` nạp API specs & UI mockup $\to$ `/code phase-02` (TDD + Targeted E2E) $\to$ `/save-brain`.
   * **Session 4 (Audit & Deploy):** Mở thread chat mới $\to$ `/audit` $\to$ Live-test $\to$ `/deploy`.

2. **Quy tắc Bàn giao Session (Handover Checkpoint):**
   * Sau khi hoàn thành một Phase lớn, AI **bắt buộc** xuất thông báo đề xuất người dùng mở Session mới:
     > *"🎉 Phase [X] đã hoàn tất và vượt qua 100% test hợp lệ! Để AI giữ 100% sức mạnh suy luận và không bị tràn bộ nhớ, anh hãy mở một Session Chat mới và gõ `/recap` để bắt đầu Phase tiếp theo."*
   * Khi mở Session mới và gõ `/recap`, AI áp dụng **Tiered Context Hydration** (chỉ nạp ~800 tokens ngữ cảnh thiết yếu, bao gồm các bài học kinh nghiệm từ `.brain/learnings.md`).

---

## 3. Các Quy Tắc Bất Biến (Non-Negotiable Rules)

1. **Hiểu rõ Tiêu chí Nghiệm thu (Acceptance Criteria):** Xác định rõ kết quả quan sát được trước khi thay đổi bất kỳ dòng code nào.
2. **Khai thác Đồ thị Kiến trúc GitNexus (Knowledge Graph First):**
   * Trước khi sửa code, dùng GitNexus (`impact`, `context`, `trace`, `route_map`) để đánh giá vùng ảnh hưởng (Blast Radius).
   * Không bao giờ sửa code "mò" khi chưa nắm rõ các hàm/module phụ thuộc.
3. **Kỷ luật Kiểm thử Tuyệt đối (Strict TDD - RED-GREEN-REFACTOR):**
   * Viết test fail trước $\to$ Xác nhận test fail $\to$ Viết code tối thiểu để pass test $\to$ Refactor $\to$ Commit.
   * Bất kỳ code nào viết trước test đều vi phạm quy chuẩn.
   * Không bao giờ sửa hoặc xóa test hợp lệ chỉ để làm cho một implementation sai vượt qua kiểm tra.
4. **🛡️ KỶ LUẬT KIỂM THỬ THÔNG MINH & TIẾN TRÌNH AN TOÀN (SMART TESTING & PROCESS GUARD):**
   > *"Mục tiêu không phải là chạy ít test hơn. Mục tiêu là chạy ĐÚNG test, ở ĐÚNG tầng, vào ĐÚNG thời điểm."*
   * **1. Chỉ test hành vi thuộc quyền sở hữu của ứng dụng (Test what your app owns):** AI chỉ test logic nghiệp vụ do chính ứng dụng viết. **TUYỆT ĐỐI KHÔNG** test lại các cơ chế mà framework hoặc database đã đảm bảo (ví dụ: test xác suất trùng UUID, test tính chất ACID của Postgres, test React render thẻ HTML).
   * **2. Phân tầng kiểm thử (Test Pyramid Discipline):**
     * **Khi đang code từng Task nhỏ trong `/code`:** Chỉ chạy **Smallest Scoped Unit Test** liên quan trực tiếp đến hàm/file vừa sửa (thời gian chạy $< 1$–$2$ giây). CẤM bật browser E2E full luồng cho mỗi task nhỏ.
     * **Khi hoàn thành 1 Feature / Phase:** Chạy **Targeted E2E Smoke Test** (mở browser hoặc gửi API probe kiểm tra đúng màn hình/chức năng vừa làm).
     * **Khi chuẩn bị Deploy (`/deploy`):** Mới chạy toàn bộ **Full Test Suite & Audit**.
   * **3. Quy tắc tỷ lệ theo quy mô dự án (Proportional Testing):**
     * Đối với app MVP / PoC / Nội bộ: **CẤM TUYỆT ĐỐI** tự sinh các kịch bản Stress test, Load test 100k CCU, hay Data race test phi lý làm treo máy và cạn kiệt Quota.
     * Chỉ kích hoạt NFRs/Stress testing khi người dùng chỉ định rõ ràng hoặc dự án ở cấp `enterprise`.
   * **4. Kiểm soát tiến trình & Chống treo máy (Process Lifecycle & Timeout Guard):**
     * Mọi lệnh khởi chạy server thử nghiệm hoặc headless browser **bắt buộc có Hard Timeout (30s cho E2E, 120s cho initial build)**.
     * Khi test kết thúc (dù PASS hay FAIL), script **bắt buộc phải tự động Kill toàn bộ background process** (server ngầm, headless chrome), tuyệt đối không để rò rỉ tiến trình làm ngốn CPU và RAM.
   * **5. Chạy tuần tự mặc định (Sequential Execution):** Không spawn hàng chục worker song song cướp tài nguyên máy.
   * **6. Sổ Cái Bằng Chứng Kiểm Thử (Verification Evidence Ledger):** ⭐ MỚI (Học hỏi từ Hermes)
     * Kết quả kiểm thử được tóm tắt và ghi vào `.brain/verification_ledger.json` (TaskID, Command, Status, ExitCode, ErrorCount). **Tuyệt đối không dump hàng trăm dòng stdout/stderr thô ra chat context** để bảo vệ Token và tránh context rot.
   * **7. Zero Network / Runtime Errors:** Trong kịch bản Targeted E2E, bất kỳ API nào trả về HTTP status $\ge 400$ (Ambiguous FK, CORS, 500) đều tính là FAIL.
   * **8. Không hạ tiêu chuẩn test:** Tuyệt đối không làm suy yếu assertion hoặc xóa test chỉ để cho CI xanh.
5. **⚡ NGUYÊN TẮC BẢO VỆ PROMPT CACHE (SACRED PROMPT CACHING):** ⭐ MỚI (Học hỏi từ Hermes)
   * Giữ nguyên vẹn tính **byte-stable** cho System Prompts, Core Rules (`GEMINI.md`, `AI_CODE_WORKFLOW.md`), và Tool Schemas trên mọi lượt chat.
   * Tuyệt đối không thay đổi ngẫu nhiên cấu trúc prompt tiền tố giữa các turn hội thoại, giúp LLM (Gemini, Claude, OpenAI) kích hoạt **Prompt Caching đạt 90%+**, tiết kiệm 70–85% chi phí token và tăng tốc độ phản hồi tối đa.
6. **Quy Chuẩn Toàn Vẹn Cơ Sở Dữ Liệu & Explicit FK Hints (Database & PostgREST Integrity Policy):**
   * **Bắt buộc Explicit FK Hint:** Khi viết truy vấn Supabase / PostgREST nhúng (Embedded Query), **LUÔN LUÔN** chỉ định rõ Foreign Key Constraint (ví dụ: `supabase.from('questions').select('*, profiles!author_id(*)')`), **tuyệt đối không dùng dạng ngầm định `profiles(*)`** khi bảng đích có $>1$ Foreign Key.
   * **Database Migration Impact Analysis:** Mỗi khi tạo bảng mới hoặc sửa Foreign Key trong SQL $\to$ **BẮT BUỘC** quét lại toàn bộ file gọi API trong codebase để phát hiện và sửa các câu query embed bị ảnh hưởng.
7. **Phân Loại Lỗi Có Hệ Thống & Sửa Lỗi Lần Đầu Thất Bại (Error Classification & Failed-First-Fix):** ⭐ MỚI
   * **Lỗi tạm thời (Transient Errors - 503, 429, Network Timeout):** Tự động retry với Exponential Backoff (tối đa 3 lần).
   * **Lỗi xác định (Deterministic Errors - Ambiguous FK, Logic, Type Error, 400, 401/403):** **CẤM retry mù quáng.** Dừng lại ngay lập tức, dùng `gitnexus trace` để tìm nguyên nhân gốc rễ và sửa code có bằng chứng.
   * Nếu lần sửa đầu tiên thất bại $\to$ **DỪNG LẠI NGAY LẬP TỨC**, rollback thay đổi và quay lại bước điều tra. Cấm đắp thêm các tầng vá lỗi suy đoán (speculative patching) hoặc fallback che giấu lỗi.
8. **🧠 HỌC HỎI, ĐÚC KẾT & TỔNG HỢP KỸ NĂNG (CONTINUOUS LEARNING & SKILL SYNTHESIS):** ⭐ MỚI
   * **Tự động trích xuất bài học:** Sau mỗi lần fix bug thành công và E2E pass trong `/debug`, AI tự động đúc kết nguyên nhân, giải pháp chuẩn và anti-pattern vào `.brain/learnings.md`.
   * **Đóng gói Kỹ năng Tái sử dụng (Autonomous Skill Synthesis):** Nếu giải pháp đại diện cho một kỹ thuật phức tạp có tính tái sử dụng cao, AI tự động đóng gói thành file `skills/custom/[skill-name]/SKILL.md` chuẩn `agentskills.io` để dùng lại cho các dự án sau.
   * **Đối chiếu trước khi lập plan mới:** Trước khi lập `/plan` cho tính năng mới, AI bắt buộc đọc lại `.brain/learnings.md` để không lặp lại lỗi kiến trúc cũ.
9. **Cổng Gác Vật lý Bắt Buộc (Strict Automated Guardrails & Pre-flight Gate):**
   * Cài đặt và kích hoạt hệ thống **automated guardrails** (`guardrails/guardrail.py` và `guardrails/hooks/pre-commit`).
   * Agents **must not bypass**, disable, weaken, hoặc dùng `git commit --no-verify` để lách qua cổng kiểm tra.
   * Cấm commit trực tiếp lên nhánh được bảo vệ (`main`, `master`).
   * Cấm commit khi chưa vượt qua các kiểm tra thật: `tests`, `lint`, `typecheck`, `build`, và `e2e` (nếu có).
   * **Pre-flight Task Contract Gate:** Trước khi Subagent code, bắt buộc thẩm định task brief qua `scripts/task-brief.ps1 -Validate`.
10. **Cổng Triển Khai (Live-Test Deployment Gate):**
   * Tuyệt đối không tự ý deploy lên production khi chưa có sự xác nhận rõ ràng của người dùng sau khi đã kiểm thử trực tiếp (Live-test) và 100% targeted tests đạt chuẩn.

---

## 4. Quy Trình 8 Giai Đoạn Khép Kín (8-Stage End-to-End Flow)

```
[/init] ──► [/brainstorm] ──► [/visualize] ──► [gitnexus analyze] ──► [/plan]
   ▲                                                  │                  │
   │                                           [Đọc .brain/learnings.md] │
   │                                                                     │
   │                              [Modular Handover / New Session]       ▼
[/save-brain] ◄── [/deploy] ◄── [/audit] ◄── [/review] ◄── [/code (Smart TDD + E2E)]
   ▲                                                                     │
   └─────────────── [Tự Động Đúc Kết Bài Học & Skill: /debug] ───────────┘
```

### 4.1. Giai đoạn 1: Khởi tạo & Cài Guardrail (`/init`)
* Tự động nhận diện dự án mới hoặc dự án đang làm $\to$ Cài Guardrail & Git hooks.

### 4.2. Giai đoạn 2: Phân tích & Trực quan hóa (`/brainstorm` & `/visualize`)
* Socratic questioning để làm rõ yêu cầu $\to$ Lưu Spec vào `docs/superpowers/specs/<feature>.md`.
* Tạo Mockup HTML/CSS và trích xuất Design Tokens phục vụ UI.

### 4.3. Giai đoạn 3: Quét Đồ thị Kiến trúc (`gitnexus analyze`)
* Quét AST và lập bản đồ quan hệ toàn dự án vào LadybugDB.

### 4.4. Giai đoạn 4: Lập Kế hoạch TDD & Scenarios (`/plan`)
* Đối chiếu bài học cũ từ `.brain/learnings.md` + Tính Blast Radius bằng GitNexus `impact`.
* Phân rã công việc thành các task nhỏ (2–5 phút) với Unit Test tương ứng và 1 kịch bản Targeted E2E cho cả feature.
* Lưu vào `docs/superpowers/plans/<feature-name>.md` $\to$ Đóng gói Session 1 bằng `/save-brain`.

### 4.5. Giai đoạn 5: Thực thi Độc lập & Cổng Kiểm Thử Thông Minh (`/code`)
* Kích hoạt `using-git-worktrees` tạo nhánh làm việc cô lập.
* Subagents thực thi Strict TDD trên từng task (Smallest Scoped Unit Test $< 1$–$2$s).
* Khi xong toàn bộ feature: Chạy **Targeted E2E Smoke Test** (có auto-cleanup process).
* Cập nhật kết quả vào Sổ cái Bằng chứng `.brain/verification_ledger.json`.
* Cổng `guardrail.py` tự động thẩm định mỗi commit.

### 4.6. Giai đoạn 6: Review Độc lập 2 Lớp (`/review`)
* Task Reviewer kiểm tra Spec Compliance + Code Quality + GitNexus shape check.

### 4.7. Giai đoạn 7: Xử lý Lỗi Chuyên sâu & Tự Động Đúc Kết Bài Học (`/debug`)
* Phân loại lỗi (Transient vs Deterministic).
* Áp dụng `systematic-debugging` 4 bước kết hợp `gitnexus trace`.
* Viết test tái hiện đúng lỗi $\to$ Fix lỗi $\to$ Chạy lại test E2E chứng minh lỗi đã biến mất.
* **Tự động lưu bài học vào `.brain/learnings.md`** và tổng hợp Custom Skill nếu là kỹ thuật phức tạp.

### 4.8. Giai đoạn 8: Nghiệm thu, Kiểm toán Toàn vẹn, Triển khai & Lưu Trí nhớ
* Merge nhánh worktree an toàn (`finishing-a-development-branch`).
* Chạy `/audit` (quét Bảo mật, Code Quality, Dependencies và Database Relationship Integrity).
* Chạy Full Test Suite trong `/test`.
* Xuất báo cáo Handoff chuẩn $\to$ Hướng dẫn người dùng Live-test $\to$ `/deploy` $\to$ `/save-brain`.

---

## 5. Điều Kiện Dừng Bắt Buộc (Mandatory Stop Conditions)

AI bắt buộc phải **DỪNG LẠI và HỎI Ý KIẾN NGƯỜI DÙNG** khi:
1. Cần thực hiện Deploy lên production hoặc thay đổi cấu hình production.
2. Cần thực hiện Migration cơ sở dữ liệu có tính chất xóa hoặc thay đổi dữ liệu khó phục hồi.
3. Cần xóa dữ liệu hoặc thay đổi cấu trúc bảng ảnh hưởng dữ liệu người dùng.
4. Phát hiện thay đổi có rủi ro bảo mật, xác thực (auth), phân quyền hoặc lộ lọt secrets.
5. Phát hiện vùng ảnh hưởng (Blast Radius từ GitNexus hoặc DB Schema Conflict) vượt xa phạm vi đã thống nhất ban đầu.
6. Lỗi fix lần 1 thất bại và chưa xác định được nguyên nhân gốc rễ có bằng chứng.
7. Kịch bản E2E Test liên tục thất bại sau 3 vòng lặp sửa lỗi.
