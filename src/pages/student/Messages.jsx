import React, { useState, useEffect, useContext, useRef } from 'react'
import { FiSend, FiMessageSquare, FiArrowLeft, FiPlus } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/common/DashboardLayout'
import Avatar from '../../components/common/Avatar'
import SearchBar from '../../components/common/SearchBar'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import Modal from '../../components/common/Modal'
import { messageService } from '../../services/messageService'
import { teacherService } from '../../services/teacherService'
import { ToastContext } from '../../context/ToastContext'
import { useAuth } from '../../hooks/useAuth'
import { formatName, timeAgo, formatDatetime } from '../../utils/formatters'

export default function StudentMessages() {
  const { addToast } = useContext(ToastContext)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')

  // New conversation
  const [newConvModal, setNewConvModal] = useState(false)
  const [teachers, setTeachers] = useState([])
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [initMessage, setInitMessage] = useState('')

  const bottomRef = useRef()

  const fetchConversations = async () => {
    try {
      const data = await messageService.getConversations()
      setConversations(data.conversations || [])
    } catch {
      addToast('Failed to load conversations', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (otherUserId) => {
    try {
      const data = await messageService.getMessages(otherUserId)
      setMessages(data.messages || [])
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch {
      addToast('Failed to load messages', 'error')
    }
  }

  const fetchTeachers = async () => {
    try {
      const data = await teacherService.getAll({ limit: 100 })
      setTeachers(data.teachers || [])
    } catch { /* silent */ }
  }

  useEffect(() => {
    fetchConversations()
    fetchTeachers()
  }, [])

  useEffect(() => {
    if (!activeConv) return
    fetchMessages(activeConv.other_user_id)
    const interval = setInterval(
      () => fetchMessages(activeConv.other_user_id),
      8000
    )
    return () => clearInterval(interval)
  }, [activeConv])

  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv) return
    setSending(true)
    try {
      await messageService.send({
        receiver_id: activeConv.other_user_id,
        content: newMessage.trim(),
      })
      setNewMessage('')
      fetchMessages(activeConv.other_user_id)
      fetchConversations()
    } catch {
      addToast('Failed to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleStartConversation = async () => {
    if (!selectedTeacher || !initMessage.trim()) {
      addToast('Please select a teacher and write a message', 'warning')
      return
    }
    setSending(true)
    try {
      await messageService.send({
        receiver_id: selectedTeacher.user_id,
        content: initMessage.trim(),
      })
      addToast('Message sent!', 'success')
      setNewConvModal(false)
      setInitMessage('')
      setSelectedTeacher(null)
      fetchConversations()
    } catch {
      addToast('Failed to send message', 'error')
    } finally {
      setSending(false)
    }
  }

  const handleSelectConv = (conv) => {
    setActiveConv(conv)
    setMessages([])
  }

  const handleBackToList = () => {
    setActiveConv(null)
  }

  const filteredConversations = conversations.filter(c =>
    formatName(c.first_name, c.last_name)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">Chat with your teachers</p>
        </div>
        <Button
          variant="primary"
          icon={<FiPlus size={15} />}
          onClick={() => setNewConvModal(true)}
          size="md"
        >
          <span className="btn-new-label">New Conversation</span>
          <span className="btn-new-label-short" style={{ display: 'none' }}>New</span>
        </Button>
      </div>

      <div className="chat-wrapper">
        {/* ── Conversation Sidebar ── */}
        <div className={`chat-sidebar ${activeConv ? 'conv-active' : ''}`}>
          {/* Search */}
          <div style={{
            padding: '0.85rem',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search teachers..." />
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {loading && (
              <p style={{
                padding: '2rem', textAlign: 'center',
                color: 'var(--text-muted)', fontSize: '0.85rem',
              }}>
                Loading...
              </p>
            )}

            {!loading && filteredConversations.length === 0 && (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <p style={{
                  color: 'var(--text-muted)', fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}>
                  No conversations yet
                </p>
                <Button
                  variant="primary" size="sm"
                  onClick={() => setNewConvModal(true)}
                  icon={<FiPlus size={14} />}
                >
                  Start chatting
                </Button>
              </div>
            )}

            {filteredConversations.map(conv => (
              <button
                key={conv.other_user_id}
                onClick={() => handleSelectConv(conv)}
                style={{
                  width: '100%', padding: '0.9rem 1rem',
                  background: activeConv?.other_user_id === conv.other_user_id
                    ? 'var(--primary-ghost)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--border-light)',
                  cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  transition: 'var(--transition)',
                  minHeight: 64,
                }}
                onMouseEnter={e => {
                  if (activeConv?.other_user_id !== conv.other_user_id)
                    e.currentTarget.style.background = 'var(--bg)'
                }}
                onMouseLeave={e => {
                  if (activeConv?.other_user_id !== conv.other_user_id)
                    e.currentTarget.style.background = 'transparent'
                }}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar firstName={conv.first_name} lastName={conv.last_name} size={40} />
                  {conv.unread_count > 0 && (
                    <span style={{
                      position: 'absolute', top: -2, right: -2,
                      width: 18, height: 18,
                      background: 'var(--danger)', color: 'white',
                      borderRadius: '50%', fontSize: '0.62rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid white',
                    }}>
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: conv.unread_count > 0 ? 700 : 600,
                    fontSize: '0.85rem', color: 'var(--primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {formatName(conv.first_name, conv.last_name)}
                  </p>
                  <p style={{
                    fontSize: '0.75rem', color: 'var(--text-muted)',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                    textOverflow: 'ellipsis', marginTop: '0.1rem',
                  }}>
                    {conv.last_message || '—'}
                  </p>
                </div>
                {conv.last_at && (
                  <span style={{
                    fontSize: '0.68rem', color: 'var(--text-light)',
                    flexShrink: 0, whiteSpace: 'nowrap',
                  }}>
                    {timeAgo(conv.last_at)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Chat Area ── */}
        <div className={`chat-area ${activeConv ? 'conv-active' : ''}`}>
          {!activeConv ? (
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', height: '100%',
              flexDirection: 'column', gap: '1rem', padding: '2rem',
            }}>
              <EmptyState
                icon={FiMessageSquare}
                message="Select a conversation or start a new one"
              />
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{
                padding: '0.85rem 1rem',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                background: 'var(--white)',
                flexShrink: 0,
              }}>
                <button
                  className="chat-back-btn"
                  onClick={handleBackToList}
                  style={{
                    background: 'var(--bg)', border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.4rem', cursor: 'pointer',
                    color: 'var(--primary)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    minWidth: 36, minHeight: 36, flexShrink: 0,
                  }}
                >
                  <FiArrowLeft size={18} />
                </button>

                <Avatar
                  firstName={activeConv.first_name}
                  lastName={activeConv.last_name}
                  size={36}
                />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{
                    fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {formatName(activeConv.first_name, activeConv.last_name)}
                  </p>
                  <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                    Teacher
                  </p>
                </div>
              </div>

              {/* Messages list */}
              <div style={{
                flex: 1, overflowY: 'auto',
                padding: '1rem',
                display: 'flex', flexDirection: 'column', gap: '0.65rem',
                background: 'var(--bg)',
                WebkitOverflowScrolling: 'touch',
              }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No messages yet. Say hello! 👋
                    </p>
                  </div>
                )}

                {messages.map(msg => {
                  const isOwn = msg.sender_id === user?.id
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                      }}
                    >
                      {!isOwn && (
                        <Avatar
                          firstName={activeConv.first_name}
                          lastName={activeConv.last_name}
                          size={26}
                          style={{
                            marginRight: '0.35rem',
                            alignSelf: 'flex-end',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div style={{ maxWidth: '80%', minWidth: 0 }}>
                        <div style={{
                          padding: '0.7rem 0.9rem',
                          background: isOwn ? 'var(--primary)' : 'var(--white)',
                          color: isOwn ? 'white' : 'var(--text-primary)',
                          borderRadius: isOwn
                            ? '16px 16px 4px 16px'
                            : '16px 16px 16px 4px',
                          boxShadow: 'var(--shadow-sm)',
                          border: isOwn ? 'none' : '1px solid var(--border)',
                          fontSize: '0.85rem',
                          lineHeight: 1.55,
                          wordBreak: 'break-word',
                        }}>
                          {msg.content}
                        </div>
                        <p style={{
                          fontSize: '0.65rem', color: 'var(--text-light)',
                          marginTop: '0.2rem',
                          textAlign: isOwn ? 'right' : 'left',
                        }}>
                          {formatDatetime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input area */}
              <div style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid var(--border)',
                display: 'flex', gap: '0.6rem',
                background: 'var(--white)',
                flexShrink: 0,
                alignItems: 'flex-end',
              }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Type your message..."
                  className="form-input"
                  style={{ flex: 1, minHeight: 42 }}
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  style={{
                    padding: '0.6rem 1rem',
                    background: 'var(--secondary)',
                    color: 'white', border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer',
                    opacity: !newMessage.trim() || sending ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    fontWeight: 600, fontSize: '0.85rem',
                    transition: 'var(--transition)',
                    minHeight: 42, minWidth: 42,
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FiSend size={16} />
                  <span className="send-label">Send</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── New Conversation Modal ── */}
      <Modal
        isOpen={newConvModal}
        onClose={() => setNewConvModal(false)}
        title="New Conversation"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setNewConvModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={sending}
              onClick={handleStartConversation}
              icon={<FiSend size={14} />}
            >
              Send
            </Button>
          </>
        }
      >
        {/* Teacher selection */}
        <div className="form-group">
          <label className="form-label">Select Teacher</label>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.4rem',
            maxHeight: 200, overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}>
            {teachers.length === 0 && (
              <p style={{
                color: 'var(--text-muted)', fontSize: '0.85rem',
                textAlign: 'center', padding: '1rem',
              }}>
                No teachers available
              </p>
            )}
            {teachers.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTeacher(t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  padding: '0.7rem',
                  background: selectedTeacher?.id === t.id
                    ? 'var(--primary-ghost)' : 'var(--bg)',
                  border: selectedTeacher?.id === t.id
                    ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'var(--transition)',
                  minHeight: 52,
                }}
              >
                <Avatar firstName={t.first_name} lastName={t.last_name} size={32} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{
                    fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {formatName(t.first_name, t.last_name)}
                  </p>
                  <p style={{
                    fontSize: '0.75rem', color: 'var(--text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {t.subject}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message input */}
        <div className="form-group">
          <label className="form-label">Message</label>
          <textarea
            className="form-textarea"
            value={initMessage}
            onChange={e => setInitMessage(e.target.value)}
            placeholder="Write your message..."
            rows={4}
            style={{ minHeight: 100 }}
          />
        </div>
      </Modal>

      {/* ── Responsive Styles ── */}
      <style>{`
        .chat-wrapper {
          display: flex;
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          height: calc(100vh - 220px);
          min-height: 400px;
        }

        .chat-sidebar {
          width: 300px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        .chat-back-btn {
          display: none !important;
        }

        .btn-new-label-short {
          display: none !important;
        }

        /* ── Tablet ────────────────────── */
        @media (max-width: 900px) {
          .chat-sidebar { width: 250px; }
        }

        /* ── Mobile ────────────────────── */
        @media (max-width: 768px) {
          .chat-wrapper {
            height: calc(100vh - 160px);
            border-radius: var(--radius-md);
            position: relative;
          }

          .chat-sidebar {
            width: 100%;
            position: absolute;
            top: 0; left: 0; bottom: 0; right: 0;
            z-index: 2;
            background: var(--white);
            border-right: none;
          }

          .chat-sidebar.conv-active {
            display: none;
          }

          .chat-area {
            display: none;
            position: absolute;
            top: 0; left: 0; bottom: 0; right: 0;
            z-index: 3;
            background: var(--white);
          }

          .chat-area.conv-active {
            display: flex;
          }

          .chat-back-btn {
            display: flex !important;
          }

          .send-label {
            display: none;
          }

          .btn-new-label {
            display: none !important;
          }
          .btn-new-label-short {
            display: inline !important;
          }
        }

        /* ── Small Mobile ──────────────── */
        @media (max-width: 480px) {
          .chat-wrapper {
            height: calc(100vh - 140px);
            border-radius: var(--radius-sm);
          }
        }
      `}</style>
    </DashboardLayout>
  )
}