import React from 'react'

const variants = {
  present:  { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Present' },
  absent:   { bg: 'var(--danger-bg)', color: 'var(--danger)', label: 'Absent' },
  late:     { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'Late' },
  excused:  { bg: 'var(--info-bg)', color: 'var(--info)', label: 'Excused' },
  active:   { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Active' },
  inactive: { bg: 'var(--danger-bg)', color: 'var(--danger)', label: 'Inactive' },
  pending:  { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'Pending' },
  done:     { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Done' },
  primary:  { bg: 'var(--primary-ghost)', color: 'var(--primary)' },
  secondary:{ bg: 'var(--secondary-ghost)', color: 'var(--secondary)' },
}

export default function Badge({ type, label, custom }) {
  const v = variants[type] || variants.primary
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.65rem',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: custom?.bg || v.bg,
      color: custom?.color || v.color,
      whiteSpace: 'nowrap',
      letterSpacing: '0.02em',
    }}>
      {label || v.label}
    </span>
  )
}