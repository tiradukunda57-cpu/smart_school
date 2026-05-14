import React, { useState, useEffect, useContext, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSend, FiUsers, FiPaperclip } from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Avatar from '../../components/common/Avatar'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { groupService } from '../../services/groupService'
import { ToastContext } from '../../context/ToastContext'
import { useAuth } from '../../hooks/useAuth'
import { formatName, formatDatetime, timeAgo } from '../../utils/formatters'

export default function GroupChat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addToast } = useContext(ToastContext)

  const [group, setGroup] = useState(null)
  const [members, setMembers] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [membersModal, setMembersModal] = useState(false)
  const bottomRef = useRef()

  const fetchGroup = async () => {
    try {
      const data = await groupService.getById(id)
      setGroup(data.group)
      setMembers(data.members || [])
    } catch {
      addToast('Failed to load group', 'error')
      navigate('/groups')
    }
  }

  const fetchMessages = async () => {
    try {
      const data = await groupService.getMessages(id)
      setMessages(data.messages || [])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } catch {} // silent on poll
  }

  useEffect(() => {
    const init = async () => {
      await fetchGroup()
      await fetchMessages()
      setLoading(false)
    }
    init()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [id])

  const handleSend = async () => {
    if (!newMessage.trim()) return
    setSending(true)
    try {
      await groupService.sendMessage(id, { content: newMessage.trim() })
      setNewMessage('')
      fetchMessages()
    } catch {
      addToast('Failed to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading group...</div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        marginBottom: '1rem', flexWrap: 'wrap',
      }}>
        <button onClick={() => navigate('/groups')} style={{
          background: 'var(--bg)', border: 'none', borderRadius: 'var(--radius-sm)',
          padding: '0.4rem', cursor: 'pointer', color: 'var(--primary)',
          display: 'flex', minWidth: 36, minHeight: 36, alignItems: 'center', justifyContent: 'center',
        }}>
          <FiArrowLeft size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            {group?.name}
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {members.length} members
          </p>
        </div>
        <Button variant="outline" size="sm" icon={<FiUsers size={14} />}
          onClick={() => setMembersModal(true)}>
          <span className="members-btn-text">Members</span>
        </Button>
      </div>

      {/* Chat area */}
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        height: 'calc(100vh - 240px)', minHeight: 350,
      }}>
        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '1rem',
          display: 'flex', flexDirection: 'column', gap: '0.6rem',
          background: 'var(--bg)', WebkitOverflowScrolling: 'touch',
        }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>
              No messages yet. Start the conversation! 💬
            </div>
          )}

          {messages.map(msg => {
            const isOwn = msg.sender_id === user?.id
            return (
              <div key={msg.id} style={{
                display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start',
              }}>
                {!isOwn && (
                  <Avatar firstName={msg.first_name} lastName={msg.last_name} size={28}
                    style={{ marginRight: '0.35rem', alignSelf: 'flex-end', flexShrink: 0 }} />
                )}
                <div style={{ maxWidth: '75%', minWidth: 0 }}>
                  {!isOwn && (
                    <p style={{
                      fontSize: '0.68rem', fontWeight: 600,
                      color: msg.user_role === 'teacher' ? 'var(--primary)' : 'var(--secondary)',
                      marginBottom: '0.15rem', marginLeft: '0.2rem',
                    }}>
                      {formatName(msg.first_name, msg.last_name)}
                      <span style={{ fontWeight: 400, color: 'var(--text-light)', marginLeft: '0.3rem' }}>
                        {msg.user_role}
                      </span>
                    </p>
                  )}
                  <div style={{
                    padding: '0.65rem 0.9rem',
                    background: isOwn ? 'var(--primary)' : 'var(--white)',
                    color: isOwn ? 'white' : 'var(--text-primary)',
                    borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    boxShadow: 'var(--shadow-sm)',
                    border: isOwn ? 'none' : '1px solid var(--border)',
                    fontSize: '0.85rem', lineHeight: 1.5, wordBreak: 'break-word',
                  }}>
                    {msg.content}
                  </div>

                  {/* Attachments */}
                  {msg.attachments && msg.attachments !== '[]' && (
                    <div style={{ marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {(typeof msg.attachments === 'string' ? JSON.parse(msg.attachments) : msg.attachments).map(att => (
                        <a key={att.id} href={`/${att.file_path}`} target="_blank" rel="noopener noreferrer"
                          style={{
                            fontSize: '0.75rem', color: isOwn ? 'rgba(255,255,255,0.8)' : 'var(--primary)',
                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                          }}>
                          <FiPaperclip size={11} /> {att.file_name}
                        </a>
                      ))}
                    </div>
                  )}

                  <p style={{
                    fontSize: '0.62rem', color: 'var(--text-light)',
                    marginTop: '0.2rem', textAlign: isOwn ? 'right' : 'left',
                  }}>
                    {formatDatetime(msg.created_at)}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '0.75rem 1rem', borderTop: '1px solid var(--border)',
          display: 'flex', gap: '0.6rem', background: 'var(--white)',
          flexShrink: 0, alignItems: 'flex-end',
        }}>
          <input type="text" value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Type a message..."
            className="form-input" style={{ flex: 1, minHeight: 42 }} />
          <button onClick={handleSend} disabled={!newMessage.trim() || sending}
            style={{
              padding: '0.6rem 1rem', background: 'var(--primary)',
              color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
              cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer',
              opacity: !newMessage.trim() || sending ? 0.5 : 1,
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              fontWeight: 600, fontSize: '0.85rem', minHeight: 42, minWidth: 42,
              justifyContent: 'center', flexShrink: 0,
            }}>
            <FiSend size={16} />
            <span className="gc-send-label">Send</span>
          </button>
        </div>
      </div>

      {/* Members Modal */}
      <Modal isOpen={membersModal} onClose={() => setMembersModal(false)}
        title={`Members (${members.length})`} size="sm">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {members.map(m => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.7rem',
              padding: '0.6rem', background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
            }}>
              <Avatar firstName={m.first_name} lastName={m.last_name} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {formatName(m.first_name, m.last_name)}
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {m.user_role} · {m.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <style>{`
        @media(max-width:480px){
          .members-btn-text{display:none}
          .gc-send-label{display:none}
        }
      `}</style>
    </DashboardLayout>
  )
}