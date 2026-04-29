import React from 'react'
import { FiInbox } from 'react-icons/fi'

export default function EmptyState({ message, icon: Icon = FiInbox, action }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      gap: '1rem',
    }}>
      <div style={{
        width: 64, height: 64,
        background: 'var(--primary-ghost)',
        borderRadius: 'var(--radius-full)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--primary-lighter)',
      }}>
        <Icon size={28} />
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', textAlign: 'center', maxWidth: 300 }}>
        {message || 'No data found'}
      </p>
      {action && <div style={{ marginTop: '0.5rem' }}>{action}</div>}
    </div>
  )
}