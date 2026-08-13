# Tulanh-simple

Phiên bản HTML thuần + Supabase của **Tulanh-simple Blog**.
(100% giao diện giống bản Next.js, không cần server)

## 📦 Cấu trúc thư mục

```
Tulanh-simple/
├── index.html          ← Trang chủ danh sách bài viết
├── post.html           ← Trang đọc bài viết
├── about.html          ← Trang giới thiệu (tạo thêm nếu cần)
├── style.css           ← CSS (copy từ globals.css của Next.js)
├── js/
│   ├── supabase.js     ← Supabase client (cần điền URL + key)
│   ├── auth.js         ← Auth helper (requireAdmin, signOut)
│   ├── layout.js       ← Header/Footer chung
│   ├── posts.js        ← Logic trang chủ
│   └── post.js         ← Logic trang bài viết
├── admin/
│   ├── login.html      ← Đăng nhập admin
│   ├── index.html      ← Dashboard (stat cards + Charts.js)
│   ├── posts.html      ← Quản lý bài viết
│   ├── edit-post.html  ← Tạo/sửa bài viết
│   └── comments.html   ← Quản lý bình luận
└── scripts/
    ├── supabase-setup.sql  ← SQL tạo bảng + RLS policies
    └── migrate-mdx.mjs     ← Script migrate bài từ MDX → Supabase
```

## 🚀 Bắt đầu

### Bước 1: Cài đặt Supabase
1. Vào [supabase.com](https://supabase.com) → Tạo project mới
2. Vào **SQL Editor** → Chạy toàn bộ file `scripts/supabase-setup.sql`
   - Nếu đang nâng cấp từ bản cũ, vẫn chạy lại file này để thêm RPC, RLS và hash mật khẩu bài viết.
3. Vào **Authentication → Users** → Tạo tài khoản admin
4. Thêm user admin vào bảng `admin_users`:
   ```sql
   INSERT INTO admin_users (user_id, email)
   SELECT id, email FROM auth.users WHERE email = 'admin@example.com'
   ON CONFLICT (user_id) DO NOTHING;
   ```
5. Giữ public signup nếu muốn người đọc đăng ký để bình luận. Quyền admin chỉ cấp cho user có trong `admin_users`.

### Bước 2: Cấu hình
Mở file `js/supabase.js` và điền thông tin:
```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY_HERE'
```
Lấy từ: Supabase Dashboard → Project Settings → API

### Bước 3: Migrate bài viết (1 lần duy nhất)
```bash
# Điền SUPABASE_URL và SERVICE_ROLE_KEY vào scripts/migrate-mdx.mjs trước
node scripts/migrate-mdx.mjs
```

### Bước 4: Chạy local để test
```bash
# Cài Live Server extension trong VS Code
# Hoặc dùng Python:
python -m http.server 8080
# Mở trình duyệt: http://localhost:8080
```

## 🌐 Deploy
Upload toàn bộ thư mục này lên:
- **Cloudflare Pages** (Khuyến nghị — miễn phí, CDN toàn cầu)
- **GitHub Pages**
- **Netlify**

Không cần server, không cần Node.js!

## 🔐 Đăng nhập Admin
- URL: `/admin/login.html`
- Dùng email/password đã tạo trên Supabase Authentication

## 🔐 Ghi chú bảo mật bài viết có mật khẩu

Bài viết có mật khẩu không được đọc trực tiếp từ bảng `posts` bằng anon key. Frontend gọi RPC `get_public_post`; database chỉ trả `content` khi mật khẩu đúng. Mật khẩu nhập ở admin được hash bằng `pgcrypto` trước khi lưu.
