# Phase 03: Frontend Core Layout & UI Widgets
Status: ⬜ Pending
Dependencies: Phase 02

## Objective
Xây dựng giao diện tĩnh (Mockup & Local State) cho Dashboard Workspace 3 cột sử dụng CSS hiện đại, Lucide React icons và Framer Motion. Giao diện phải mang phong cách premium, tối giản, hỗ trợ responsive tốt.

## Requirements
### Functional
- [ ] Xây dựng khung Dashboard 3 cột:
  - Cột 1: Todo List Widget.
  - Cột 2: Ghi Chú Đa Tab Widget.
  - Cột 3: Pomodoro Timer Widget.
- [ ] **Giao diện Todo List:**
  - Form thêm mới task (nhập title, chọn Priority: High/Medium/Low, chọn Deadline).
  - List task scroll được, mỗi item có checkbox, hiển thị badge priority, ngày deadline, và một nút "Focus" (để chọn làm task active cho Pomodoro).
- [ ] **Giao diện Ghi Chú:**
  - Sidebar phụ bên trong cột hiển thị danh sách các trang ghi chú (nút thêm note mới, danh sách note, nút xóa note).
  - Khu vực soạn thảo chính: Tiêu đề note, thanh công cụ định dạng (In đậm `B`, In nghiêng `I`, Gạch đầu dòng `•`), và vùng soạn thảo Rich Text (sử dụng div `contentEditable`).
- [ ] **Giao diện Pomodoro Timer:**
  - Đồng hồ hiển thị thời gian số lớn (ví dụ: `25:00`).
  - Trạng thái hiện tại: "Focusing 🎯" hoặc "Short Break ☕".
  - Các nút Start / Pause / Reset.
  - Widget hiển thị task đang active làm mục tiêu (ví dụ: "Đang làm: Viết báo cáo tuần").
  - Hộp thống kê cà chua trong ngày (ví dụ: vẽ các icon 🍅 nhỏ tương ứng số phiên hoàn thành).

### Non-Functional
- [ ] UI hiện đại, thanh thoát, bo góc mịn (border-radius lớn), đổ bóng mềm mại, sử dụng CSS variables cho màu sắc (phù hợp với giao diện tối/sáng của dự án gốc).
- [ ] Sử dụng `framer-motion` cho các hiệu ứng thêm/xóa task hoặc chuyển đổi tab ghi chú để tạo cảm giác mượt mà (premium feel).

## Implementation Steps
1. [ ] Cài đặt hoặc import các icon cần thiết từ `lucide-react`.
2. [ ] Thiết kế layout grid/flexbox trong file `app/working/working.css` để đảm bảo layout Dashboard chia 3 cột đẹp mắt trên màn hình PC và chuyển thành 1 cột trên Mobile/Tablet.
3. [ ] Viết các component React tĩnh ngay trong file `app/working/page.js` hoặc tách thành các file nhỏ hơn trong thư mục `app/working/components` nếu code quá dài:
   - `TodoWidget.js`
   - `NotesWidget.js`
   - `PomodoroWidget.js`
4. [ ] Sử dụng React Local State (`useState`) để lưu trữ dữ liệu giả lập (mock data) nhằm kiểm tra các thao tác: bấm check hoàn thành, chọn tab ghi chú, gõ chữ, bấm nút start chạy đồng hồ (giả lập giảm giây).

## Files to Create/Modify
- `[NEW] app/working/components/TodoWidget.js` - Giao diện Todo List.
- `[NEW] app/working/components/NotesWidget.js` - Giao diện Ghi chú đa tab & soạn thảo.
- `[NEW] app/working/components/PomodoroWidget.js` - Giao diện đồng hồ Pomodoro.
- `[MODIFY] app/working/page.js` - Import và sắp xếp các Component vào layout 3 cột chính.
- `[MODIFY] app/working/working.css` - Bổ sung styles chi tiết cho từng widget và hiệu ứng.

## Test Criteria
- [ ] Dashboard hiển thị đúng bố cục 3 cột trên màn hình lớn.
- [ ] Form thêm todo hoạt động ở client-side (thêm item vào danh sách tạm thời).
- [ ] Chọn các tab ghi chú khác nhau hiển thị đúng nội dung ghi chú tương ứng.
- [ ] Bấm in đậm/in nghiêng trên thanh công cụ ghi chú có tác dụng định dạng text đang soạn thảo.
- [ ] Giao diện co giãn (responsive) tốt trên thiết bị di động (Mobile).
