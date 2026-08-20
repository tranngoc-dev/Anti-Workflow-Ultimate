# Knowledge & Learnings Base

### [LEARNING-20260815-01] Ambiguous Foreign Key in PostgREST Queries
- 📍 **Triệu chứng & Phân loại:** Deterministic - HTTP 400 Bad Request
- 🔍 **Nguyên nhân gốc rễ (Root Cause):** Bảng questions có nhiều hơn 1 Foreign Key tới profiles (author_id và reviewer_id).
- 💡 **Giải pháp chuẩn (Proven Fix):** Luôn dùng Explicit FK Hint: `supabase.from('questions').select('*, profiles!author_id(*)')`.
- 🚫 **Anti-Pattern cần tránh:** Cấm dùng cú pháp ngầm định `profiles(*)`.

### [LEARNING-20260816-02] Rate Limit Handling with Backoff
- 📍 **Triệu chứng & Phân loại:** Transient - HTTP 429 Too Many Requests
- 🔍 **Nguyên nhân:** Gọi API quá tần suất giới hạn.
- 💡 **Giải pháp:** Áp dụng Exponential Backoff với Jitter (1s, 2s, 4s).
