import React from 'react'

const variants = {
  primary:   { background: 'var(--primary)',   color: 'var(--white)', border: '1.5px solid var(--primary)',   hover: 'var(--primary-light)' },
  secondary: { background: 'var(--secondary)', color: 'var(--white)', border: '1.5px solid var(--secondary)', hover: 'var(--secondary-light)' },
  outline:   { background: 'transparent',      color: 'var(--primary)', border: '1.5px solid var(--primary)', hover: 'var(--primary-ghost)' },
  ghost:     { background: 'transparent',      color: 'var(--text-secondary)', border: '1.5px solid transparent', hover: 'var(--bg)' },
  danger:    { background: 'var(--danger)',     color: 'var(--white)', border: '1.5px solid var(--danger)',   hover: '#9B2C2C' },
  success:   { background: 'var(--success)',    color: 'var(--white)', border: '1.5px solid var(--success)',  hover: 'var(--secondary-dark)' },
}

const sizes = {
  sm: { padding: '0.4rem 0.85rem', fontSize: '0.78rem' },
  md: { padding: '0.6rem 1.15rem', fontSize: '0.85rem' },
  lg: { padding: '0.8rem 1.5rem',  fontSize: '0.95rem' },
}

export default function Button({
  children, variant = 'primary', size = 'md',
  loading, disabled, icon, fullWidth, onClick,
  type = 'button', style = {}
}) {
  const v = variants[variant] || variants.primary
  const s = sizes[size] || sizes.md

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        ...s,
        background: v.background,
        color: v.color,
        border: v.border,
        borderRadius: 'var(--radius-md)',
        fontWeight: 600,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'var(--transition)',
        width: fullWidth ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        minHeight: 40,           /* touch target */
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled && !loading) e.target.style.background = v.hover
      }}
      onMouseLeave={e => {
        if (!disabled && !loading) e.target.style.background = v.background
      }}
    >
      {loading ? (
        <span style={{
          width: 16, height: 16,
          border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block',
        }} />
      ) : icon}
      {children}
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </button>
  )
}