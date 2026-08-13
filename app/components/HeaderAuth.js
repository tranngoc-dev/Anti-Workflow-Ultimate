'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function HeaderAuth() {
  const [session, setSession] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    // Get initial session
    supabase.auth.getSession()
      .then(({ data }) => {
        setSession(data?.session);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[HeaderAuth] getSession error:', err);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/working` : undefined,
        },
      });
    } catch (err) {
      console.error('[HeaderAuth] Sign in error:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[HeaderAuth] Sign out error:', err);
    }
  };

  // SSR Safe: render loading placeholder to prevent layout shifts
  if (!isMounted || loading) {
    return <div className="header-auth-loading-placeholder" />;
  }

  const MindmapIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline-block' }}>
      <circle cx="12" cy="12" r="3" />
      <circle cx="5" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <line x1="7" y1="7" x2="10" y2="10" />
      <line x1="17" y1="7" x2="14" y2="10" />
      <line x1="7" y1="17" x2="10" y2="14" />
      <line x1="17" y1="17" x2="14" y2="14" />
    </svg>
  );

  const GoogleIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle', display: 'inline-block' }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div className="header-auth-container">
      {session ? (
        <div className="header-auth-user-box" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a 
            href="/working" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '0.9rem', 
              color: 'var(--accent)', 
              fontWeight: 600,
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'rgba(15, 118, 110, 0.03)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(15, 118, 110, 0.08)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(15, 118, 110, 0.03)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <rect x="3" y="3" width="7" height="9" />
              <rect x="14" y="3" width="7" height="5" />
              <rect x="14" y="12" width="7" height="9" />
              <rect x="3" y="16" width="7" height="5" />
            </svg>
            <span>Workspace</span>
          </a>
          <img 
            src={session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || ''} 
            alt="User avatar" 
            className="header-auth-avatar"
            onError={(e) => {
              e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%236B7280" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>';
            }}
          />
          <button onClick={handleSignOut} className="header-auth-btn sign-out" title="Đăng xuất">
            Thoát
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <button onClick={handleSignIn} className="header-auth-btn sign-in" title="Đăng nhập Google">
            <GoogleIcon />
            <span>Đăng nhập</span>
          </button>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '4px' }}>để sử dụng chức năng bí mật</span>
        </div>
      )}
    </div>
  );
}
