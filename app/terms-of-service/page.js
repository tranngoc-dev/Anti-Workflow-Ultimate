import React from 'react';

export const metadata = {
  title: 'Điều khoản Dịch vụ - Tủ Lạnh Simple',
  description: 'Điều khoản dịch vụ khi sử dụng Tủ Lạnh Simple.',
};

export default function TermsOfServicePage() {
  return (
    <main id="main-content" className="container-main" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.7' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-dark)' }}>Điều khoản Dịch vụ</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>1. Chấp nhận Điều khoản</h2>
        <p>Bằng việc truy cập và sử dụng website Tủ Lạnh Simple (bao gồm cả công cụ Sơ đồ tư duy), bạn đồng ý tuân thủ các Điều khoản Dịch vụ này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản, vui lòng ngừng sử dụng dịch vụ của chúng tôi.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>2. Sử dụng Dịch vụ</h2>
        <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>Bạn cam kết cung cấp thông tin chính xác (bao gồm email) khi sử dụng tính năng đăng nhập Google.</li>
          <li>Bạn chịu trách nhiệm về mọi nội dung, ý tưởng, sơ đồ tư duy mà bạn tạo ra trên nền tảng của chúng tôi.</li>
          <li>Nghiêm cấm sử dụng website cho các mục đích vi phạm pháp luật, phát tán nội dung độc hại hoặc quấy rối người khác.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>3. Quyền Sở hữu Trí tuệ</h2>
        <p>Tất cả mã nguồn, giao diện, logo và tính năng của Tủ Lạnh Simple thuộc sở hữu của quản trị viên. Các nội dung, bài viết, và sơ đồ tư duy do người dùng tạo ra vẫn thuộc quyền sở hữu của người dùng đó, tuy nhiên bạn cấp quyền cho chúng tôi lưu trữ và hiển thị chúng trên nền tảng (theo thiết lập bảo mật của bạn).</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>4. Giới hạn Trách nhiệm</h2>
        <p>Chúng tôi cung cấp dịch vụ "như hiện trạng" và không đảm bảo rằng website sẽ hoạt động liên tục không gián đoạn hoặc không có lỗi. Chúng tôi không chịu trách nhiệm cho bất kỳ tổn thất dữ liệu nào do sự cố kỹ thuật hoặc lỗi phát sinh từ phía người dùng.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>5. Thay đổi Điều khoản</h2>
        <p>Chúng tôi có quyền cập nhật và sửa đổi Điều khoản Dịch vụ này vào bất kỳ lúc nào. Những thay đổi sẽ được thông báo ngay trên website và việc bạn tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp nhận các điều khoản mới.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>6. Liên hệ</h2>
        <p>Nếu bạn có bất kỳ câu hỏi nào về Điều khoản này, vui lòng liên hệ với ban quản trị thông qua địa chỉ email hỗ trợ.</p>
      </section>
    </main>
  );
}
