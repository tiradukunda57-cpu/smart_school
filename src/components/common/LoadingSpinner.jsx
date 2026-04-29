import React from 'react'

export default function LoadingSpinner({ fullPage, size = 40, text }) {
  const spinner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: size,
        height: size,
        border: `3px solid var(--border)`,
        borderTop: `3px solid var(--primary)`,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      {text && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{text}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (fullPage) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
      }}>
        {spinner}
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
    }}>
      {spinner}
    </div>
  )
}