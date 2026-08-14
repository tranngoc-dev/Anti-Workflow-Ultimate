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
   * **Session 2 (Backend & DB):** Mở thread chat mới $\to$ `/recap` nạp gọn cấu trúc $\to$ `/code phase-01` (TDD) $\to$ `/save-brain`.
   * **Session 3 (Frontend UI & Integration):** Mở thread chat mới $\to$ `/recap` nạp API specs & UI mockup $\to$ `/code phase-02` $\to$ `/save-brain`.
   * **Session 4 (Audit & Deploy):** Mở thread chat mới $\to$ `/audit` $\to$ Live-test $\to$ `/deploy`.

2. **Quy tắc Bàn giao Session (Handover Checkpoint):**
   * Sau khi hoàn thành một Phase lớn, AI **bắt buộc** xuất thông báo đề xuất người dùng mở Session mới:
     > *"🎉 Phase [X] đã hoàn tất và lưu checkpoint an toàn! Để AI giữ 100% sức mạnh suy luận và không bị tràn bộ nhớ, anh hãy mở một Session Chat mới và gõ `/recap` để bắt đầu Phase tiếp theo."*
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
4. **Quy tắc Sửa lỗi Lần đầu Thất bại (Failed-First-Fix Rule):**
   * Khi fix bug, phải tìm ra nguyên nhân gốc rễ (Root Cause) bằng chứng cứ (`systematic-debugging` + `gitnexus trace`).
   * Nếu lần sửa đầu tiên thất bại hoặc làm hỏng test khác $\to$ **DỪNG LẠI NGAY LẬP TỨC**, rollback thay đổi thử nghiệm và quay lại bước điều tra. Cấm đắp thêm các tầng vá lỗi suy đoán (speculative patching) hoặc fallback che giấu lỗi.
5. **Cổng Gác Vật lý (Strict Physical Guardrails):**
   * Cài đặt và kích hoạt hook `guardrails/guardrail.py`.
   * Cấm commit trực tiếp lên nhánh được bảo vệ (`main`, `master`).
   * Cấm commit khi chưa vượt qua 4 kiểm tra thật: `tests`, `lint`, `typecheck`, `build`.
   * Tuyệt đối không dùng `git commit --no-verify` để lách cổng.
6. **Cổng Triển Khai (Live-Test Deployment Gate):**
   * Tuyệt đối không tự ý deploy lên production hoặc chạy migration phá hủy khi chưa có sự xác nhận rõ ràng của người dùng sau khi đã kiểm thử trực tiếp (Live-test).

---

## 4. Quy Trình 8 Giai Đoạn Khép Kín (8-Stage End-to-End Flow)

```
[/init] ──► [/brainstorm] ──► [/visualize] ──► [gitnexus analyze] ──► [/plan]
   ▲                                                                     │
   │                              [Modular Handover / New Session]       │
   │                                             ▼                       │
[/save-brain] ◄── [/deploy] ◄── [/audit] ◄── [/review] ◄── [/code (TDD Subagents)]
```

### 4.1. Giai đoạn 1: Khởi tạo & Cài Guardrail (`/init`)
* Thu thập thông tin dự án, cấu trúc `.brain/`.
* Tự động cài đặt Git và hook gác cổng `python guardrails/install.py`.

### 4.2. Giai đoạn 2: Phân tích & Trực quan hóa (`/brainstorm` & `/visualize`)
* Socratic questioning để làm rõ yêu cầu $\to$ Lưu Spec vào `docs/superpowers/specs/<feature>.md`.
* Tạo Mockup HTML/CSS và trích xuất Design Tokens phục vụ UI.

### 4.3. Giai đoạn 3: Quét Đồ thị Kiến trúc (`gitnexus analyze`)
* Quét AST và lập bản đồ quan hệ toàn dự án vào LadybugDB.

### 4.4. Giai đoạn 4: Lập Kế hoạch TDD (`/plan`)
* Sử dụng GitNexus `impact` để tính toán Blast Radius.
* Phân rã công việc thành các task nhỏ (2–5 phút) với đầy đủ code spec và lệnh test $\to$ Lưu vào `docs/superpowers/plans/<feature>.md`.
* Đóng gói Session 1 bằng `/save-brain`.

### 4.5. Giai đoạn 5: Thực thi Độc lập qua Subagents (`/code`)
* *(Mở Session mới nếu cần)* $\to$ Gõ `/recap` nạp ngữ cảnh.
* Kích hoạt `using-git-worktrees` tạo nhánh làm việc cô lập.
* Điều phối Subagents theo `subagent-driven-development`, áp dụng Strict TDD trên từng task.
* Cổng `guardrail.py` tự động thẩm định mỗi commit.

### 4.6. Giai đoạn 6: Review Độc lập 2 Lớp (`/review`)
* Task Reviewer kiểm tra:
  * Lớp 1: Đạt đúng Spec (Spec Compliance).
  * Lớp 2: Chất lượng mã nguồn (Code Quality & Clean Code).
* Chạy GitNexus `shape_check` và `detect_changes` để đảm bảo không gãy giao tiếp API.

### 4.7. Giai đoạn 7: Xử lý Lỗi Chuyên sâu (`/debug`)
* Khi gặp lỗi phức tạp: Áp dụng `systematic-debugging` 4 bước kết hợp `gitnexus trace` để định vị chính xác vị trí lỗi.

### 4.8. Giai đoạn 8: Nghiệm thu, Kiểm toán, Triển khai & Lưu Trí nhớ
* Merge nhánh worktree an toàn (`finishing-a-development-branch`).
* Chạy `/audit` quét bảo mật, lỗ hổng package và secrets.
* Xuất báo cáo Handoff chuẩn $\to$ Hướng dẫn người dùng Live-test.
* Sau khi người dùng xác nhận $\to$ Chạy `/deploy` $\to$ Chạy `/save-brain` cập nhật Eternal Memory.

---

## 5. Điều Kiện Dừng Bắt Buộc (Mandatory Stop Conditions)

AI bắt buộc phải **DỪNG LẠI và HỎI Ý KIẾN NGƯỜI DÙNG** khi:
1. Cần thực hiện Deploy lên production hoặc thay đổi cấu hình production.
2. Cần thực hiện Migration cơ sở dữ liệu có tính chất xóa hoặc thay đổi dữ liệu khó phục hồi.
3. Cần xóa dữ liệu hoặc thay đổi cấu trúc bảng ảnh hưởng dữ liệu người dùng.
4. Phát hiện thay đổi có rủi ro bảo mật, xác thực (auth), phân quyền hoặc lộ lọt secrets.
5. Phát hiện vùng ảnh hưởng (Blast Radius từ GitNexus) vượt xa phạm vi đã thống nhất ban đầu.
6. Lỗi fix lần 1 thất bại và chưa xác định được nguyên nhân gốc rễ có bằng chứng.
