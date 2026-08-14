---
description: ✨ Khởi tạo dự án mới với Cổng Guardrail và Quản lý Context
---

# WORKFLOW: /init - Khởi Tạo Dự Án Chuẩn Toàn Diện

**Vai trò:** Project Initializer & Architect  
**Mục tiêu:** Nắm bắt ý tưởng dự án, thiết lập workspace chuẩn 4 tầng (AWF, Superpowers, GitNexus, Guardrails), kích hoạt cổng bảo vệ pre-commit.

**NGÔN NGỮ: Luôn trả lời bằng tiếng Việt thân thiện, rõ ràng.**

---

## 🗺️ Vị Trí Trong Quy Trình Khép Kín

```
[/init] ← BẠN ĐANG Ở ĐÂY (Khởi tạo dự án + Cài Guardrails)
   ↓
[/brainstorm] (Làm rõ ý tưởng theo phương pháp Socratic)
   ↓
[/visualize] (Dựng UI Mockup & Design Tokens)
   ↓
[gitnexus analyze] ➔ [/plan] (Lập kế hoạch TDD có tính toán Impact)
   ↓
🔄 [MODULAR HANDOVER ➔ Mở Session mới]
   ↓
[/code] (Subagents TDD + Git Worktree + Cổng Guardrail)
```

---

## Giai đoạn 1: Thu Thập Thông Tin Dự Án (Nhanh Gọn)

Hỏi người dùng 3 câu hỏi cơ bản:
1. **Tên dự án là gì?** (Ví dụ: `coffee-shop-app`, `vibe-crm`)
2. **Mục tiêu chính của ứng dụng?** (1–2 câu mô tả sản phẩm giải quyết vấn đề gì)
3. **Loại ứng dụng dự kiến?** (Web App Next.js/React, Backend API, Mobile, hay Tool/CLI?)

---

## Giai đoạn 2: Khởi Tạo Workspace & Cấu Trúc Thư Mục

Tạo cấu trúc thư mục tiêu chuẩn:

```
{project-name}/
├── .brain/
│   ├── preferences.json       # Cấu hình persona & technical level
│   ├── session.json           # Lưu trạng thái active phase & plan
│   ├── session_log.txt        # Append log nhẹ nhàng
│   └── handovers/             # Checkpoint giữa các session
├── docs/
│   ├── superpowers/
│   │   ├── specs/             # Nơi lưu trữ Spec chi tiết
│   │   └── plans/             # Nơi lưu trữ Implementation Plans
│   └── ideas.md
├── guardrails/                # Cổng kiểm soát pre-commit vật lý
│   ├── guardrail.py
│   ├── install.py
│   ├── policy.json
│   └── hooks/
├── .gemini/
│   ├── GEMINI.md
│   └── mcp_config.json
├── AGENTS.md
├── AI_CODE_WORKFLOW.md
├── GUARDRAILS.md
└── README.md
```

---

## Giai đoạn 3: Thiết Lập Git & Cài Đặt Guardrails

Tự động thực hiện các lệnh khởi tạo:
```bash
# 1. Khởi tạo Git nếu chưa có
git init

# 2. Cài đặt Cổng gác Pre-commit Guardrail
python guardrails/install.py

# 3. Tạo commit đầu tiên
git add .
git commit -m "chore: initial project workspace with anti-workflow guardrails"
```

---

## Giai đoạn 4: Xác Nhận & Điều Hướng Tiếp Theo

Hiển thị thông báo hoàn tất:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ DỰ ÁN ĐÃ ĐƯỢC KHỞI TẠO HOÀN HẢO!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Dự án: {project-name}
🔒 Cổng Guardrail: Đã kích hoạt (Chặn commit main, bảo vệ test)
🧠 Context System: Đã cấu hình (.brain/)

🚀 BƯỚC TIẾP THEO:
1️⃣ /brainstorm - Bàn ý tưởng sâu & thiết kế kiến trúc (Khuyên dùng)
2️⃣ /visualize - Thiết kế UI Mockup & Style guide
3️⃣ /plan - Lên kế hoạch chi tiết nếu đã có sẵn Spec

💡 Gợi ý: Gõ /brainstorm để cùng AI thảo luận và làm rõ tính năng!
```
