import React, { useState, useEffect, useContext } from 'react'
import { FiClipboard, FiClock, FiPlay, FiCheckCircle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import { quizService } from '../../services/quizService'
import { ToastContext } from '../../context/ToastContext'
import { formatDate, timeAgo } from '../../utils/formatters'

export default function AvailableQuizzes() {
  const { addToast } = useContext(ToastContext)
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await quizService.getAvailable()
        setQuizzes(data.quizzes || [])
      } catch {
        addToast('Failed to load quizzes', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Available Quizzes</h1>
          <p className="page-subtitle">{quizzes.length} quizzes ready to take</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
      ) : quizzes.length === 0 ? (
        <Card>
          <EmptyState icon={FiClipboard} message="No quizzes available right now. Check back later!" />
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}>
          {quizzes.map(q => (
            <div key={q.id} style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)', transition: 'var(--transition-slow)',
              display: 'flex', flexDirection: 'column', gap: '0.85rem',
              borderTop: '3px solid var(--secondary)',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                  {q.title}
                </p>
                {q.course && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600 }}>
                    {q.course}
                  </p>
                )}
              </div>

              {q.description && (
                <p style={{
                  fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.6,
                  display: '-webkit-box', WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {q.description}
                </p>
              )}

              <div style={{
                display: 'flex', gap: '1rem', fontSize: '0.78rem',
                color: 'var(--text-muted)', flexWrap: 'wrap',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FiClipboard size={13} /> {q.question_count} questions
                </span>
                {q.time_limit && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <FiClock size={13} /> {q.time_limit} min
                  </span>
                )}
                <span>{q.max_attempts} attempt{q.max_attempts > 1 ? 's' : ''}</span>
              </div>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                By {q.teacher_name}
              </p>

              <Button variant="primary" fullWidth
                icon={<FiPlay size={15} />}
                onClick={() => navigate(`/student/quizzes/${q.id}/take`)}>
                Start Quiz
              </Button>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}