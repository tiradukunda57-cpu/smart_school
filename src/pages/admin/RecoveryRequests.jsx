import React, { useState, useEffect, useContext } from 'react'
import {
  FiShield, FiCheck, FiX, FiClock,
  FiUser, FiMail, FiKey, FiEye, FiEyeOff
} from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { adminService } from '../../services/adminService'
import { ToastContext } from '../../context/ToastContext'
import { formatName, formatDatetime, timeAgo } from '../../utils/formatters'

export default function RecoveryRequests() {
  const { addToast } = useContext(ToastContext)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [actionModal, setActionModal] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const data = await adminService.getRecoveryRequests({ status: filter === 'all' ? '' : filter })
      setRequests(data.requests || [])
    } catch {
      addToast('Failed to load requests', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRequests() }, [filter])

  const handleAction = async (action) => {
    if (!actionModal) return

    if (action === 'approve' && !newPassword.trim()) {
      addToast('Please enter the new password for this user', 'warning')
      return
    }

    setSaving(true)
    try {
      await adminService.handleRecovery(actionModal.id, {
        action,
        new_password: action === 'approve' ? newPassword.trim() : undefined,
        admin_note: adminNote.trim() || undefined,
      })
      addToast(
        action === 'approve'
          ? `Password reset done! New password: ${newPassword}`
          : 'Request rejected',
        action === 'approve' ? 'success' : 'info'
      )
      setActionModal(null)
      setNewPassword('')
      setAdminNote('')
      fetchRequests()
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const statusConfig = {
    pending:  { color: 'var(--warning)', bg: 'var(--warning-bg)', label: 'Pending' },
    approved: { color: 'var(--success)', bg: 'var(--success-bg)', label: 'Approved' },
    rejected: { color: 'var(--danger)',  bg: 'var(--danger-bg)',  label: 'Rejected' },
  }

  return (
    <DashboardLayout>
      <div style={{ animation: 'adminPageIn 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Password Recovery Requests</h1>
            <p className="page-subtitle">
              {requests.filter(r => r.status === 'pending').length} pending requests
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', padding: '0.25rem' }}>
            {['pending', 'approved', 'rejected', 'all'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '0.45rem 1rem',
                background: filter === f ? 'var(--primary)' : 'var(--bg)',
                color: filter === f ? 'white' : 'var(--text-muted)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                transition: 'all 0.2s ease', minHeight: 36,
                textTransform: 'capitalize',
              }}>
                {f}
              </button>
            ))}
          </div>
        </Card>

        {/* Requests list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
        ) : requests.length === 0 ? (
          <Card>
            <EmptyState icon={FiShield}
              message={filter === 'pending' ? 'No pending recovery requests 🎉' : 'No requests found'} />
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {requests.map((r, i) => {
              const sc = statusConfig[r.status] || statusConfig.pending
              return (
                <Card key={r.id} style={{
                  animation: `cardPopIn 0.35s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s both`,
                  borderLeft: `4px solid ${sc.color}`,
                }}>
                  <div className="rcv-card">
                    {/* User info */}
                    <div className="rcv-info">
                      <Avatar firstName={r.first_name} lastName={r.last_name} size={44} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                            {formatName(r.first_name, r.last_name)}
                          </p>
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 700,
                            background: sc.bg, color: sc.color,
                            padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)',
                          }}>
                            {sc.label}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                          📧 {r.email} · {r.role} · {timeAgo(r.created_at)}
                        </p>
                      </div>
                    </div>

                    {/* Message */}
                    <div style={{
                      background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem', margin: '0.75rem 0',
                      fontSize: '0.85rem', color: 'var(--text-primary)',
                      lineHeight: 1.65, whiteSpace: 'pre-wrap',
                    }}>
                      {r.message}
                    </div>

                    {/* Admin note if exists */}
                    {r.admin_note && (
                      <p style={{
                        fontSize: '0.78rem', color: 'var(--text-secondary)',
                        fontStyle: 'italic', margin: '0.3rem 0',
                      }}>
                        💬 Admin: {r.admin_note}
                      </p>
                    )}

                    {/* Actions for pending */}
                    {r.status === 'pending' && (
                      <div className="rcv-actions">
                        <Button variant="success" size="sm" icon={<FiCheck size={14} />}
                          onClick={() => { setActionModal(r); setNewPassword(''); setAdminNote('') }}>
                          Approve & Set Password
                        </Button>
                        <Button variant="danger" size="sm" icon={<FiX size={14} />}
                          onClick={() => handleAction('reject')}>
                          Reject
                        </Button>
                      </div>
                    )}

                    {/* Result for approved */}
                    {r.status === 'approved' && r.new_password && (
                      <div style={{
                        background: 'var(--success-bg)', border: '1px solid var(--success)',
                        borderRadius: 'var(--radius-sm)', padding: '0.55rem 0.85rem',
                        marginTop: '0.4rem',
                      }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
                          ✅ Password set to: <code style={{ fontWeight: 800 }}>{r.new_password}</code>
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Action Modal */}
        <Modal isOpen={!!actionModal} onClose={() => setActionModal(null)}
          title="Reset User Password" size="sm"
          footer={<>
            <Button variant="ghost" onClick={() => setActionModal(null)}>Cancel</Button>
            <Button variant="success" loading={saving}
              onClick={() => handleAction('approve')}
              icon={<FiKey size={14} />}>
              Set New Password
            </Button>
          </>}>
          {actionModal && (
            <div>
              {/* User preview */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.85rem', background: 'var(--bg)',
                borderRadius: 'var(--radius-md)', marginBottom: '1rem',
              }}>
                <Avatar firstName={actionModal.first_name} lastName={actionModal.last_name} size={40} />
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {formatName(actionModal.first_name, actionModal.last_name)}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{actionModal.email}</p>
                </div>
              </div>

              {/* User's message */}
              <div style={{
                background: 'var(--warning-bg)', border: '1px solid var(--warning)',
                borderRadius: 'var(--radius-md)', padding: '0.85rem',
                marginBottom: '1rem', fontSize: '0.82rem', lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--warning)', marginBottom: '0.3rem' }}>
                  USER'S REQUEST:
                </p>
                {actionModal.message}
              </div>

              {/* New password input */}
              <div className="form-group">
                <label className="form-label">New Password for User *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="form-input"
                    type={showPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', display: 'flex',
                    }}>
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              {/* Admin note */}
              <div className="form-group">
                <label className="form-label">Admin Note (optional)</label>
                <textarea className="form-textarea" value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Message to the user..." rows={2}
                  style={{ minHeight: 60 }} />
              </div>
            </div>
          )}
        </Modal>
      </div>

      <style>{`
        .rcv-card { display: flex; flex-direction: column; }
        .rcv-info { display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; }
        .rcv-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }
        @media(max-width:600px) {
          .rcv-actions { width: 100%; }
          .rcv-actions button { flex: 1; }
        }
      `}</style>
    </DashboardLayout>
  )
}