'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

const NAV_LINKS = [
  {
    href: '/admin',
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
  },
  {
    href: '/admin/posts',
    id: 'posts',
    label: 'Bài viết',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
      </svg>
    ),
  },
  {
    href: '/admin/comments',
    id: 'comments',
    label: 'Bình luận',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14h-6.83L12 17.17 10.83 16H4V4h16v12z" />
      </svg>
    ),
  },
  {
    href: '/admin/visit-logs',
    id: 'visit-logs',
    label: 'Nhật ký IP',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    id: 'users',
    label: 'Người dùng',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.5 13c-1.2 0-3.07.34-4.5 1-1.43-.67-3.3-1-4.5-1C5.33 13 1 15.17 1 18.5V21h15v-2.5c0-3.33-4.33-5.5-7.5-5.5zM15 18.5c0-.66-.34-1.3-1-1.75.66.45 1 1.09 1 1.75zM16.5 13c1.66 0 3-1.34 3-3s-1.34-3-3-3c-.43 0-.83.1-1.2.27.42.69.7 1.48.7 2.36s-.28 1.67-.7 2.36c.37.17.77.27 1.2.27zM7.5 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm9 2c0-1.86-1.28-3.41-3-3.86.83.69 1.5 1.67 1.5 2.86s-.67 2.17-1.5 2.86c1.72-.45 3-2 3-3.86zM22.5 18.5V21h-5v-2.5c0-1.72-.83-3.23-2.17-4.14.86.3 1.83.64 2.67 1.14 2.83 1.67 4.5 3.83 4.5 5.5z" />
      </svg>
    ),
  },
  {
    href: '/admin/mindmaps',
    id: 'mindmaps',
    label: 'Quản lý Mindmap',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    ),
  },
  {
    href: '/admin/tags',
    id: 'tags',
    label: 'Quản lý Tags',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.41l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.41zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
      </svg>
    ),
  },
  {
    href: '/admin/settings',
    id: 'settings',
    label: 'Cài đặt',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // 1. Kiểm tra Auth Guard (Chặn toàn bộ các route ngoại trừ /admin/login)
  useEffect(() => {
    async function checkAuth() {
      if (pathname === '/admin/login') {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        router.push('/admin/login');
        return;
      }

      // Check is_admin RPC
      const { data: isAdmin, error } = await supabase.rpc('is_admin');
      if (error || isAdmin !== true) {
        await supabase.auth.signOut();
        router.push('/admin/login');
        return;
      }

      setSession(currentSession);
      setLoading(false);
    }
    checkAuth();
  }, [pathname, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  // Nếu đang ở trang đăng nhập, chỉ render form đăng nhập không kèm sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#090d16', color: '#94a3b8' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="comment-section__loading" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Đang kiểm tra quyền truy cập...</div>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  const userName = session?.user?.email?.split('@')[0] || 'Admin';
  const initial = userName.charAt(0).toUpperCase();

  // Xác định active menu item dựa trên URL pathname
  let activePageId = 'dashboard';
  if (pathname.startsWith('/admin/posts') || pathname.startsWith('/admin/edit-post')) {
    activePageId = 'posts';
  } else if (pathname.startsWith('/admin/comments')) {
    activePageId = 'comments';
  } else if (pathname.startsWith('/admin/visit-logs')) {
    activePageId = 'visit-logs';
  } else if (pathname.startsWith('/admin/users')) {
    activePageId = 'users';
  } else if (pathname.startsWith('/admin/mindmaps')) {
    activePageId = 'mindmaps';
  } else if (pathname.startsWith('/admin/tags')) {
    activePageId = 'tags';
  } else if (pathname.startsWith('/admin/settings')) {
    activePageId = 'settings';
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar" role="navigation" aria-label="Admin navigation">
        <div className="admin-sidebar__header">
          <a href="/admin" className="admin-sidebar__logo" aria-label="Tulanh Admin - Về Dashboard">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <rect width="20" height="20" rx="4" fill="currentColor" />
              <path d="M5 10L9 14L15 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Tulanh
          </a>
        </div>

        <nav className="admin-sidebar__nav">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.href}
              className={`admin-sidebar__link ${activePageId === link.id ? 'active' : ''}`}
              aria-current={activePageId === link.id ? 'page' : undefined}
            >
              {link.icon}
              {link.label}
            </a>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-sidebar__link" aria-label="Xem Blog (mở tab mới)">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
              <path d="M14 14H4V4h5V2H4C2.9 2 2 2.9 2 4v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9h-2v5zM11 2v2h2.59L7.29 10.29l1.41 1.41L15 5.41V8h2V2h-6z" />
            </svg>
            Xem Blog
          </a>
          <button id="signout-btn" className="admin-sidebar__logout" type="button" aria-label="Đăng xuất" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="admin-main" role="main">
        <header className="admin-header">
          <div className="admin-header__user">
            <span className="admin-header__avatar" aria-hidden="true">
              {initial}
            </span>
            <span className="admin-header__name">{userName}</span>
          </div>
        </header>
        <div className="admin-content" id="admin-page-content" aria-live="polite">
          {children}
        </div>
      </main>
    </div>
  );
}
