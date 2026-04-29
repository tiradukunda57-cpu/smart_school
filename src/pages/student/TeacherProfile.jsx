import React, { useState, useEffect, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FiArrowLeft, FiMessageSquare, FiBook,
  FiAward, FiPhone, FiMail, FiSend, FiCalendar
} from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import Modal from '../../components/common/Modal'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import { teacherService } from '../../services/teacherService'
import { messageService } from '../../services/messageService'
import { ToastContext } from '../../context/ToastContext'
import { formatDate, formatName } from '../../utils/formatters'

export default function ViewTeacherProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useContext(ToastContext)
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msgModal, setMsgModal] = useState(false)
  const [msgContent, setMsgContent] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await teacherService.getById(id)
        setTeacher(data.teacher)
      } catch {
        addToast('Failed to load teacher profile', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleSendMessage = async () => {
    if (!msgContent.trim()) {
      addToast('Please write a message', 'warning')
      return
    }
    setSending(true)
    try {
      await messageService.send({
        receiver_id: teacher.user_id,
        content: msgContent.trim(),
      })
      addToast('Message sent successfully!', 'success')
      setMsgModal(false)
      setMsgContent('')
      navigate('/student/messages')
    } catch {
      addToast('Failed to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullPage={false} text="Loading teacher profile..." />
      </DashboardLayout>
    )
  }

  if (!teacher) {
    return (
      <DashboardLayout>
        <div style={{
          textAlign: 'center', padding: '4rem 1rem',
          color: 'var(--text-muted)',
        }}>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Teacher not found
          </p>
          <Button variant="outline" onClick={() => navigate('/student/teachers')}>
            ← Back to Teachers
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const infoItems = [
    { icon: FiBook, label: 'Subject', value: teacher.subject },
    { icon: FiAward, label: 'Qualification', value: teacher.qualification },
    { icon: FiPhone, label: 'Phone', value: teacher.phone },
    { icon: FiMail, label: 'Email', value: teacher.email },
  ].filter(i => i.value)

  const detailCards = [
    { label: 'Subject', value: teacher.subject || '—' },
    { label: 'Qualification', value: teacher.qualification || '—' },
    { label: 'Email', value: teacher.email },
    { label: 'Phone', value: teacher.phone || '—' },
  ]

  return (
    <DashboardLayout>
      {/* Back button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate('/student/teachers')}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
            padding: '0.4rem 0', minHeight: 40,
            transition: 'var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <FiArrowLeft size={16} /> Back to Teachers
        </button>
      </div>

      {/* Main grid — responsive */}
      <div className="tp-grid">
        {/* ── Left Column: Profile Card ── */}
        <div className="tp-left">
          <Card>
            {/* Banner */}
            <div style={{
              height: 90,
              margin: '-1.25rem -1.25rem 0',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
            }} />

            <div style={{ padding: '0 0.5rem' }}>
              {/* Avatar overlapping banner */}
              <div style={{ marginTop: -40, marginBottom: '1rem' }}>
                <Avatar
                  firstName={teacher.first_name}
                  lastName={teacher.last_name}
                  size={76}
                  style={{
                    border: '4px solid white',
                    boxShadow: 'var(--shadow-md)',
                  }}
                />
              </div>

              <h2 style={{
                fontSize: '1.15rem', fontWeight: 800,
                color: 'var(--primary)', marginBottom: '0.2rem',
                wordBreak: 'break-word',
              }}>
                {formatName(teacher.first_name, teacher.last_name)}
              </h2>
              <p style={{
                fontSize: '0.88rem', color: 'var(--secondary)',
                fontWeight: 700, marginBottom: '0.75rem',
              }}>
                {teacher.subject || 'Teacher'}
              </p>

              {/* Message button */}
              <Button
                variant="secondary"
                fullWidth
                icon={<FiMessageSquare size={15} />}
                onClick={() => setMsgModal(true)}
              >
                Send Message
              </Button>
            </div>

            {/* Quick info list */}
            <div style={{
              borderTop: '1px solid var(--border)',
              marginTop: '1.25rem',
              paddingTop: '1rem',
            }}>
              {infoItems.map(({ icon: Icon, label, value }) => (
                <div key={label} style={{
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  padding: '0.6rem 0',
                  borderBottom: '1px solid var(--border-light)',
                }}>
                  <div style={{
                    width: 32, height: 32,
                    background: 'var(--primary-ghost)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={14} color="var(--primary)" />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {label}
                    </p>
                    <p style={{
                      fontSize: '0.83rem', color: 'var(--primary)', fontWeight: 600,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}

              <div style={{
                padding: '0.6rem 0',
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.8rem',
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Member since</span>
                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                  {formatDate(teacher.created_at)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Right Column: Details ── */}
        <div className="tp-right">
          {/* Bio */}
          {teacher.bio && (
            <Card title="About">
              <p style={{
                fontSize: '0.88rem', color: 'var(--text-secondary)',
                lineHeight: 1.8, whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}>
                {teacher.bio}
              </p>
            </Card>
          )}

          {/* Professional Details */}
          <Card title="Professional Details" style={{ marginTop: teacher.bio ? '1.25rem' : 0 }}>
            <div className="tp-detail-grid">
              {detailCards.map(({ label, value }) => (
                <div key={label} style={{
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  minWidth: 0,
                }}>
                  <p style={{
                    fontSize: '0.72rem', color: 'var(--text-muted)',
                    fontWeight: 600, marginBottom: '0.3rem',
                    textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    {label}
                  </p>
                  <p style={{
                    fontSize: '0.88rem', fontWeight: 700,
                    color: 'var(--primary)', wordBreak: 'break-word',
                  }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* CTA Banner */}
          <div style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            color: 'white',
            textAlign: 'center',
            marginTop: '1.25rem',
          }}>
            <FiMessageSquare size={28} style={{ marginBottom: '0.7rem', opacity: 0.9 }} />
            <h3 style={{ fontWeight: 800, marginBottom: '0.45rem', fontSize: '1.05rem' }}>
              Need Help?
            </h3>
            <p style={{
              opacity: 0.85, fontSize: '0.88rem',
              marginBottom: '1.25rem', lineHeight: 1.6,
              maxWidth: 360, margin: '0 auto 1.25rem',
            }}>
              Send a message to {teacher.first_name} and get the support you need.
            </p>
            <button
              onClick={() => setMsgModal(true)}
              style={{
                padding: '0.7rem 1.75rem', background: 'white',
                color: 'var(--primary)', border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                transition: 'var(--transition)',
                minHeight: 44,
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Send Message
            </button>
          </div>
        </div>
      </div>

      {/* ── Message Modal ── */}
      <Modal
        isOpen={msgModal}
        onClose={() => setMsgModal(false)}
        title={`Message to ${formatName(teacher.first_name, teacher.last_name)}`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setMsgModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={sending}
              onClick={handleSendMessage}
              icon={<FiSend size={14} />}
            >
              Send
            </Button>
          </>
        }
      >
        {/* Recipient preview */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.7rem',
          marginBottom: '1.25rem', padding: '0.85rem',
          background: 'var(--bg)', borderRadius: 'var(--radius-md)',
        }}>
          <Avatar firstName={teacher.first_name} lastName={teacher.last_name} size={38} />
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {formatName(teacher.first_name, teacher.last_name)}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {teacher.subject}
            </p>
          </div>
        </div>

        {/* Message input */}
        <div className="form-group">
          <label className="form-label">Your Message</label>
          <textarea
            className="form-textarea"
            value={msgContent}
            onChange={e => setMsgContent(e.target.value)}
            placeholder={`Write your message to ${teacher.first_name}...`}
            rows={5}
            style={{ minHeight: 120 }}
          />
        </div>
      </Modal>

      {/* ── Responsive CSS ── */}
      <style>{`
        .tp-grid {
          display: grid;
          grid-template-columns: minmax(260px, 340px) 1fr;
          gap: 1.5rem;
          align-items: start;
        }
        .tp-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        @media (max-width: 992px) {
          .tp-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          .tp-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </DashboardLayout>
  )
}