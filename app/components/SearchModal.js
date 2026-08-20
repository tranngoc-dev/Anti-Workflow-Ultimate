'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const { data, error } = await supabase.rpc('search_posts', {
          search_query: query.trim(),
        });
        if (error) throw error;
        setResults(data || []);
      } catch (err) {
        console.error('[SearchModal] Lỗi tìm kiếm:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  if (!isOpen) return null;

  // Bôi vàng từ khóa tìm kiếm trong kết quả hiển thị để giống hệt website cũ
  function highlightText(text = '', keyword = '') {
    if (!keyword.trim()) return text;
    const terms = keyword.trim().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return text;

    const regex = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index}>{part}</mark>
      ) : (
        part
      )
    );
  }

  return (
    <div
      id="search-modal-overlay"
      className="search-modal-overlay active"
      onClick={(e) => {
        if (e.target.id === 'search-modal-overlay') onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Tìm kiếm"
    >
      <div className="search-modal">
        <div className="search-modal__header">
          <span className="search-modal__icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            id="cmd-k-input"
            className="search-modal__input"
            placeholder="Tìm kiếm bài viết (Nhấn Esc để thoát)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          <button id="cmd-k-close" className="search-modal__close" onClick={onClose} aria-label="Đóng">
            ESC
          </button>
        </div>
        <div id="cmd-k-results" className="search-modal__results">
          {loading && <div className="search-modal__empty">Đang tìm kiếm...</div>}
          {!loading && query && results.length === 0 && (
            <div className="search-modal__empty">
              Không tìm thấy kết quả nào cho &quot;<b>{query}</b>&quot;.
            </div>
          )}
          {!loading &&
            results.map((post) => (
              <a key={post.id} href={`/${encodeURIComponent(post.slug)}`} className="search-result-item">
                <span className="search-result-item__title">
                  {highlightText(post.title, query)} {post.is_locked && '🔒'}
                </span>
                <span className="search-result-item__excerpt">{highlightText(post.excerpt || '', query)}</span>
              </a>
            ))}
        </div>
      </div>
    </div>
  );
}
