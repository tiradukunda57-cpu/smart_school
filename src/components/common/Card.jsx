import React from 'react'

export default function Card({
  children, title, subtitle, action, padding,
  style = {}, hover = false, className = ''
}) {
  return (
    <>
      <div
        className={`responsive-card ${className}`}
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border)',
          transition: hover ? 'var(--transition-slow)' : 'none',
          cursor: hover ? 'pointer' : 'default',
          overflow: 'hidden',
          ...style,
        }}
        onMouseEnter={hover ? e => {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        } : undefined}
        onMouseLeave={hover ? e => {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
          e.currentTarget.style.transform = 'translateY(0)'
        } : undefined}
      >
        {(title || action) && (
          <div className="card-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.1rem 1.25rem 0',
            marginBottom: '0.85rem',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ minWidth: 0 }}>
              {title && (
                <h3 style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  letterSpacing: '-0.01em',
                }}>{title}</h3>
              )}
              {subtitle && (
                <p style={{
                  fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem',
                }}>{subtitle}</p>
              )}
            </div>
            {action && <div style={{ flexShrink: 0 }}>{action}</div>}
          </div>
        )}
        <div className="card-body" style={{
          padding: padding || '1.25rem',
        }}>
          {children}
        </div>
      </div>
      <style>{`
        @media (max-width: 480px) {
          .responsive-card .card-body {
            padding: 0.85rem !important;
          }
          .responsive-card .card-header {
            padding: 0.85rem 0.85rem 0 !important;
          }
        }
      `}</style>
    </>
  )
}