import React from 'react'
import { FiShield, FiAlertCircle, FiX } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'

export default function PendingBanner() {
  const { user } = useAuth()

  if (!user || user.role !== 'teacher') return null

  const configs = {
    pending: {
      bg: 'var(--warning-bg)',
      border: 'var(--warning)',
      color: 'var(--warning)',
      icon: '⏳',
      title: 'Account Pending Approval',
      message: 'Your teacher account is awaiting admin approval. You can browse the dashboard but cannot manage data until approved.',
    },
    rejected: {
      bg: 'var(--danger-bg)',
      border: 'var(--danger)',
      color: 'var(--danger)',
      icon: '❌',
      title: 'Application Rejected',
      message: 'Your teaching application was not approved. Please contact the school administrator.',
    },
    suspended: {
      bg: 'var(--info-bg)',
      border: 'var(--info)',
      color: 'var(--info)',
      icon: '🔒',
      title: 'Account Suspended',
      message: 'Your account has been suspended by an administrator. Contact admin for more information.',
    },
  }

  const config = configs[user.status]
  if (!config) return null

  return (
    <div style={{
      background: config.bg,
      border: `1.5px solid ${config.border}`,
      borderRadius: 'var(--radius-lg)',
      padding: '1rem 1.25rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.85rem',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: config.border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', flexShrink: 0,
      }}>
        {config.icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, color: config.color, fontSize: '0.92rem' }}>
          {config.title}
        </p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.5 }}>
          {config.message}
        </p>
      </div>
    </div>
  )
}