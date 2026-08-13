# Strict AI Coding Guardrails

Bộ này tạo một cổng kiểm tra bắt buộc cho mọi dự án Git. Nó chặn commit khi không chứng minh được rằng các kiểm tra cần thiết đã đạt. Nó không cài dependency, không gửi dữ liệu ra ngoài và **never deploys**.

## Cài đặt trên máy

Đặt toàn bộ các file của bộ rule tại thư mục gốc dự án, mở terminal ở đúng thư mục đó rồi chạy:

```bash
python3 guardrails/install.py
```

Trên Windows, nếu lệnh `python3` không tồn tại, hãy thử `python guardrails/install.py`. Hook mặc định vẫn gọi `python3`; anh cần có Python 3 trong `PATH` hoặc đổi đúng executable trong `guardrails/hooks/pre-commit`.

Installer chỉ cấu hình repository hiện tại dùng hook có version tại `guardrails/hooks`. Nó ghi lại giá trị `core.hooksPath` cũ để rollback và có thể chạy lặp lại an toàn.

Luôn làm việc trên feature branch; commit trực tiếp trên `main` và `master` bị chặn.

## Khai báo lệnh kiểm tra

Sửa `guardrails/policy.json`. Mỗi lệnh là một mảng đối số, không phải chuỗi shell:

```json
{
  "protected_branches": ["main", "master"],
  "commands": {
    "tests": [["python3", "-m", "pytest"]],
    "lint": [["ruff", "check", "."]],
    "typecheck": [["mypy", "."]],
    "build": [["python3", "-m", "build"]]
  },
  "debug_markers": ["DEBUG_ONLY"],
  "allowlist": []
}
```

Node được tự nhận diện khi `package.json` khai báo đủ `test`, `lint`, `typecheck` và `build`. Go và Rust dùng các lệnh compiler/test tiêu chuẩn. Python không có một bộ lệnh chuẩn duy nhất nên phải khai báo rõ. Công nghệ chưa hỗ trợ cũng phải khai báo lệnh; thiếu hoặc mơ hồ sẽ bị chặn.

## Khi bị chặn

Thông báo luôn chỉ ra rule, file/dòng liên quan và bước sửa an toàn nhất. Chạy chính lệnh được báo, sửa nguyên nhân rồi commit lại.

Ngoại lệ false positive chỉ được thêm vào `allowlist` theo đúng rule và path, kèm lý do:

```json
{"rule": "source.debug-marker", "path": "tests/fixture.txt", "reason": "Intentional scanner fixture"}
```

Không dùng `git commit --no-verify`. Local hook có thể bị cố ý bỏ qua bằng `--no-verify` hoặc bằng cách đổi Git config; đây là giới hạn của mọi local hook.

## GitHub

Workflow có sẵn sẽ chạy lại cùng engine khi push và khi mở pull request. Sau khi đưa dự án lên GitHub, bật **branch protection** cho `main`/`master`, yêu cầu pull request và đặt status check `guardrails` là bắt buộc. Workflow không tự thay đổi thiết lập GitHub.

## Rollback

Installer ghi cấu hình cũ tại đường dẫn Git trả về cho `.git/guardrails/previous-hooks-path`. Để rollback:

1. Đọc giá trị trong file đó.
2. Nếu rỗng, chạy `git config --local --unset core.hooksPath`.
3. Nếu có giá trị, chạy `git config --local core.hooksPath "<giá-trị-cũ>"`.
4. Xóa `.github/workflows/guardrails.yml` nếu không muốn chạy cổng trên GitHub.
5. Chỉ sau đó mới xóa thư mục `guardrails/` và tài liệu này nếu muốn gỡ hoàn toàn.

Rollback không thay đổi application data, production hay remote settings.

## Giới hạn

- Đây là cổng kỹ thuật, không thể chứng minh mọi bước suy luận của AI.
- Scanner secret dùng mẫu có độ tin cậy cao, không thay thế security review chuyên biệt.
- GitHub branch protection phải được chủ repository bật thủ công.
- Bộ này không tạo hoặc chạy deployment; production vẫn cần người dùng test live và phê duyệt rõ ràng.
