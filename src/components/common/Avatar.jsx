import React from 'react'
import { getInitials } from '../../utils/formatters'

export default function Avatar({ firstName, lastName, src, size = 40, style = {} }) {
  const initials = getInitials(firstName, lastName)

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--border)',
          ...style,
        }}
      />
    )
  }

  const colors = [
    { bg: 'var(--primary)', color: 'var(--white)' },
    { bg: 'var(--secondary)', color: 'var(--white)' },
    { bg: 'var(--primary-light)', color: 'var(--white)' },
    { bg: 'var(--secondary-dark)', color: 'var(--white)' },
  ]
  const colorIndex = (firstName?.charCodeAt(0) || 0) % colors.length
  const c = colors[colorIndex]

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: c.bg,
      color: c.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.36,
      fontWeight: 700,
      flexShrink: 0,
      border: '2px solid rgba(255,255,255,0.2)',
      ...style,
    }}>
      {initials}
    </div>
  )
}