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
   * **Session 2 (Backend & DB):** Mở thread chat mới $\to$ `/recap` nạp gọn cấu trúc $\to$ `/code phase-01` (TDD + E2E) $\to$ `/save-brain`.
   * **Session 3 (Frontend UI & Integration):** Mở thread chat mới $\to$ `/recap` nạp API specs & UI mockup $\to$ `/code phase-02` (TDD + E2E) $\to$ `/save-brain`.
   * **Session 4 (Audit & Deploy):** Mở thread chat mới $\to$ `/audit` $\to$ Live-test $\to$ `/deploy`.

2. **Quy tắc Bàn giao Session (Handover Checkpoint):**
   * Sau khi hoàn thành một Phase lớn, AI **bắt buộc** xuất thông báo đề xuất người dùng mở Session mới:
     > *"🎉 Phase [X] đã hoàn tất và vượt qua 100% E2E test! Để AI giữ 100% sức mạnh suy luận và không bị tràn bộ nhớ, anh hãy mở một Session Chat mới và gõ `/recap` để bắt đầu Phase tiếp theo."*
   * Khi mở Session mới và gõ `/recap`, AI áp dụng **Tiered Context Hydration** (chỉ nạp ~800 tokens ngữ cảnh thiết yếu, không nạp lại toàn bộ lịch sử trò chuyện cũ).

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
4. **🚨 CỔNG KIỂM THỬ E2E BẮT BUỘC (MANDATORY E2E PASS-TO-PROCEED GATE):** ⭐ MỚI
   * **Bắt buộc E2E thật sự sau mỗi Feature / Bug Fix:** Sau khi Unit Test pass, **BẮT BUỘC** phải chạy kịch bản Test E2E thực tế (khởi động Dev/API Server thật, mở Headless Browser Playwright hoặc gửi HTTP Request thật tới Database).
   * **E2E PASS mới được làm tiếp:** AI **tuyệt đối không được phép** đánh dấu hoàn thành task, commit mã nguồn hoặc chuyển sang task tiếp theo nếu E2E chưa PASS 100%.
   * **Zero Network / Runtime Errors:** Trong quá trình chạy E2E, bất kỳ request API nào trả về HTTP status $\ge 400$ (bao gồm lỗi PostgREST Ambiguous FK, CORS, 500 Server Error) hoặc có Uncaught Exception trong Browser Console đều bị tính là **E2E FAILED** và kích hoạt Fix Loop ngay lập tức.
   * **Cấm hoàn toàn Shallow Mocking đơn độc:** Không được phép coi việc mock Supabase/API client là đã hoàn tất kiểm thử tính năng.
5. **Quy Chuẩn Toàn Vẹn Cơ Sở Dữ Liệu & Explicit FK Hints (Database & PostgREST Integrity Policy):**
   * **Bắt buộc Explicit FK Hint:** Khi viết truy vấn Supabase / PostgREST nhúng (Embedded Query), **LUÔN LUÔN** chỉ định rõ Foreign Key Constraint (ví dụ: `supabase.from('questions').select('*, profiles!author_id(*)')`), **tuyệt đối không dùng dạng ngầm định `profiles(*)`** khi bảng đích có $>1$ Foreign Key.
   * **Database Migration Impact Analysis:** Mỗi khi tạo bảng mới hoặc sửa Foreign Key trong SQL $\to$ **BẮT BUỘC** quét lại toàn bộ file gọi API trong codebase để phát hiện và sửa các câu query embed bị ảnh hưởng.
6. **Quy tắc Sửa lỗi Lần đầu Thất bại (Failed-First-Fix Rule):**
   * Khi fix bug, phải tìm ra nguyên nhân gốc rễ (Root Cause) bằng chứng cứ (`systematic-debugging` + `gitnexus trace`).
   * Phải viết kịch bản E2E tái hiện chính xác lỗi trước khi sửa.
   * Nếu lần sửa đầu tiên thất bại $\to$ **DỪNG LẠI NGAY LẬP TỨC**, rollback thay đổi và quay lại bước điều tra. Cấm đắp thêm các tầng vá lỗi suy đoán (speculative patching) hoặc fallback che giấu lỗi.
