import React, { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

export default function Modal({
  isOpen, onClose, title, children, footer,
  size = 'md', closeOnBackdrop = true
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const widths = { sm: 440, md: 560, lg: 720, xl: 900 }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(17, 28, 48, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-end',  // mobile: slides from bottom
        justifyContent: 'center',
        padding: 0,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        style={{
          background: 'var(--white)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          width: '100%',
          maxWidth: widths[size] || widths.md,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          animation: 'modalSlideUp 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <h2 style={{
            fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary)',
            paddingRight: '1rem',
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg)', border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
              minWidth: 36, minHeight: 36, justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '1.5rem',
          WebkitOverflowScrolling: 'touch',
        }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: '0.75rem', justifyContent: 'flex-end',
            flexShrink: 0,
            flexWrap: 'wrap',
          }}>
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @media (min-width: 600px) {
          /* Desktop: centered modal, not bottom sheet */
          .modal-desktop-override { }
        }
      `}</style>

      {/* Desktop override: re-center on larger screens */}
      <style>{`
        @media (min-width: 600px) {
          div[style*="alignItems: flex-end"] {
            align-items: center !important;
            padding: 1rem !important;
          }
          div[style*="borderRadius: var(--radius-xl) var(--radius-xl) 0 0"] {
            border-radius: var(--radius-xl) !important;
            animation: scaleIn 0.2s ease !important;
          }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  )
}