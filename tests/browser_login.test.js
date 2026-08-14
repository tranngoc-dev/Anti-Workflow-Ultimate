const { chromium } = require('playwright');

(async () => {
  console.log('Khởi chạy trình duyệt Google Chrome...');
  // Sử dụng channel 'chrome' để chạy trực tiếp trình duyệt Google Chrome có sẵn trên máy của Sếp
  const browser = await chromium.launch({ 
    headless: false, 
    channel: 'chrome',
    slowMo: 150 // Làm chậm 150ms từng thao tác để Sếp nhìn rõ quá trình tự động nhập liệu
  });
  
  const page = await browser.newPage();
  
  // Thiết lập viewport lớn cho dễ nhìn
  await page.setViewportSize({ width: 1280, height: 800 });
  
  console.log('Đang truy cập trang quản trị admin...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle' });
  
  console.log('Đang tự động nhập Email: vutrongvtv24@gmail.com');
  await page.fill('#adminEmail', 'vutrongvtv24@gmail.com');
  
  console.log('Đang tự động nhập Mật khẩu: kocopass@123hTc');
  await page.fill('#adminPassword', 'kocopass@123hTc');
  
  console.log('Đang bấm nút "Đăng nhập"...');
  await page.click('button[type="submit"]');
  
  console.log('Đang chờ chuyển hướng sang trang quản trị...');
  // Đợi URL chuyển hướng sang trang Dashboard /admin
  await page.waitForURL('**/admin', { timeout: 15000 });
  
  console.log('ĐĂNG NHẬP THÀNH CÔNG! Hiện tại đã ở trang:', page.url());
  
  console.log('Đang giữ trình duyệt hiển thị trong 10 giây để Sếp xem giao diện...');
  // Chờ 10 giây
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  console.log('Đóng trình duyệt...');
  await browser.close();
  console.log('Kiểm thử tự động hoàn thành tốt đẹp!');
})().catch(err => {
  console.error('Lỗi kiểm thử tự động:', err.message);
});
