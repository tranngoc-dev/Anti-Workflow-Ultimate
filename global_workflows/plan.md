---
description: 📋 Lên kế hoạch tính năng chi tiết có tính toán Impact & TDD
---

# WORKFLOW: /plan - Lập Kế Hoạch Tính Năng TDD & Phân Tích Vùng Ảnh Hưởng

**Vai trò:** Lead Software Architect & Technical Planner  
**Mục tiêu:** Chuyển đổi ý tưởng thành Spec và Kế hoạch Thực thi (Implementation Plan) cực kỳ chi tiết, tính toán vùng ảnh hưởng bằng **GitNexus** và chia nhỏ thành các task TDD (2–5 phút) của **Superpowers**.

---

## 🗺️ Vị Trí Trong Quy Trình Khép Kín

```
[/brainstorm] / [/visualize]
   ↓
[gitnexus analyze] (Quét đồ thị kiến trúc)
   ↓
[/plan] ← BẠN ĐANG Ở ĐÂY (Tạo Spec & TDD Implementation Plan)
   ↓
🔄 [MODULAR HANDOVER: /save-brain ➔ Mở Chat Session Mới]
   ↓
[/code] (Chạy Subagent TDD trong Context Window sạch 100%)
```

---

## Giai đoạn 1: Quét Bản Đồ Kiến Trúc (GitNexus Scan)

1. Nếu dự án đã có code, kích hoạt index GitNexus:
   ```bash
   npx gitnexus analyze
   ```
2. Gọi các công cụ GitNexus MCP để phân tích:
   * `gitnexus:query` & `gitnexus:context`: Xác định các module, cluster và interface liên quan.
   * `gitnexus:impact`: Tính toán phạm vi ảnh hưởng (Blast Radius) khi thay đổi/thêm tính năng mới.
   * `gitnexus:route_map`: Kiểm tra các API routes và component tiêu thụ.

---

## Giai đoạn 2: Tạo Bản Đặc Tả Kỹ Thuật (Feature Spec)

Tạo file đặc tả tại `docs/superpowers/specs/<feature-name>.md` với nội dung:
* **Mục tiêu sản phẩm:** Hành vi người dùng quan sát được.
* **Tiêu chí nghiệm thu (Acceptance Criteria):** Điều kiện cụ thể để chứng minh tính năng hoạt động.
* **Phạm vi ngoài lề (Out of Scope):** Những phần tuyệt đối không đụng tới.
* **Mô hình Dữ liệu & API Contracts:** Định nghĩa Schema và Type Safety rõ ràng.

---

## Giai đoạn 3: Phân Rã Kế Hoạch Thực Thi TDD (Writing Plans)

Tạo file kế hoạch tại `docs/superpowers/plans/<feature-name>.md` tuân thủ nguyên tắc Superpowers:
* Chia thành các Task nhỏ (2–5 phút thực thi mỗi task).
* Mỗi Task **bắt buộc** gồm:
  1. File paths chính xác.
  2. Đoạn mã hoàn chỉnh (Full code snippet, không để placeholder `// TODO`).
  3. Lệnh kiểm thử tự động (Test command) theo chuẩn TDD (Red $\to$ Green).
  4. Tiêu chí review độc lập (Spec verification).

### Mẫu Cấu Trúc Task Chuẩn:
```markdown
### Task 1: Định nghĩa Interface & Unit Test cho Order Service
- **Files:** `src/types/order.ts`, `tests/unit/order.test.ts`
- **Bước 1 (RED):** Viết unit test kiểm tra validate order fail.
  Lệnh chạy: `npm test tests/unit/order.test.ts` (Kết quả kỳ vọng: FAIL)
- **Bước 2 (GREEN):** Viết logic tối thiểu trong `src/services/order.ts` để test PASS.
  Lệnh chạy: `npm test tests/unit/order.test.ts` (Kết quả kỳ vọng: PASS)
- **Bước 3 (REFACTOR):** Tối ưu code và commit.
```

---

## Giai đoạn 4: Đóng Gói Checkpoint & Bàn Giao Session Mới (Modular Handover)

1. Cập nhật `.brain/session.json` với `current_plan_path: "docs/superpowers/plans/<feature-name>.md"`.
2. Append vào `.brain/session_log.txt`:
   ```
   [HH:MM] PLAN_CREATED: docs/superpowers/plans/<feature-name>.md (Tasks: X)
   ```

3. **Hiển thị Thông Báo Bàn Giao Session (Session Handover Notice):**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 KẾ HOẠCH TDD ĐÃ ĐƯỢC TẠO HOÀN HẢO!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 File Spec: docs/superpowers/specs/{feature-name}.md
📝 File Plan: docs/superpowers/plans/{feature-name}.md
📊 Tổng số Tasks: {X} tasks (Chuẩn RED-GREEN-REFACTOR)
🔍 Blast Radius: Đã kiểm tra qua GitNexus (An toàn)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 GIAO THỨC MODULAR CONVERSATION (TỐI ƯU TOKEN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Để đảm bảo AI giữ 100% công suất suy luận, phản hồi siêu tốc và Context Window sạch sẽ:
👉 Anh hãy MỞ MỘT CHAT SESSION MỚI TINH và gõ:

    /code

AI sẽ tự động nạp kế hoạch và điều phối Subagents thực thi TDD khép kín!
```
