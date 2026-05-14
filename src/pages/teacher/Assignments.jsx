import React, {
  useState, useEffect, useContext, useCallback
} from 'react'
import {
  FiPlus, FiTrash2, FiEdit, FiBookOpen,
  FiCalendar, FiClock, FiSearch, FiZap,
  FiFileText, FiCheckCircle, FiAlertCircle,
  FiChevronRight, FiGrid, FiList, FiX,
  FiCheck, FiHelpCircle, FiType, FiToggleLeft,
} from 'react-icons/fi'
import DashboardLayout  from '../../components/common/DashboardLayout'
import Card             from '../../components/common/Card'
import PendingBanner from '../../components/common/PendingBanner'
import Button           from '../../components/common/Button'
import Modal            from '../../components/common/Modal'
import { assignmentService } from '../../services/assignmentService'
import { ToastContext } from '../../context/ToastContext'
import { useAuth }      from '../../hooks/useAuth'

// ─── Constants ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '', description: '', course: '',
  due_date: '', priority: 'Medium',
  type: 'assignment', time_limit: '', max_score: 100,
  questions: [],
}

const EMPTY_QUESTION = {
  type: 'multiple_choice',
  text: '',
  options: ['', '', '', ''],
  correct_answer: '',
  points: 1,
  explanation: '',
}

const PRIORITIES = ['Low', 'Medium', 'High']
const TYPES      = [
  { value: 'assignment', label: 'Assignment', icon: FiFileText,    color: 'var(--primary)'   },
  { value: 'quiz',       label: 'Quiz',       icon: FiZap,         color: 'var(--warning)'   },
  { value: 'exam',       label: 'Exam',       icon: FiAlertCircle, color: 'var(--danger)'    },
  { value: 'note',       label: 'Study Note', icon: FiBookOpen,    color: 'var(--success)'   },
]

const Q_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice', icon: FiCheckCircle },
  { value: 'true_false',      label: 'True / False',    icon: FiToggleLeft  },
  { value: 'short_answer',    label: 'Short Answer',    icon: FiType        },
  { value: 'essay',           label: 'Essay',           icon: FiFileText    },
]

const PRIORITY_META = {
  High:   { bg: '#fff1f0', color: '#e53e3e', border: '#feb2b2' },
  Medium: { bg: '#fffbeb', color: '#d69e2e', border: '#fcd34d' },
  Low:    { bg: '#f0fff4', color: '#38a169', border: '#9ae6b4' },
}

const TYPE_META = {
  assignment: { bg: '#ebf8ff', color: '#3182ce', border: '#bee3f8' },
  quiz:       { bg: '#fffbeb', color: '#d69e2e', border: '#fcd34d' },
  exam:       { bg: '#fff1f0', color: '#e53e3e', border: '#feb2b2' },
  note:       { bg: '#f0fff4', color: '#38a169', border: '#9ae6b4' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

const timeAgo = (d) => {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs  < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const isOverdue = (d) => d && new Date(d) < new Date()

// ─── TypeBadge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const meta = TYPE_META[type] || TYPE_META.assignment
  const t    = TYPES.find(t => t.value === type)
  const Icon = t?.icon || FiFileText
  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          '0.3rem',
      fontSize:     '0.72rem',
      fontWeight:   700,
      background:   meta.bg,
      color:        meta.color,
      border:       `1px solid ${meta.border}`,
      padding:      '0.2rem 0.55rem',
      borderRadius: '999px',
      textTransform:'uppercase',
      letterSpacing:'0.03em',
    }}>
      <Icon size={10} />
      {t?.label || type}
    </span>
  )
}

// ─── PriorityBadge ────────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const meta = PRIORITY_META[priority] || PRIORITY_META.Medium
  return (
    <span style={{
      fontSize:     '0.72rem',
      fontWeight:   700,
      background:   meta.bg,
      color:        meta.color,
      border:       `1px solid ${meta.border}`,
      padding:      '0.2rem 0.55rem',
      borderRadius: '999px',
    }}>
      {priority}
    </span>
  )
}

