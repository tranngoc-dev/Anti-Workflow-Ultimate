import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import Tracker from './components/Tracker';
import SessionSync from './components/SessionSync';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import HeaderAuth from './components/HeaderAuth';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

async function getSiteName() {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'site_name')
      .single();
    if (error) throw error;
    return data?.value || 'Tulanh-simple';
  } catch (err) {
    console.error('[RootLayout] Lỗi lấy tên website:', err);
    return 'Tulanh-simple';
  }
}

export async function generateMetadata() {
  const siteName = await getSiteName();
  return {
    title: siteName,
    description: 'Nơi lưu giữ và chia sẻ tri thức miễn phí về thiết kế web, lập trình, và trải nghiệm người dùng.',
    icons: {
      icon: '/images/fridge-logo.png',
    },
  };
}

export default async function RootLayout({ children }) {
  const siteName = await getSiteName();
  const year = new Date().getFullYear();

  return (
    <html lang="vi" className={inter.className}>
      <body>
        <SessionSync />
        <a href="#main-content" className="skip-link">
          Bỏ qua đến nội dung chính
        </a>

        {/* Header */}
        <header className="site-header" role="banner">
          <div className="site-header__inner container-main">
            <a href="/" className="site-header__logo" aria-label={`${siteName} - Trang chủ`}>
              <Image src="/images/fridge-logo.png" alt={siteName} className="site-header__logo-img" width={32} height={32} />
              <span className="site-header__logo-text">{siteName}</span>
            </a>
            <HeaderAuth />
          </div>
        </header>

        {/* Main Content */}
        {children}

        {/* Footer */}
        <footer className="site-footer" role="contentinfo">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
            <span className="site-footer__text" style={{ margin: 0 }}>
              © {year} <span className="dynamic-site-name">{siteName}</span>
            </span>
            
            <span style={{ color: 'var(--muted)', opacity: 0.5 }}>|</span>
            
            <a href="/terms-of-service" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>Điều khoản Dịch vụ</a>
            
            <span style={{ color: 'var(--muted)', opacity: 0.5 }}>|</span>
            
            <a href="/privacy-policy" style={{ color: 'var(--muted)', textDecoration: 'underline' }}>Chính sách Bảo mật</a>
            
            <span style={{ color: 'var(--muted)', opacity: 0.5 }}>|</span>
            
            <span className="site-footer__ip" style={{ margin: 0 }}>
              IP của bạn:{' '}
              <Suspense fallback={<span>Đang tải...</span>}>
                <Tracker />
              </Suspense>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
