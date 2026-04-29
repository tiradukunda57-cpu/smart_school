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
  success: { bg: 'var(--success-bg)', border: 'var(--success)', color: 'var(--success)' },
  error: { bg: 'var(--danger-bg)', border: 'var(--danger)', color: 'var(--danger)' },
  warning: { bg: 'var(--warning-bg)', border: 'var(--warning)', color: 'var(--warning)' },
  info: { bg: 'var(--info-bg)', border: 'var(--info)', color: 'var(--info)' },
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
              border: `1.5px solid ${c.border}`,
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              boxShadow: 'var(--shadow-md)',
              animation: 'toastSlideIn 0.3s ease',
            }}>
              <span style={{ color: c.color, flexShrink: 0 }}>{icons[toast.type]}</span>
              <span style={{
                flex: 1, fontSize: '0.85rem', color: 'var(--text-primary)',
                fontWeight: 500, lineHeight: 1.4,
              }}>
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none', color: c.color, padding: '2px',
                  display: 'flex', border: 'none', cursor: 'pointer',
                  flexShrink: 0, minWidth: 24, minHeight: 24,
                  alignItems: 'center', justifyContent: 'center',
                }}
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
          from { transform: translateX(100%); opacity: 0 }
          to { transform: translateX(0); opacity: 1 }
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
            from { transform: translateY(100%); opacity: 0 }
            to { transform: translateY(0); opacity: 1 }
          }
        }
      `}</style>
    </>
  )
}