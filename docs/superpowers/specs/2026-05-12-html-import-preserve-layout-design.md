# HTML Import Preserve Layout Design

**Goal**

Khi admin import một file HTML hoàn chỉnh, web phải giữ gần như nguyên bản cấu trúc hiển thị và CSS gốc của file đó ở trang public.

**Scope**

- Luồng import HTML ở `admin/posts.html`
- Luồng render bài public ở `js/post.js`
- Luồng export HTML ở `admin/posts.html`
- Gợi ý biên tập ở `admin/edit-post.html`

**Decisions**

- Không convert HTML import sang Markdown.
- Lưu nguyên chuỗi HTML gốc vào `posts.content`.
- Phân biệt bài HTML import bằng heuristic `full HTML document` thay vì đổi schema DB.
- Render bài HTML import trong `iframe srcdoc` để cô lập CSS với `style.css` của web.
- `iframe` dùng `sandbox="allow-same-origin"` để chặn script nhưng vẫn cho parent đọc chiều cao và auto-resize.
- Khi export bài dạng này, trả lại nguyên nội dung HTML gốc.

**Non-goals**

- Không thay đổi schema Supabase.
- Không chuẩn hóa lại nội dung hoặc CSS của file HTML gốc.
- Không cố trộn CSS của bài import vào layout hiện tại.

**Risks**

- Heuristic nhận diện HTML document dựa trên `<html>` / `<!doctype html>`; các fragment HTML không nằm trong phạm vi này.
- Reading time của bài HTML cần strip tag trước khi tính để tránh số phút đọc bị sai.
