import React, {
  useState, useEffect, useContext, useCallback, useRef
} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiClock, FiChevronRight, FiChevronLeft,
  FiCheck, FiAlertCircle, FiCheckCircle,
  FiBookOpen, FiFlag, FiX,
} from 'react-icons/fi'
import DashboardLayout  from '../../components/common/DashboardLayout'
import { assignmentService } from '../../services/assignmentService'
import { ToastContext } from '../../context/ToastContext'

const PRIORITY_META = {
  High:   { color: '#e53e3e' },
  Medium: { color: '#d69e2e' },
  Low:    { color: '#38a169' },
}

const TYPE_META = {
  assignment: { color: '#3182ce', label: 'Assignment' },
  quiz:       { color: '#d69e2e', label: 'Quiz'       },
  exam:       { color: '#e53e3e', label: 'Exam'       },
  note:       { color: '#38a169', label: 'Study Note' },
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({ seconds, onExpire }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining, onExpire])

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const isLow = remaining < 60

  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          '0.5rem',
      padding:      '0.5rem 1rem',
      background:   isLow ? '#fff1f0' : 'var(--bg)',
      border:       `1px solid ${isLow ? '#feb2b2' : 'var(--border)'}`,
      borderRadius: '999px',
      color:        isLow ? '#e53e3e' : 'var(--text-muted)',
      fontWeight:   700,
      fontSize:     '0.9rem',
      animation:    isLow ? 'pulse 1s ease-in-out infinite' : 'none',
    }}>
      <FiClock size={15} />
      {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
    </div>
  )
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        marginBottom:   '0.4rem',
        fontSize:       '0.78rem',
        color:          'var(--text-muted)',
        fontWeight:     600,
      }}>
        <span>Question {current} of {total}</span>
        <span>{pct}%</span>
      </div>
      <div style={{
        height:       6,
        background:   'var(--border)',
        borderRadius: '999px',
        overflow:     'hidden',
      }}>
        <div style={{
          height:       '100%',
          width:        `${pct}%`,
          background:   'linear-gradient(90deg, var(--primary) 0%, #63b3ed 100%)',
          borderRadius: '999px',
          transition:   'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}

// ─── QuestionRenderer ─────────────────────────────────────────────────────────
function QuestionRenderer({ question: q, qIdx, answer, onAnswer }) {
  const letters = ['A','B','C','D','E','F']

  return (
    <div>
      {/* Question text */}
      <div style={{
        background:   'var(--bg)',
        borderRadius: 'var(--radius-lg)',
        padding:      '1.5rem',
        marginBottom: '1.5rem',
        border:       '1px solid var(--border)',
      }}>
        <div style={{
          display:    'flex',
          alignItems: 'flex-start',
          gap:        '0.75rem',
        }}>
          <span style={{
            width:          32,
            height:         32,
            background:     'var(--primary)',
            color:          'white',
            borderRadius:   '50%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '0.85rem',
            fontWeight:     700,
            flexShrink:     0,
            marginTop:      '0.1rem',
          }}>
            {qIdx + 1}
          </span>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize:   '1rem',
              fontWeight: 700,
              color:      'var(--text-primary)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {q.text || `Question ${qIdx + 1}`}
            </p>
            <div style={{
              display:    'flex',
              gap:        '1rem',
              marginTop:  '0.5rem',
              flexWrap:   'wrap',
            }}>
              <span style={{
                fontSize:  '0.75rem',
                color:     'var(--text-light)',
                fontWeight:600,
              }}>
                {q.type === 'multiple_choice' && '☑ Multiple Choice'}
                {q.type === 'true_false'      && '⚖ True / False'}
                {q.type === 'short_answer'    && '✍ Short Answer'}
                {q.type === 'essay'           && '📝 Essay'}
              </span>
              <span style={{
                fontSize:  '0.75rem',
                color:     'var(--text-light)',
                fontWeight:600,
              }}>
                🏆 {q.points || 1} pt{(q.points || 1) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multiple choice */}
      {q.type === 'multiple_choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {(q.options || []).map((opt, oi) => {
            const isSelected = String(answer) === String(oi)
            return (
              <button
                key={oi}
                onClick={() => onAnswer(String(oi))}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '0.85rem',
                  padding:      '1rem 1.25rem',
                  border:       `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  background:   isSelected ? 'var(--primary-ghost, #ebf8ff)' : 'var(--white)',
                  cursor:       'pointer',
                  textAlign:    'left',
                  transition:   'all 0.2s',
                  width:        '100%',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.background  = 'var(--bg)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.background  = 'var(--white)'
                  }
                }}
              >
                {/* Letter circle */}
                <span style={{
                  width:          34,
                  height:         34,
                  borderRadius:   '50%',
                  border:         `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`,
                  background:     isSelected ? 'var(--primary)' : 'transparent',
                  color:          isSelected ? 'white' : 'var(--text-muted)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       '0.85rem',
                  fontWeight:     700,
                  flexShrink:     0,
                  transition:     'all 0.2s',
                }}>
                  {isSelected ? <FiCheck size={16} /> : letters[oi]}
                </span>
                <span style={{
                  fontSize:   '0.9rem',
                  fontWeight: isSelected ? 700 : 500,
                  color:      isSelected ? 'var(--primary)' : 'var(--text-primary)',
                  lineHeight: 1.5,
                }}>
                  {opt || `Option ${letters[oi]}`}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* True / False */}
      {q.type === 'true_false' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {['True', 'False'].map(tf => {
            const isSelected = answer === tf
            const selColor   = tf === 'True' ? '#38a169' : '#e53e3e'
            return (
              <button
                key={tf}
                onClick={() => onAnswer(tf)}
                style={{
                  padding:       '1.5rem',
                  border:        `2px solid ${isSelected ? selColor : 'var(--border)'}`,
                  borderRadius:  'var(--radius-xl)',
                  background:    isSelected
                    ? tf === 'True' ? '#f0fff4' : '#fff1f0'
                    : 'var(--white)',
                  cursor:        'pointer',
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  gap:           '0.6rem',
                  transition:    'all 0.2s',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = selColor
                    e.currentTarget.style.background  = tf === 'True' ? '#f0fff4' : '#fff1f0'
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.background  = 'var(--white)'
                  }
                }}
              >
                <span style={{
                  fontSize: '2rem',
                  lineHeight: 1,
                }}>
                  {tf === 'True' ? '✓' : '✗'}
                </span>
                <span style={{
                  fontSize:  '1rem',
                  fontWeight: 700,
                  color:     isSelected ? selColor : 'var(--text-muted)',
                }}>
                  {tf}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Short answer */}
      {q.type === 'short_answer' && (
        <input
          value={answer || ''}
          onChange={e => onAnswer(e.target.value)}
          placeholder="Type your answer here..."
          style={{
            width:        '100%',
            fontSize:     '0.95rem',
            border:       '2px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding:      '1rem 1.25rem',
            background:   'var(--white)',
            color:        'var(--text-primary)',
            boxSizing:    'border-box',
            fontFamily:   'inherit',
            outline:      'none',
            transition:   'border-color 0.2s',
          }}
          onFocus={e  => e.target.style.borderColor = 'var(--primary)'}
          onBlur={e   => e.target.style.borderColor = 'var(--border)'}
        />
      )}

      {/* Essay */}
      {q.type === 'essay' && (
        <div>
          <textarea
            value={answer || ''}
            onChange={e => onAnswer(e.target.value)}
            placeholder="Write your essay response here... Be detailed and clear."
            rows={10}
            style={{
              width:        '100%',
              fontSize:     '0.92rem',
              border:       '2px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding:      '1rem 1.25rem',
              background:   'var(--white)',
              color:        'var(--text-primary)',
              boxSizing:    'border-box',
              fontFamily:   'inherit',
              resize:       'vertical',
              lineHeight:   1.8,
              outline:      'none',
              transition:   'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border)'}
          />
          <div style={{
            textAlign: 'right',
            fontSize:  '0.75rem',
            color:     'var(--text-light)',
            marginTop: '0.35rem',
          }}>
            {(answer || '').length} characters
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Results Screen ───────────────────────────────────────────────────────────
function ResultsScreen({ result, assignment, onBack }) {
  const { score, totalPoints, percentage, graded } = result
  const grade = percentage >= 90 ? 'A'
              : percentage >= 80 ? 'B'
              : percentage >= 70 ? 'C'
              : percentage >= 60 ? 'D' : 'F'

  const gradeColor = percentage >= 80 ? '#38a169'
                   : percentage >= 60 ? '#d69e2e'
                   : '#e53e3e'

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '1rem' }}>
        {/* Score card */}
        <div style={{
          background:    'var(--white)',
          borderRadius:  'var(--radius-xl)',
          border:        '1px solid var(--border)',
          padding:       '2.5rem 2rem',
          textAlign:     'center',
          marginBottom:  '1.5rem',
          boxShadow:     'var(--shadow-md)',
        }}>
          <div style={{
            width:          100,
            height:         100,
            borderRadius:   '50%',
            border:         `6px solid ${gradeColor}`,
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 1.25rem',
            background:     `${gradeColor}12`,
          }}>
            <span style={{
              fontSize:   '1.8rem',
              fontWeight: 900,
              color:      gradeColor,
              lineHeight: 1,
            }}>
              {grade}
            </span>
            <span style={{
              fontSize:   '0.75rem',
              fontWeight: 600,
              color:      gradeColor,
            }}>
              {percentage}%
            </span>
          </div>

          <h2 style={{
            fontSize:     '1.3rem',
            fontWeight:   800,
            color:        'var(--text-primary)',
            marginBottom: '0.5rem',
          }}>
            {percentage >= 80 ? '🎉 Excellent work!'
            : percentage >= 60 ? '👍 Good effort!'
            : '📚 Keep studying!'}
          </h2>

          <p style={{
            fontSize:     '0.9rem',
            color:        'var(--text-muted)',
            marginBottom: '1.5rem',
          }}>
            You scored <strong>{score}</strong> out of <strong>{totalPoints}</strong> points
          </p>

          {/* Stats */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap:                 '1rem',
            padding:             '1.25rem',
            background:          'var(--bg)',
            borderRadius:        'var(--radius-lg)',
          }}>
            {[
              { label: 'Correct',   value: graded.filter(g => g.is_correct === true).length,  color: '#38a169' },
              { label: 'Incorrect', value: graded.filter(g => g.is_correct === false).length, color: '#e53e3e' },
              { label: 'Pending',   value: graded.filter(g => g.is_correct === null).length,  color: '#d69e2e' },
            ].map(s => (
              <div key={s.label}>
                <p style={{
                  fontSize:   '1.5rem',
                  fontWeight: 800,
                  color:      s.color,
                }}>
                  {s.value}
                </p>
                <p style={{
                  fontSize:  '0.78rem',
                  color:     'var(--text-muted)',
                  fontWeight: 600,
                }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Per-question breakdown */}
        <div style={{
          background:    'var(--white)',
          borderRadius:  'var(--radius-xl)',
          border:        '1px solid var(--border)',
          overflow:      'hidden',
          marginBottom:  '1.5rem',
        }}>
          <div style={{
            padding:      '1rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            fontWeight:   700,
            fontSize:     '0.95rem',
            color:        'var(--text-primary)',
          }}>
            Answer Review
          </div>
          {assignment.questions.map((q, idx) => {
            const g        = graded[idx]
            const isCorrect = g?.is_correct
            const isPending = g?.is_correct === null
            const borderColor = isPending  ? '#d69e2e'
                              : isCorrect  ? '#38a169'
                              : '#e53e3e'
            const bgColor     = isPending  ? '#fffbeb'
                              : isCorrect  ? '#f0fff4'
                              : '#fff1f0'
            return (
              <div key={idx} style={{
                padding:      '1.25rem 1.5rem',
                borderBottom: idx < assignment.questions.length - 1
                  ? '1px solid var(--border-light)'
                  : 'none',
                borderLeft:   `4px solid ${borderColor}`,
                background:   bgColor,
              }}>
                <div style={{
                  display:        'flex',
                  alignItems:     'flex-start',
                  gap:            '0.75rem',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontWeight:   700,
                      fontSize:     '0.9rem',
                      color:        'var(--text-primary)',
                      marginBottom: '0.5rem',
                    }}>
                      {idx + 1}. {q.text}
                    </p>

                    <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                      <p>
                        Your answer:{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {g?.student_answer !== null && g?.student_answer !== undefined
                            ? (q.type === 'multiple_choice'
                              ? q.options?.[parseInt(g.student_answer)] || g.student_answer
                              : g.student_answer)
                            : '(not answered)'}
                        </strong>
                      </p>
                      {!isPending && !isCorrect && q.correct_answer && (
                        <p style={{ marginTop: '0.25rem' }}>
                          Correct answer:{' '}
                          <strong style={{ color: '#38a169' }}>
                            {q.type === 'multiple_choice'
                              ? q.options?.[parseInt(q.correct_answer)] || q.correct_answer
                              : q.correct_answer}
                          </strong>
                        </p>
                      )}
                      {q.explanation && (
                        <p style={{
                          marginTop:  '0.5rem',
                          fontStyle:  'italic',
                          background: 'rgba(255,255,255,0.6)',
                          padding:    '0.4rem 0.7rem',
                          borderRadius:'var(--radius-sm)',
                        }}>
                          💡 {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{
                    textAlign:  'right',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      display:    'inline-flex',
                      alignItems: 'center',
                      gap:        '0.3rem',
                      fontSize:   '0.75rem',
                      fontWeight: 700,
                      color:      borderColor,
                    }}>
                      {isPending  ? <FiAlertCircle size={14} /> :
                       isCorrect  ? <FiCheckCircle size={14} /> :
                       <FiX      size={14} />}
                      {isPending ? 'Pending' : isCorrect ? 'Correct' : 'Wrong'}
                    </span>
                    <p style={{
                      fontSize:  '0.75rem',
                      color:     'var(--text-light)',
                      marginTop: '0.2rem',
                    }}>
                      {isPending ? '—' : `${g.points_earned ?? 0}/${g.max_points}`} pts
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={onBack}
          style={{
            padding:      '0.75rem 2rem',
            background:   'var(--primary)',
            color:        'white',
            border:       'none',
            borderRadius: 'var(--radius-md)',
            fontSize:     '0.9rem',
            fontWeight:   700,
            cursor:       'pointer',
            display:      'flex',
            alignItems:   'center',
            gap:          '0.5rem',
          }}
        >
          <FiChevronLeft size={16} /> Back to Assignments
        </button>
      </div>
    </DashboardLayout>
  )
}

// ─── TakeAssessment Main ──────────────────────────────────────────────────────
export default function TakeAssessment() {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const { addToast }  = useContext(ToastContext)

  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading]       = useState(true)
  const [started, setStarted]       = useState(false)
  const [currentQ, setCurrentQ]     = useState(0)
  const [answers, setAnswers]       = useState([])
  const [flagged, setFlagged]       = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]         = useState(null)

  useEffect(() => {
    assignmentService.getById(id)
      .then(data => {
        setAssignment(data.assignment)
        setAnswers(new Array(data.assignment.questions?.length || 0).fill(null).map(() => ({ answer: null })))
      })
      .catch(() => addToast('Failed to load assignment', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAnswer = useCallback((value) => {
    setAnswers(prev => prev.map((a, i) =>
      i === currentQ ? { answer: value } : a
    ))
  }, [currentQ])

  const toggleFlag = () => {
    setFlagged(prev =>
      prev.includes(currentQ)
        ? prev.filter(i => i !== currentQ)
        : [...prev, currentQ]
    )
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await assignmentService.submit(id, answers)
      setResult(res)
    } catch {
      addToast('Failed to submit. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Results ───────────────────────────────────────────────
  if (result && assignment) {
    return (
      <ResultsScreen
        result={result}
        assignment={assignment}
        onBack={() => navigate('/student/assignments')}
      />
    )
  }

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div style={{
          display:        'flex',
          justifyContent: 'center',
          alignItems:     'center',
          minHeight:      400,
          flexDirection:  'column',
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
          Loading assessment...
        </div>
      </DashboardLayout>
    )
  }

  if (!assignment) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Assignment not found.
          <button onClick={() => navigate(-1)} style={{
            display:    'block',
            margin:     '1rem auto 0',
            padding:    '0.6rem 1.5rem',
            background: 'var(--primary)',
            color:      'white',
            border:     'none',
            borderRadius:'var(--radius-md)',
            cursor:     'pointer',
            fontWeight: 700,
          }}>
            Go Back
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const questions  = assignment.questions || []
  const hasQuestions = questions.length > 0
  const typeMeta   = TYPE_META[assignment.type] || TYPE_META.assignment

  // ── Intro Screen ──────────────────────────────────────────
  if (!started) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{
            background:    'var(--white)',
            border:        '1px solid var(--border)',
            borderRadius:  'var(--radius-xl)',
            overflow:      'hidden',
            boxShadow:     'var(--shadow-md)',
          }}>
            {/* Banner */}
            <div style={{
              background:  `linear-gradient(135deg, ${typeMeta.color} 0%, ${typeMeta.color}99 100%)`,
              padding:     '2.5rem 2rem',
              color:       'white',
            }}>
              <span style={{
                display:      'inline-block',
                background:   'rgba(255,255,255,0.25)',
                borderRadius: '999px',
                padding:      '0.3rem 0.9rem',
                fontSize:     '0.78rem',
                fontWeight:   700,
                textTransform:'uppercase',
                letterSpacing:'0.05em',
                marginBottom: '0.75rem',
              }}>
                {typeMeta.label}
              </span>
              <h1 style={{
                fontSize:   '1.6rem',
                fontWeight: 900,
                marginBottom:'0.5rem',
                lineHeight: 1.3,
              }}>
                {assignment.title}
              </h1>
              {assignment.course && (
                <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>
                  📚 {assignment.course}
                </p>
              )}
            </div>

            {/* Details */}
            <div style={{ padding: '1.75rem 2rem' }}>
              {/* Info grid */}
              <div style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap:                 '1rem',
                marginBottom:        '1.5rem',
              }}>
                {[
                  { icon: '❓', label: 'Questions', value: hasQuestions ? questions.length : 'Reading only' },
                  { icon: '🏆', label: 'Max Score',  value: `${assignment.max_score || 100} pts` },
                  { icon: '⏱',  label: 'Time Limit', value: assignment.time_limit ? `${assignment.time_limit} min` : 'No limit' },
                  { icon: '📊', label: 'Priority',   value: assignment.priority || 'Medium' },
                ].map(item => (
                  <div key={item.label} style={{
                    background:    'var(--bg)',
                    borderRadius:  'var(--radius-md)',
                    padding:       '0.9rem',
                    textAlign:     'center',
                    border:        '1px solid var(--border)',
                  }}>
                    <p style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{item.icon}</p>
                    <p style={{
                      fontSize:   '1rem',
                      fontWeight: 700,
                      color:      'var(--text-primary)',
                    }}>
                      {item.value}
                    </p>
                    <p style={{
                      fontSize: '0.75rem',
                      color:    'var(--text-muted)',
                    }}>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div style={{
                background:   'var(--bg)',
                border:       '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding:      '1.25rem',
                marginBottom: '1.5rem',
                maxHeight:    300,
                overflowY:    'auto',
              }}>
                <p style={{
                  fontSize:  '0.8rem',
                  fontWeight: 700,
                  color:     'var(--text-muted)',
                  marginBottom: '0.5rem',
                  textTransform:'uppercase',
                  letterSpacing:'0.04em',
                }}>
                  Instructions
                </p>
                <p style={{
                  fontSize:  '0.9rem',
                  color:     'var(--text-secondary)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}>
                  {assignment.description}
                </p>
              </div>

              {/* Start button */}
              <button
                onClick={() => setStarted(true)}
                style={{
                  width:          '100%',
                  padding:        '1rem',
                  background:     `linear-gradient(135deg, ${typeMeta.color} 0%, ${typeMeta.color}cc 100%)`,
                  color:          'white',
                  border:         'none',
                  borderRadius:   'var(--radius-lg)',
                  fontSize:       '1rem',
                  fontWeight:     800,
                  cursor:         'pointer',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            '0.5rem',
                  boxShadow:      `0 4px 15px ${typeMeta.color}40`,
                  transition:     'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {hasQuestions ? 'Start Assessment' : 'Read Content'}
                <FiChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // ── No questions — reading only ───────────────────────────
  if (!hasQuestions) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{
            background:    'var(--white)',
            border:        '1px solid var(--border)',
            borderRadius:  'var(--radius-xl)',
            padding:       '2rem',
            boxShadow:     'var(--shadow-md)',
          }}>
            <h2 style={{
              fontSize:     '1.2rem',
              fontWeight:   800,
              color:        'var(--text-primary)',
              marginBottom: '1.25rem',
            }}>
              {assignment.title}
            </h2>
            <div style={{
              fontSize:   '0.95rem',
              color:      'var(--text-secondary)',
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
            }}>
              {assignment.description}
            </div>
            <button
              onClick={() => navigate(-1)}
              style={{
                marginTop:    '2rem',
                padding:      '0.7rem 1.5rem',
                background:   'var(--primary)',
                color:        'white',
                border:       'none',
                borderRadius: 'var(--radius-md)',
                fontSize:     '0.9rem',
                fontWeight:   700,
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                gap:          '0.5rem',
              }}
            >
              <FiChevronLeft size={16} /> Done
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // ── Assessment in progress ────────────────────────────────
  const q           = questions[currentQ]
  const isAnswered  = answers[currentQ]?.answer !== null &&
                      answers[currentQ]?.answer !== undefined &&
                      answers[currentQ]?.answer !== ''
  const isFlagged   = flagged.includes(currentQ)
  const answeredCnt = answers.filter(a => a?.answer !== null && a?.answer !== undefined && a?.answer !== '').length
  const isLast      = currentQ === questions.length - 1

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Top bar */}
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          marginBottom:   '1.25rem',
          gap:            '1rem',
          flexWrap:       'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <ProgressBar current={currentQ + 1} total={questions.length} />
          </div>
          {assignment.time_limit && (
            <CountdownTimer
              seconds={assignment.time_limit * 60}
              onExpire={handleSubmit}
            />
          )}
        </div>

        {/* Question card */}
        <div style={{
          background:    'var(--white)',
          border:        '1px solid var(--border)',
          borderRadius:  'var(--radius-xl)',
          padding:       '2rem',
          boxShadow:     'var(--shadow-md)',
          marginBottom:  '1.25rem',
        }}>
          {/* Q header */}
          <div style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            marginBottom:   '1.5rem',
          }}>
            <h2 style={{
              fontSize:   '1rem',
              fontWeight: 700,
              color:      'var(--text-primary)',
            }}>
              {assignment.title}
            </h2>
            <button
              onClick={toggleFlag}
              title={isFlagged ? 'Remove flag' : 'Flag for review'}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '0.35rem',
                padding:      '0.4rem 0.75rem',
                background:   isFlagged ? '#fffbeb' : 'var(--bg)',
                border:       `1px solid ${isFlagged ? '#d69e2e' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                color:        isFlagged ? '#d69e2e' : 'var(--text-muted)',
                fontSize:     '0.8rem',
                fontWeight:   600,
                cursor:       'pointer',
                transition:   'all 0.2s',
              }}
            >
              <FiFlag size={13} />
              {isFlagged ? 'Flagged' : 'Flag'}
            </button>
          </div>

          <QuestionRenderer
            question={q}
            qIdx={currentQ}
            answer={answers[currentQ]?.answer}
            onAnswer={handleAnswer}
          />
        </div>

        {/* Navigation */}
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          gap:            '1rem',
          flexWrap:       'wrap',
        }}>
          <button
            onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
            disabled={currentQ === 0}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '0.4rem',
              padding:      '0.75rem 1.25rem',
              background:   'var(--white)',
              border:       '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize:     '0.9rem',
              fontWeight:   600,
              cursor:       currentQ === 0 ? 'not-allowed' : 'pointer',
              opacity:      currentQ === 0 ? 0.4 : 1,
              color:        'var(--text-muted)',
            }}
          >
            <FiChevronLeft size={16} /> Previous
          </button>

          {/* Question dots */}
          <div style={{
            display:    'flex',
            gap:        '0.4rem',
            flexWrap:   'wrap',
            justifyContent:'center',
            flex:       1,
          }}>
            {questions.map((_, i) => {
              const ans     = answers[i]?.answer
              const hasAns  = ans !== null && ans !== undefined && ans !== ''
              const isCurr  = i === currentQ
              const isFlag  = flagged.includes(i)
              return (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  title={`Q${i+1}${hasAns ? ' (answered)' : ''}${isFlag ? ' (flagged)' : ''}`}
                  style={{
                    width:        30,
                    height:       30,
                    borderRadius: '50%',
                    border:       `2px solid ${
                      isCurr   ? 'var(--primary)'
                    : isFlag   ? '#d69e2e'
                    : hasAns   ? '#38a169'
                    : 'var(--border)'
                    }`,
                    background:   isCurr   ? 'var(--primary)'
                                : isFlag   ? '#fffbeb'
                                : hasAns   ? '#f0fff4'
                                : 'var(--white)',
                    color:        isCurr   ? 'white'
                                : isFlag   ? '#d69e2e'
                                : hasAns   ? '#38a169'
                                : 'var(--text-muted)',
                    fontSize:     '0.75rem',
                    fontWeight:   700,
                    cursor:       'pointer',
                    transition:   'all 0.15s',
                  }}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '0.4rem',
                padding:      '0.75rem 1.5rem',
                background:   submitting ? 'var(--text-light)' : '#38a169',
                color:        'white',
                border:       'none',
                borderRadius: 'var(--radius-md)',
                fontSize:     '0.9rem',
                fontWeight:   700,
                cursor:       submitting ? 'not-allowed' : 'pointer',
                boxShadow:    '0 2px 8px rgba(56,161,105,0.3)',
              }}
            >
              {submitting ? 'Submitting...' : (
                <>
                  Submit <FiCheckCircle size={16} />
                  {answeredCnt < questions.length && (
                    <span style={{
                      background:   'rgba(255,255,255,0.3)',
                      borderRadius: '999px',
                      padding:      '0.1rem 0.45rem',
                      fontSize:     '0.75rem',
                    }}>
                      {answeredCnt}/{questions.length}
                    </span>
                  )}
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQ(q => Math.min(questions.length - 1, q + 1))}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '0.4rem',
                padding:      '0.75rem 1.25rem',
                background:   'var(--primary)',
                color:        'white',
                border:       'none',
                borderRadius: 'var(--radius-md)',
                fontSize:     '0.9rem',
                fontWeight:   700,
                cursor:       'pointer',
                boxShadow:    '0 2px 8px rgba(49,130,206,0.3)',
              }}
            >
              Next <FiChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}