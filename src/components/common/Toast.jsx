import React, { useContext } from 'react'
import { ToastContext } from '../../context/ToastContext'
import { FiCheckCircle, FiAlertCircle, FiInfo, FiXCircle, FiX } from 'react-icons/fi'

const icons = {
  success: <FiCheckCircle size={18} />,
  error: <FiXCircle size={18} />,
  warning: <FiAlertCircle size={18} />,
  info: <FiInfo size={18} />,
}

const colors = {
  success: { bg: 'linear-gradient(135deg, #10b981, #059669)', border: '#047857', color: '#ffffff', iconBg: '#065f46' },
  error: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', border: '#b91c1c', color: '#ffffff', iconBg: '#991b1b' },
  warning: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', border: '#b45309', color: '#ffffff', iconBg: '#92400e' },
  info: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: '#1d4ed8', color: '#ffffff', iconBg: '#1e40af' },
}

export default function Toast() {
  const { toasts, removeToast } = useContext(ToastContext)

  return (
    <>
      <div className="toast-container">
        {toasts.map(toast => {
          const c = colors[toast.type] || colors.info
          return (
            <div key={toast.id} className="toast-item" style={{
              background: c.bg,
              border: `2px solid ${c.border}`,
              borderRadius: '12px',
              padding: '1rem 1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              animation: 'toastSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{
                background: c.iconBg,
                borderRadius: '50%',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {icons[toast.type]}
              </div>
              <span style={{
                flex: 1, fontSize: '0.9rem', color: c.color,
                fontWeight: 600, lineHeight: 1.4,
              }}>
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'rgba(255,255,255,0.2)', color: c.color, padding: '4px',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  flexShrink: 0, minWidth: 28, minHeight: 28,
                  alignItems: 'center', justifyContent: 'center',
                  display: 'flex',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
              >
                <FiX size={16} />
              </button>
            </div>
          )
        })}
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          top: 1rem;
          right: 1rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          max-width: 380px;
          width: calc(100% - 2rem);
        }
        @keyframes toastSlideIn {
          from { transform: translateX(120%) scale(0.8); opacity: 0 }
          to { transform: translateX(0) scale(1); opacity: 1 }
        }
        @media (max-width: 480px) {
          .toast-container {
            top: auto;
            bottom: 1rem;
            right: 0.5rem;
            left: 0.5rem;
            max-width: none;
            width: auto;
          }
          @keyframes toastSlideIn {
            from { transform: translateY(120%) scale(0.8); opacity: 0 }
            to { transform: translateY(0) scale(1); opacity: 1 }
          }
        }
      `}</style>
    </>
  )
}