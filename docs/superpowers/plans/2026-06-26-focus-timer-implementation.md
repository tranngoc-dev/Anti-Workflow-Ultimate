# Kế hoạch thực hiện: Focus Timer Web App (Tích hợp Supabase)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng lại trang `/working` của Next.js thành ứng dụng Focus Timer phẳng 1 cột (560px) có âm thanh nền Ambient Sound và đồng bộ dữ liệu trực tuyến qua Supabase.

**Architecture:** Sử dụng React Hooks điều khiển trạng thái tập trung trong `page.js`. Tích hợp Web Audio API cho Ambient Sound động và OscillatorNode cho âm chuông báo hiệu. Sử dụng Supabase Client để đồng bộ thời gian thực với bảng `workspace_todos` và `workspace_pomodoro_history`.

**Tech Stack:** Next.js (React), Supabase SDK, Web Audio API, Vanilla CSS.

## Global Constraints
- Không dùng shadow trong CSS (thiết kế flat).
- Chiều rộng tối đa khung nội dung là 560px.
- Các nút tab chuyển chế độ bị khóa khi timer đang chạy.
- Cài đặt thời gian chỉ có hiệu lực khi timer không hoạt động.
- Trình duyệt cần xin quyền gửi thông báo đẩy (Notification API).

---

## Danh sách các Task triển khai

### Task 1: Cấu trúc CSS và Layout 1 cột tối giản cho `/working`

**Files:**
- Modify: `app/working/working.css`

**Interfaces:**
- Produces: CSS variables và cấu trúc class hỗ trợ Light/Dark mode và 3 màu giao diện tương ứng với 3 chế độ (`.theme-work`, `.theme-short`, `.theme-long`).

- [ ] **Step 1: Viết lại CSS định nghĩa Layout phẳng 1 cột**
  Thay thế toàn bộ nội dung trong `app/working/working.css` bằng cấu trúc CSS phẳng, max-width 560px, căn giữa, định nghĩa các biến màu cho Dark Mode:
  ```css
  :root {
    --bg: #FAFAF7;
    --card-bg: #FFFFFF;
    --border: 0.5px solid rgba(0, 0, 0, 0.08);
    --text: #1C1C1E;
    --text-muted: #8E8E93;
    --accent: #3B6D11; /* Mặc định màu làm việc */
    --accent-light: rgba(59, 109, 17, 0.08);
    --radius-lg: 16px;
    --radius-md: 10px;
    --radius-sm: 8px;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #121211;
      --card-bg: #1E1E1C;
      --border: 0.5px solid rgba(255, 255, 255, 0.08);
      --text: #F2F2F7;
      --text-muted: #8E8E93;
    }
  }

  .theme-work {
    --accent: #3B6D11;
    --accent-light: rgba(59, 109, 17, 0.08);
  }
  .theme-short {
    --accent: #185FA5;
    --accent-light: rgba(24, 95, 165, 0.08);
  }
  .theme-long {
    --accent: #853B0B;
    --accent-light: rgba(133, 59, 11, 0.08);
  }

  body {
    background-color: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .focus-timer-container {
    max-width: 560px;
    margin: 40px auto;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Định nghĩa các style phẳng (no shadow, border-radius chuẩn) cho các block: card, tab, controls, sound-btn */
  .focus-card {
    background: var(--card-bg);
    border: var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
  }
  ```

- [ ] **Step 2: Cập nhật code UI tạm thời ở page.js để kiểm tra layout**
  Chỉnh sửa `app/working/page.js` tạm thời hiển thị container có class `.focus-timer-container` và các thẻ card `.focus-card` để kiểm tra CSS hoạt động chính xác.

- [ ] **Step 3: Chạy dev server để xác nhận giao diện hiển thị**
  Chạy lệnh: `npm run dev`
  Truy cập: `http://localhost:3000/working`
  Kiểm tra giao diện có chuyển sang 1 cột gọn gàng và không còn bóng đổ (shadow), viền 0.5px.

- [ ] **Step 4: Commit thay đổi CSS**
  ```bash
  git add app/working/working.css
  git commit -m "style: init flat 1-column layout for focus timer"
  ```

---

### Task 2: Triển khai Logic Timer, Vòng tròn tiến trình SVG & Tabs chế độ

**Files:**
- Modify: `app/working/page.js`

**Interfaces:**
- Produces: State `mode`, `timeLeft`, `isRunning`. Hàm `switchMode()`, `tick()`, `renderTimer()`.

- [ ] **Step 1: Viết logic Timer đếm ngược trong React**
  Tích hợp logic đếm ngược vào `app/working/page.js`:
  ```javascript
  const [mode, setMode] = useState('work'); // 'work' | 'short' | 'long'
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(state.settingsWork * 60);

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            // Kích hoạt khi đếm ngược kết thúc
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);
  ```

