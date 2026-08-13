'use client';

import { useState, useEffect } from 'react';
import SearchModal from './SearchModal';

const POSTS_PER_PAGE = 10;

export default function HomeClient({ initialPosts }) {
  const [activeParent, setActiveParent] = useState('');
  const [activeChild, setActiveChild] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 1. Lắng nghe phím tắt Cmd+K hoặc Ctrl+K toàn cục để mở modal tìm kiếm
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 2. Gom nhóm tags phân cấp (2 tầng)
  const tagMap = new Map();
  const standaloneParents = new Set();

  initialPosts.forEach((post) => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag) => {
        if (tag.includes('/')) {
          const [parent, child] = tag.split('/', 2);
          if (!tagMap.has(parent)) {
            tagMap.set(parent, new Set());
          }
          tagMap.get(parent).add(child);
        } else {
          standaloneParents.add(tag);
        }
      });
    }
  });

  const parentTags = Array.from(new Set([...tagMap.keys(), ...standaloneParents])).sort();

  // 3. Lọc bài viết theo Tags hoạt động
  const filteredPosts = initialPosts.filter((post) => {
    const tags = post.tags || [];
    if (!activeParent) return true;

    if (activeChild) {
      const targetTag = `${activeParent}/${activeChild}`;
      return tags.includes(targetTag);
    } else {
      // Chỉ chọn cha -> tìm bất kỳ tag nào bằng cha hoặc bắt đầu bằng cha/
      return tags.some((t) => t === activeParent || t.startsWith(`${activeParent}/`));
    }
  });

  // 4. Phân trang
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handleParentTagClick = (parent) => {
    setActiveParent(parent);
    setActiveChild('');
    setCurrentPage(1);
  };

  const handleChildTagClick = (child) => {
    setActiveChild(child);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    document.getElementById('tag-filter')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper formats
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function getReadingTime(post) {
    if (post.reading_minutes) return post.reading_minutes;
    const wordCount = (post.content || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  }

  return (
    <main id="main-content" className="home-container">
      {/* Tag Filter */}
      <div id="tag-filter" className="tag-filter" aria-label="Lọc theo chủ đề">
        <div className="tag-filter__main" id="tag-filter-main">
          <button
            className={`tag-filter__btn ${activeParent === '' ? 'active' : ''}`}
            onClick={() => handleParentTagClick('')}
          >
            Tất cả
          </button>
          {parentTags.map((parent) => (
            <button
              key={parent}
              className={`tag-filter__btn ${activeParent === parent ? 'active' : ''}`}
              onClick={() => handleParentTagClick(parent)}
            >
              {parent}
            </button>
          ))}
        </div>

        {activeParent && tagMap.get(activeParent) && tagMap.get(activeParent).size > 0 && (
          <div className="tag-filter__sub active" id="tag-filter-sub">
            <button
              className={`tag-filter__sub-btn ${activeChild === '' ? 'active' : ''}`}
              onClick={() => handleChildTagClick('')}
            >
              Tất cả {activeParent}
            </button>
            {Array.from(tagMap.get(activeParent))
              .sort()
              .map((child) => (
                <button
                  key={child}
                  className={`tag-filter__sub-btn ${activeChild === child ? 'active' : ''}`}
                  onClick={() => handleChildTagClick(child)}
                >
                  {child}
                </button>
              ))}
          </div>
        )}
      </div>



      {/* Search Bar Wrapper (Bấm để mở modal) */}
      <div
        className="search-bar-wrapper"
        role="search"
        id="home-search-trigger"
        style={{ cursor: 'pointer' }}
        onClick={() => setIsSearchOpen(true)}
      >
        <label htmlFor="searchInput" className="visually-hidden">
          Tìm kiếm thứ mà bạn đang cần
        </label>
        <input
          id="searchInput"
          type="text"
          placeholder="Tìm kiếm bài viết (Bấm vào đây hoặc ⌘K)..."
          className="search-input"
          aria-label="Tìm kiếm thứ bạn đang cần"
          readOnly
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Grid bài viết */}
      <div id="posts-grid" className="posts-grid" aria-label="Danh sách bài viết">
        {paginatedPosts.length === 0 ? (
          <div id="no-results" className="no-results" style={{ display: 'block' }}>
            <span className="no-results__icon">📝</span>
            <p className="no-results__title">Chưa có bài viết nào</p>
            <p className="no-results__text">Blog đang được chuẩn bị nội dung...</p>
          </div>
        ) : (
          paginatedPosts.map((post) => {
            const readMinutes = getReadingTime(post);
            return (
              <article className="blog-card" key={post.id}>
                <a href={`/${encodeURIComponent(post.slug)}`} className="blog-card__link" aria-label={post.title}>
                  <span className="blog-card__meta">
                    <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                    &nbsp;·&nbsp;{readMinutes} phút đọc
                    {post.is_locked && <span className="blog-card__lock"> 🔒</span>}
                    &nbsp;·&nbsp;
                    <span className="blog-card__votes" style={{ color: '#ef4444', fontWeight: 500 }}>
                      ❤️ {post.votes || 0}
                    </span>
                  </span>
                  <h2 className="blog-card__title">{post.title}</h2>
                  {post.excerpt && post.excerpt.trim() !== '' && (
                    <p className="blog-card__excerpt">{post.excerpt}</p>
                  )}
                  <div className="blog-card__tags">
                    {(post.tags || []).map((t, i) => {
                      if (t.includes('/')) {
                        const [parent, child] = t.split('/', 2);
                        return (
                          <span className="tag tag--hierarchical" key={i}>
                            <span className="tag__parent">{parent}</span>
                            <span className="tag__separator">›</span>
                            <span className="tag__child">{child}</span>
                          </span>
                        );
                      }
                      return (
                        <span className="tag" key={i}>
                          {t}
                        </span>
                      );
                    })}
                  </div>
                  <span className="blog-card__readmore">Đọc tiếp →</span>
                </a>
              </article>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          id="pagination-container"
          className="pagination-container"
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            gap: '0.5rem',
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
          }}
        >
          {currentPage > 1 && (
            <button className="pagination-btn" onClick={() => handlePageChange(currentPage - 1)}>
              ← Trước
            </button>
          )}
          <span style={{ margin: '0 1rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
            Trang {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <button className="pagination-btn" onClick={() => handlePageChange(currentPage + 1)}>
              Sau →
            </button>
          )}
        </div>
      )}

      {/* Search Modal Component */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </main>
  );
}
