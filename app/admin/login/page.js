'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);



  async function handleLogin(e) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!email.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      // Kiểm tra quyền Admin trực tiếp từ metadata của session trả về
      const isAdmin = data.user?.user_metadata?.is_admin === true;
      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error('Tài khoản của bạn không có quyền truy cập trang quản trị.');
      }

      // Đăng nhập thành công -> chuyển hướng sang trang quản trị
      window.location.href = '/admin';
    } catch (err) {
      console.error('[AdminLogin] Lỗi đăng nhập:', err);
      setErrorMsg(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="post-container" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <article className="post-article">
        <header className="post-header" style={{ textAlign: 'center' }}>
          <img
            src="/images/fridge-logo.png"
            alt="Tulanh Admin"
            style={{ width: '48px', height: '48px', marginBottom: '1rem' }}
          />
          <h1>Đăng nhập Admin</h1>
        </header>

        <form onSubmit={handleLogin} className="comment-section__form" style={{ marginTop: '1.5rem' }}>
          {errorMsg && (
            <p className="comment-section__success-text" style={{ color: '#ef4444', marginBottom: '1rem' }}>
              {errorMsg}
            </p>
          )}

          <div className="comment-section__field">
            <label htmlFor="adminEmail">Email đăng nhập</label>
            <input
              id="adminEmail"
              type="email"
              placeholder="admin@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="comment-section__field" style={{ marginTop: '1rem' }}>
            <label htmlFor="adminPassword">Mật khẩu</label>
            <input
              id="adminPassword"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="comment-section__submit"
            style={{ marginTop: '1.5rem', width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>
      </article>
    </main>
  );
}
