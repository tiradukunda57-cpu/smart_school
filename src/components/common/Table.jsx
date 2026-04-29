import React from 'react'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

export default function Table({
  columns, data, loading, emptyMessage = 'No records found',
  onRowClick, striped = true
}) {
  if (loading) return <LoadingSpinner />
  if (!data || data.length === 0) return <EmptyState message={emptyMessage} />

  return (
    <>
      {/* Desktop table */}
      <div className="table-desktop" style={{
        overflowX: 'auto',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        WebkitOverflowScrolling: 'touch',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr style={{ background: 'var(--primary)' }}>
              {columns.map(col => (
                <th key={col.key} style={{
                  padding: '0.85rem 1rem',
                  textAlign: col.align || 'left',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--white)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  width: col.width,
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick && onRowClick(row)}
                style={{
                  background: striped && i % 2 !== 0 ? 'var(--bg)' : 'var(--white)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'var(--transition)',
                  borderBottom: '1px solid var(--border-light)',
                }}
              >
                {columns.map(col => (
                  <td key={col.key} style={{
                    padding: '0.8rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    textAlign: col.align || 'left',
                    verticalAlign: 'middle',
                  }}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="table-mobile" style={{ display: 'none' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.map((row, i) => (
            <div
              key={row.id || i}
              onClick={() => onRowClick && onRowClick(row)}
              style={{
                background: 'var(--white)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                cursor: onRowClick ? 'pointer' : 'default',
              }}
            >
              {columns.map(col => {
                if (col.key === 'actions') {
                  return (
                    <div key={col.key} style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-light)',
                    }}>
                      {col.render ? col.render(row[col.key], row) : null}
                    </div>
                  )
                }
                return (
                  <div key={col.key} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.35rem 0',
                    gap: '0.75rem',
                  }}>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600,
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      flexShrink: 0,
                    }}>
                      {col.label}
                    </span>
                    <span style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      fontWeight: 500,
                      textAlign: 'right',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .table-desktop { display: none !important; }
          .table-mobile  { display: block !important; }
        }
        @media (min-width: 769px) {
          .table-desktop { display: block !important; }
          .table-mobile  { display: none !important; }
        }
      `}</style>
    </>
  )
}