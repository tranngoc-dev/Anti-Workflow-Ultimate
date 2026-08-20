# Đặc tả thiết kế: Focus Timer Web App (Tích hợp Supabase)

Tài liệu này đặc tả thiết kế kỹ thuật cho việc xây dựng lại trang `/working` hiện tại trong Next.js thành ứng dụng **Focus Timer** phẳng 1 cột (max-width 560px) có âm thanh nền Ambient Sound và đồng bộ dữ liệu trực tuyến.

---

## 1. Kiến trúc & Cấu trúc Component

Trang `/working` sẽ được chuyển đổi cấu trúc từ dạng dashboard 3 cột sang cấu trúc 1 cột dọc tối giản, kế thừa cơ chế đăng nhập bằng tài khoản Google (Supabase Auth).

### 1.1 Sắp xếp thư mục nguồn
- **Trang chính**: [app/working/page.js](file:///C:/Users/Trong/Desktop/tulanh-simple-Tulanh/app/working/page.js) quản lý State tập trung, kết nối Supabase API, điều phối âm thanh và render layout.
- **Component con**: Các sub-component được khai báo cục bộ hoặc đặt trong thư mục `components/` để tái sử dụng:
  - `<TimerRing />`: Render vòng tròn SVG, hiển thị thời gian đếm ngược và active task.
  - `<TaskList />`: Thẻ nhập và danh sách công việc.
  - `<AmbientSound />`: Các nút chọn và điều khiển âm thanh nền.
  - `<PomoSettings />`: Cấu hình thời gian làm việc và nghỉ ngơi.
  - `<SessionLogList />`: Lịch sử các phiên hoàn thành.
- **Style sheet**: [app/working/working.css](file:///C:/Users/Trong/Desktop/tulanh-simple-Tulanh/app/working/working.css) chứa toàn bộ các khai báo giao diện phẳng, CSS variables cho Light/Dark mode.

---

## 2. Thiết kế Cơ sở dữ liệu & Đồng bộ hóa

Ứng dụng liên kết trực tiếp với PostgreSQL trên Supabase qua 2 bảng chính:

### 2.1 Bảng `workspace_todos`
Dùng để quản lý danh sách công việc:
```sql
CREATE TABLE IF NOT EXISTS public.workspace_todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(60) NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  pomodoros_completed INTEGER DEFAULT 0,
  priority VARCHAR(10) DEFAULT 'med', -- Lưu tương thích ngược
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

- **Thêm task mới**: `INSERT` vào bảng `workspace_todos` với `title` tối đa 60 ký tự, `is_completed: false`, `pomodoros_completed: 0`.
- **Tick hoàn thành**: `UPDATE` trường `is_completed`. Nếu task đang là `activeTodo`, tự động hủy chọn active.
- **Xóa task**: `DELETE` khỏi bảng. Nếu task đang active, đặt `activeTodo` về `null`.

### 2.2 Bảng `workspace_pomodoro_history`
Lưu trữ lịch sử phiên làm việc tập trung để tính toán Stats:
```sql
CREATE TABLE IF NOT EXISTS public.workspace_pomodoro_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  todo_id UUID REFERENCES public.workspace_todos(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

- Khi timer làm việc (`work`) đếm về `0`, `INSERT` bản ghi lịch sử vào bảng này.
- Đồng thời gọi Postgres RPC `increment_todo_pomodoro(todo_id_arg)` để tăng cột `pomodoros_completed` của task tương ứng thêm 1 đơn vị.

---

## 3. Quản lý State trong React

Toàn bộ dữ liệu động được quản lý tập trung tại `WorkingPage`:

```javascript
const [state, setState] = useState({
  mode: 'work',           // Chế độ: 'work' | 'short' | 'long'
  isRunning: false,       // Trạng thái timer chạy hay dừng
  timeLeft: 25 * 60,      // Số giây còn lại của phiên hiện tại
  settingsWork: 25,       // Cấu hình thời gian làm việc (phút)
  settingsShort: 5,       // Cấu hình thời gian nghỉ ngắn (phút)
  settingsLong: 15,       // Cấu hình thời gian nghỉ dài (phút)
  todos: [],              // Danh sách task tải từ Supabase
  activeTodo: null,       // Task đang được chọn để tập trung
  stats: {
    sessionsToday: 0,     // Số phiên làm việc hôm nay
    focusMinutes: 0,      // Tổng số phút làm việc hôm nay
    tasksDone: 0          // Số việc đã tick xong
  },
  sound: 'none',          // Âm thanh nền: 'none' | 'rain' | 'forest' | 'cafe' | 'white'
  logs: []                // Nhật ký phiên cục bộ (tối đa 10 dòng)
});
```

---

## 4. Đặc tả Âm thanh nền (Web Audio API)

Hệ thống Ambient Sound sử dụng `AudioContext` để tạo tiếng white noise động và lọc qua tần số thích hợp.

- **Khởi tạo trễ (Lazy-init)**: Chỉ khởi tạo AudioContext khi người dùng có hành động bấm nút chạy timer hoặc chọn loại âm thanh đầu tiên để vượt qua rào cản Auto-play của trình duyệt.
- **Tạo Noise Buffer**:
  ```javascript
  const bufferSize = audioCtx.sampleRate * 4; // 4 giây
  const buffer = audioCtx.createBuffer(2, bufferSize, audioCtx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.6; // White noise
    }
  }
  ```
- **Biquad Filters cấu hình**:
  - `rain` (Mưa): Lọc `bandpass`, tần số `1400Hz`, Q = `0.5`, Gain = `0.22`.
  - `forest` (Rừng): Lọc `lowpass`, tần số `600Hz`, Gain = `0.12`.
  - `cafe` (Cà phê): Lọc `bandpass`, tần số `800Hz`, Q = `1.2`, Gain = `0.14`.
  - `white` (White noise): Lọc `lowpass`, tần số `800Hz`, Gain = `0.18`.
- **Fade-in & Fade-out**: Khi timer bắt đầu chạy, gain volume sẽ được fade-in từ `0` lên mức cấu hình trong `1.5 giây` bằng `linearRampToValueAtTime`. Khi tạm dừng hoặc tắt, âm lượng fade-out nhanh về `0` trước khi dừng buffer source.

---

## 5. Thiết kế Giao diện (CSS & Responsive)

- **Màu sắc chủ đạo**:
  - Nền trang sáng: `#FAFAF7` (ngà ấm), Nền card: `#FFFFFF`.
  - Nền trang tối: `#121211`, Nền card tối: `#1E1E1C`.
  - Màu nhấn (Accent) thay đổi động qua các class `.theme-work`, `.theme-short`, `.theme-long` gán vào body hoặc container chính.
- **Tiến trình SVG**:
  - Thẻ `circle` tiến trình có bán kính `r = 52`, chu vi `stroke-dasharray="326.7"`.
  - `stroke-dashoffset` được cập nhật liên tục mỗi giây qua thuộc tính CSS `stroke-dashoffset: 326.7 * (1 - pct)`.
  - Thiết lập hiệu ứng chuyển cảnh mượt mà `transition: stroke-dashoffset 0.5s ease`.

---

## 6. Cơ chế Thông báo & Âm báo

- **Toast Notification**: Hiển thị cố định ở đầu màn hình với CSS:
  ```css
  .toast-container {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1000;
  }
  .toast-container.show {
    transform: translateX(-50%) translateY(0);
  }
  ```
- **Chuông báo hết phiên**:
  - Hết phiên làm việc: Tạo `OscillatorNode` phát âm thanh chuông chánh niệm (Zen Bell) ngân vang tần số `440Hz` rồi giảm dần âm lượng 3 lần liên tiếp.
  - Hết phiên nghỉ ngơi: Phát tiếng bíp ngắn tần số `880Hz` trong 0.2 giây liên tục 2 lần.
  - Hỗ trợ biến `isMuted` để bật/tắt toàn bộ âm báo hiệu này.
