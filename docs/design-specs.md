# Design Specifications: Personal Workspace

Tài liệu đặc tả thiết kế giao diện (UI/UX) cho trang Working Space, đảm bảo tính đồng bộ hoàn hảo với hệ thống Design Tokens hiện tại của website (Warm Minimalist).

---

## 🎨 Bảng Màu (Color Palette)

| Tên biến | Mã màu (Hex) | Vai trò trong Workspace |
| :--- | :--- | :--- |
| `--bg` | `#FAFAF7` | Nền trang tổng thể (màu ấm nhạt) |
| `--surface` | `#FFFFFF` | Nền cho các thẻ Widget (Todo, Note, Pomodoro) |
| `--text` | `#1F2937` | Màu chữ chính (đọc tốt) |
| `--muted` | `#6B7280` | Chữ phụ, ghi chú ngày giờ, trạng thái đã hoàn thành |
| `--accent` | `#0F766E` | Màu chính (Teal) cho nút bấm, icon active, trạng thái đang chọn |
| `--accent-hover`| `#0D6D66` | Màu khi hover nút bấm chính |
| `--border` | `#E5E7EB` | Viền ngăn cách nhẹ giữa các phần tử |
| **Màu phụ thêm** | | |
| `--pomo-red` | `#E11D48` | Màu đỏ cà chua cho trạng thái làm việc (Focusing) |
| `--pomo-green` | `#0F766E` | Màu xanh lá cổ vịt cho trạng thái giải lao (Break) |
| `--priority-high`| `#EF4444` | Badge độ ưu tiên Cao (Đỏ) |
| `--priority-med` | `#F59E0B` | Badge độ ưu tiên Trung bình (Vàng) |
| `--priority-low` | `#3B82F6` | Badge độ ưu tiên Thấp (Xanh dương) |

---

## 📝 Typography (Phông chữ & Cỡ chữ)

Dùng font chữ hệ thống **Inter** đã tích hợp sẵn.
- **Tiêu đề Widget:** Cỡ `20px` (`font-weight: 700`, `letter-spacing: -0.02em`).
- **Nội dung chính (Todo item, Note body):** Cỡ `16px` (`font-weight: 400`, `line-height: 1.6`).
- **Nhãn phụ (Badge, Time, Deadline):** Cỡ `13px` (`font-weight: 500`, `color: var(--muted)`).
- **Mặt số đồng hồ Pomodoro:** Cỡ `64px` (`font-weight: 800`, `font-mono`, `letter-spacing: -0.03em`).

---

## 📐 Spacing & Layout (Khoảng cách & Bố cục)

Sử dụng hệ thống Spacing multiples-of-4 của dự án:
- `gap` giữa các cột Dashboard: `24px` (`var(--sp-6)`).
- `padding` trong các thẻ Widget: `24px` (`var(--sp-6)`).
- `gap` giữa các item trong danh sách: `12px` (`var(--sp-3)`).

---

## 🔲 Bo góc & Đổ bóng (Border Radius & Shadows)

- **Bo góc thẻ Widget:** `12px` (`border-radius: 12px` để giữ vẻ hiện đại và nhẹ nhàng).
- **Bo góc nút bấm, input:** `6px` hoặc `8px`.
- **Đổ bóng (Shadow):** Sử dụng đổ bóng cực nhẹ để tạo độ nổi khối (Elevation) tự nhiên trên nền xám ấm:
  - `box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);`
  - Hover shadow (khi di chuột qua card): `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03);`

---

## ✨ Hiệu ứng & Chuyển động (Animations)

Sử dụng `framer-motion` cho các hành động tương tác:
- **Thêm/Xóa Task:** Hiệu ứng fade-in + slide-down khi thêm, và fade-out + shrink-height khi xóa (`duration: 0.2s`, `ease: "easeInOut"`).
- **Chuyển Tab ghi chú:** Hiệu ứng di chuyển mượt mà.
- **Đồng hồ đếm ngược:** Hiệu ứng đập nhẹ (pulse) khi thời gian còn dưới 10 giây.
- **Nút bấm:** Hiệu ứng scale nhẹ khi hover (`whileHover={{ scale: 1.02 }}`) và click (`whileTap={{ scale: 0.98 }}`).

---

## 📱 Khả năng Responsive (Thích ứng thiết bị)
- **Màn hình Desktop (> 1024px):** Bố cục grid 3 cột rõ ràng (`grid-template-columns: 35fr 40fr 25fr`).
- **Màn hình Tablet (768px - 1024px):** Bố cục grid 2 cột (Cột Todo + Pomodoro chiếm cột 1, Ghi chú chiếm cột 2 dài hơn).
- **Màn hình Mobile (< 768px):** Chuyển sang bố cục dọc 1 cột. Người dùng cuộn xuống dưới hoặc có tab thanh điều hướng nhanh ở trên cùng (Todo / Notes / Pomodoro) để chuyển đổi qua lại nhanh chóng.

---

## ⚙️ Thiết kế Trạng thái rỗng (Empty States) & Loading

- **Trạng thái tải trang (Loading):** Hiển thị các khối Skeleton màu xám sáng (`#F3F4F6` với animation nhấp nháy chậm) thay vì dùng vòng xoay spinner thô cứng.
- **Không có task/ghi chú (Empty state):** 
  - Todo list trống: Hiện hình vẽ minh họa nhỏ kèm câu text động viên *"Hôm nay bạn muốn làm gì nào?"* màu xám mờ.
  - Notes trống: Hiện *"Hãy chọn hoặc tạo một ghi chú để bắt đầu viết."*
