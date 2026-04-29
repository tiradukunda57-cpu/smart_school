import React from 'react'
import { FiSearch, FiX } from 'react-icons/fi'

export default function SearchBar({ value, onChange, placeholder = 'Search...', style = {} }) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      ...style,
    }}>
      <FiSearch style={{
        position: 'absolute', left: '0.85rem',
        color: 'var(--text-muted)', pointerEvents: 'none',
      }} size={16} />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.65rem 2.4rem 0.65rem 2.3rem',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-full)',
          fontSize: '16px', /* prevents iOS zoom */
          color: 'var(--text-primary)',
          background: 'var(--white)',
          transition: 'var(--transition)',
          minHeight: 42,
        }}
        onFocus={e => {
          e.target.style.borderColor = 'var(--primary-lighter)'
          e.target.style.boxShadow = '0 0 0 3px var(--primary-ghost)'
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--border)'
          e.target.style.boxShadow = 'none'
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            position: 'absolute', right: '0.75rem',
            background: 'none', color: 'var(--text-muted)',
            display: 'flex', padding: '4px', borderRadius: '50%',
            border: 'none', cursor: 'pointer',
            minWidth: 28, minHeight: 28,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <FiX size={15} />
        </button>
      )}
    </div>
  )
}