7. **Cổng Gác Vật lý (Strict Physical Guardrails):**
   * Cài đặt và kích hoạt hook `guardrails/guardrail.py`.
   * Cấm commit trực tiếp lên nhánh được bảo vệ (`main`, `master`).
   * Cấm commit khi chưa vượt qua các kiểm tra thật: `tests`, `lint`, `typecheck`, `build`, và `e2e` (nếu có).
   * Tuyệt đối không dùng `git commit --no-verify` để lách cổng.
8. **Cổng Triển Khai (Live-Test Deployment Gate):**
   * Tuyệt đối không tự ý deploy lên production khi chưa có sự xác nhận rõ ràng của người dùng sau khi đã kiểm thử trực tiếp (Live-test) và 100% E2E tests đạt chuẩn.

---

## 4. Quy Trình 8 Giai Đoạn Khép Kín (8-Stage End-to-End Flow)

```
[/init] ──► [/brainstorm] ──► [/visualize] ──► [gitnexus analyze] ──► [/plan]
   ▲                                                                     │
   │                              [Modular Handover / New Session]       │
   │                                             ▼                       │
[/save-brain] ◄── [/deploy] ◄── [/audit] ◄── [/review] ◄── [/code (TDD + E2E Gate)]
```

### 4.1. Giai đoạn 1: Khởi tạo & Cài Guardrail (`/init`)
* Thu thập thông tin dự án, cấu trúc `.brain/`.
* Tự động cài đặt Git và hook gác cổng `python guardrails/install.py`.

### 4.2. Giai đoạn 2: Phân tích & Trực quan hóa (`/brainstorm` & `/visualize`)
* Socratic questioning để làm rõ yêu cầu $\to$ Lưu Spec vào `docs/superpowers/specs/<feature>.md`.
* Tạo Mockup HTML/CSS và trích xuất Design Tokens phục vụ UI.

### 4.3. Giai đoạn 3: Quét Đồ thị Kiến trúc (`gitnexus analyze`)
* Quét AST và lập bản đồ quan hệ toàn dự án vào LadybugDB.

### 4.4. Giai đoạn 4: Lập Kế hoạch TDD & E2E Scenarios (`/plan`)
* Sử dụng GitNexus `impact` để tính toán Blast Radius (bao gồm cả schema DB).
* Phân rã công việc thành các task nhỏ (2–5 phút) với đầy đủ code spec, lệnh Unit Test và **kịch bản kiểm thử E2E tương ứng**.
* Lưu vào `docs/superpowers/plans/<feature>.md` $\to$ Đóng gói Session 1 bằng `/save-brain`.

### 4.5. Giai đoạn 5: Thực thi Độc lập & Cổng E2E Bắt Buộc (`/code`)
* Kích hoạt `using-git-worktrees` tạo nhánh làm việc cô lập.
* Subagents thực thi Strict TDD trên từng task.
* **Chạy Cổng E2E Verification:** Khởi chạy server, thực thi Playwright / API E2E test thật.
* **Chỉ khi E2E PASS 100% $\to$ mới hoàn thành task và commit qua Guardrail.**

### 4.6. Giai đoạn 6: Review Độc lập 2 Lớp (`/review`)
* Task Reviewer kiểm tra:
  * Lớp 1: Đạt đúng Spec (Spec Compliance & E2E Results).
  * Lớp 2: Chất lượng mã nguồn (Code Quality & Clean Code).
* Chạy GitNexus `shape_check` và `detect_changes`.

### 4.7. Giai đoạn 7: Xử lý Lỗi Chuyên sâu (`/debug`)
* Khi gặp lỗi: Áp dụng `systematic-debugging` 4 bước kết hợp `gitnexus trace`.
* Viết kịch bản E2E tái hiện lỗi $\to$ Fix lỗi $\to$ Chạy lại E2E chứng minh lỗi đã biến mất hoàn toàn trên môi trường thật.

### 4.8. Giai đoạn 8: Nghiệm thu, Kiểm toán Toàn vẹn, Triển khai & Lưu Trí nhớ
* Merge nhánh worktree an toàn (`finishing-a-development-branch`).
* Chạy `/audit` (quét Bảo mật, Code Quality, Dependencies và Database Relationship Integrity).
* Chạy Full E2E Test Suite trong `/test`.
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
