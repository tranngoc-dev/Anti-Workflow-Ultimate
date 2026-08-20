import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

const HARD_EXCLUDED_IPS = ['42.114.55.200'];

// Trích xuất IP thực từ các HTTP Request Headers
function getClientIp(request) {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }
  return '127.0.0.1';
}

// 1. GET: Dùng để lấy IP hiển thị ở chân trang (Footer) mà không cần ghi nhận gì vào DB
export async function GET(request) {
  const ip = getClientIp(request);
  return NextResponse.json({ ip });
}

// 2. POST: Ghi nhận bảo mật lượt xem trang hoặc xem bài viết chi tiết
export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const { action, slug, page_path, user_agent, referrer } = body;

    // Lấy cấu hình IP loại trừ mềm từ cơ sở dữ liệu site_settings
    const { data: settingData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'excluded_view_ips')
      .maybeSingle();

    const excludedIps = (settingData?.value || '')
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    const allExcludedIps = [...HARD_EXCLUDED_IPS, ...excludedIps];

    // Chặn ghi nhận nếu IP nằm trong danh sách loại trừ
    if (ip && allExcludedIps.includes(ip)) {
      // Vẫn trả về success: true để phía client không gặp lỗi, nhưng bỏ qua insert
      return NextResponse.json({ success: true, ignored: true, ip });
    }

    if (action === 'visit') {
      // Ghi nhật ký truy cập chung của trang web
      const { error } = await supabase.from('visit_logs').insert([
        {
          ip_address: ip,
          page_path: page_path || '/',
          user_agent: user_agent || 'Unknown',
          referrer: referrer || 'Trực tiếp',
        },
      ]);
      if (error) throw error;
    } else if (action === 'post_view') {
      if (!slug) {
        return NextResponse.json({ error: 'Thiếu slug của bài viết.' }, { status: 400 });
      }

      // Ghi nhận lượt xem chi tiết cho bài viết
      const { error } = await supabase.from('page_views').insert([
        {
          post_slug: slug,
          visitor_ip: ip,
        },
      ]);
      if (error) throw error;
    } else {
      return NextResponse.json({ error: 'Hành động (action) không hợp lệ.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, ip });
  } catch (err) {
    console.error('[API Track] Lỗi ghi nhận thông tin:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
