import React, { useState, useEffect, useContext } from 'react'
import { FiShield, FiSend, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import Modal from './Modal'
import Button from './Button'
import Badge from './Badge'
import { recoveryService } from '../../services/recoveryService'
import { ToastContext } from '../../context/ToastContext'
import { useAuth } from '../../hooks/useAuth'
import { formatDatetime } from '../../utils/formatters'

export default function RecoveryModal({ isOpen, onClose }) {
  const { user } = useAuth()
  const { addToast } = useContext(ToastContext)

  const [tab, setTab] = useState('new') // 'new' | 'history'
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [requests, setRequests] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const fetchHistory = async () => {
    setLoadingHistory(true)
    try {
      const data = await recoveryService.getMyRequests()
      setRequests(data.requests || [])
    } catch {
      // silent
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (isOpen) fetchHistory()
  }, [isOpen])

  const handleSubmit = async () => {
    if (!message.trim()) {
      addToast('Please describe your issue and the new password you want', 'warning')
      return
    }

    setSending(true)
    try {
      await recoveryService.submit({ message: message.trim() })
      addToast('Recovery request sent! Admin will review it shortly.', 'success')
      setMessage('')
      setTab('history')
      fetchHistory()
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to submit request', 'error')
    } finally {
      setSending(false)
    }
  }

  const hasPending = requests.some(r => r.status === 'pending')

  const statusConfig = {
    pending:  { icon: FiClock,       color: 'var(--warning)', bg: 'var(--warning-bg)', label: 'Pending' },
    approved: { icon: FiCheckCircle, color: 'var(--success)', bg: 'var(--success-bg)', label: 'Approved' },
    rejected: { icon: FiXCircle,     color: 'var(--danger)',  bg: 'var(--danger-bg)',  label: 'Rejected' },
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Password Recovery" size="md">
      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '2px', marginBottom: '1.5rem',
        background: 'var(--bg)', borderRadius: 'var(--radius-md)',
        padding: 3,
      }}>
        {[
          { key: 'new', label: 'New Request' },
          { key: 'history', label: `History (${requests.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '0.55rem 0.75rem',
            background: tab === t.key ? 'var(--primary)' : 'transparent',
            color: tab === t.key ? 'white' : 'var(--text-muted)',
            border: 'none', borderRadius: 'var(--radius-sm)',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
            transition: 'all 0.2s ease', minHeight: 38,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* New Request Tab */}
      {tab === 'new' && (
        <div style={{ animation: 'pageFadeIn 0.3s ease both' }}>
          {hasPending ? (
            <div style={{
              background: 'var(--warning-bg)', border: '1px solid var(--warning)',
              borderRadius: 'var(--radius-md)', padding: '1.25rem',
              textAlign: 'center',
            }}>
              <FiClock size={32} color="var(--warning)" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 700, color: 'var(--warning)', marginBottom: '0.3rem' }}>
                Request Pending
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                You already have a pending recovery request. Please wait for admin to respond.
              </p>
            </div>
          ) : (
            <>
              <div style={{
                background: 'var(--primary-ghost)', borderRadius: 'var(--radius-md)',
                padding: '1rem', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
              }}>
                <FiShield size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600 }}>
                    How Password Recovery Works
                  </p>
                  <ul style={{
                    fontSize: '0.78rem', color: 'var(--text-muted)',
                    paddingLeft: '1rem', marginTop: '0.3rem', lineHeight: 1.7,
                  }}>
                    <li>Describe your issue below</li>
                    <li>Include the <strong>new password</strong> you want to use</li>
                    <li>Admin will review and update your password</li>
                    <li>You'll see the result in the History tab</li>
                  </ul>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Request Message</label>
                <textarea
                  className="form-textarea"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Hi Admin,\n\nI forgot my password. Please change it to: mynewpassword123\n\nThank you,\n${user?.first_name || 'User'}`}
                  rows={6}
                  style={{ minHeight: 150 }}
                />
              </div>

              <Button variant="primary" fullWidth loading={sending}
                onClick={handleSubmit} icon={<FiSend size={15} />}>
                Submit Recovery Request
              </Button>
            </>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div style={{ animation: 'pageFadeIn 0.3s ease both' }}>
          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading...
            </div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <FiShield size={36} color="var(--text-light)" style={{ marginBottom: '0.75rem' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No recovery requests yet
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 400, overflowY: 'auto' }}>
              {requests.map(r => {
                const sc = statusConfig[r.status] || statusConfig.pending
                const StatusIcon = sc.icon
                return (
                  <div key={r.id} style={{
                    background: sc.bg, border: `1px solid ${sc.color}`,
                    borderRadius: 'var(--radius-md)', padding: '1rem',
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '0.5rem',
                      flexWrap: 'wrap', gap: '0.5rem',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <StatusIcon size={15} color={sc.color} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: sc.color }}>
                          {sc.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {formatDatetime(r.created_at)}
                      </span>
                    </div>

                    <p style={{
                      fontSize: '0.82rem', color: 'var(--text-primary)',
                      lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '0.5rem',
                    }}>
                      {r.message}
                    </p>

                    {r.status === 'approved' && r.new_password && (
                      <div style={{
                        background: 'var(--white)', borderRadius: 'var(--radius-sm)',
                        padding: '0.65rem 0.85rem', marginTop: '0.5rem',
                        border: '1px solid var(--success)',
                      }}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.25rem' }}>
                          ✅ New Password Set:
                        </p>
                        <p style={{
                          fontFamily: 'monospace', fontSize: '0.9rem',
                          fontWeight: 700, color: 'var(--primary)',
                          letterSpacing: '0.05em',
                        }}>
                          {r.new_password}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                          Please log out and log back in with this password.
                        </p>
                      </div>
                    )}

                    {r.admin_note && (
                      <div style={{
                        background: 'var(--white)', borderRadius: 'var(--radius-sm)',
                        padding: '0.55rem 0.75rem', marginTop: '0.4rem',
                        fontSize: '0.78rem', color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                      }}>
                        💬 Admin: {r.admin_note}
                      </div>
                    )}

                    {r.handled_at && (
                      <p style={{ fontSize: '0.68rem', color: 'var(--text-light)', marginTop: '0.35rem' }}>
                        Handled: {formatDatetime(r.handled_at)}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}