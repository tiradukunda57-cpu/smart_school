import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiBookOpen, FiCalendar, FiChevronRight,
  FiSearch, FiClock, FiHelpCircle, FiX,
} from 'react-icons/fi'
import DashboardLayout        from '../../components/common/DashboardLayout'
import { assignmentService }  from '../../services/assignmentService'
import { ToastContext }        from '../../context/ToastContext'

const TYPE_META = {
  assignment: { color: '#3182ce', bg: '#ebf8ff', label: 'Assignment' },
  quiz:       { color: '#d69e2e', bg: '#fffbeb', label: 'Quiz'       },
  exam:       { color: '#e53e3e', bg: '#fff1f0', label: 'Exam'       },
  note:       { color: '#38a169', bg: '#f0fff4', label: 'Study Note' },
}

const PRIORITY_META = {
  High:   { color: '#e53e3e', bg: '#fff1f0' },
  Medium: { color: '#d69e2e', bg: '#fffbeb' },
  Low:    { color: '#38a169', bg: '#f0fff4' },
}

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const isOverdue = (d) => d && new Date(d) < new Date()

const inputStyle = {
  fontSize:     '0.9rem',
  border:       '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding:      '0.65rem 0.85rem',
  background:   'var(--white)',
  color:        'var(--text-primary)',
  boxSizing:    'border-box',
  fontFamily:   'inherit',
  outline:      'none',
}

