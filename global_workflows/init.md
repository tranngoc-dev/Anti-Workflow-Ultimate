---
description: ✨ Tự động khởi tạo dự án mới hoặc Tích hợp vào dự án đang làm
---

# WORKFLOW: /init - Khởi Tạo Hoặc Tích Hợp Dự Án Tự Động 100%

**Vai trò:** Project Initializer & Auto-Onboarding Lead  
**Mục tiêu:** Tự động phát hiện loại dự án (Mới hoàn toàn hay Đang phát triển), tự động cài đặt bộ quy tắc, cổng Guardrail và quét đồ thị GitNexus mà **không làm mất bất kỳ dòng code cũ nào**.

**NGÔN NGỮ: Luôn trả lời bằng tiếng Việt thân thiện, rõ ràng.**

---

## 🔍 Giai đoạn 0: Tự Động Nhận Diện Ngữ Cảnh Thư Mục (Smart Detection)

AI tự động kiểm tra thư mục hiện tại:
* **Nếu thư mục ĐÃ CÓ code** (có `package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, hoặc thư mục `.git/`):
  $\longrightarrow$ **Kích hoạt [KỊCH BẢN B: TÍCH HỢP DỰ ÁN ĐANG LÀM]** (Tự động 100%).
* **Nếu thư mục TRỐNG hoặc chỉ mới tạo:**
  $\longrightarrow$ **Kích hoạt [KỊCH BẢN A: KHỞI TẠO DỰ ÁN MỚI]**.

---

## 🌟 KỊCH BẢN A: KHỞI TẠO DỰ ÁN MỚI (Từ đầu)

1. **Hỏi nhanh người dùng 3 thông tin:**
   - Tên dự án là gì?
   - Mục tiêu chính của app?
   - Loại app (Web Next.js/React, Backend API, Mobile, CLI)?
2. **Tạo cấu trúc workspace chuẩn:**
   - Tạo `.brain/`, `docs/superpowers/specs/`, `docs/superpowers/plans/`.
   - Cài đặt `guardrails/` và chạy `python guardrails/install.py`.
   - Tạo file `AI_CODE_WORKFLOW.md`, `GEMINI.md`, `AGENTS.md`, `GUARDRAILS.md`, `README.md`.
3. **Khởi tạo Git và First Commit:**
   ```bash
   git init
   git add .
   git commit -m "chore: initial project workspace with anti-workflow guardrails"
   ```
4. **Hướng dẫn bước tiếp theo:** Gợi ý `/brainstorm` hoặc `/visualize`.

---

## ⚡ KỊCH BẢN B: TÍCH HỢP TỰ ĐỘNG VÀO DỰ ÁN ĐANG LÀM (Zero-Manual Steps)

Nếu phát hiện đây là dự án đang phát triển, AI **TỰ ĐỘNG THỰC HIỆN TOÀN BỘ CÁC BƯỚC SAU MÀ KHÔNG CẦN NGƯỜI DÙNG LÀM THỦ CÔNG**:

### Bước 1: Bảo Toàn Mã Nguồn & Tạo Cấu Trúc Bổ Trợ
* Giữ nguyên 100% mã nguồn, file cấu hình và lịch sử Git hiện có.
* Tự động tạo thư mục `.brain/` và `docs/superpowers/` nếu chưa có.
* Copy/tạo các file quy tắc: `AI_CODE_WORKFLOW.md`, `GEMINI.md`, `AGENTS.md`, `GUARDRAILS.md`.

### Bước 2: Tự Động Cài Đặt & Cấu Hình Guardrails
1. Copy thư mục `guardrails/` vào thư mục gốc dự án.
2. Tự động kích hoạt Git Hook:
   ```bash
   python guardrails/install.py
   ```
3. **Tự động nhận diện công nghệ để cấu hình `guardrails/policy.json`:**
   * Nếu là Node.js (`package.json`): Tự động trích xuất các lệnh `test`, `lint`, `typecheck`, `build`, `test:e2e`.
   * Nếu là Python: Cấu hình `pytest`, `ruff`, `mypy`, `build`.
   * Nếu là Rust/Go: Cấu hình `cargo`/`go`.

### Bước 3: Tự Động Quét Bản Đồ Kiến Trúc Bằng GitNexus
* Tự động chạy quét đồ thị toàn bộ codebase hiện tại:
  ```bash
  npx gitnexus analyze
  ```
* GitNexus sẽ phân tích AST toàn bộ các file, xác định các API routes, function calls, clusters và contract interfaces.

### Bước 4: Báo Cáo Hoàn Tất Tích Hợp (Executive Dashboard)

Hiển thị thông báo hoàn tất:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ ĐÃ TỰ ĐỘNG TÍCH HỢP ANTI-WORKFLOW VÀO DỰ ÁN HIỆN TẠI!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Dự án: {Project Name} (Công nghệ nhận diện: {Tech Stack})
🔒 Cổng Guardrail: ĐÃ CÀI ĐẶT & KÍCH HOẠT (Bảo vệ nhánh main, ép test thật)
🧠 Bản đồ GitNexus: ĐÃ QUÉT XONG ({N} files, {M} symbols, {K} API routes)
📦 Ngữ cảnh dự án: Đã khởi tạo .brain/ và docs/superpowers/

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 BƯỚC TIẾP THEO ANH NÊN CHỌN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ /audit - Khám tổng quát dự án hiện tại (Tìm lỗi tiềm ẩn & xung đột DB) ⭐ Khuyên dùng
2️⃣ /plan - Lên kế hoạch phát triển tính năng mới
3️⃣ /debug - Sửa một lỗi đang phát sinh trong dự án
4️⃣ /test - Chạy kiểm thử toàn bộ hệ thống hiện tại
```