// ─── QuestionBuilder ──────────────────────────────────────────────────────────
function QuestionBuilder({ questions, onChange }) {
  const addQuestion = () => {
    onChange([...questions, { ...EMPTY_QUESTION, options: ['', '', '', ''] }])
  }

  const removeQuestion = (idx) => {
    onChange(questions.filter((_, i) => i !== idx))
  }

  const updateQuestion = (idx, field, value) => {
    const updated = questions.map((q, i) =>
      i === idx ? { ...q, [field]: value } : q
    )
    onChange(updated)
  }

  const updateOption = (qIdx, optIdx, value) => {
    const updated = questions.map((q, i) => {
      if (i !== qIdx) return q
      const options = [...q.options]
      options[optIdx] = value
      return { ...q, options }
    })
    onChange(updated)
  }

  const addOption = (qIdx) => {
    const updated = questions.map((q, i) =>
      i === qIdx ? { ...q, options: [...q.options, ''] } : q
    )
    onChange(updated)
  }

  const removeOption = (qIdx, optIdx) => {
    const updated = questions.map((q, i) => {
      if (i !== qIdx) return q
      const options = q.options.filter((_, oi) => oi !== optIdx)
      return { ...q, options }
    })
    onChange(updated)
  }

  return (
    <div>
      {/* Question list */}
      {questions.map((q, idx) => (
        <div key={idx} style={{
          border:       '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1rem',
          overflow:     'hidden',
          boxShadow:    'var(--shadow-sm)',
        }}>
          {/* Question header */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'space-between',
            padding:        '0.75rem 1rem',
            background:     'var(--bg)',
            borderBottom:   '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                width:          28,
                height:         28,
                background:     'var(--primary)',
                color:          'white',
                borderRadius:   '50%',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       '0.78rem',
                fontWeight:     700,
                flexShrink:     0,
              }}>
                {idx + 1}
              </span>
              {/* Question type selector */}
              <select
                value={q.type}
                onChange={e => updateQuestion(idx, 'type', e.target.value)}
                style={{
                  fontSize:     '0.8rem',
                  fontWeight:   600,
                  border:       '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding:      '0.3rem 0.6rem',
                  background:   'var(--white)',
                  color:        'var(--text-primary)',
                  cursor:       'pointer',
                }}
              >
                {Q_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              {/* Points */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pts:</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={q.points}
                  onChange={e => updateQuestion(idx, 'points', parseInt(e.target.value) || 1)}
                  style={{
                    width:        50,
                    fontSize:     '0.8rem',
                    fontWeight:   600,
                    border:       '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding:      '0.3rem 0.4rem',
                    textAlign:    'center',
                    background:   'var(--white)',
                    color:        'var(--text-primary)',
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => removeQuestion(idx)}
              style={{
                background:   'none',
                border:       'none',
                cursor:       'pointer',
                color:        'var(--danger)',
                padding:      '0.3rem',
                borderRadius: 'var(--radius-sm)',
                display:      'flex',
                alignItems:   'center',
              }}
            >
              <FiTrash2 size={15} />
            </button>
          </div>

          {/* Question body */}
          <div style={{ padding: '1rem' }}>
            {/* Question text */}
            <textarea
              value={q.text}
              onChange={e => updateQuestion(idx, 'text', e.target.value)}
              placeholder={`Question ${idx + 1} — type your question here...`}
              rows={2}
              style={{
                width:        '100%',
                fontSize:     '0.88rem',
                fontWeight:   600,
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding:      '0.65rem 0.8rem',
                resize:       'vertical',
                background:   'var(--white)',
                color:        'var(--text-primary)',
                lineHeight:   1.6,
                boxSizing:    'border-box',
                fontFamily:   'inherit',
              }}
            />

            {/* Multiple choice options */}
            {q.type === 'multiple_choice' && (
              <div style={{ marginTop: '0.75rem' }}>
                <p style={{
                  fontSize:  '0.78rem',
                  fontWeight: 600,
                  color:     'var(--text-muted)',
                  marginBottom: '0.5rem',
                }}>
                  OPTIONS — click the ✓ circle to mark correct answer
                </p>
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '0.5rem',
                    marginBottom: '0.5rem',
                  }}>
                    {/* Correct answer radio */}
                    <button
                      onClick={() => updateQuestion(idx, 'correct_answer', String(oi))}
                      style={{
                        width:          28,
                        height:         28,
                        borderRadius:   '50%',
                        border:         `2px solid ${
                          String(q.correct_answer) === String(oi)
                            ? 'var(--success)'
                            : 'var(--border)'
                        }`,
                        background:     String(q.correct_answer) === String(oi)
                          ? 'var(--success)'
                          : 'transparent',
                        cursor:         'pointer',
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        flexShrink:     0,
                        transition:     'all 0.2s',
                      }}
                    >
                      {String(q.correct_answer) === String(oi) && (
                        <FiCheck size={14} color="white" />
                      )}
                    </button>
                    {/* Option label */}
                    <span style={{
                      width:          24,
                      height:         24,
                      background:     'var(--bg)',
                      border:         '1px solid var(--border)',
                      borderRadius:   'var(--radius-sm)',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      fontSize:       '0.75rem',
                      fontWeight:     700,
                      color:          'var(--text-muted)',
                      flexShrink:     0,
                    }}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <input
                      value={opt}
                      onChange={e => updateOption(idx, oi, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      style={{
                        flex:         1,
                        fontSize:     '0.85rem',
                        border:       '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding:      '0.45rem 0.7rem',
                        background:   'var(--white)',
                        color:        'var(--text-primary)',
                        fontFamily:   'inherit',
                      }}
                    />
                    {q.options.length > 2 && (
                      <button
                        onClick={() => removeOption(idx, oi)}
                        style={{
                          background: 'none',
                          border:     'none',
                          cursor:     'pointer',
                          color:      'var(--text-muted)',
                          padding:    '0.2rem',
                          display:    'flex',
                          flexShrink: 0,
                        }}
                      >
                        <FiX size={13} />
                      </button>
                    )}
                  </div>
                ))}
                {q.options.length < 6 && (
                  <button
                    onClick={() => addOption(idx)}
                    style={{
                      fontSize:     '0.8rem',
                      color:        'var(--primary)',
                      background:   'none',
                      border:       '1px dashed var(--primary)',
                      borderRadius: 'var(--radius-sm)',
                      padding:      '0.4rem 0.75rem',
                      cursor:       'pointer',
                      marginTop:    '0.25rem',
                      display:      'flex',
                      alignItems:   'center',
                      gap:          '0.3rem',
                    }}
                  >
                    <FiPlus size={13} /> Add Option
                  </button>
                )}
              </div>
            )}

            {/* True/False */}
            {q.type === 'true_false' && (
              <div style={{
                display: 'flex',
                gap:     '0.75rem',
                marginTop: '0.75rem',
              }}>
                {['True', 'False'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => updateQuestion(idx, 'correct_answer', tf)}
                    style={{
                      flex:         1,
                      padding:      '0.65rem',
                      border:       `2px solid ${
                        q.correct_answer === tf
                          ? tf === 'True' ? 'var(--success)' : 'var(--danger)'
                          : 'var(--border)'
                      }`,
                      borderRadius: 'var(--radius-md)',
                      background:   q.correct_answer === tf
                        ? tf === 'True' ? 'var(--success-bg, #f0fff4)' : 'var(--danger-bg)'
                        : 'var(--white)',
                      color:        q.correct_answer === tf
                        ? tf === 'True' ? 'var(--success)' : 'var(--danger)'
                        : 'var(--text-muted)',
                      fontWeight:   700,
                      fontSize:     '0.88rem',
                      cursor:       'pointer',
                      transition:   'all 0.2s',
                    }}
                  >
                    {tf === 'True' ? '✓ True' : '✗ False'}
                  </button>
                ))}
              </div>
            )}

            {/* Short answer / Essay — just show hint */}
            {(q.type === 'short_answer' || q.type === 'essay') && (
              <div style={{
                marginTop:    '0.75rem',
                padding:      '0.75rem',
                background:   'var(--bg)',
                borderRadius: 'var(--radius-md)',
                border:       '1px dashed var(--border)',
              }}>
                <p style={{
                  fontSize:   '0.8rem',
                  color:      'var(--text-muted)',
                  fontStyle:  'italic',
                  display:    'flex',
                  alignItems: 'center',
                  gap:        '0.4rem',
                }}>
                  <FiType size={13} />
                  Students will type their {q.type === 'essay' ? 'essay' : 'answer'} here.
                  Manual grading required.
                </p>
                <input
                  value={q.correct_answer}
                  onChange={e => updateQuestion(idx, 'correct_answer', e.target.value)}
                  placeholder="Model answer / grading notes (optional)"
                  style={{
                    width:        '100%',
                    fontSize:     '0.82rem',
                    border:       '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    padding:      '0.45rem 0.7rem',
                    marginTop:    '0.5rem',
                    background:   'var(--white)',
                    color:        'var(--text-muted)',
                    boxSizing:    'border-box',
                    fontFamily:   'inherit',
                  }}
                />
              </div>
            )}

            {/* Explanation */}
            <input
              value={q.explanation}
              onChange={e => updateQuestion(idx, 'explanation', e.target.value)}
              placeholder="Explanation shown after submission (optional)"
              style={{
                width:        '100%',
                fontSize:     '0.8rem',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding:      '0.4rem 0.7rem',
                marginTop:    '0.75rem',
                background:   'var(--bg)',
                color:        'var(--text-muted)',
                boxSizing:    'border-box',
                fontFamily:   'inherit',
              }}
            />
          </div>
        </div>
      ))}

      {/* Add question button */}
      <button
        onClick={addQuestion}
        style={{
          width:          '100%',
          padding:        '0.9rem',
          border:         '2px dashed var(--primary)',
          borderRadius:   'var(--radius-lg)',
          background:     'var(--primary-ghost, #ebf8ff)',
          color:          'var(--primary)',
          fontSize:       '0.88rem',
          fontWeight:     700,
          cursor:         'pointer',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          gap:            '0.5rem',
          transition:     'all 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-ghost-hover, #bee3f8)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--primary-ghost, #ebf8ff)'}
      >
        <FiPlus size={17} /> Add Question
      </button>

      {questions.length > 0 && (
        <div style={{
          marginTop:    '0.75rem',
          padding:      '0.65rem 1rem',
          background:   'var(--bg)',
          borderRadius: 'var(--radius-md)',
          display:      'flex',
          gap:          '1.5rem',
          flexWrap:     'wrap',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            📋 <strong>{questions.length}</strong> question{questions.length !== 1 ? 's' : ''}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            🏆 Total: <strong>{questions.reduce((s, q) => s + (q.points || 1), 0)}</strong> pts
          </span>
        </div>
      )}
    </div>
  )
}

// ─── AssignmentCard ───────────────────────────────────────────────────────────
function AssignmentCard({ assignment: a, onView, onEdit, onDelete }) {
  const typeMeta = TYPE_META[a.type]   || TYPE_META.assignment
  const priMeta  = PRIORITY_META[a.priority] || PRIORITY_META.Medium
  const overdue  = isOverdue(a.due_date)
  const qCount   = Array.isArray(a.questions) ? a.questions.length : 0

  return (
    <div style={{
      background:     'var(--white)',
      border:         '1px solid var(--border)',
      borderRadius:   'var(--radius-lg)',
      padding:        '1.4rem',
      boxShadow:      'var(--shadow-sm)',
      display:        'flex',
      flexDirection:  'column',
      gap:            '0.9rem',
      borderTop:      `3px solid ${typeMeta.color}`,
      transition:     'all 0.2s',
      cursor:         'default',
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
      {/* Badges */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <TypeBadge type={a.type} />
        <PriorityBadge priority={a.priority} />
        {overdue && (
          <span style={{
            fontSize:     '0.72rem',
            fontWeight:   700,
            background:   PRIORITY_META.High.bg,
            color:        PRIORITY_META.High.color,
            border:       `1px solid ${PRIORITY_META.High.border}`,
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
          display:             '-webkit-box',
          WebkitLineClamp:     2,
          WebkitBoxOrient:     'vertical',
          overflow:            'hidden',
          lineHeight:          1.4,
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

      {/* Description */}
      <p style={{
        fontSize:            '0.82rem',
        color:               'var(--text-muted)',
        lineHeight:          1.6,
        display:             '-webkit-box',
        WebkitLineClamp:     2,
        WebkitBoxOrient:     'vertical',
        overflow:            'hidden',
      }}>
        {a.description}
      </p>

      {/* Stats row */}
      <div style={{
        display:         'flex',
        gap:             '1rem',
        flexWrap:        'wrap',
        paddingTop:      '0.5rem',
        borderTop:       '1px solid var(--border-light)',
      }}>
        <span style={{
          fontSize:   '0.75rem',
          color:      overdue ? PRIORITY_META.High.color : 'var(--text-muted)',
          display:    'flex',
          alignItems: 'center',
          gap:        '0.3rem',
          fontWeight: overdue ? 700 : 400,
        }}>
          <FiCalendar size={12} />
          {formatDate(a.due_date)}
        </span>
        {qCount > 0 && (
          <span style={{
            fontSize:   '0.75rem',
            color:      'var(--text-muted)',
            display:    'flex',
            alignItems: 'center',
            gap:        '0.3rem',
          }}>
            <FiHelpCircle size={12} />
            {qCount} question{qCount !== 1 ? 's' : ''}
          </span>
        )}
        {a.max_score && (
          <span style={{
            fontSize:   '0.75rem',
            color:      'var(--text-muted)',
            display:    'flex',
            alignItems: 'center',
            gap:        '0.3rem',
          }}>
            🏆 {a.max_score} pts
          </span>
        )}
        <span style={{
          fontSize:   '0.75rem',
          color:      'var(--text-light)',
          marginLeft: 'auto',
        }}>
          {timeAgo(a.created_at)}
        </span>
      </div>

      {/* Actions */}
      <div style={{
        display:   'flex',
        gap:       '0.5rem',
        marginTop: '0.25rem',
      }}>
        <button
          onClick={onView}
          style={{
            flex:         2,
            padding:      '0.55rem',
            background:   'var(--primary-ghost, #ebf8ff)',
            color:        'var(--primary)',
            border:       'none',
            borderRadius: 'var(--radius-md)',
            fontSize:     '0.82rem',
            fontWeight:   700,
            cursor:       'pointer',
            display:      'flex',
            alignItems:   'center',
            justifyContent:'center',
            gap:          '0.35rem',
            transition:   'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <FiBookOpen size={14} /> View
        </button>
        <button
          onClick={onEdit}
          style={{
            flex:         1,
            padding:      '0.55rem',
            background:   'var(--bg)',
            color:        'var(--text-muted)',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            cursor:       'pointer',
            display:      'flex',
            alignItems:   'center',
            justifyContent:'center',
            transition:   'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--secondary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <FiEdit size={14} />
        </button>
        <button
          onClick={onDelete}
          style={{
            flex:         1,
            padding:      '0.55rem',
            background:   'var(--bg)',
            color:        'var(--text-muted)',
            border:       '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            cursor:       'pointer',
            display:      'flex',
            alignItems:   'center',
            justifyContent:'center',
            transition:   'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = PRIORITY_META.High.color
            e.currentTarget.style.color       = PRIORITY_META.High.color
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color       = 'var(--text-muted)'
          }}
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── AssignmentFormModal ──────────────────────────────────────────────────────
function AssignmentFormModal({
  isOpen, onClose, title,
  form, setForm, errors,
  saving, onSubmit, submitLabel,
}) {
  const [activeTab, setActiveTab] = useState('details')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
  }

  const tabs = [
    { key: 'details',   label: 'Details',   icon: FiFileText   },
    { key: 'questions', label: 'Questions',  icon: FiHelpCircle },
    { key: 'settings',  label: 'Settings',  icon: FiZap        },
  ]

  if (!isOpen) return null

  return (
    <div
      style={{
        position:       'fixed',
        inset:          0,
        background:     'rgba(0,0,0,0.5)',
        zIndex:         1000,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '1rem',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background:    'var(--white)',
        borderRadius:  'var(--radius-xl, 16px)',
        width:         '100%',
        maxWidth:      760,
        maxHeight:     '90vh',
        display:       'flex',
        flexDirection: 'column',
        boxShadow:     '0 20px 60px rgba(0,0,0,0.2)',
        overflow:      'hidden',
      }}>
        {/* Modal Header */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          padding:        '1.25rem 1.5rem',
          borderBottom:   '1px solid var(--border)',
          flexShrink:     0,
        }}>
          <h2 style={{
            fontSize:   '1.1rem',
            fontWeight: 800,
            color:      'var(--text-primary)',
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background:   'none',
              border:       'none',
              cursor:       'pointer',
              color:        'var(--text-muted)',
              padding:      '0.35rem',
              borderRadius: 'var(--radius-sm)',
              display:      'flex',
              transition:   'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display:      'flex',
          gap:          '0.25rem',
          padding:      '0.75rem 1.5rem 0',
          borderBottom: '1px solid var(--border)',
          flexShrink:   0,
        }}>
          {tabs.map(t => {
            const Icon    = t.icon
            const isActive = activeTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  display:       'flex',
                  alignItems:    'center',
                  gap:           '0.4rem',
                  padding:       '0.6rem 1rem',
                  border:        'none',
                  borderBottom:  isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  background:    'none',
                  color:         isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize:      '0.85rem',
                  fontWeight:    isActive ? 700 : 500,
                  cursor:        'pointer',
                  transition:    'all 0.2s',
                  marginBottom:  '-1px',
                }}
              >
                <Icon size={14} /> {t.label}
                {t.key === 'questions' && form.questions?.length > 0 && (
                  <span style={{
                    background:   'var(--primary)',
                    color:        'white',
                    borderRadius: '999px',
                    fontSize:     '0.68rem',
                    fontWeight:   700,
                    padding:      '0.1rem 0.45rem',
                    lineHeight:   1.4,
                  }}>
                    {form.questions.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Modal Body — scrollable */}
        <div style={{
          flex:       1,
          overflowY:  'auto',
          padding:    '1.5rem',
        }}>

          {/* ── DETAILS TAB ── */}
          {activeTab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Type selector */}
              <div>
                <label style={{
                  fontSize:     '0.8rem',
                  fontWeight:   700,
                  color:        'var(--text-muted)',
                  display:      'block',
                  marginBottom: '0.5rem',
                  textTransform:'uppercase',
                  letterSpacing:'0.04em',
                }}>
                  Type
                </label>
                <div style={{
                  display:             'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap:                 '0.5rem',
                }}>
                  {TYPES.map(t => {
                    const Icon     = t.icon
                    const isActive = form.type === t.value
                    return (
                      <button
                        key={t.value}
                        onClick={() => setForm(p => ({ ...p, type: t.value }))}
                        style={{
                          padding:       '0.75rem 0.5rem',
                          border:        `2px solid ${isActive ? t.color : 'var(--border)'}`,
                          borderRadius:  'var(--radius-md)',
                          background:    isActive ? `${t.color}15` : 'var(--white)',
                          color:         isActive ? t.color : 'var(--text-muted)',
                          cursor:        'pointer',
                          display:       'flex',
                          flexDirection: 'column',
                          alignItems:    'center',
                          gap:           '0.35rem',
                          fontSize:      '0.78rem',
                          fontWeight:    isActive ? 700 : 500,
                          transition:    'all 0.2s',
                        }}
                      >
                        <Icon size={18} />
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={labelStyle}>Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Chapter 3 Quiz — Algebra"
                  style={{
                    ...inputStyle,
                    borderColor: errors.title ? 'var(--danger)' : 'var(--border)',
                  }}
                />
                {errors.title && <span style={errorStyle}>{errors.title}</span>}
              </div>

              {/* Course + Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Course</label>
                  <input
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    placeholder="e.g. Mathematics"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due date */}
              <div>
                <label style={labelStyle}>Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  style={{
                    ...inputStyle,
                    borderColor: errors.due_date ? 'var(--danger)' : 'var(--border)',
                  }}
                />
                {errors.due_date && (
                  <span style={errorStyle}>{errors.due_date}</span>
                )}
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description / Instructions *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the assignment, paste instructions, notes, or any content..."
                  rows={6}
                  style={{
                    ...inputStyle,
                    resize:      'vertical',
                    lineHeight:  1.7,
                    borderColor: errors.description ? 'var(--danger)' : 'var(--border)',
                  }}
                />
                {errors.description && (
                  <span style={errorStyle}>{errors.description}</span>
                )}
                <span style={{
                  fontSize: '0.75rem',
                  color:    'var(--text-light)',
                }}>
                  {form.description.length} characters
                </span>
              </div>
            </div>
          )}

          {/* ── QUESTIONS TAB ── */}
          {activeTab === 'questions' && (
            <div>
              <div style={{
                padding:      '0.75rem 1rem',
                background:   'var(--bg)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize:     '0.82rem',
                color:        'var(--text-muted)',
                lineHeight:   1.6,
              }}>
                💡 Add interactive questions. Students will answer them one at a time.
                Multiple choice and True/False are auto-graded.
              </div>
              <QuestionBuilder
                questions={form.questions || []}
                onChange={qs => setForm(p => ({ ...p, questions: qs }))}
              />
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                display:             'grid',
                gridTemplateColumns: '1fr 1fr',
                gap:                 '1rem',
              }}>
                <div>
                  <label style={labelStyle}>Time Limit (minutes)</label>
                  <input
                    type="number"
                    name="time_limit"
                    value={form.time_limit}
                    onChange={handleChange}
                    placeholder="No limit"
                    min={1}
                    max={300}
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    Leave empty for no time limit
                  </span>
                </div>
                <div>
                  <label style={labelStyle}>Maximum Score</label>
                  <input
                    type="number"
                    name="max_score"
                    value={form.max_score}
                    onChange={handleChange}
                    min={1}
                    max={1000}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Summary */}
              <div style={{
                padding:      '1rem',
                background:   'var(--bg)',
                borderRadius: 'var(--radius-lg)',
                border:       '1px solid var(--border)',
              }}>
                <p style={{
                  fontSize:     '0.8rem',
                  fontWeight:   700,
                  color:        'var(--text-muted)',
                  marginBottom: '0.75rem',
                  textTransform:'uppercase',
                  letterSpacing:'0.04em',
                }}>
                  Summary
                </p>
                {[
                  ['Type',       form.type || '—'],
                  ['Questions',  `${form.questions?.length || 0} question(s)`],
                  ['Total pts',  `${(form.questions || []).reduce((s,q) => s + (q.points||1), 0)} pts (from questions)`],
                  ['Max score',  `${form.max_score || 100} pts`],
                  ['Time limit', form.time_limit ? `${form.time_limit} min` : 'No limit'],
                  ['Priority',   form.priority || 'Medium'],
                ].map(([label, val]) => (
                  <div key={label} style={{
                    display:        'flex',
                    justifyContent: 'space-between',
                    alignItems:     'center',
                    padding:        '0.4rem 0',
                    borderBottom:   '1px solid var(--border-light)',
                    fontSize:       '0.85rem',
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          display:        'flex',
          justifyContent: 'flex-end',
          gap:            '0.75rem',
          padding:        '1rem 1.5rem',
          borderTop:      '1px solid var(--border)',
          flexShrink:     0,
        }}>
          <button
            onClick={onClose}
            style={{
              padding:      '0.65rem 1.25rem',
              background:   'var(--bg)',
              border:       '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize:     '0.88rem',
              fontWeight:   600,
              cursor:       'pointer',
              color:        'var(--text-muted)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={saving}
            style={{
              padding:      '0.65rem 1.5rem',
              background:   saving ? 'var(--text-light)' : 'var(--primary)',
              color:        'white',
              border:       'none',
              borderRadius: 'var(--radius-md)',
              fontSize:     '0.88rem',
              fontWeight:   700,
              cursor:       saving ? 'not-allowed' : 'pointer',
              display:      'flex',
              alignItems:   'center',
              gap:          '0.4rem',
            }}
          >
            {saving ? 'Saving...' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// Shared input styles
const labelStyle = {
  fontSize:     '0.8rem',
  fontWeight:   700,
  color:        'var(--text-muted)',
  display:      'block',
  marginBottom: '0.4rem',
  textTransform:'uppercase',
  letterSpacing:'0.04em',
}

const inputStyle = {
  width:        '100%',
  fontSize:     '0.9rem',
  border:       '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding:      '0.65rem 0.85rem',
  background:   'var(--white)',
  color:        'var(--text-primary)',
  boxSizing:    'border-box',
  fontFamily:   'inherit',
  outline:      'none',
  transition:   'border-color 0.2s',
}

const errorStyle = {
  fontSize:  '0.78rem',
  color:     'var(--danger)',
  marginTop: '0.3rem',
  display:   'block',
}

// ─── Main Assignments Page ────────────────────────────────────────────────────
export default function Assignments() {
  const { addToast }  = useContext(ToastContext)
  const { user }      = useAuth()
  const isTeacher     = user?.role === 'teacher'

  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filterType, setFilterType]   = useState('')
  const [viewMode, setViewMode]       = useState('grid')

  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal]     = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)

  const [selected, setSelected] = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)

  // ── Fetch ─────────────────────────────────────────────────
  const fetchAssignments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await assignmentService.getAll({ search })
      setAssignments(data.assignments || [])
    } catch {
      addToast('Failed to load assignments', 'error')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchAssignments() }, [fetchAssignments])

  // ── Validate ───────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!form.title.trim())       errs.title       = 'Title is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Handlers ──────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await assignmentService.create(form)
      addToast('Assignment broadcast to all students!', 'success')
      setCreateModal(false)
      setForm(EMPTY_FORM)
      fetchAssignments()
    } catch (e) {
      addToast(e?.response?.data?.message || 'Failed to create', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      await assignmentService.update(selected.id, form)
      addToast('Assignment updated!', 'success')
      setEditModal(false)
      fetchAssignments()
    } catch (e) {
      addToast(e?.response?.data?.message || 'Failed to update', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await assignmentService.delete(selected.id)
      addToast('Assignment deleted', 'success')
      setDeleteModal(false)
      fetchAssignments()
    } catch {
      addToast('Failed to delete', 'error')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (a) => {
    setSelected(a)
    setForm({
      title:       a.title,
      description: a.description,
      course:      a.course      || '',
      due_date:    a.due_date?.split('T')[0] || '',
      priority:    a.priority    || 'Medium',
      type:        a.type        || 'assignment',
      questions:   Array.isArray(a.questions) ? a.questions : [],
      time_limit:  a.time_limit  || '',
      max_score:   a.max_score   || 100,
    })
    setErrors({})
    setEditModal(true)
  }

  // ── Filter ────────────────────────────────────────────────
  const filtered = filterType
    ? assignments.filter(a => a.type === filterType)
    : assignments

  // ── Counts ────────────────────────────────────────────────
  const counts = TYPES.reduce((acc, t) => ({
    ...acc,
    [t.value]: assignments.filter(a => a.type === t.value).length,
  }), {})

  // ── Render ────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <PendingBanner />
      {/* ── Page Header ─────────────────────────────────── */}
      <div style={{
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'space-between',
        marginBottom:   '1.5rem',
        gap:            '1rem',
        flexWrap:       'wrap',
      }}>
        <div>
          <h1 style={{
            fontSize:   '1.5rem',
            fontWeight: 800,
            color:      'var(--text-primary)',
          }}>
            Assignments
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {assignments.length} item{assignments.length !== 1 ? 's' : ''} broadcast to students
          </p>
        </div>
        {isTeacher && (
          <button
            onClick={() => { setForm(EMPTY_FORM); setErrors({}); setCreateModal(true) }}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '0.45rem',
              padding:      '0.7rem 1.25rem',
              background:   'var(--primary)',
              color:        'white',
              border:       'none',
              borderRadius: 'var(--radius-md)',
              fontSize:     '0.9rem',
              fontWeight:   700,
              cursor:       'pointer',
              boxShadow:    '0 2px 8px rgba(49,130,206,0.3)',
              transition:   'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <FiPlus size={16} /> New Assignment
          </button>
        )}
      </div>

      {/* ── Type filter chips ────────────────────────────── */}
      <div style={{
        display:      'flex',
        gap:          '0.5rem',
        marginBottom: '1.25rem',
        flexWrap:     'wrap',
      }}>
        <button
          onClick={() => setFilterType('')}
          style={chipStyle(filterType === '')}
        >
          All ({assignments.length})
        </button>
        {TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setFilterType(filterType === t.value ? '' : t.value)}
            style={chipStyle(filterType === t.value, t.color)}
          >
            {t.label} ({counts[t.value] || 0})
          </button>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────────── */}
      <div style={{
        display:       'flex',
        gap:           '0.75rem',
        marginBottom:  '1.5rem',
        alignItems:    'center',
        flexWrap:      'wrap',
      }}>
        {/* Search */}
        <div style={{
          flex:         1,
          minWidth:     200,
          position:     'relative',
          display:      'flex',
          alignItems:   'center',
        }}>
          <FiSearch size={15}
            style={{
              position:       'absolute',
              left:           '0.85rem',
              color:          'var(--text-light)',
              pointerEvents:  'none',
            }}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assignments..."
            style={{
              ...inputStyle,
              paddingLeft: '2.2rem',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position:   'absolute',
                right:      '0.7rem',
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

        {/* View toggle */}
        <div style={{
          display:      'flex',
          background:   'var(--bg)',
          borderRadius: 'var(--radius-md)',
          padding:      '3px',
          border:       '1px solid var(--border)',
        }}>
          {[
            { mode: 'grid', Icon: FiGrid },
            { mode: 'list', Icon: FiList },
          ].map(({ mode, Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding:      '0.45rem 0.75rem',
                background:   viewMode === mode ? 'var(--primary)' : 'transparent',
                color:        viewMode === mode ? 'white' : 'var(--text-muted)',
                border:       'none',
                borderRadius: 'var(--radius-sm)',
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                transition:   'all 0.2s',
              }}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Loading ──────────────────────────────────────── */}
      {loading && (
        <div style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '5rem',
          gap:            '1rem',
          color:          'var(--text-muted)',
        }}>
          <div style={{
            width:        40,
            height:       40,
            border:       '3px solid var(--border)',
            borderTop:    '3px solid var(--primary)',
            borderRadius: '50%',
            animation:    'spin 0.8s linear infinite',
          }} />
          Loading assignments...
        </div>
      )}

      {/* ── Empty ────────────────────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <div style={{
          textAlign:      'center',
          padding:        '5rem 2rem',
          background:     'var(--white)',
          borderRadius:   'var(--radius-xl)',
          border:         '1px solid var(--border)',
        }}>
          <div style={{
            width:          72,
            height:         72,
            background:     'var(--primary-ghost, #ebf8ff)',
            borderRadius:   '50%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 1.25rem',
          }}>
            <FiBookOpen size={32} color="var(--primary)" />
          </div>
          <h3 style={{
            fontSize:     '1.05rem',
            fontWeight:   700,
            color:        'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            {search || filterType ? 'No matches found' : 'No assignments yet'}
          </h3>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {search || filterType
              ? 'Try adjusting your search or filter'
              : 'Create your first assignment to broadcast to all students'}
          </p>
          {isTeacher && !search && !filterType && (
            <button
              onClick={() => { setForm(EMPTY_FORM); setCreateModal(true) }}
              style={{
                padding:      '0.65rem 1.5rem',
                background:   'var(--primary)',
                color:        'white',
                border:       'none',
                borderRadius: 'var(--radius-md)',
                fontSize:     '0.9rem',
                fontWeight:   700,
                cursor:       'pointer',
                display:      'inline-flex',
                alignItems:   'center',
                gap:          '0.4rem',
              }}
            >
              <FiPlus size={15} /> Create Assignment
            </button>
          )}
        </div>
      )}

      {/* ── Grid View ────────────────────────────────────── */}
      {!loading && filtered.length > 0 && viewMode === 'grid' && (
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap:                 '1.25rem',
        }}>
          {filtered.map(a => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              onView={() => { setSelected(a); setDetailModal(true) }}
              onEdit={() => openEdit(a)}
              onDelete={() => { setSelected(a); setDeleteModal(true) }}
            />
          ))}
        </div>
      )}

      {/* ── List View ────────────────────────────────────── */}
      {!loading && filtered.length > 0 && viewMode === 'list' && (
        <div style={{
          background:    'var(--white)',
          border:        '1px solid var(--border)',
          borderRadius:  'var(--radius-lg)',
          overflow:      'hidden',
        }}>
          {filtered.map((a, i) => {
            const typeMeta = TYPE_META[a.type] || TYPE_META.assignment
            const qCount   = Array.isArray(a.questions) ? a.questions.length : 0
            const overdue  = isOverdue(a.due_date)
            return (
              <div
                key={a.id}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '1rem',
                  padding:      '1rem 1.25rem',
                  borderBottom: i < filtered.length - 1
                    ? '1px solid var(--border-light)'
                    : 'none',
                  transition:   'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Icon */}
                <div style={{
                  width:          44,
                  height:         44,
                  background:     `${typeMeta.color}18`,
                  borderRadius:   'var(--radius-md)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                }}>
                  {React.createElement(
                    TYPES.find(t => t.value === a.type)?.icon || FiFileText,
                    { size: 20, color: typeMeta.color }
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '0.5rem',
                    flexWrap:   'wrap',
                    marginBottom: '0.25rem',
                  }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize:   '0.9rem',
                      color:      'var(--text-primary)',
                      overflow:   'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow:'ellipsis',
                    }}>
                      {a.title}
                    </span>
                    <TypeBadge type={a.type} />
                    <PriorityBadge priority={a.priority} />
                    {overdue && (
                      <span style={{
                        fontSize:     '0.7rem',
                        fontWeight:   700,
                        color:        PRIORITY_META.High.color,
                        background:   PRIORITY_META.High.bg,
                        padding:      '0.1rem 0.45rem',
                        borderRadius: '999px',
                      }}>
                        Overdue
                      </span>
                    )}
                  </div>
                  <div style={{
                    display:  'flex',
                    gap:      '1rem',
                    flexWrap: 'wrap',
                  }}>
                    <span style={{
                      fontSize:   '0.78rem',
                      color:      'var(--text-muted)',
                      display:    'flex',
                      alignItems: 'center',
                      gap:        '0.3rem',
                    }}>
                      <FiCalendar size={11} /> {formatDate(a.due_date)}
                    </span>
                    {a.course && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        📚 {a.course}
                      </span>
                    )}
                    {qCount > 0 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        ❓ {qCount} question{qCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span style={{
                      fontSize: '0.78rem',
                      color:    'var(--text-light)',
                    }}>
                      {timeAgo(a.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  {[
                    {
                      icon:    FiBookOpen,
                      color:   'var(--primary)',
                      bg:      'var(--primary-ghost, #ebf8ff)',
                      onClick: () => { setSelected(a); setDetailModal(true) },
                    },
                    {
                      icon:    FiEdit,
                      color:   'var(--secondary)',
                      bg:      'var(--secondary-ghost, #f7fafc)',
                      onClick: () => openEdit(a),
                    },
                    {
                      icon:    FiTrash2,
                      color:   'var(--danger)',
                      bg:      PRIORITY_META.High.bg,
                      onClick: () => { setSelected(a); setDeleteModal(true) },
                    },
                  ].map(({ icon: Icon, color, bg, onClick }, bi) => (
                    <button
                      key={bi}
                      onClick={onClick}
                      style={{
                        width:        34,
                        height:       34,
                        background:   'var(--bg)',
                        border:       '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        cursor:       'pointer',
                        display:      'flex',
                        alignItems:   'center',
                        justifyContent:'center',
                        transition:   'all 0.2s',
                        color:        'var(--text-muted)',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background   = bg
                        e.currentTarget.style.borderColor  = color
                        e.currentTarget.style.color        = color
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background   = 'var(--bg)'
                        e.currentTarget.style.borderColor  = 'var(--border)'
                        e.currentTarget.style.color        = 'var(--text-muted)'
                      }}
                    >
                      <Icon size={14} />
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Create Modal ─────────────────────────────────── */}
      <AssignmentFormModal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Assignment"
        form={form}
        setForm={setForm}
        errors={errors}
        saving={saving}
        onSubmit={handleCreate}
        submitLabel="Broadcast to Students"
      />

      {/* ── Edit Modal ───────────────────────────────────── */}
      <AssignmentFormModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Assignment"
        form={form}
        setForm={setForm}
        errors={errors}
        saving={saving}
        onSubmit={handleEdit}
        submitLabel="Save Changes"
      />

      {/* ── Detail Modal ─────────────────────────────────── */}
      {detailModal && selected && (
        <AssignmentDetailModal
          assignment={selected}
          onClose={() => setDetailModal(false)}
        />
      )}

      {/* ── Delete Modal ─────────────────────────────────── */}
      {deleteModal && (
        <div
          style={{
            position:       'fixed',
            inset:          0,
            background:     'rgba(0,0,0,0.5)',
            zIndex:         1000,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        '1rem',
          }}
          onClick={e => e.target === e.currentTarget && setDeleteModal(false)}
        >
          <div style={{
            background:    'var(--white)',
            borderRadius:  'var(--radius-xl)',
            padding:       '2rem',
            maxWidth:      420,
            width:         '100%',
            textAlign:     'center',
            boxShadow:     '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{
              width:          60,
              height:         60,
              background:     PRIORITY_META.High.bg,
              borderRadius:   '50%',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              margin:         '0 auto 1.25rem',
            }}>
              <FiTrash2 size={26} color={PRIORITY_META.High.color} />
            </div>
            <h3 style={{
              fontSize:     '1.1rem',
              fontWeight:   800,
              marginBottom: '0.5rem',
              color:        'var(--text-primary)',
            }}>
              Delete Assignment?
            </h3>
            <p style={{
              fontSize:     '0.88rem',
              color:        'var(--text-muted)',
              marginBottom: '1.5rem',
              lineHeight:   1.6,
            }}>
              "<strong>{selected?.title}</strong>" will be permanently deleted.
              This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteModal(false)}
                style={{
                  padding:      '0.65rem 1.5rem',
                  background:   'var(--bg)',
                  border:       '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  fontSize:     '0.9rem',
                  fontWeight:   600,
                  cursor:       'pointer',
                  color:        'var(--text-muted)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                style={{
                  padding:      '0.65rem 1.5rem',
                  background:   PRIORITY_META.High.color,
                  color:        'white',
                  border:       'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize:     '0.9rem',
                  fontWeight:   700,
                  cursor:       saving ? 'not-allowed' : 'pointer',
                  opacity:      saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

// Chip button style helper
const chipStyle = (active, color = 'var(--primary)') => ({
  padding:      '0.4rem 0.9rem',
  border:       `1px solid ${active ? color : 'var(--border)'}`,
  borderRadius: '999px',
  background:   active ? `${color}18` : 'var(--white)',
  color:        active ? color : 'var(--text-muted)',
  fontSize:     '0.82rem',
  fontWeight:   active ? 700 : 500,
  cursor:       'pointer',
  transition:   'all 0.2s',
  whiteSpace:   'nowrap',
})