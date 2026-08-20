---
description: 📋 Lên kế hoạch tính năng chi tiết có tính toán Impact, TDD & Bài học kinh nghiệm
---

# WORKFLOW: /plan - Lập Kế Hoạch Tính Năng TDD & Đối Chiếu Bài Học Kinh Nghiệm (v4.8.0)

**Vai trò:** Lead Software Architect & Technical Planner  
**Mục tiêu:** Chuyển đổi ý tưởng thành Spec và Kế hoạch Thực thi (Implementation Plan) cực kỳ chi tiết, tính toán vùng ảnh hưởng bằng **GitNexus**, **đối chiếu bài học kinh nghiệm từ `.brain/learnings.md`** để không lặp lại lỗi cũ, và chia nhỏ thành các task Smart TDD (2–5 phút).

---

## 🗺️ Vị Trí Trong Quy Trình Khép Kín

```
[/brainstorm] / [/visualize]
   ↓
[gitnexus analyze] + [Đọc .brain/learnings.md]
   ↓
[/plan] ← BẠN ĐANG Ở ĐÂY (Tạo Spec & Smart TDD Implementation Plan)
   ↓
🔄 [MODULAR HANDOVER: /save-brain ➔ Mở Chat Session Mới]
   ↓
[/code] (Chạy Subagent TDD trong Context Window sạch 100%)
```

---

## Giai đoạn 1: Quét Bản Đồ Kiến Trúc & Đối Chiếu Bài Học Kinh Nghiệm

1. **Quét bản đồ GitNexus:**
   ```bash
   npx gitnexus analyze
   ```
2. **Gọi các công cụ GitNexus MCP để phân tích:**
   * `gitnexus:query` & `gitnexus:context`: Xác định các module, cluster và interface liên quan.
   * `gitnexus:impact`: Tính toán phạm vi ảnh hưởng (Blast Radius) khi thay đổi/thêm tính năng mới.
   * `gitnexus:route_map`: Kiểm tra các API routes và component tiêu thụ.
3. **Truy Vấn Tri Thức Tích Lũy Bằng Semantic Brain RAG (`scripts/brain-query.ps1`):** ⭐ MỚI
   * Chạy truy vấn trích xuất nhanh các bài học liên quan đến từ khóa của tính năng:
     ```powershell
     .\scripts\brain-query.ps1 -Query "<Tên tính năng / Từ khóa kỹ thuật>"
     ```
   * Rà soát nhanh các Anti-Pattern hoặc lỗi từng gặp trong quá khứ (ví dụ: quy chuẩn Explicit FK hint trong Supabase, sanitize input, route dynamic hops).
   * **Đảm bảo kế hoạch mới tuân thủ 100% các giải pháp chuẩn đã đúc kết, chỉ tốn ~100 tokens ngữ cảnh.**

---

## Giai đoạn 2: Tạo Bản Đặc Tả Kỹ Thuật (Feature Spec)

Tạo file đặc tả tại `docs/superpowers/specs/<feature-name>.md` với nội dung:
* **Mục tiêu sản phẩm:** Hành vi người dùng quan sát được.
* **Tiêu chí nghiệm thu (Acceptance Criteria):** Điều kiện cụ thể để chứng minh tính năng hoạt động.
* **Phạm vi ngoài lề (Out of Scope):** Những phần tuyệt đối không đụng tới.
* **Mô hình Dữ liệu & API Contracts:** Định nghĩa Schema và Type Safety rõ ràng (áp dụng Explicit FK hint).

---

## Giai đoạn 3: Phân Rã Kế Hoạch Thực Thi Smart TDD (Writing Plans)

Tạo file kế hoạch tại `docs/superpowers/plans/<feature-name>.md` tuân thủ nguyên tắc Smart TDD:
* Chia thành các Task nhỏ (2–5 phút thực thi mỗi task).
* Mỗi Task **bắt buộc** gồm:
  1. File paths chính xác.
  2. Đoạn mã hoàn chỉnh (Full code snippet, không để placeholder `// TODO`).
  3. Lệnh Unit Test nhỏ (Smallest Scoped Test $< 1$s) theo chuẩn Red $\to$ Green.
* Kèm 1 kịch bản **Targeted E2E Smoke Test** chung cho cả Feature.

---

## Giai đoạn 4: Đóng Gói Checkpoint & Handover Session

Sau khi tạo xong Plan:
1. Ghi nhận đường dẫn plan vào `.brain/session.json`.
2. Append vào `.brain/session_log.txt`.
3. Xuất thông báo hướng dẫn người dùng mở Session Chat Mới để tiến hành `/code`.
