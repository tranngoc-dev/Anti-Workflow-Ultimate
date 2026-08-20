'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ipAddress, setIpAddress] = useState('Đang tải...');

  useEffect(() => {
    // Chỉ chạy tracking và lấy IP ở phía Client
    async function trackVisit() {
      let ip = '';
      
      // 1. Lấy địa chỉ IP thực thông qua API Route nội bộ (chống Adblocker chặn)
      try {
        const response = await fetch('/api/track', { cache: 'no-store' });
        if (!response.ok) throw new Error('Không thể lấy IP từ API nội bộ');
        const data = await response.json();
        ip = data?.ip || '';
        setIpAddress(ip || 'Không rõ');
      } catch (error) {
        console.warn('[Tracker] Lỗi lấy IP người dùng từ server:', error);
        setIpAddress('Không rõ');
        return;
      }

      // Không chạy logic ghi nhận nếu đang ở trang Admin để tránh loãng data nhật ký
      if (pathname.startsWith('/admin')) {
        return;
      }

      // 2. Ghi nhận lượt xem thông qua API Route nội bộ
      try {
        const ipLogKey = `tulanh_ip_logged_${ip}`;
        if (localStorage.getItem(ipLogKey)) {
          // Bỏ qua nếu IP này vừa được log gần đây trên thiết bị để tránh trùng lặp liên tục
          return;
        }

        const pagePath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
        const userAgent = navigator.userAgent;
        const referrer = document.referrer || 'Trực tiếp';

        const trackRes = await fetch('/api/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'visit',
            page_path: pagePath,
            user_agent: userAgent,
            referrer: referrer,
          }),
        });

        if (trackRes.ok) {
          const trackData = await trackRes.json();
          if (trackData.success && !trackData.ignored) {
            localStorage.setItem(ipLogKey, 'true');
          }
        }
      } catch (err) {
        console.error('[Tracker] Lỗi gửi yêu cầu ghi nhận truy cập:', err);
      }
    }

    trackVisit();
  }, [pathname, searchParams]);

  return (
    <span id="visitor-ip" className="visitor-ip-text">
      {ipAddress}
    </span>
  );
}