- [ ] **Step 2: Triển khai Vòng tròn SVG tiến trình**
  Vòng tròn có bán kính $r = 52$ pixels, chu vi $C \approx 326.7$. Tính toán `strokeDashoffset`:
  ```javascript
  const totalSeconds = mode === 'work' ? settingsWork * 60 : (mode === 'short' ? settingsShort * 60 : settingsLong * 60);
  const pct = timeLeft / totalSeconds;
  const strokeDashoffset = 326.7 * (1 - pct);
  ```
  Render SVG trong React:
  ```jsx
  <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
    <circle cx="60" cy="60" r="52" stroke="var(--border)" strokeWidth="5" fill="none" />
    <circle 
      cx="60" 
      cy="60" 
      r="52" 
      stroke="var(--accent)" 
      strokeWidth="5" 
      fill="none"
      strokeLinecap="round"
      strokeDasharray="326.7"
      strokeDashoffset={strokeDashoffset}
      style={{ transition: 'stroke-dashoffset 0.5s ease' }}
    />
  </svg>
  ```

- [ ] **Step 3: Khóa các Tabs đổi chế độ khi timer đang chạy**
  ```jsx
  <button 
    disabled={isRunning} 
    onClick={() => handleSwitchMode('work')}
    className={`mode-tab ${mode === 'work' ? 'active' : ''}`}
  >
    Làm việc
  </button>
  ```

- [ ] **Step 4: Kiểm tra hoạt động bằng tay**
  Chạy timer, bấm Start/Pause/Reset. Đảm bảo vòng tròn thu ngắn dần đều và text số phút đếm ngược chính xác.

- [ ] **Step 5: Commit**
  ```bash
  git add app/working/page.js
  git commit -m "feat: implement svg progress ring and timer logic"
  ```

---

### Task 3: Tích hợp Supabase Auth Google & Đồng bộ công việc (Tasks)

**Files:**
- Modify: `app/working/page.js`

**Interfaces:**
- Consumes: Bảng `workspace_todos` trên Supabase.
- Produces: Đọc/Ghi Tasks từ DB và xử lý chọn active task hiển thị ở dưới Timer.

- [ ] **Step 1: Viết hàm fetch Todos ban đầu sau khi Auth**
  ```javascript
  const fetchTodos = async (userId) => {
    const { data, error } = await supabase
      .from('workspace_todos')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setTodos(data || []);
  };
  ```

- [ ] **Step 2: Xây dựng hàm thêm task (max 60 ký tự, mặc định priority 'med')**
  ```javascript
  const handleAddTask = async (title) => {
    if (!title.trim() || title.length > 60) return;
    const { data, error } = await supabase
      .from('workspace_todos')
      .insert({ title: title.trim(), user_id: session.user.id, priority: 'med' })
      .select()
      .single();
    if (!error) setTodos([data, ...todos]);
  };
  ```

- [ ] **Step 3: Xây dựng hàm tick hoàn thành và xóa task**
  - Khi tick xong: `UPDATE workspace_todos SET is_completed = true WHERE id = todoId`. Nếu task đó đang active, set `activeTodo = null`.
  - Khi xóa task: `DELETE FROM workspace_todos WHERE id = todoId`. Nếu task đang active, set `activeTodo = null`.

- [ ] **Step 4: Click chọn active task**
  - Click vào task chưa hoàn thành → set `activeTodo` là task đó. Hiển thị tên task ở chân Timer: `"Đang làm: [Tên Task]"`.
  - Task đã xong hiển thị mờ đi (opacity 0.45) và gạch ngang chữ.

- [ ] **Step 5: Kiểm tra đồng bộ**
  Bấm đăng nhập Google, thêm một vài task, chọn active task, tick hoàn thành. Mở trang admin Supabase kiểm tra data thay đổi tương ứng.

- [ ] **Step 6: Commit**
  ```bash
  git add app/working/page.js
  git commit -m "feat: sync task list with supabase workspace_todos"
  ```

---

### Task 4: Triển khai Âm thanh nền (Ambient Sound) & Chuông báo hết phiên

**Files:**
- Modify: `app/working/page.js`

**Interfaces:**
- Produces: Biến `sound` trong state, AudioContext điều khiển âm mưa, rừng, cafe, white noise qua BiquadFilterNode. OscillatorNode tạo tiếng Zen Bell và Alarm Bíp.

- [ ] **Step 1: Khởi tạo AudioContext (Lazy-init)**
  ```javascript
  let audioCtx = null;
  let sourceNode = null;
  let gainNode = null;

  const initAudio = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  };
  ```

- [ ] **Step 2: Viết hàm tạo White Noise Loop Buffer**
  ```javascript
  const createNoiseBuffer = (ctx) => {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.6;
      }
    }
    return buffer;
  };
  ```

