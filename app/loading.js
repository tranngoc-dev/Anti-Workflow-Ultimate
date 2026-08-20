export default function Loading() {
  return (
    <div className="home-container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Skeleton Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="skeleton-pulse"
            style={{
              width: '90px',
              height: '38px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              flexShrink: 0
            }}
          />
        ))}
      </div>

      {/* Skeleton Search */}
      <div
        className="skeleton-pulse"
        style={{
          width: '100%',
          height: '46px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.03)',
          marginBottom: '3rem'
        }}
      />

      {/* Skeleton Post Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              padding: '1.75rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {/* Meta */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div className="skeleton-pulse" style={{ width: '140px', height: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '4px' }} />
            </div>
            {/* Title */}
            <div className="skeleton-pulse" style={{ width: '75%', height: '24px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px' }} />
            {/* Excerpt */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="skeleton-pulse" style={{ width: '100%', height: '14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px' }} />
              <div className="skeleton-pulse" style={{ width: '85%', height: '14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '4px' }} />
            </div>
            {/* Tags */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
              <div className="skeleton-pulse" style={{ width: '60px', height: '22px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }} />
              <div className="skeleton-pulse" style={{ width: '80px', height: '22px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
