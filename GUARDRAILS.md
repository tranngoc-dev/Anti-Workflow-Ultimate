# Strict AI Coding Guardrails - Cổng Kiểm Soát Vật Lý

Bộ này tạo một cổng kiểm tra bắt buộc cho mọi dự án Git. Nó chặn commit khi không chứng minh được rằng các kiểm tra cần thiết đã đạt. Nó không cài dependency bừa bãi, không gửi dữ liệu ra ngoài và **tuyệt đối không tự ý deploy**.

---

## 1. Cài đặt trên máy (Windows & POSIX)

Mở terminal tại thư mục gốc dự án và chạy:

```bash
# Windows / Linux / macOS
python guardrails/install.py
```

*(Trên Linux/macOS, có thể chạy `python3 guardrails/install.py`).*

Installer cấu hình repository hiện tại sử dụng hook phiên bản tại `guardrails/hooks`. Nó ghi lại giá trị `core.hooksPath` cũ để có thể rollback an toàn bất kỳ lúc nào.

> ⚠️ **Lưu ý quan trọng:** Luôn làm việc trên feature branch. Commit trực tiếp trên `main` và `master` sẽ bị chặn cứng.

---

## 2. Khai báo Lệnh Kiểm tra trong `guardrails/policy.json`

Mỗi lệnh là một mảng đối số thực thi thật (không dùng lệnh giả):

```json
{
  "protected_branches": ["main", "master"],
  "commands": {
    "tests": [["npm", "test"]],
    "lint": [["npm", "run", "lint"]],
    "typecheck": [["npx", "tsc", "--noEmit"]],
    "build": [["npm", "run", "build"]]
  },
  "debug_markers": ["DEBUG_ONLY", "console.log"],
  "allowlist": []
}
```

* Đối với Python: dùng `pytest`, `ruff`, `mypy`, `build`.
* Đối với Node/TypeScript: tự động nhận diện `test`, `lint`, `typecheck`, `build` từ `package.json`.
* Đối với Go / Rust: dùng `go test`, `cargo test`, `cargo check`.

---

## 3. Khi Bị Chặn Commit

Thông báo luôn chỉ rõ rule bị vi phạm, file/dòng liên quan và giải pháp sửa chữa an toàn. 
Tuyệt đối không dùng `git commit --no-verify` để lách cổng. Mọi lỗi gác cổng là bằng chứng kỹ thuật cần điều tra và xử lý dứt điểm.

---

## 4. Rollback Guardrails

Để khôi phục thiết lập Git hook ban đầu:
```bash
# Nếu trước đó chưa có hook tùy chỉnh:
git config --local --unset core.hooksPath

# Hoặc khôi phục giá trị cũ từ .git/guardrails/previous-hooks-path
```