export default function StudentAssignments() {
  const navigate     = useNavigate()
  const { addToast } = useContext(ToastContext)

  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterType, setFilterType]   = useState('')

  useEffect(() => {
    setLoading(true)
    assignmentService.getAll({ search })
      .then(d => setAssignments(d.assignments || []))
      .catch(() => addToast('Failed to load', 'error'))
      .finally(() => setLoading(false))
  }, [search])

  const filtered = filterType
    ? assignments.filter(a => a.type === filterType)
    : assignments

  const TYPES = Object.entries(TYPE_META).map(([value, meta]) => ({
    value, ...meta,
  }))

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize:   '1.5rem',
          fontWeight: 800,
          color:      'var(--text-primary)',
        }}>
          My Assignments
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {assignments.length} item{assignments.length !== 1 ? 's' : ''} from your teachers
        </p>
      </div>

      {/* Filter chips */}
      <div style={{
        display:      'flex',
        gap:          '0.5rem',
        marginBottom: '1rem',
        flexWrap:     'wrap',
      }}>
        <button
          onClick={() => setFilterType('')}
          style={{
            padding:      '0.4rem 0.9rem',
            border:       `1px solid ${filterType === '' ? 'var(--primary)' : 'var(--border)'}`,
            borderRadius: '999px',
            background:   filterType === '' ? 'var(--primary-ghost, #ebf8ff)' : 'var(--white)',
            color:        filterType === '' ? 'var(--primary)' : 'var(--text-muted)',
            fontSize:     '0.82rem',
            fontWeight:   filterType === '' ? 700 : 500,
            cursor:       'pointer',
          }}
        >
          All ({assignments.length})
        </button>
        {TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setFilterType(filterType === t.value ? '' : t.value)}
            style={{
              padding:      '0.4rem 0.9rem',
              border:       `1px solid ${filterType === t.value ? t.color : 'var(--border)'}`,
              borderRadius: '999px',
              background:   filterType === t.value ? t.bg : 'var(--white)',
              color:        filterType === t.value ? t.color : 'var(--text-muted)',
              fontSize:     '0.82rem',
              fontWeight:   filterType === t.value ? 700 : 500,
              cursor:       'pointer',
            }}
          >
            {t.label} ({assignments.filter(a => a.type === t.value).length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <FiSearch size={15} style={{
          position:      'absolute',
          left:          '0.85rem',
          top:           '50%',
          transform:     'translateY(-50%)',
          color:         'var(--text-light)',
          pointerEvents: 'none',
        }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search assignments..."
          style={{ ...inputStyle, width: '100%', paddingLeft: '2.2rem' }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position:   'absolute',
              right:      '0.7rem',
              top:        '50%',
              transform:  'translateY(-50%)',
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              color:      'var(--text-muted)',
              display:    'flex',
              padding:    0,
            }}
          >
            <FiX size={15} />
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          display:        'flex',
          justifyContent: 'center',
          padding:        '4rem',
          color:          'var(--text-muted)',
        }}>
          <div style={{
            width:        36,
            height:       36,
            border:       '3px solid var(--border)',
            borderTop:    '3px solid var(--primary)',
            borderRadius: '50%',
            animation:    'spin 0.8s linear infinite',
          }} />
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign:    'center',
          padding:      '4rem 2rem',
          background:   'var(--white)',
          borderRadius: 'var(--radius-xl)',
          border:       '1px solid var(--border)',
        }}>
          <FiBookOpen size={40} color="var(--text-light)" style={{ marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {search || filterType ? 'No matches found' : 'No assignments yet from your teachers.'}
          </p>
        </div>
      )}

      {/* Cards grid */}
      {!loading && filtered.length > 0 && (
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap:                 '1.25rem',
        }}>
          {filtered.map(a => {
            const typeMeta = TYPE_META[a.type] || TYPE_META.assignment
            const priMeta  = PRIORITY_META[a.priority] || PRIORITY_META.Medium
            const overdue  = isOverdue(a.due_date)
            const qCount   = Array.isArray(a.questions) ? a.questions.length : 0
            const isNote   = a.type === 'note'

            return (
              <div
                key={a.id}
                style={{
                  background:    'var(--white)',
                  border:        '1px solid var(--border)',
                  borderRadius:  'var(--radius-xl)',
                  overflow:      'hidden',
                  boxShadow:     'var(--shadow-sm)',
                  transition:    'all 0.2s',
                  display:       'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Color top bar */}
                <div style={{
                  height:     4,
                  background: typeMeta.color,
                }} />

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize:     '0.72rem',
                      fontWeight:   700,
                      background:   typeMeta.bg,
                      color:        typeMeta.color,
                      padding:      '0.2rem 0.55rem',
                      borderRadius: '999px',
                      textTransform:'uppercase',
                    }}>
                      {typeMeta.label}
                    </span>
                    <span style={{
                      fontSize:     '0.72rem',
                      fontWeight:   700,
                      background:   priMeta.bg,
                      color:        priMeta.color,
                      padding:      '0.2rem 0.55rem',
                      borderRadius: '999px',
                    }}>
                      {a.priority}
                    </span>
                    {overdue && !isNote && (
                      <span style={{
                        fontSize:     '0.72rem',
                        fontWeight:   700,
                        background:   '#fff1f0',
                        color:        '#e53e3e',
                        padding:      '0.2rem 0.55rem',
                        borderRadius: '999px',
                      }}>
                        Overdue
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <p style={{
                      fontWeight:          700,
                      fontSize:            '0.95rem',
                      color:               'var(--text-primary)',
                      lineHeight:          1.4,
                      display:             '-webkit-box',
                      WebkitLineClamp:     2,
                      WebkitBoxOrient:     'vertical',
                      overflow:            'hidden',
                    }}>
                      {a.title}
                    </p>
                    {a.course && (
                      <p style={{
                        fontSize:   '0.78rem',
                        color:      typeMeta.color,
                        fontWeight: 600,
                        marginTop:  '0.2rem',
                      }}>
                        {a.course}
                      </p>
                    )}
                  </div>

                  {/* Description preview */}
                  <p style={{
                    fontSize:            '0.82rem',
                    color:               'var(--text-muted)',
                    lineHeight:          1.6,
                    display:             '-webkit-box',
                    WebkitLineClamp:     2,
                    WebkitBoxOrient:     'vertical',
                    overflow:            'hidden',
                    flex:                1,
                  }}>
                    {a.description}
                  </p>

                  {/* Stats */}
                  <div style={{
                    display:    'flex',
                    gap:        '0.75rem',
                    flexWrap:   'wrap',
                    paddingTop: '0.5rem',
                    borderTop:  '1px solid var(--border-light)',
                    fontSize:   '0.75rem',
                    color:      'var(--text-muted)',
                  }}>
                    {!isNote && (
                      <span style={{
                        display:    'flex',
                        alignItems: 'center',
                        gap:        '0.3rem',
                        color:      overdue ? '#e53e3e' : 'var(--text-muted)',
                        fontWeight: overdue ? 700 : 400,
                      }}>
                        <FiCalendar size={11} /> {formatDate(a.due_date)}
                      </span>
                    )}
                    {qCount > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FiHelpCircle size={11} /> {qCount} question{qCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {a.time_limit && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <FiClock size={11} /> {a.time_limit} min
                      </span>
                    )}
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => navigate(`/student/assessments/${a.id}`)}
                  style={{
                    padding:        '0.85rem',
                    background:     typeMeta.color,
                    color:          'white',
                    border:         'none',
                    cursor:         'pointer',
                    fontSize:       '0.88rem',
                    fontWeight:     700,
                    display:        'flex',
                    alignItems:     'center',
                    justifyContent: 'center',
                    gap:            '0.5rem',
                    transition:     'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {isNote   ? 'Read Note'
                  : qCount > 0 ? 'Start Assessment'
                  : 'View Assignment'}
                  <FiChevronRight size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}