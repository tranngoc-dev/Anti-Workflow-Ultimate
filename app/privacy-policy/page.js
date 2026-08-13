import React from 'react';

export const metadata = {
  title: 'Chính sách Bảo mật - Tủ Lạnh Simple',
  description: 'Chính sách bảo mật quyền riêng tư khi sử dụng Tủ Lạnh Simple.',
};

export default function PrivacyPolicyPage() {
  return (
    <main id="main-content" className="container-main" style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.7' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--text-dark)' }}>Chính sách Bảo mật (Privacy Policy)</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>

      <section style={{ marginBottom: '2rem' }}>
        <p>Tại Tủ Lạnh Simple, quyền riêng tư của bạn là ưu tiên hàng đầu của chúng tôi. Chính sách này mô tả các loại thông tin cá nhân mà chúng tôi thu thập, cách thức sử dụng và cách chúng tôi bảo vệ thông tin đó.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>1. Thông tin chúng tôi thu thập</h2>
        <p>Khi bạn sử dụng tính năng "Đăng nhập bằng Google", chúng tôi chỉ thu thập các thông tin cơ bản được cung cấp bởi tài khoản Google của bạn, bao gồm:</p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li><strong>Địa chỉ Email:</strong> Được dùng để định danh tài khoản và liên lạc khi cần thiết.</li>
          <li><strong>Tên hiển thị:</strong> Được dùng để hiển thị trên giao diện người dùng và trong khu vực quản lý sơ đồ tư duy.</li>
          <li><strong>Ảnh đại diện (Avatar):</strong> Được hiển thị trên header để cá nhân hóa trải nghiệm của bạn.</li>
        </ul>
        <p style={{ marginTop: '0.5rem' }}>Chúng tôi hoàn toàn không truy cập hay lấy bất kỳ dữ liệu nhạy cảm nào khác từ tài khoản Google của bạn (như danh bạ, email riêng tư, hay tệp trên Drive).</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>2. Cách chúng tôi sử dụng thông tin</h2>
        <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>Cung cấp, vận hành và duy trì hệ thống đăng nhập tài khoản.</li>
          <li>Lưu trữ cá nhân hóa: liên kết các sơ đồ tư duy (mindmaps) mà bạn đã tạo với tài khoản của chính bạn.</li>
          <li>Ngăn chặn các hành vi giả mạo, spam hoặc lạm dụng hệ thống.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>3. Bảo mật dữ liệu của bạn</h2>
        <p>Toàn bộ thông tin cá nhân của bạn được lưu trữ một cách an toàn thông qua nền tảng Supabase - một nhà cung cấp cơ sở dữ liệu tuân thủ các tiêu chuẩn bảo mật quốc tế. Mật khẩu hay token đăng nhập được quản lý trực tiếp bởi hệ thống bảo mật của Google và Supabase, chúng tôi không xem được và không lưu trữ mật khẩu của bạn dưới bất kỳ hình thức nào.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>4. Chia sẻ thông tin</h2>
        <p>Chúng tôi cam kết <strong>không bán, không trao đổi và không chia sẻ</strong> thông tin cá nhân của bạn cho bất kỳ bên thứ ba nào vì mục đích thương mại. Thông tin chỉ có thể được tiết lộ nếu có yêu cầu hợp pháp từ các cơ quan chức năng có thẩm quyền.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>5. Quyền của người dùng</h2>
        <p>Bạn có toàn quyền yêu cầu xóa bỏ hoàn toàn tài khoản và mọi dữ liệu liên quan (bao gồm cả các sơ đồ tư duy) khỏi hệ thống của chúng tôi bất cứ lúc nào. Vui lòng liên hệ với ban quản trị để thực hiện quyền này.</p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>6. Liên hệ</h2>
        <p>Mọi thắc mắc về chính sách bảo mật này, xin vui lòng gửi phản hồi về địa chỉ email của ban quản trị.</p>
      </section>
    </main>
  );
}
