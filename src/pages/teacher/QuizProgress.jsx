import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiRefreshCw, FiEye, FiClock, FiCheckCircle, FiLoader } from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import Modal from '../../components/common/Modal'
import { quizService } from '../../services/quizService'
import { ToastContext } from '../../context/ToastContext'
import { formatName, formatDatetime } from '../../utils/formatters'

export default function QuizProgress() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useContext(ToastContext)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answerSheet, setAnswerSheet] = useState(null)
  const [sheetModal, setSheetModal] = useState(false)

  const fetchProgress = async () => {
    try {
      const res = await quizService.getProgress(id)
      setData(res)
    } catch {
      addToast('Failed to load progress', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
    const interval = setInterval(fetchProgress, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [id])

  const viewAnswers = async (sessionId) => {
    try {
      const res = await quizService.getAnswerSheet(sessionId)
      setAnswerSheet(res)
      setSheetModal(true)
    } catch {
      addToast('Failed to load answer sheet', 'error')
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>Loading...</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '1rem' }}>
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
          <h1 className="page-title">Quiz Progress</h1>
          <p className="page-subtitle">Live tracking · Auto-refreshes every 5s</p>
        </div>
        <Button variant="outline" icon={<FiRefreshCw size={15} />} onClick={fetchProgress}>
          Refresh
        </Button>
      </div>

      {/* Stats */}
      {data && (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            <StatMini icon={FiCheckCircle} label="Completed" value={data.completed}
              color="var(--success)" bg="var(--success-bg)" />
            <StatMini icon={FiLoader} label="In Progress" value={data.in_progress}
              color="var(--warning)" bg="var(--warning-bg)" />
            <StatMini icon={FiEye} label="Total Attempts" value={data.total_students}
              color="var(--primary)" bg="var(--primary-ghost)" />
            <StatMini icon={FiClock} label="Questions" value={data.total_questions}
              color="var(--secondary)" bg="var(--secondary-ghost)" />
          </div>

          {/* Sessions list */}
          <Card title="Student Sessions">
            {data.sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No students have attempted this quiz yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {data.sessions.map(s => {
                  const progress = data.total_questions > 0
                    ? Math.round((s.answered / data.total_questions) * 100)
                    : 0

                  return (
                    <div key={s.id} className="session-row" style={{
                      display: 'flex', alignItems: 'center', gap: '1rem',
                      padding: '0.9rem 1rem', background: 'var(--bg)',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${s.status === 'in_progress' ? 'var(--warning)' : 'var(--border)'}`,
                      flexWrap: 'wrap',
                    }}>
                      <Avatar firstName={s.first_name} lastName={s.last_name} size={40} />

                      <div style={{ flex: 1, minWidth: 150 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                            {formatName(s.first_name, s.last_name)}
                          </p>
                          <Badge
                            type={s.status === 'completed' ? 'active' : s.status === 'in_progress' ? 'pending' : 'inactive'}
                            label={s.status === 'in_progress' ? '🔴 Live' : s.status}
                          />
                        </div>

                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          Level {s.level} · Attempt #{s.attempt} · {s.answered}/{data.total_questions} answered
                        </p>

                        {/* Progress bar */}
                        <div style={{
                          height: 6, background: 'var(--border)',
                          borderRadius: 'var(--radius-full)', marginTop: '0.4rem',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%', width: `${progress}%`,
                            background: s.status === 'completed' ? 'var(--success)' :
                              s.status === 'in_progress' ? 'var(--warning)' : 'var(--border)',
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        {s.status === 'completed' && (
                          <p style={{
                            fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)',
                          }}>
                            {s.score}/{s.total_points}
                          </p>
                        )}
                        {s.status === 'in_progress' && (
                          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--warning)' }}>
                            {s.current_score} pts
                          </p>
                        )}
                        <Button variant="outline" size="sm" onClick={() => viewAnswers(s.id)}
                          style={{ marginTop: '0.4rem' }}>
                          <FiEye size={13} /> Answers
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Answer Sheet Modal */}
      <Modal isOpen={sheetModal} onClose={() => setSheetModal(false)}
        title={answerSheet ? `Answer Sheet — ${formatName(answerSheet.session?.first_name, answerSheet.session?.last_name)}` : 'Answer Sheet'}
        size="lg">
        {answerSheet && (
          <div>
            {/* Summary */}
            <div style={{
              background: 'var(--primary-ghost)', borderRadius: 'var(--radius-md)',
              padding: '1rem', marginBottom: '1.25rem',
              display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem',
            }}>
              <div>
                <p style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {answerSheet.session?.quiz_title}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Score: {answerSheet.session?.score}/{answerSheet.session?.total_points}
                  {' · '}
                  {answerSheet.session?.total_points > 0 &&
                    `${Math.round((answerSheet.session.score / answerSheet.session.total_points) * 100)}%`
                  }
                </p>
              </div>
              <Badge
                type={answerSheet.session?.status === 'completed' ? 'active' : 'pending'}
                label={answerSheet.session?.status}
              />
            </div>

            {/* Responses */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {answerSheet.responses?.map((r, i) => (
                <div key={r.id} style={{
                  padding: '1rem', borderRadius: 'var(--radius-md)',
                  background: r.is_correct ? 'var(--success-bg)' : 'var(--danger-bg)',
                  border: `1px solid ${r.is_correct ? 'var(--success)' : 'var(--danger)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--primary)' }}>
                      Q{i + 1}. {r.question}
                    </p>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      color: r.is_correct ? 'var(--success)' : 'var(--danger)',
                    }}>
                      {r.is_correct ? `✓ ${r.points}/${r.max_points} pts` : `✗ 0/${r.max_points} pts`}
                    </span>
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.82rem' }}>
                    <p><strong>Student Answer:</strong> {r.answer || '(no answer)'}</p>
                    <p style={{ color: 'var(--success)' }}><strong>Correct:</strong> {r.correct || '(essay)'}</p>
                    {r.explanation && (
                      <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                        💡 {r.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @media(max-width:600px){
          .session-row{flex-direction:column;align-items:flex-start!important}
          .session-row>div:last-child{text-align:left!important;width:100%}
        }
      `}</style>
    </DashboardLayout>
  )
}

function StatMini({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1rem',
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 'var(--radius-md)',
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{value ?? 0}</p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</p>
      </div>
    </div>
  )
}