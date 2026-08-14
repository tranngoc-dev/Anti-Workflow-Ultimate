---
description: 🚀 Triển khai ứng dụng production an toàn qua Cổng Live-Test
---

# WORKFLOW: /deploy - Triển Khai Production & Cổng Live-Test An Toàn

**Vai trò:** DevOps & Release Lead  
**Mục tiêu:** Kiểm toán lần cuối, yêu cầu người dùng xác nhận đã Live-test thực tế và tiến hành triển khai ứng dụng lên môi trường Production (Vercel, Cloudflare, VPS, Docker).

---

## 🗺️ Vị Trí Trong Quy Trình Khép Kín

```
[/code] ➔ [/review] ➔ [/audit]
   ↓
[CỔNG KIỂM THỬ TRỰC TIẾP - LIVE-TEST GATE]
   ↓
[/deploy] ← BẠN ĐANG Ở ĐÂY (Triển khai Production)
   ↓
[/save-brain] (Lưu lại URL và cấu hình vào .brain/)
```

---

## 🚨 CỔNG BẮT BUỘC: LIVE-TEST DEPLOYMENT GATE

Theo điều khoản tại `AI_CODE_WORKFLOW.md`, AI **tuyệt đối không được tự ý deploy lên production** mà chưa qua cổng này:

### Bước 1: Kiểm Tra Điều Kiện Tiên Quyết
1. Toàn bộ tests, lint, typecheck phải **PASS 100%**.
2. Nhánh làm việc đã được merge sạch sẽ vào `main`/`master` qua `finishing-a-development-branch`.
3. Không có test nào bị skip hay có lỗi bảo mật từ `/audit`.

### Bước 2: Yêu Cầu Người Dùng Xác Nhận Live-Test

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛑 CỔNG XÁC NHẬN TRIỂN KHAI (LIVE-TEST GATE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ứng dụng đã sẵn sàng để deploy, nhưng cần xác nhận từ anh:
1. Anh đã chạy thử ứng dụng cục bộ (`npm run dev` hoặc `/run`) chưa?
2. Giao diện và các chức năng quan trọng đã hoạt động đúng mong đợi?

👉 Hãy chọn hành động:
1️⃣ "Tôi đã test trực tiếp và mọi thứ OK, tiến hành Deploy ngay!"
2️⃣ "Tôi muốn chạy /run để test thử trước."
3️⃣ "Dừng lại để chỉnh sửa thêm."
```

---

## Giai đoạn 2: Tiến Hành Triển Khai (Sau Khi Người Dùng Xác Nhận)

Hỗ trợ các nền tảng triển khai phổ biến:

### 1. Vercel / Cloudflare Pages (Frontend / Fullstack Next.js)
```bash
# Vercel
npx vercel --prod

# Cloudflare Pages
npx wrangler pages deploy dist/
```

### 2. Cloudflare Tunnel (Cho Local Host / Home Server)
* Tạo tunnel public an toàn không cần mở port modem.

### 3. Docker & VPS Deployment
* Build production image và khởi chạy container:
```bash
docker compose up -d --build
```

---

## Giai đoạn 3: Bàn Giao & Lưu Trữ

* Hiển thị Production URL công khai.
* Lưu thông tin deployment vào `.brain/brain.json`.
* Gợi ý chạy `/save-brain` để kết thúc toàn bộ chu kỳ dự án.
