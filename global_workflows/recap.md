---
description: 📖 Khôi phục ngữ cảnh nhanh chóng theo mô hình Tiered Context Hydration & Đọc bài học cũ
---

# WORKFLOW: /recap - Khôi Phục Ngữ Cảnh Tinh Gọn (Tiered Context Hydration v4.8.0)

**Vai trò:** Memory & Context Orchestrator  
**Mục tiêu:** Khôi phục toàn bộ bối cảnh dự án và **các bài học kinh nghiệm đã tích lũy (`.brain/learnings.md`)** trong một Chat Session Mới Tinh với lượng token tối thiểu (< 1.000 tokens), đảm bảo AI tập trung 100% công suất cho tác vụ hiện tại mà không lặp lại lỗi cũ.

---

## 🗺️ Vị Trí Trong Quy Trình Khép Kín

```
[MỞ CHAT SESSION MỚI]
   ↓
[/recap] ← BẠN ĐANG Ở ĐÂY (Nạp Tiered Context & Bài Học Cũ < 1.000 tokens)
   ↓
Tiếp tục [/code], [/test], [/review], hoặc [/deploy]
```

---

## Giai đoạn 1: Nạp Ngữ Cảnh 3 Tầng & Bài Học Đúc Kết

Thay vì đọc toàn bộ hàng trăm tin nhắn cũ gây tràn token, AI thực hiện đọc có chọn lọc 3 tầng thông tin:

### 🔹 Tầng 1: Metadata & Preferences (~100 tokens)
* Đọc `.brain/preferences.json`: Xác định `technical_level` (newbie/pro) và `persona` giao tiếp.
* Đọc `README.md`: Xác định tên và mục tiêu dự án.

### 🔹 Tầng 2: Trạng Thái Kiến Trúc, Kế Hoạch & Bài Học Đã Học (~500 tokens) ⭐ MỚI
* Đọc `.brain/session.json`: Lấy `current_plan_path`, `active_phase`, `current_branch`.
* Đọc file plan tương ứng tại `docs/superpowers/plans/<feature-name>.md` để lấy danh sách tasks còn lại.
* **Đọc 5 bài học gần nhất trong `.brain/learnings.md`:** Nạp ngay vào bộ nhớ làm việc các lỗi từng gặp và giải pháp chuẩn để **tuyệt đối không dẫm lại vết xe đổ**.
* Nếu cần thiết, truy vấn nhanh `gitnexus:route_map` hoặc `gitnexus:context`.

### 🔹 Tầng 3: Trạng Thái Git Thực Tế (~200 tokens)
* Chạy `git status` và `git branch --show-current` để kiểm tra nhánh hiện tại và các file đang sửa dở.

---

## Giai đoạn 2: Báo Cáo Tình Trạng Ngắn Gọn (Executive Dashboard)

Hiển thị ngay cho người dùng báo cáo súc tích:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📖 ĐÃ KHÔI PHỤC NGỮ CẢNH HOÀN HẢO (CLEAN CONTEXT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Dự án: {project_name}
🌿 Nhánh Git: {current_branch}
📋 Kế hoạch: {current_plan_path}
📊 Tiến độ: Phase {X}/{Total} ({Progress}%)
🧠 Trí nhớ dự án: Đã nạp {N} bài học kinh nghiệm từ `.brain/learnings.md`

🎯 TÁC VỤ TIẾP THEO:
- [ ] Task {N}: {Tên task tiếp theo trong Plan}

🚀 LỰA CHỌN HÀNH ĐỘNG:
1️⃣ /code - Tiếp tục code Task {N} theo chuẩn Smart TDD
2️⃣ /plan - Xem hoặc điều chỉnh kế hoạch tính năng
3️⃣ /test - Chạy kiểm thử hệ thống hiện tại
4️⃣ /audit - Khám tổng quát dự án
```
