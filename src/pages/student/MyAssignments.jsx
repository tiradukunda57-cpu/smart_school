import React, { useState, useEffect, useContext } from 'react'
import { FiBookOpen, FiCalendar, FiSearch, FiEye } from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import SearchBar from '../../components/common/SearchBar'
import EmptyState from '../../components/common/EmptyState'
import { assignmentService } from '../../services/assignmentService'
import { ToastContext } from '../../context/ToastContext'
import { formatDate, timeAgo } from '../../utils/formatters'

const priorityColors = {
  High: { bg: 'var(--danger-bg)', color: 'var(--danger)' },
  Medium: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  Low: { bg: 'var(--success-bg)', color: 'var(--success)' },
}

export default function MyAssignments() {
  const { addToast } = useContext(ToastContext)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | upcoming | overdue
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await assignmentService.getAll({ search })
        setAssignments(data.assignments || [])
      } catch {
        addToast('Failed to load assignments', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [search])

  const now = new Date()
  const filtered = assignments.filter(a => {
    if (filter === 'upcoming') return new Date(a.due_date) >= now
    if (filter === 'overdue') return new Date(a.due_date) < now
    return true
  })

  const upcomingCount = assignments.filter(a => new Date(a.due_date) >= now).length
  const overdueCount = assignments.filter(a => new Date(a.due_date) < now).length

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">{assignments.length} total assignments</p>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', count: assignments.length, color: 'var(--primary)', bg: 'var(--primary-ghost)' },
          { label: 'Upcoming', count: upcomingCount, color: 'var(--secondary)', bg: 'var(--secondary-ghost)' },
          { label: 'Overdue', count: overdueCount, color: 'var(--danger)', bg: 'var(--danger-bg)' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} style={{
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <p style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{count}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.25rem' }}>
          <SearchBar
            value={search} onChange={setSearch}
            placeholder="Search assignments..."
            style={{ flex: 1, minWidth: 200 }}
          />
          <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
            {['all', 'upcoming', 'overdue'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '0.4rem 0.9rem',
                background: filter === f ? 'var(--primary)' : 'transparent',
                color: filter === f ? 'white' : 'var(--text-muted)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                transition: 'var(--transition)', textTransform: 'capitalize',
              }}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={FiBookOpen} message="No assignments found." />
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: '1.25rem',
        }}>
          {filtered.map(a => {
            const overdue = new Date(a.due_date) < now
            const pc = priorityColors[a.priority] || priorityColors.Medium
            return (
              <div
                key={a.id}
                style={{
                  background: 'var(--white)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)', transition: 'var(--transition-slow)',
                  display: 'flex', flexDirection: 'column', gap: '1rem',
                  borderTop: `3px solid ${pc.color}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>{a.title}</p>
                    {a.subject && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600, marginTop: '0.15rem' }}>
                        {a.subject}
                      </p>
                    )}
                  </div>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    background: pc.bg, color: pc.color,
                    padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)',
                    flexShrink: 0,
                  }}>
                    {a.priority}
                  </span>
                </div>

                <p style={{
                  fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.65,
                  display: '-webkit-box', WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {a.description}
                </p>

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.65rem 0.9rem',
                  background: overdue ? 'var(--danger-bg)' : 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: 700,
                    color: overdue ? 'var(--danger)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', gap: '0.3rem',
                  }}>
                    <FiCalendar size={13} />
                    {overdue ? 'Overdue · ' : 'Due: '}{formatDate(a.due_date)}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{timeAgo(a.created_at)}</span>
                </div>

                <button
                  onClick={() => setSelected(a)}
                  style={{
                    width: '100%', padding: '0.6rem',
                    background: 'var(--primary-ghost)',
                    color: 'var(--primary)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    fontSize: '0.83rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary-ghost)'; e.currentTarget.style.color = 'var(--primary)' }}
                >
                  <FiEye size={14} /> View Details
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Assignment Details" size="md">
        {selected && (
          <div>
            <div style={{ background: 'var(--primary-ghost)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                {selected.title}
              </h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {selected.subject && <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>📖 {selected.subject}</span>}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📅 Due: {formatDate(selected.due_date)}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🕐 {timeAgo(selected.created_at)}</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.6rem' }}>DESCRIPTION</p>
              <p style={{
                fontSize: '0.9rem', color: 'var(--text-secondary)',
                lineHeight: 1.8, whiteSpace: 'pre-wrap',
                background: 'var(--bg)', padding: '1rem', borderRadius: 'var(--radius-md)',
              }}>
                {selected.description}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}