- [ ] **Step 3: Xây dựng hàm phát âm thanh và áp dụng Biquad Filter**
  ```javascript
  const startAmbientSound = (type) => {
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    stopAmbientSound();

    if (type === 'none') return;

    const source = audioCtx.createBufferSource();
    source.buffer = createNoiseBuffer(audioCtx);
    source.loop = true;

    const filter = audioCtx.createBiquadFilter();
    let volume = 0.18;

    if (type === 'rain') {
      filter.type = 'bandpass';
      filter.frequency.value = 1400;
      filter.Q.value = 0.5;
      volume = 0.22;
    } else if (type === 'forest') {
      filter.type = 'lowpass';
      filter.frequency.value = 600;
      volume = 0.12;
    } else if (type === 'cafe') {
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 1.2;
      volume = 0.14;
    } else if (type === 'white') {
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      volume = 0.18;
    }

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 1.5); // Fade-in 1.5s

    source.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    source.start();
    sourceNode = source;
    gainNode = gain;
  };
  ```

- [ ] **Step 4: Viết âm báo hết phiên (OscillatorNode)**
  - Hết phiên làm việc: Tạo tiếng chuông Zen Bell kêu 3 lần. Tần số 440Hz, giảm dần độ lớn.
  - Hết phiên nghỉ: Tạo tiếng bíp ngắn 2 lần. Tần số 880Hz.
  - Tích hợp state `isMuted` để bỏ qua âm báo này nếu `isMuted === true`.

- [ ] **Step 5: Kiểm tra âm thanh**
  Bật timer và chọn âm thanh "🌧 Mưa". Xác nhận âm thanh bắt đầu rào rào tăng dần âm lượng. Bấm pause, âm thanh ngắt ngay. Hết phiên, xác nhận phát tiếng chuông báo rõ ràng.

- [ ] **Step 6: Commit**
  ```bash
  git add app/working/page.js
  git commit -m "feat: add ambient sound generator and alarm oscillator"
  ```

---

### Task 5: Cài đặt thời gian, Session Log, Toast & Thông báo hệ thống

**Files:**
- Modify: `app/working/page.js`

**Interfaces:**
- Consumes: Bảng `workspace_pomodoro_history` trên Supabase.
- Produces: UI Settings, UI Session Log, Browser Notification API.

- [ ] **Step 1: Triển khai Cấu hình thời gian (Settings)**
  - 3 input number tương ứng với 3 chế độ (Làm việc, Nghỉ ngắn, Nghỉ dài).
  - Ràng buộc: `settingsWork` (1-90 phút), `settingsShort` (1-30 phút), `settingsLong` (5-60 phút).
  - Sửa đổi chỉ có hiệu lực khi timer KHÔNG chạy. Khi thay đổi, cập nhật ngay `timeLeft` và re-render vòng tròn.

- [ ] **Step 2: Triển khai Session Log (Nhật ký phiên)**
  - Lưu trữ danh sách nhật ký (tối đa 10 dòng gần nhất) vào `localStorage` của trình duyệt dưới dạng: `{ isWork: boolean, label: string, timestamp: string }`.
  - Khi hoàn thành bất kỳ phiên nào (cả làm việc hay nghỉ), ghi log mới lên đầu danh sách.

- [ ] **Step 3: Triển khai Toast Notification trượt**
  - Khi đếm về 0, kích hoạt Toast hiển thị thông báo tương ứng ("Phiên xong!..." hoặc "Xong nghỉ!...").
  - Thêm class `.show` để trượt xuống, tự động xóa class sau 3 giây.

- [ ] **Step 4: Gửi thông báo đẩy trình duyệt (Notification API)**
  - Hàm check permission và xin quyền lúc load trang.
  - Gọi `new Notification("Hết giờ làm!", { body: "Nghỉ ngơi 5 phút thôi anh!" })` khi tab đang chạy ẩn.

- [ ] **Step 5: Đồng bộ lịch sử phiên làm việc lên Supabase**
  - Khi phiên `work` hoàn thành: `INSERT` lịch sử vào bảng `workspace_pomodoro_history` (todo_id được truyền nếu có active task).
  - Tải lại stats "Phiên hôm nay" và "Phút tập trung" dựa trên dữ liệu hôm nay thu được.

- [ ] **Step 6: Kiểm thử toàn diện và dọn dẹp code thừa**
  Xóa các component cũ không dùng như `NotesWidget.js`, `TodoWidget.js` (hoặc giữ lại file dự phòng nhưng không import). Đảm bảo build thành công không lỗi lint.

- [ ] **Step 7: Commit**
  ```bash
  git add app/working/page.js
  git commit -m "feat: implement settings, session logs, toast and browser notifications"
  ```
