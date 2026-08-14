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

  useEffect(() => {
    // Lắng nghe sự kiện thay đổi trạng thái Auth của Supabase để xử lý redirect sau OAuth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: isAdmin, error } = await supabase.rpc('is_admin');
        if (isAdmin === true) {
          router.push('/admin');
        } else if (event === 'SIGNED_IN') {
          setErrorMsg('Tài khoản của bạn không có quyền truy cập trang quản trị.');
          await supabase.auth.signOut();
        }
      }
    });

    // Chạy kiểm tra session hiện tại ngay khi mount
    async function checkCurrentSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: isAdmin } = await supabase.rpc('is_admin');
        if (isAdmin === true) {
          router.push('/admin');
        }
      }
    }
    checkCurrentSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

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

      // Kiểm tra quyền Admin bằng RPC 'is_admin'
      const { data: isAdmin, error: adminErr } = await supabase.rpc('is_admin');
      if (adminErr || isAdmin !== true) {
        await supabase.auth.signOut();
        throw new Error('Tài khoản của bạn không có quyền truy cập trang quản trị.');
      }

      router.push('/admin');
    } catch (err) {
      console.error('[AdminLogin] Lỗi đăng nhập:', err);
      setErrorMsg(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setErrorMsg('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/admin`,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error('[AdminLogin] Lỗi đăng nhập Google:', err);
      setErrorMsg(err.message || 'Đăng nhập bằng Google thất bại.');
      setLoading(false);
    }
  }

  return (
    <main className="post-container" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <article className="post-article">
        <header className="post-header" style={{ textAlign: 'center' }}>
          <img
            src="/images/fridge-logo.png"
            alt="Tulanh-simple Admin"
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

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0', color: 'var(--muted)' }}>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)', opacity: 0.3 }} />
            <span style={{ padding: '0 10px', fontSize: '0.85rem' }}>Hoặc</span>
            <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-color)', opacity: 0.3 }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="comment-section__submit"
            style={{ 
              width: '100%', 
              backgroundColor: '#fff', 
              color: '#334155', 
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontWeight: 600
            }}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Đăng nhập bằng Google
          </button>
        </form>
      </article>
    </main>
  );
}
