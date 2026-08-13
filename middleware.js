import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Khởi tạo các giá trị Supabase từ môi trường (có fallback)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wamdmopfyhcbljeeclph.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbWRtb3BmeWhjYmxqZWVjbHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTkxOTAsImV4cCI6MjA5MzM5NTE5MH0.zWu_CLZ2RGCVaY_Tbj81V1xAJOI6xbgaPnnpxgnt7cg';

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Lấy access token từ cookie trình duyệt
  const token = request.cookies.get('sb-access-token')?.value;

  // Nếu không có token, chuyển hướng HTTP 302 ngay lập tức về trang đăng nhập
  if (!token) {
    console.log(`[Middleware] Chặn truy cập không hợp lệ vào ${pathname} (Không có cookie token)`);
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    // Khởi tạo một Supabase Client tạm thời với quyền hạn của chính Token này
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // 1. Xác thực xem Token còn hoạt động không
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.warn(`[Middleware] Token không hợp lệ hoặc đã hết hạn:`, userError?.message);
      return redirectWithClearCookies(request);
    }

    // 2. Gọi RPC `is_admin` của Supabase để kiểm tra xem tài khoản này có quyền admin thực sự không
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
    if (adminError || isAdmin !== true) {
      console.warn(`[Middleware] Tài khoản ${user.email} cố gắng truy cập admin nhưng không có quyền (is_admin = false):`, adminError?.message);
      return redirectWithClearCookies(request);
    }

    // Nếu mọi bước xác thực thành công, cho phép tiếp tục tải trang
    return NextResponse.next();
  } catch (err) {
    console.error(`[Middleware] Gặp lỗi nghiêm trọng khi xác thực session:`, err);
    return redirectWithClearCookies(request);
  }
}

// Hàm phụ xóa cookie không hợp lệ và chuyển hướng về trang login để tránh lặp vô hạn
function redirectWithClearCookies(request) {
  const response = NextResponse.redirect(new URL('/admin/login', request.url));
  response.cookies.set('sb-access-token', '', { path: '/', expires: new Date(0) });
  response.cookies.set('sb-logged-in', '', { path: '/', expires: new Date(0) });
  return response;
}

// Cấu hình matcher để chặn toàn bộ các trang con trong admin ngoại trừ trang đăng nhập admin/login
export const config = {
  matcher: [
    /*
     * Chặn toàn bộ các URL bắt đầu bằng /admin
     * nhưng LOẠI TRỪ /admin/login, các tệp tĩnh (tải ảnh, css, js)
     */
    '/admin/((?!login|api|_next/static|_next/image|favicon.ico|images).*)',
    // Cũng chặn luôn cả chính đường dẫn root /admin
    '/admin',
  ],
};
