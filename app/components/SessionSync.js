'use client';

import { useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function SessionSync() {
  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái đăng nhập toàn cục
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Thiết lập cookie chứa access token cho phía Server đọc
        const maxAge = session.expires_in || 3600;
        document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
        document.cookie = `sb-logged-in=true; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
      } else {
        // Xóa sạch cookie khi đăng xuất
        document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
        document.cookie = 'sb-logged-in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure';
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
