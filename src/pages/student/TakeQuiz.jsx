import React, { useState, useEffect, useContext, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiClock, FiChevronRight, FiCheck, FiSend, FiAlertCircle } from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import { quizService } from '../../services/quizService'
import { ToastContext } from '../../context/ToastContext'

export default function TakeQuiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useContext(ToastContext)

  const [session, setSession] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [timeLimit, setTimeLimit] = useState(null)
  const [timeLeft, setTimeLeft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState(null)

  // Start quiz
  useEffect(() => {
    const startQuiz = async () => {
      try {
        const data = await quizService.start(id)
        setSession(data.session_id)
        setQuestions(data.questions || [])
        setTimeLimit(data.time_limit)
        if (data.time_limit) setTimeLeft(data.time_limit * 60)

        // Restore previous answers if resumed
        if (data.resumed && data.questions) {
          const restored = {}
          data.questions.forEach(q => {
            if (q.answer) restored[q.id] = q.answer
          })
          setAnswers(restored)
        }
      } catch (err) {
        addToast(err?.response?.data?.message || 'Failed to start quiz', 'error')
        navigate('/student/quizzes')
      } finally {
        setLoading(false)
      }
    }
    startQuiz()
  }, [id])

  // Timer
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0 || finished) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleFinish()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft, finished])

  const formatTime = (seconds) => {
    if (!seconds) return '—'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const currentQ = questions[currentIdx]

  // Answer question
  const handleAnswer = async () => {
    if (!selectedAnswer && currentQ?.type !== 'essay') {
      addToast('Please select an answer', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const res = await quizService.answer({
        session_id: session,
        question_id: currentQ.id,
        answer: selectedAnswer,
      })

      setAnswers(prev => ({ ...prev, [currentQ.id]: selectedAnswer }))

      if (res.is_correct !== undefined) {
        setFeedback(res.is_correct)
        // Brief feedback delay
        await new Promise(r => setTimeout(r, 1200))
        setFeedback(null)
      }

      // Move to next or finish
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1)
        setSelectedAnswer(answers[questions[currentIdx + 1]?.id] || '')
      } else {
        handleFinish()
      }
    } catch {
      addToast('Failed to submit answer', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFinish = async () => {
    if (finished) return
    try {
      const res = await quizService.submit(session)
      setResult(res)
      setFinished(true)
    } catch {
      addToast('Failed to submit quiz', 'error')
    }
  }

  // Set selected answer when navigating
  useEffect(() => {
    if (currentQ) {
      setSelectedAnswer(answers[currentQ.id] || '')
    }
  }, [currentIdx])

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
        Preparing your quiz...
      </div>
    </DashboardLayout>
  )

  // Result screen
  if (finished && result) {
    const pct = result.percentage || 0
    const passed = pct >= 50
    return (
      <DashboardLayout>
        <div style={{
          maxWidth: 500, margin: '2rem auto', textAlign: 'center',
          animation: 'stepForward 0.4s ease',
        }}>
          <Card>
            <div style={{ padding: '2rem 1rem' }}>
              {/* Score circle */}
              <div style={{
                width: 120, height: 120, borderRadius: '50%',
                background: passed ? 'var(--success-bg)' : 'var(--danger-bg)',
                border: `4px solid ${passed ? 'var(--success)' : 'var(--danger)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', flexDirection: 'column',
              }}>
                <span style={{
                  fontSize: '2rem', fontWeight: 800,
                  color: passed ? 'var(--success)' : 'var(--danger)',
                }}>
                  {pct}%
                </span>
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>
                {passed ? '🎉 Great Job!' : '📚 Keep Studying!'}
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                You scored {result.score} out of {result.total} points
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="outline" onClick={() => navigate('/student/quizzes')}>
                  Back to Quizzes
                </Button>
                <Button variant="primary" onClick={() => navigate('/student/dashboard')}>
                  Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </div>
        <style>{`@keyframes stepForward{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
      </DashboardLayout>
    )
  }

  if (!currentQ) return null

  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / questions.length) * 100)

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        {/* Header bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <span style={{
            background: 'var(--primary)', color: 'white',
            padding: '0.3rem 1rem', borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem', fontWeight: 700,
          }}>
            Question {currentIdx + 1} of {questions.length}
          </span>

          {timeLeft !== null && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.35rem 0.9rem', borderRadius: 'var(--radius-full)',
              background: timeLeft < 60 ? 'var(--danger-bg)' : 'var(--warning-bg)',
              color: timeLeft < 60 ? 'var(--danger)' : 'var(--warning)',
              fontSize: '0.85rem', fontWeight: 700,
            }}>
              <FiClock size={14} /> {formatTime(timeLeft)}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div style={{
          height: 6, background: 'var(--border)', borderRadius: 'var(--radius-full)',
          marginBottom: '1.5rem', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s ease',
          }} />
        </div>

        {/* Question card */}
        <Card key={currentQ.id} style={{
          animation: 'questionSlide 0.3s ease',
          borderTop: '3px solid var(--primary)',
        }}>
          {/* Points badge */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', marginBottom: '1rem',
            flexWrap: 'wrap', gap: '0.5rem',
          }}>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700,
              background: 'var(--primary-ghost)', color: 'var(--primary)',
              padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
            }}>
              {currentQ.type?.replace('_', ' ')}
            </span>
            <span style={{
              fontSize: '0.75rem', fontWeight: 700, color: 'var(--secondary)',
            }}>
              {currentQ.points} point{currentQ.points > 1 ? 's' : ''}
            </span>
          </div>

          {/* Question text */}
          <h2 style={{
            fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)',
            lineHeight: 1.5, marginBottom: '1.5rem',
            wordBreak: 'break-word',
          }}>
            {currentQ.question}
          </h2>

          {/* Feedback overlay */}
          {feedback !== null && (
            <div style={{
              padding: '1rem', borderRadius: 'var(--radius-md)',
              background: feedback ? 'var(--success-bg)' : 'var(--danger-bg)',
              border: `1.5px solid ${feedback ? 'var(--success)' : 'var(--danger)'}`,
              textAlign: 'center', marginBottom: '1rem',
              animation: 'stepForward 0.2s ease',
            }}>
              <p style={{
                fontWeight: 700, fontSize: '1rem',
                color: feedback ? 'var(--success)' : 'var(--danger)',
              }}>
                {feedback ? '✓ Correct!' : '✗ Incorrect'}
              </p>
            </div>
          )}

          {/* Options: Multiple choice */}
          {currentQ.type === 'multiple_choice' && currentQ.options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {(typeof currentQ.options === 'string' ? JSON.parse(currentQ.options) : currentQ.options).map((opt, i) => (
                <button key={i} onClick={() => setSelectedAnswer(opt)} style={{
                  padding: '0.85rem 1rem',
                  background: selectedAnswer === opt ? 'var(--primary)' : 'var(--white)',
                  color: selectedAnswer === opt ? 'white' : 'var(--text-primary)',
                  border: `2px solid ${selectedAnswer === opt ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.9rem', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  transition: 'var(--transition)', minHeight: 48,
                }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: selectedAnswer === opt ? 'rgba(255,255,255,0.2)' : 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.78rem', fontWeight: 700,
                    border: selectedAnswer === opt ? 'none' : '1.5px solid var(--border)',
                  }}>
                    {selectedAnswer === opt ? <FiCheck size={14} /> : String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* True / False */}
          {currentQ.type === 'true_false' && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['True', 'False'].map(val => (
                <button key={val} onClick={() => setSelectedAnswer(val)} style={{
                  flex: 1, padding: '1rem',
                  background: selectedAnswer === val ? 'var(--primary)' : 'var(--white)',
                  color: selectedAnswer === val ? 'white' : 'var(--text-primary)',
                  border: `2px solid ${selectedAnswer === val ? 'var(--primary)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', fontWeight: 700, fontSize: '1rem',
                  transition: 'var(--transition)', minHeight: 56,
                }}>
                  {val}
                </button>
              ))}
            </div>
          )}

          {/* Short answer */}
          {currentQ.type === 'short_answer' && (
            <input className="form-input" value={selectedAnswer}
              onChange={e => setSelectedAnswer(e.target.value)}
              placeholder="Type your answer..."
              style={{ fontSize: '1rem' }} />
          )}

          {/* Essay */}
          {currentQ.type === 'essay' && (
            <textarea className="form-textarea" value={selectedAnswer}
              onChange={e => setSelectedAnswer(e.target.value)}
              placeholder="Write your essay response..."
              rows={6} style={{ minHeight: 150 }} />
          )}

          {/* Navigation */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: '1.5rem', gap: '0.75rem', flexWrap: 'wrap',
          }}>
            <Button variant="ghost" disabled={currentIdx === 0}
              onClick={() => { setCurrentIdx(p => p - 1) }}>
              ← Previous
            </Button>

            {currentIdx < questions.length - 1 ? (
              <Button variant="primary" loading={submitting} onClick={handleAnswer}
                icon={<FiChevronRight size={16} />}>
                Submit & Next
              </Button>
            ) : (
              <Button variant="success" loading={submitting} onClick={handleAnswer}
                icon={<FiSend size={15} />}>
                Submit Quiz
              </Button>
            )}
          </div>
        </Card>

        {/* Question navigator dots */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '0.3rem',
          marginTop: '1.25rem', flexWrap: 'wrap',
        }}>
          {questions.map((q, i) => (
            <button key={q.id} onClick={() => setCurrentIdx(i)} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: i === currentIdx ? 'var(--primary)' :
                answers[q.id] ? 'var(--success)' : 'var(--border)',
              color: i === currentIdx || answers[q.id] ? 'white' : 'var(--text-muted)',
              border: 'none', cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 700,
              transition: 'var(--transition)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {answers[q.id] ? <FiCheck size={12} /> : i + 1}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes questionSlide{from{transform:translateX(40px);opacity:0}to{transform:translateX(0);opacity:1}}
        @keyframes stepForward{from{transform:translateY(10px);opacity:0}to{transform:translateY(0);opacity:1}}
      `}</style>
    </DashboardLayout>
  )
}