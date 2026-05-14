import React, { useState, useEffect, useContext, useRef, useCallback } from 'react'
import { FiSend, FiMessageSquare, FiArrowLeft, FiSearch } from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Avatar from '../../components/common/Avatar'
import EmptyState from '../../components/common/EmptyState'
import SearchBar from '../../components/common/SearchBar'
import { messageService } from '../../services/messageService'
import { ToastContext } from '../../context/ToastContext'
import { useAuth } from '../../hooks/useAuth'
import { formatName, timeAgo, formatDatetime } from '../../utils/formatters'

export default function TeacherMessages() {
  const { addToast }  = useContext(ToastContext)
  const { user }      = useAuth()

  const [conversations, setConversations] = useState([])
  const [messages,      setMessages]      = useState([])
  const [activeConv,    setActiveConv]    = useState(null)
  const [newMessage,    setNewMessage]    = useState('')
  const [loading,       setLoading]       = useState(true)
  const [sending,       setSending]       = useState(false)
  const [search,        setSearch]        = useState('')

  const bottomRef    = useRef()
  const inputRef     = useRef()
  const pollRef      = useRef()

  // ── Fetch conversations ──────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const data = await messageService.getConversations()
      setConversations(data.conversations || [])
    } catch (err) {
      if (err?.response?.status !== 403) {
        addToast('Failed to load conversations', 'error')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // ── Fetch messages with active user ─────────────────────────
  const fetchMessages = useCallback(async (otherUserId) => {
    if (!otherUserId) return
    try {
      const data = await messageService.getMessages(otherUserId)
      setMessages(data.messages || [])
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      })
    } catch {
      // silent on poll errors
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (!activeConv) return

    // Immediate fetch
    fetchMessages(activeConv.other_user_id)
    fetchConversations()

    // Poll every 4 seconds
    pollRef.current = setInterval(() => {
      fetchMessages(activeConv.other_user_id)
      fetchConversations()
    }, 4000)

    return () => clearInterval(pollRef.current)
  }, [activeConv?.other_user_id, fetchMessages, fetchConversations])

  // ── Select conversation ──────────────────────────────────────
  const handleSelectConv = (conv) => {
    setActiveConv(conv)
    setMessages([])
    setNewMessage('')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleBack = () => {
    setActiveConv(null)
    clearInterval(pollRef.current)
  }

  // ── Send message ─────────────────────────────────────────────
  const handleSend = async () => {
    if (!newMessage.trim() || !activeConv || sending) return
    const content = newMessage.trim()
    setNewMessage('')
    setSending(true)
    try {
      await messageService.send({
        receiver_id: activeConv.other_user_id,
        content,
      })
      await fetchMessages(activeConv.other_user_id)
      await fetchConversations()
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to send', 'error')
      setNewMessage(content) // restore on error
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const filtered = conversations.filter(c =>
    formatName(c.first_name, c.last_name)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div style={{ animation: 'pageSlideRight 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Messages</h1>
            <p className="page-subtitle">Student conversations</p>
          </div>
        </div>

        <div className="msg-layout">

          {/* ── Conversation Sidebar ─────────────────── */}
          <div className={`msg-sidebar ${activeConv ? 'hidden-mobile' : ''}`}>
            <div style={{ padding: '0.85rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <SearchBar value={search} onChange={setSearch} placeholder="Search conversations..." />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {loading && (
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Loading...
                </p>
              )}

              {!loading && filtered.length === 0 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                  <FiMessageSquare size={28} color="var(--text-light)" style={{ marginBottom: '0.5rem' }} />
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {search ? 'No matches found' : 'No conversations yet'}
                  </p>
                </div>
              )}

              {filtered.map(conv => {
                const isActive = activeConv?.other_user_id === conv.other_user_id
                return (
                  <button
                    key={conv.other_user_id}
                    onClick={() => handleSelectConv(conv)}
                    style={{
                      width: '100%', padding: '0.9rem 1rem',
                      background: isActive ? 'var(--primary-ghost)' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-light)',
                      cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: '0.7rem',
                      transition: 'background 0.15s ease', minHeight: 64,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar firstName={conv.first_name} lastName={conv.last_name} size={40} />
                      {conv.unread_count > 0 && (
                        <span style={{
                          position: 'absolute', top: -3, right: -3,
                          minWidth: 18, height: 18,
                          background: 'var(--danger)', color: 'white',
                          borderRadius: '9px', fontSize: '0.62rem', fontWeight: 800,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '2px solid white', padding: '0 3px',
                        }}>
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontWeight: parseInt(conv.unread_count) > 0 ? 700 : 600,
                        fontSize: '0.85rem', color: 'var(--primary)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {formatName(conv.first_name, conv.last_name)}
                      </p>
                      <p style={{
                        fontSize: '0.75rem', color: 'var(--text-muted)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        marginTop: '0.1rem',
                      }}>
                        {conv.last_message || 'No messages yet'}
                      </p>
                    </div>
                    {conv.last_at && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {timeAgo(conv.last_at)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Chat Area ───────────────────────────── */}
          <div className={`msg-chat ${activeConv ? 'visible-mobile' : ''}`}>
            {!activeConv ? (
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexDirection: 'column', gap: '0.75rem',
              }}>
                <EmptyState
                  icon={FiMessageSquare}
                  message="Select a conversation to start chatting"
                />
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div style={{
                  padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  background: 'var(--white)', flexShrink: 0,
                }}>
                  <button className="back-btn" onClick={handleBack} style={{
                    background: 'var(--bg)', border: 'none',
                    borderRadius: 'var(--radius-sm)', padding: '0.4rem',
                    cursor: 'pointer', color: 'var(--primary)',
                    display: 'none', alignItems: 'center',
                    minWidth: 36, minHeight: 36, justifyContent: 'center',
                  }}>
                    <FiArrowLeft size={18} />
                  </button>
                  <Avatar firstName={activeConv.first_name} lastName={activeConv.last_name} size={36} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{
                      fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {formatName(activeConv.first_name, activeConv.last_name)}
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {activeConv.role}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div style={{
                  flex: 1, overflowY: 'auto', padding: '1rem',
                  display: 'flex', flexDirection: 'column', gap: '0.6rem',
                  background: 'var(--bg)', WebkitOverflowScrolling: 'touch',
                }}>
                  {messages.length === 0 && (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '3rem' }}>
                      No messages yet. Say hello! 👋
                    </p>
                  )}
                  {messages.map(msg => {
                    const isOwn = msg.sender_id === user?.id
                    return (
                      <div key={msg.id} style={{
                        display: 'flex',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                      }}>
                        {!isOwn && (
                          <Avatar
                            firstName={activeConv.first_name}
                            lastName={activeConv.last_name}
                            size={26}
                            style={{ marginRight: '0.35rem', alignSelf: 'flex-end', flexShrink: 0 }}
                          />
                        )}
                        <div style={{ maxWidth: '76%', minWidth: 0 }}>
                          <div style={{
                            padding: '0.65rem 0.9rem',
                            background: isOwn ? 'var(--primary)' : 'var(--white)',
                            color: isOwn ? 'white' : 'var(--text-primary)',
                            borderRadius: isOwn ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                            boxShadow: 'var(--shadow-sm)',
                            border: isOwn ? 'none' : '1px solid var(--border)',
                            fontSize: '0.85rem', lineHeight: 1.55,
                            wordBreak: 'break-word',
                          }}>
                            {msg.content}
                          </div>
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
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Enter to send)"
                    className="form-input"
                    style={{ flex: 1, minHeight: 42 }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    style={{
                      padding: '0.6rem 1rem', background: 'var(--primary)',
                      color: 'white', border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: !newMessage.trim() || sending ? 'not-allowed' : 'pointer',
                      opacity: !newMessage.trim() || sending ? 0.5 : 1,
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      fontWeight: 600, fontSize: '0.85rem',
                      minHeight: 42, minWidth: 42, justifyContent: 'center',
                      flexShrink: 0, transition: 'all 0.15s ease',
                    }}
                  >
                    <FiSend size={16} />
                    <span className="send-text">Send</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .msg-layout {
          display: flex;
          background: var(--white);
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          height: calc(100vh - 220px);
          min-height: 400px;
        }
        .msg-sidebar {
          width: 300px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .msg-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        @media (max-width: 900px) {
          .msg-sidebar { width: 250px; }
        }

        @media (max-width: 768px) {
          .msg-layout {
            height: calc(100vh - 160px);
            border-radius: var(--radius-md);
            position: relative;
          }
          .msg-sidebar {
            width: 100%;
            position: absolute;
            top: 0; left: 0; bottom: 0; right: 0;
            z-index: 2;
            background: var(--white);
            border-right: none;
          }
          .msg-sidebar.hidden-mobile { display: none; }
          .msg-chat {
            position: absolute;
            top: 0; left: 0; bottom: 0; right: 0;
            z-index: 3;
            background: var(--white);
            display: none;
          }
          .msg-chat.visible-mobile { display: flex; }
          .back-btn { display: flex !important; }
          .send-text { display: none; }
        }

        @media (max-width: 480px) {
          .msg-layout { height: calc(100vh - 140px); }
        }
      `}</style>
    </DashboardLayout>
  )
}