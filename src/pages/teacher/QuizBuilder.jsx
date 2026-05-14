import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiPlus, FiTrash2, FiArrowLeft, FiCheck,
  FiChevronUp, FiChevronDown, FiSave, FiClipboard
} from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { quizService } from '../../services/quizService'
import { ToastContext } from '../../context/ToastContext'

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false',      label: 'True / False' },
  { value: 'short_answer',    label: 'Short Answer' },
  { value: 'essay',           label: 'Essay' },
]

const emptyQuestion = () => ({
  id: Date.now() + Math.random(),
  question: '',
  type: 'multiple_choice',
  options: ['', '', '', ''],
  correct: '',
  points: 1,
  explanation: '',
})

export default function QuizBuilder() {
  const navigate = useNavigate()
  const { addToast } = useContext(ToastContext)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState(0) // 0 = details, 1 = questions, 2 = review

  const [details, setDetails] = useState({
    title: '', description: '', course: '',
    time_limit: '', max_attempts: 1,
    shuffle: false, show_results: true,
    starts_at: '', ends_at: '',
  })

  const [questions, setQuestions] = useState([emptyQuestion()])
  const [errors, setErrors] = useState({})

  // ── Detail handlers ──────────────────────────────────
  const handleDetailChange = e => {
    const { name, value, type, checked } = e.target
    setDetails(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    setErrors(p => ({ ...p, [name]: null }))
  }

  // ── Question handlers ────────────────────────────────
  const updateQuestion = (idx, field, value) => {
    setQuestions(prev => {
      const updated = [...prev]
      updated[idx] = { ...updated[idx], [field]: value }
      return updated
    })
  }

  const updateOption = (qIdx, oIdx, value) => {
    setQuestions(prev => {
      const updated = [...prev]
      const opts = [...(updated[qIdx].options || [])]
      opts[oIdx] = value
      updated[qIdx] = { ...updated[qIdx], options: opts }
      return updated
    })
  }

  const addOption = (qIdx) => {
    setQuestions(prev => {
      const updated = [...prev]
      updated[qIdx] = {
        ...updated[qIdx],
        options: [...(updated[qIdx].options || []), ''],
      }
      return updated
    })
  }

  const removeOption = (qIdx, oIdx) => {
    setQuestions(prev => {
      const updated = [...prev]
      const opts = [...(updated[qIdx].options || [])]
      opts.splice(oIdx, 1)
      updated[qIdx] = { ...updated[qIdx], options: opts }
      return updated
    })
  }

  const addQuestion = () => setQuestions(prev => [...prev, emptyQuestion()])

  const removeQuestion = (idx) => {
    if (questions.length <= 1) {
      addToast('Quiz must have at least 1 question', 'warning')
      return
    }
    setQuestions(prev => prev.filter((_, i) => i !== idx))
  }

  const moveQuestion = (idx, dir) => {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= questions.length) return
    setQuestions(prev => {
      const arr = [...prev]
      ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
      return arr
    })
  }

  // ── Validation ───────────────────────────────────────
  const validateStep0 = () => {
    const e = {}
    if (!details.title.trim()) e.title = 'Title is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep1 = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question.trim()) {
        addToast(`Question ${i + 1} text is empty`, 'warning')
        return false
      }
      if ((q.type === 'multiple_choice' || q.type === 'true_false') && !q.correct) {
        addToast(`Question ${i + 1} needs a correct answer`, 'warning')
        return false
      }
    }
    return true
  }

  // ── Submit ───────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validateStep1()) return
    setSaving(true)
    try {
      const payload = {
        ...details,
        time_limit: details.time_limit ? parseInt(details.time_limit) : null,
        max_attempts: parseInt(details.max_attempts) || 1,
        starts_at: details.starts_at || null,
        ends_at: details.ends_at || null,
        questions: questions.map((q, i) => ({
          question: q.question,
          type: q.type,
          options: q.type === 'multiple_choice' ? q.options.filter(o => o.trim()) :
                   q.type === 'true_false' ? ['True', 'False'] : null,
          correct: q.correct || null,
          points: parseInt(q.points) || 1,
          explanation: q.explanation || null,
        })),
      }

      await quizService.create(payload)
      addToast('Quiz created successfully! 🎉', 'success')
      navigate('/teacher/quizzes')
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to create quiz', 'error')
    } finally {
      setSaving(false)
    }
  }

  const totalPoints = questions.reduce((sum, q) => sum + (parseInt(q.points) || 0), 0)

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/teacher/quizzes')} style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, minHeight: 40,
        }}>
          <FiArrowLeft size={16} /> Back to Quizzes
        </button>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Create Quiz</h1>
          <p className="page-subtitle">
            {step === 0 ? 'Step 1: Quiz details' :
             step === 1 ? `Step 2: Add questions (${questions.length})` :
             'Step 3: Review & save'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            background: 'var(--primary-ghost)', color: 'var(--primary)',
            padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)',
            fontSize: '0.78rem', fontWeight: 700,
          }}>
            {questions.length} questions · {totalPoints} points
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginBottom: '1.5rem',
      }}>
        {['Details', 'Questions', 'Review'].map((label, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{
              height: 4, borderRadius: 2,
              background: i <= step ? 'var(--primary)' : 'var(--border)',
              transition: 'background 0.3s ease',
            }} />
            <p style={{
              fontSize: '0.72rem', color: i <= step ? 'var(--primary)' : 'var(--text-light)',
              fontWeight: 600, marginTop: '0.35rem', textAlign: 'center',
            }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Step 0: Details */}
      {step === 0 && (
        <Card title="Quiz Details" style={{ animation: 'stepForward 0.3s ease' }}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input className={`form-input ${errors.title ? 'error' : ''}`}
              name="title" value={details.title} onChange={handleDetailChange}
              placeholder="e.g. Chapter 5 Assessment" />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" name="description"
              value={details.description} onChange={handleDetailChange}
              placeholder="Instructions for students..." rows={3} />
          </div>

          <div className="quiz-detail-grid">
            <div className="form-group">
              <label className="form-label">Course</label>
              <input className="form-input" name="course"
                value={details.course} onChange={handleDetailChange}
                placeholder="e.g. Mathematics" />
            </div>
            <div className="form-group">
              <label className="form-label">Time Limit (minutes)</label>
              <input className="form-input" name="time_limit" type="number" min="0"
                value={details.time_limit} onChange={handleDetailChange}
                placeholder="Leave empty for unlimited" />
            </div>
            <div className="form-group">
              <label className="form-label">Max Attempts</label>
              <input className="form-input" name="max_attempts" type="number" min="1"
                value={details.max_attempts} onChange={handleDetailChange} />
            </div>
          </div>

          <div className="quiz-detail-grid">
            <div className="form-group">
              <label className="form-label">Starts At (optional)</label>
              <input className="form-input" name="starts_at" type="datetime-local"
                value={details.starts_at} onChange={handleDetailChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Ends At (optional)</label>
              <input className="form-input" name="ends_at" type="datetime-local"
                value={details.ends_at} onChange={handleDetailChange} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" name="shuffle" checked={details.shuffle}
                onChange={handleDetailChange} style={{ width: 16, height: 16 }} />
              Shuffle questions
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
              <input type="checkbox" name="show_results" checked={details.show_results}
                onChange={handleDetailChange} style={{ width: 16, height: 16 }} />
              Show results after each answer
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button variant="primary" onClick={() => { if (validateStep0()) setStep(1) }}>
              Next: Add Questions →
            </Button>
          </div>
        </Card>
      )}

      {/* Step 1: Questions */}
      {step === 1 && (
        <div style={{ animation: 'stepForward 0.3s ease' }}>
          {questions.map((q, qIdx) => (
            <Card key={q.id} style={{
              marginBottom: '1.25rem',
              borderLeft: `4px solid ${q.question ? 'var(--success)' : 'var(--warning)'}`,
            }}>
              {/* Question header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '1rem', gap: '0.5rem', flexWrap: 'wrap',
              }}>
                <span style={{
                  background: 'var(--primary)', color: 'white',
                  padding: '0.2rem 0.7rem', borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem', fontWeight: 700,
                }}>
                  Q{qIdx + 1}
                </span>

                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  <button onClick={() => moveQuestion(qIdx, -1)} disabled={qIdx === 0}
                    style={{ ...miniBtn, opacity: qIdx === 0 ? 0.3 : 1 }}>
                    <FiChevronUp size={14} />
                  </button>
                  <button onClick={() => moveQuestion(qIdx, 1)} disabled={qIdx === questions.length - 1}
                    style={{ ...miniBtn, opacity: qIdx === questions.length - 1 ? 0.3 : 1 }}>
                    <FiChevronDown size={14} />
                  </button>
                  <button onClick={() => removeQuestion(qIdx)} style={{ ...miniBtn, color: 'var(--danger)' }}>
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Question text */}
              <div className="form-group">
                <label className="form-label">Question Text *</label>
                <textarea className="form-textarea" value={q.question}
                  onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                  placeholder="Enter your question..."
                  rows={2} style={{ minHeight: 70 }} />
              </div>

              {/* Type + Points */}
              <div className="q-type-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={q.type}
                    onChange={e => {
                      const newType = e.target.value
                      updateQuestion(qIdx, 'type', newType)
                      if (newType === 'true_false') {
                        updateQuestion(qIdx, 'options', ['True', 'False'])
                        updateQuestion(qIdx, 'correct', '')
                      } else if (newType === 'multiple_choice') {
                        updateQuestion(qIdx, 'options', ['', '', '', ''])
                      }
                    }}>
                    {QUESTION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Points</label>
                  <input className="form-input" type="number" min="1" value={q.points}
                    onChange={e => updateQuestion(qIdx, 'points', e.target.value)}
                    style={{ width: '100%' }} />
                </div>
              </div>

              {/* Options for multiple choice */}
              {q.type === 'multiple_choice' && (
                <div className="form-group">
                  <label className="form-label">Options (click to mark correct)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {(q.options || []).map((opt, oIdx) => (
                      <div key={oIdx} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                      }}>
                        <button onClick={() => updateQuestion(qIdx, 'correct', opt)} style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: q.correct === opt && opt ? 'var(--success)' : 'var(--bg)',
                          border: `2px solid ${q.correct === opt && opt ? 'var(--success)' : 'var(--border)'}`,
                          color: q.correct === opt && opt ? 'white' : 'var(--text-muted)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', flexShrink: 0, fontSize: '0.7rem', fontWeight: 700,
                        }}>
                          {q.correct === opt && opt ? <FiCheck size={14} /> : String.fromCharCode(65 + oIdx)}
                        </button>
                        <input className="form-input" value={opt} style={{ flex: 1 }}
                          onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`} />
                        {q.options.length > 2 && (
                          <button onClick={() => removeOption(qIdx, oIdx)}
                            style={{ ...miniBtn, color: 'var(--danger)' }}>
                            <FiTrash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                    {q.options.length < 6 && (
                      <button onClick={() => addOption(qIdx)} style={{
                        padding: '0.4rem', background: 'var(--bg)',
                        border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem',
                        minHeight: 36,
                      }}>
                        <FiPlus size={14} /> Add Option
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* True/False */}
              {q.type === 'true_false' && (
                <div className="form-group">
                  <label className="form-label">Correct Answer</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {['True', 'False'].map(val => (
                      <button key={val} onClick={() => updateQuestion(qIdx, 'correct', val)} style={{
                        flex: 1, padding: '0.7rem',
                        background: q.correct === val ? 'var(--primary)' : 'var(--bg)',
                        color: q.correct === val ? 'white' : 'var(--text-primary)',
                        border: `2px solid ${q.correct === val ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem',
                        transition: 'var(--transition)', minHeight: 44,
                      }}>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Short answer correct */}
              {q.type === 'short_answer' && (
                <div className="form-group">
                  <label className="form-label">Expected Answer</label>
                  <input className="form-input" value={q.correct || ''}
                    onChange={e => updateQuestion(qIdx, 'correct', e.target.value)}
                    placeholder="Correct answer text" />
                </div>
              )}

              {/* Explanation */}
              <div className="form-group">
                <label className="form-label">Explanation (shown after answer)</label>
                <input className="form-input" value={q.explanation || ''}
                  onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)}
                  placeholder="Optional explanation..." />
              </div>
            </Card>
          ))}

          {/* Add question button */}
          <button onClick={addQuestion} style={{
            width: '100%', padding: '1rem', background: 'var(--white)',
            border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
            cursor: 'pointer', color: 'var(--primary)', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1.5rem',
            transition: 'var(--transition)', minHeight: 56,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-ghost)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--white)' }}
          >
            <FiPlus size={18} /> Add Question
          </button>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Button variant="ghost" onClick={() => setStep(0)}>← Back to Details</Button>
            <Button variant="primary" onClick={() => { if (validateStep1()) setStep(2) }}>
              Review & Save →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div style={{ animation: 'stepForward 0.3s ease' }}>
          <Card title="Quiz Summary">
            <div className="review-grid">
              {[
                { l: 'Title', v: details.title },
                { l: 'Course', v: details.course || '—' },
                { l: 'Questions', v: questions.length },
                { l: 'Total Points', v: totalPoints },
                { l: 'Time Limit', v: details.time_limit ? `${details.time_limit} min` : 'Unlimited' },
                { l: 'Max Attempts', v: details.max_attempts },
                { l: 'Shuffle', v: details.shuffle ? 'Yes' : 'No' },
                { l: 'Show Results', v: details.show_results ? 'Yes' : 'No' },
              ].map(({ l, v }) => (
                <div key={l} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.6rem 0', borderBottom: '1px solid var(--border-light)',
                }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{l}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Questions preview */}
          <Card title="Questions Preview" style={{ marginTop: '1.25rem' }}>
            {questions.map((q, i) => (
              <div key={i} style={{
                padding: '0.85rem', background: 'var(--bg)',
                borderRadius: 'var(--radius-md)', marginBottom: '0.75rem',
                borderLeft: `3px solid var(--primary)`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)' }}>
                    Q{i + 1}. {q.question}
                  </p>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {q.points} pt · {QUESTION_TYPES.find(t => t.value === q.type)?.label}
                  </span>
                </div>
                {q.correct && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.3rem' }}>
                    ✓ Correct: {q.correct}
                  </p>
                )}
              </div>
            ))}
          </Card>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <Button variant="ghost" onClick={() => setStep(1)}>← Edit Questions</Button>
            <Button variant="primary" loading={saving} onClick={handleSubmit}
              icon={<FiSave size={15} />}>
              Save Quiz
            </Button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes stepForward{from{transform:translateX(30px);opacity:0}to{transform:translateX(0);opacity:1}}
        .quiz-detail-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem}
        .q-type-row{display:grid;grid-template-columns:2fr 1fr;gap:1rem}
        .review-grid{max-width:500px}
        @media(max-width:768px){
          .quiz-detail-grid{grid-template-columns:1fr!important}
          .q-type-row{grid-template-columns:1fr!important}
        }
        @media(max-width:480px){
          .quiz-detail-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </DashboardLayout>
  )
}

const miniBtn = {
  background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)', padding: '0.3rem',
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  justifyContent: 'center', color: 'var(--text-muted)',
  minWidth: 30, minHeight: 30, transition: 'var(--transition)',
}