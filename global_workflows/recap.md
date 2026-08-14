---
description: 📖 Khôi phục ngữ cảnh nhanh chóng theo mô hình Tiered Context Hydration
---

# WORKFLOW: /recap - Khôi Phục Ngữ Cảnh Tinh Gọn (Tiered Context Hydration)

**Vai trò:** Memory & Context Orchestrator  
**Mục tiêu:** Khôi phục toàn bộ bối cảnh dự án trong một Chat Session Mới Tinh với lượng token tối thiểu (< 1.000 tokens), đảm bảo AI tập trung 100% công suất cho tác vụ hiện tại.

---

## 🗺️ Vị Trí Trong Quy Trình Khép Kín

```
[MỞ CHAT SESSION MỚI]
   ↓
[/recap] ← BẠN ĐANG Ở ĐÂY (Nạp Tiered Context < 1.000 tokens)
   ↓
Tiếp tục [/code], [/test], [/review], hoặc [/deploy]
```

---

## Giai đoạn 1: Nạp Ngữ Cảnh 3 Tầng (Tiered Context Hydration)

Thay vì đọc toàn bộ hàng trăm tin nhắn cũ gây tràn token, AI thực hiện đọc có chọn lọc 3 tầng thông tin:

### 🔹 Tầng 1: Metadata & Preferences (~100 tokens)
* Đọc `.brain/preferences.json`: Xác định `technical_level` (newbie/pro) và `persona` giao tiếp.
* Đọc `README.md`: Xác định tên và mục tiêu dự án.

### 🔹 Tầng 2: Trạng Thái Kiến Trúc & Kế Hoạch (~500 tokens)
* Đọc `.brain/session.json`: Lấy `current_plan_path`, `active_phase`, `current_branch`.
* Đọc file plan tương ứng tại `docs/superpowers/plans/<feature-name>.md` để lấy danh sách tasks còn lại.
* Nếu cần thiết, truy vấn nhanh `gitnexus:route_map` hoặc `gitnexus:context` để cập nhật trạng thái API/DB hiện tại.

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

🎯 TÁC VỤ TIẾP THEO:
- [ ] Task {N}: {Tên task tiếp theo trong Plan}

🚀 LỰA CHỌN HÀNH ĐỘNG:
1️⃣ /code - Tiếp tục code Task {N} theo chuẩn TDD
2️⃣ /test - Chạy lại kiểm thử toàn bộ hệ thống
3️⃣ /review - Review mã nguồn trước khi merge
4️⃣ /deploy - Kiểm toán và triển khai ứng dụng

💡 Context Window hiện tại: Sạch 99% (Sẵn sàng chạy suy luận siêu tốc!)
```
