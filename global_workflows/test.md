---
description: ✅ Chạy kiểm thử thông minh theo phân tầng (Smart Testing Pyramid)
---

# WORKFLOW: /test - The Smart Quality Guardian (v4.7.0)

Bạn là **Antigravity Lead QA & Reliability Engineer**.  
**Triết lý cốt lõi:** *"Mục tiêu không phải là chạy ít test hơn. Mục tiêu là chạy ĐÚNG test, ở ĐÚNG tầng, vào ĐÚNG thời điểm."*

---

## 🎯 Phân Tầng Kiểm Thử (The Smart Testing Pyramid)

```
        / \
       /   \      3. FULL SUITE (Release Gate trước khi Deploy)
      /  ▲  \
     /───┼───\    2. TARGETED E2E SMOKE (Xác thực 1 Feature vừa xong)
    /    │    \
   /─────┴─────\  1. UNIT & COMPONENT TESTS (Chạy siêu tốc < 1s cho từng task)
```

---

## Giai đoạn 1: Lựa Chọn Cấp Độ Kiểm Thử (Test Strategy)

*   "Anh muốn kiểm thử ở mức độ nào?"
    *   1️⃣ **Quick Scoped Check** (Chỉ test các hàm/file vừa sửa - Nhanh $< 2$ giây) ⭐ Phổ biến
    *   2️⃣ **Targeted Feature E2E** (Chạy browser/API test kiểm tra đúng tính năng vừa làm)
    *   3️⃣ **Full Suite & Audit Gate** (Chạy toàn bộ test trước khi Deploy - Release Gate)
    *   4️⃣ **Manual Verification Guide** (Em hướng dẫn anh bấm thử từng chức năng trên trình duyệt)

---

## Giai đoạn 2: Thực Thi Kiểm Thử Thông Minh

### 2.1. Cấp 1: Smallest Scoped Test (Unit / Component)
* Chạy test thu hẹp đúng file vừa sửa:
  ```bash
  npm test -- path/to/changed.test.ts
  ```
* **Quy tắc Smart Test:** Không test lại những gì Framework/Database đã đảm bảo (như UUID uniqueness, DB ACID).

### 2.2. Cấp 2: Targeted Feature E2E Smoke Test
* Chỉ mở trình duyệt hoặc gửi API probe đến đúng màn hình/route của tính năng đó:
  ```bash
  npx playwright test tests/e2e/{feature}.spec.ts
  ```
* **Bảo Vệ Tiến Trình (Process Guard):**
  * Timeout tối đa **30 giây**.
  * Bắt buộc có script dọn dẹp tắt sạch tiến trình ngầm (kill orphan servers & browsers).
  * Kiểm tra **Zero Network Errors** (Status code $< 400$).

### 2.3. Cấp 3: Full Suite (Chỉ Dùng Cho Cổng Release)
* Chạy tuần tự toàn bộ test runner của dự án:
  ```bash
  npm run test && npm run lint && npx tsc --noEmit && npm run build
  ```

---

## Giai đoạn 3: Phân Tích Kết Quả & Báo Cáo

### Nếu PASS 100% (Xanh):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ KIỂM THỬ THÔNG MINH ĐẠT CHUẨN XUẤT SẮC!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 Phạm vi: {Scope đã chọn}
⚡ Thời gian thực thi: {T}s (Tiết kiệm 80% thời gian & Quota)
🧹 Tiến trình: 100% Background processes đã được dọn dẹp (CPU/RAM sạch)
🔌 Database & API: 0 lỗi Ambiguous FK, 100% queries hợp lệ

🚀 Ứng dụng đã sẵn sàng cho bước tiếp theo!
1️⃣ /audit - Kiểm toán bảo mật tổng thể
2️⃣ /deploy - Bàn giao và triển khai production
```

### Nếu FAIL (Đỏ):
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ PHÁT HIỆN LỖI TRONG QUÁ TRÌNH KIỂM THỬ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 Vị trí lỗi: {File / API Route}
🔍 Nguyên nhân: {Giải thích ngắn gọn - áp dụng Failed-First-Fix}
🛠️ Đề xuất sửa: {Cách khắc phục tối thiểu}

👉 Gõ /debug để tự động điều tra nguyên nhân gốc rễ và sửa dứt điểm!
```
