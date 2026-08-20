'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Đăng ký các thành phần biểu đồ của ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const VIEW_RANGE_OPTIONS = [
  { label: '7 ngày', value: '7', days: 7 },
  { label: '30 ngày', value: '30', days: 30 },
  { label: '90 ngày', value: '90', days: 90 },
  { label: '180 ngày', value: '180', days: 180 },
  { label: 'Toàn thời gian', value: 'all', days: null },
];

export default function AdminDashboard() {
  const [selectedRange, setSelectedRange] = useState(VIEW_RANGE_OPTIONS[1]); // Mặc định 30 ngày
  const [loading, setLoading] = useState(true);

  // Thống kê
  const [viewsToday, setViewsToday] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [pendingComments, setPendingComments] = useState(0);
  const [totalViews, setTotalViews] = useState(0);

  // Dữ liệu biểu đồ
  const [dailyViews, setDailyViews] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [
          resViewSummary,
          resTotalPosts,
          resPendingComments,
          resViewsByDay,
          resTopPosts,
        ] = await Promise.all([
          supabase.rpc('get_view_summary', { days: selectedRange.days }),
          supabase.from('posts').select('*', { count: 'exact', head: true }),
          supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.rpc('get_daily_views', { days: selectedRange.days }),
          supabase.rpc('get_top_posts', { limit_count: 5, days: selectedRange.days }),
        ]);

        if (resViewSummary.error) console.error('Lỗi view summary:', resViewSummary.error);
        if (resTotalPosts.error) console.error('Lỗi posts:', resTotalPosts.error);
        if (resPendingComments.error) console.error('Lỗi comments:', resPendingComments.error);
        if (resViewsByDay.error) console.error('Lỗi daily views:', resViewsByDay.error);
        if (resTopPosts.error) console.error('Lỗi top posts:', resTopPosts.error);

        const summary = Array.isArray(resViewSummary.data) ? resViewSummary.data[0] : resViewSummary.data;
        setViewsToday(Number(summary?.views_today || 0));
        setTotalViews(Number(summary?.total_views || 0));

        setTotalPosts(resTotalPosts.count || 0);
        setPendingComments(resPendingComments.count || 0);

        setDailyViews(resViewsByDay.data || []);
        setTopPosts(resTopPosts.data || []);
      } catch (err) {
        console.error('[Dashboard] Lỗi tải dữ liệu:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [selectedRange]);

  // ── Cấu hình Biểu đồ Đường (Daily Views) ──
  const lineChartData = {
    labels: dailyViews.map((d) => {
      const dt = new Date(d.date);
      return `${dt.getDate()}/${dt.getMonth() + 1}`;
    }),
    datasets: [
      {
        label: 'Lượt xem',
        data: dailyViews.map((d) => d.views),
        borderColor: '#0f766e',
        backgroundColor: 'rgba(15, 118, 110, 0.08)',
        borderWidth: 2,
        pointRadius: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { maxTicksLimit: 8, color: '#64748b' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        beginAtZero: true,
        ticks: { precision: 0, color: '#64748b' },
      },
    },
  };

  // ── Cấu hình Biểu đồ Cột (Top Posts) ──
  const barChartData = {
    labels: topPosts.map((d) => (d.slug.length > 20 ? d.slug.slice(0, 20) + '…' : d.slug)),
    datasets: [
      {
        label: 'Lượt xem',
        data: topPosts.map((d) => d.views),
        backgroundColor: '#0f766e',
        borderRadius: 4,
        barThickness: 16,
      },
    ],
  };

  const barChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        beginAtZero: true,
        ticks: { precision: 0, color: '#64748b' },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#64748b' },
      },
    },
  };

  return (
    <>
      <h1 className="admin-page__title">Dashboard</h1>

      {/* Filter Range */}
      <div className="admin-report-filter" aria-label="Lọc báo cáo lượt xem theo thời gian">
        {VIEW_RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`admin-report-filter__btn ${option.value === selectedRange.value ? 'active' : ''}`}
            onClick={() => setSelectedRange(option)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted)', marginTop: '2rem' }}>Đang tải dữ liệu báo cáo...</p>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="admin-stats">
            <div className="admin-stat-card">
              <div className="admin-stat-card__icon admin-stat-card__icon--views">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              </div>
              <div>
                <p className="admin-stat-card__value">{viewsToday.toLocaleString()}</p>
                <p className="admin-stat-card__label">Lượt xem hôm nay</p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card__icon admin-stat-card__icon--total">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                </svg>
              </div>
              <div>
                <p className="admin-stat-card__value">{totalPosts.toLocaleString()}</p>
                <p className="admin-stat-card__label">Tổng bài viết</p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card__icon admin-stat-card__icon--comments">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14h-6.83L12 17.17 10.83 16H4V4h16v12z" />
                </svg>
              </div>
              <div>
                <p className="admin-stat-card__value">{pendingComments.toLocaleString()}</p>
                <p className="admin-stat-card__label">Bình luận chờ duyệt</p>
              </div>
            </div>

            <div className="admin-stat-card">
              <div className="admin-stat-card__icon admin-stat-card__icon--allviews">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
                </svg>
              </div>
              <div>
                <p className="admin-stat-card__value">{totalViews.toLocaleString()}</p>
                <p className="admin-stat-card__label">Tổng lượt xem</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="admin-charts">
            <div className="admin-chart-card">
              <h2 className="admin-chart-card__title">Lượt xem {selectedRange.label.toLowerCase()}</h2>
              <div className="admin-chart-card__body" style={{ padding: '1rem', height: '280px', position: 'relative' }}>
                {dailyViews.length === 0 ? (
                  <p className="admin-chart-card__empty">Chưa có dữ liệu</p>
                ) : (
                  <Line data={lineChartData} options={lineChartOptions} />
                )}
              </div>
            </div>

            <div className="admin-chart-card">
              <h2 className="admin-chart-card__title">Top bài viết</h2>
              <div className="admin-chart-card__body" style={{ padding: '1rem', height: '280px', position: 'relative' }}>
                {topPosts.length === 0 ? (
                  <p className="admin-chart-card__empty">Chưa có dữ liệu</p>
                ) : (
                  <Bar data={barChartData} options={barChartOptions} />
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="admin-quicklinks">
            <a href="/admin/edit-post" className="admin-quicklink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
              </svg>
              Viết bài mới
            </a>
            <a href="/admin/comments" className="admin-quicklink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14h-6.83L12 17.17 10.83 16H4V4h16v12z" />
              </svg>
              Duyệt bình luận ({pendingComments})
            </a>
          </div>
        </>
      )}
    </>
  );
}
