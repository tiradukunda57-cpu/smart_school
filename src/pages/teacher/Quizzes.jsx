import React, { useState, useEffect, useContext } from 'react'
import {
  FiPlus, FiClipboard, FiTrash2,
  FiToggleLeft, FiToggleRight, FiBarChart2,
  FiEye, FiEdit
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import { quizService } from '../../services/quizService'
import { ToastContext } from '../../context/ToastContext'
import { useAuth } from '../../hooks/useAuth'
import { timeAgo } from '../../utils/formatters'

export default function TeacherQuizzes() {
  const { addToast } = useContext(ToastContext)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchQuizzes = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await quizService.getMyQuizzes()
      setQuizzes(data.quizzes || [])
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to load quizzes'
      const status = err?.response?.status
      if (status === 403) {
        setError(err?.response?.data?.message || 'Access denied')
      } else if (status === 404) {
        setError('Teacher profile not found. Please complete your registration.')
      } else {
        setError(msg)
        addToast(msg, 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchQuizzes() }, [])

  const handleToggle = async (id, current) => {
    try {
      await quizService.togglePublish(id, { is_published: !current })
      addToast(!current ? '✅ Quiz published! Students can now take it.' : 'Quiz unpublished.', 'success')
      fetchQuizzes()
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to update', 'error')
    }
  }

  const handleDelete = async () => {
    if (!deleteModal) return
    setSaving(true)
    try {
      await quizService.delete(deleteModal.id)
      addToast('Quiz deleted', 'success')
      setDeleteModal(null)
      fetchQuizzes()
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to delete', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div style={{ animation: 'pageSlideUp 0.4s cubic-bezier(0.22,1,0.36,1) both' }}>

        <div className="page-header">
          <div>
            <h1 className="page-title">My Quizzes</h1>
            <p className="page-subtitle">{quizzes.length} quiz{quizzes.length !== 1 ? 'zes' : ''} created</p>
          </div>
          <Button variant="primary" icon={<FiPlus size={16} />}
            onClick={() => navigate('/teacher/quizzes/new')}>
            Create Quiz
          </Button>
        </div>

        {/* Error state */}
        {error && !loading && (
          <div style={{
            background: 'var(--danger-bg)', border: '1.5px solid var(--danger)',
            borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem',
            marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <span style={{ fontSize: '1.5rem' }}>⚠️</span>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--danger)' }}>Cannot Load Quizzes</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 120, background: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                animation: `shimmer 1.4s ease infinite ${i * 0.15}s`,
              }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && quizzes.length === 0 && (
          <Card>
            <EmptyState
              icon={FiClipboard}
              message="No quizzes yet. Create your first quiz and share it with students!"
              action={
                <Button variant="primary" icon={<FiPlus size={14} />}
                  onClick={() => navigate('/teacher/quizzes/new')}>
                  Create First Quiz
                </Button>
              }
            />
          </Card>
        )}

        {/* Quiz grid */}
        {!loading && !error && quizzes.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}>
            {quizzes.map((q, i) => (
              <div
                key={q.id}
                style={{
                  background: 'var(--white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.22s ease',
                  display: 'flex', flexDirection: 'column', gap: '0.85rem',
                  borderTop: `3px solid ${q.is_published ? 'var(--success)' : 'var(--warning)'}`,
                  animation: `cardPopIn 0.4s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s both`,
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {q.title}
                    </p>
                    {q.course && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600, marginTop: '0.1rem' }}>
                        {q.course}
                      </p>
                    )}
                  </div>
                  <Badge
                    type={q.is_published ? 'active' : 'pending'}
                    label={q.is_published ? 'Live' : 'Draft'}
                  />
                </div>

                {/* Stats */}
                <div style={{
                  display: 'flex', gap: '0.75rem', fontSize: '0.78rem',
                  color: 'var(--text-muted)', flexWrap: 'wrap',
                }}>
                  <span>📝 {q.question_count || 0} questions</span>
                  <span>👥 {q.attempt_count || 0} attempts</span>
                  {q.time_limit && <span>⏱ {q.time_limit} min</span>}
                  <span>🔁 max {q.max_attempts || 1} attempt(s)</span>
                </div>

                {/* Description */}
                {q.description && (
                  <p style={{
                    fontSize: '0.8rem', color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {q.description}
                  </p>
                )}

                <p style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>
                  {timeAgo(q.created_at)}
                </p>

                {/* Actions */}
                <div style={{
                  display: 'flex', gap: '0.4rem',
                  borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem',
                  flexWrap: 'wrap',
                }}>
                  <button
                    onClick={() => navigate(`/teacher/quizzes/${q.id}/progress`)}
                    style={{ ...qBtn, flex: 2, color: 'var(--primary)' }}
                  >
                    <FiBarChart2 size={13} /> Progress
                  </button>
                  <button
                    onClick={() => handleToggle(q.id, q.is_published)}
                    style={{
                      ...qBtn, flex: 2,
                      color: q.is_published ? 'var(--warning)' : 'var(--success)',
                    }}
                  >
                    {q.is_published
                      ? <><FiToggleRight size={13} /> Unpublish</>
                      : <><FiToggleLeft size={13} /> Publish</>
                    }
                  </button>
                  <button
                    onClick={() => setDeleteModal(q)}
                    style={{ ...qBtn, flex: 1, color: 'var(--danger)' }}
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Modal */}
        <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)}
          title="Delete Quiz" size="sm"
          footer={<>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" loading={saving} onClick={handleDelete}>Delete</Button>
          </>}>
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--danger-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}>
              <FiTrash2 size={24} color="var(--danger)" />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Delete <strong>"{deleteModal?.title}"</strong>?<br />
              All student responses will be permanently lost.
            </p>
          </div>
        </Modal>
      </div>

      <style>{`
        @keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </DashboardLayout>
  )
}

const qBtn = {
  background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)', padding: '0.45rem 0.5rem',
  cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
  display: 'flex', alignItems: 'center', gap: '0.3rem',
  justifyContent: 'center', transition: 'all 0.2s ease', minHeight: 36,
}