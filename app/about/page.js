export const metadata = {
  title: 'Giới thiệu — Tủ lạnh',
  description: 'Tulanh-simple là blog tối giản, tập trung vào nội dung, thiết kế web, frontend và trải nghiệm người dùng.',
};

export default function AboutPage() {
  return (
    <main id="main-content" className="post-container">
      <article className="post-article">
        <header className="post-header">
          <h1>Giới thiệu</h1>
          <div className="post-meta">
            <span className="dynamic-site-name">Tulanh-simple</span>
          </div>
        </header>

        <div className="prose">
          <p>
            Tulanh-simple là nơi chia sẻ các ghi chú thực tế về thiết kế web,
            frontend và trải nghiệm người dùng. Mục tiêu của blog là giữ giao
            diện tối giản, dễ đọc và tập trung vào nội dung chính.
          </p>
          <p>
            Các bài viết ưu tiên ví dụ rõ ràng, bố cục cân bằng và những quyết
            định thiết kế có thể áp dụng trực tiếp vào sản phẩm thật.
          </p>
        </div>
      </article>
    </main>
  );
}
