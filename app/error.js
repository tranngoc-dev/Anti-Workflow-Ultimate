'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[Global Error Router]:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: "'Outfit', -apple-system, sans-serif",
        background: '#f8fafc',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: '20px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
        }}
      >
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }} aria-hidden="true">
          ⚠️
        </span>
        <h2 style={{ fontSize: '1.4rem', color: '#0f172a', fontWeight: '700', marginBottom: '0.75rem' }}>
          Đã xảy ra lỗi kết nối
        </h2>
        <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.65, marginBottom: '2rem' }}>
          Không thể tải dữ liệu từ máy chủ lúc này. Có thể kết nối cơ sở dữ liệu tạm thời bị gián đoạn hoặc đường truyền mạng không ổn định. Vui lòng bấm thử lại.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <a
            href="/"
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: '#f1f5f9',
              color: '#334155',
              fontSize: '0.9rem',
              fontWeight: '600',
              textDecoration: 'none',
              border: '1px solid #cbd5e1',
              transition: 'background 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            🏠 Về Trang chủ
          </a>
          <button
            onClick={() => reset()}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              background: '#0f766e',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(15, 118, 110, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            🔄 Thử lại
          </button>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'left' }}>
          <details style={{ fontSize: '0.8rem', color: '#64748b', cursor: 'pointer' }}>
            <summary style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Chi tiết lỗi (Dành cho nhà phát triển)</summary>
            <pre style={{ 
              background: '#f1f5f9', 
              padding: '12px', 
              borderRadius: '8px', 
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
              maxHeight: '200px',
              overflowY: 'auto',
              color: '#0f172a'
            }}>
              {error?.message || 'Lỗi không xác định'}
              {error?.stack ? `\n\n${error.stack}` : ''}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
