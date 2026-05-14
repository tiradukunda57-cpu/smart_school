import React from 'react'
import { FiGrid, FiList } from 'react-icons/fi'

export default function ViewToggle({ viewMode, setViewMode, style = {} }) {
  return (
    <div style={{
      display: 'inline-flex',
      background: 'var(--bg)',
      borderRadius: 'var(--radius-md)',
      padding: 3,
      gap: 2,
      border: '1px solid var(--border)',
      ...style,
    }}>
      {[
        { mode: 'grid', icon: FiGrid, label: 'Grid' },
        { mode: 'list', icon: FiList, label: 'List' },
      ].map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          title={label}
          style={{
            padding: '0.42rem 0.65rem',
            background: viewMode === mode ? 'var(--primary)' : 'transparent',
            color: viewMode === mode ? 'white' : 'var(--text-muted)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            transition: 'all 0.2s ease',
            minWidth: 34,
            minHeight: 34,
            justifyContent: 'center',
          }}
        >
          <Icon size={15} />
          <span className="view-toggle-label">{label}</span>
        </button>
      ))}
      <style>{`
        @media (max-width: 480px) {
          .view-toggle-label { display: none !important; }
        }
      `}</style>
    </div>
  )
}