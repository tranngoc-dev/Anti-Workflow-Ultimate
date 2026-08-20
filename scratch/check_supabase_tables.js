const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://wamdmopfyhcbljeeclph.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhbWRtb3BmeWhjYmxqZWVjbHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTkxOTAsImV4cCI6MjA5MzM5NTE5MH0.zWu_CLZ2RGCVaY_Tbj81V1xAJOI6xbgaPnnpxgnt7cg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  console.log('Đang kiểm tra bảng mindmaps...');
  try {
    const { data, error } = await supabase.from('mindmaps').select('*').limit(1);
    if (error) {
      console.log('Lỗi truy vấn bảng mindmaps:', error.message);
      if (error.message.includes('does not exist')) {
        console.log('-> Bảng mindmaps CHƯA TỒN TẠI.');
      } else {
        console.log('-> Bảng mindmaps có thể đã tồn tại nhưng gặp lỗi khác.');
      }
    } else {
      console.log('-> Bảng mindmaps ĐÃ TỒN TẠI. Dữ liệu thử:', data);
    }
  } catch (err) {
    console.error('Lỗi kết nối:', err);
  }
}

check();
