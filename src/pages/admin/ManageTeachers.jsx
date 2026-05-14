import React, { useState, useEffect, useContext } from 'react'
import { FiUserCheck, FiUserX, FiPause, FiSearch, FiFilter } from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import SearchBar from '../../components/common/SearchBar'
import EmptyState from '../../components/common/EmptyState'
import { adminService } from '../../services/adminService'
import { ToastContext } from '../../context/ToastContext'
import { formatName, formatDate, timeAgo } from '../../utils/formatters'

const statusConfig = {
  pending:   { bg: '#ecfdf5', color: '#15803d', label: 'Pending' },
  approved:  { bg: '#d1fae5', color: '#047857', label: 'Approved' },
  rejected:  { bg: '#f0fdf4', color: '#166534', label: 'Rejected' },
  suspended: { bg: '#ecfdf5', color: '#0f766e', label: 'Suspended' },
}

export default function ManageTeachers() {
  const { addToast } = useContext(ToastContext)
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [actionModal, setActionModal] = useState(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchTeachers = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAllTeachers({ status: filterStatus, search })
      setTeachers(data.teachers || [])
    } catch {
      addToast('Failed to load teachers', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTeachers() }, [search, filterStatus])

  const handleAction = async (action) => {
    if (!actionModal) return
    setSaving(true)
    try {
      if (action === 'approve') {
        await adminService.approveTeacher(actionModal.id)
        addToast('Teacher approved ✅', 'success')
      } else if (action === 'reject') {
        await adminService.rejectTeacher(actionModal.id, { note })
        addToast('Teacher rejected', 'warning')
      } else if (action === 'suspend') {
        await adminService.suspendTeacher(actionModal.id, { note })
        addToast('Teacher suspended', 'info')
      }
      setActionModal(null)
      setNote('')
      fetchTeachers()
    } catch {
      addToast(`Failed to ${action} teacher`, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Teachers</h1>
          <p className="page-subtitle">{teachers.length} teachers total</p>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div className="filters-row" style={{
          display: 'flex', gap: '1rem', alignItems: 'center',
          flexWrap: 'wrap', padding: '0.25rem',
        }}>
          <SearchBar value={search} onChange={setSearch}
            placeholder="Search teachers..." style={{ flex: 1, minWidth: 200 }} />
          <select className="form-select" value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ width: 'auto', padding: '0.6rem 2rem 0.6rem 0.9rem' }}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </Card>

      {/* Teacher list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
      ) : teachers.length === 0 ? (
        <Card><EmptyState message="No teachers found" icon={FiUserCheck} /></Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {teachers.map(t => {
            const sc = statusConfig[t.status] || statusConfig.pending
            return (
              <Card key={t.id}>
                <div className="teacher-row" style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                }}>
                  <Avatar firstName={t.first_name} lastName={t.last_name} size={48} />
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                        {formatName(t.first_name, t.last_name)}
                      </p>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)', background: sc.bg, color: sc.color,
                      }}>
                        {sc.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 600, marginTop: '0.1rem' }}>
                      {t.course}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {t.email} · {t.qualification || '—'} · {timeAgo(t.created_at)}
                    </p>
                    {t.rejection_note && (
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                        Note: {t.rejection_note}
                      </p>
                    )}
                  </div>
                  <div className="teacher-actions" style={{
                    display: 'flex', gap: '0.4rem', flexShrink: 0, flexWrap: 'wrap',
                  }}>
                    {t.status === 'pending' && (
                      <>
                        <Button variant="success" size="sm" icon={<FiUserCheck size={13} />}
                          onClick={() => { setActionModal({ ...t, action: 'approve' }) }}>
                          Approve
                        </Button>
                        <Button variant="ghost" size="sm" icon={<FiUserX size={13} />}
                          onClick={() => { setActionModal({ ...t, action: 'reject' }); setNote('') }}
                          style={{ color: 'var(--success)', border: '1.5px solid var(--success)' }}>
                          Reject
                        </Button>
                      </>
                    )}
                    {t.status === 'approved' && (
                      <Button variant="outline" size="sm" icon={<FiPause size={13} />}
                        onClick={() => { setActionModal({ ...t, action: 'suspend' }); setNote('') }}>
                        Suspend
                      </Button>
                    )}
                    {(t.status === 'rejected' || t.status === 'suspended') && (
                      <Button variant="success" size="sm" icon={<FiUserCheck size={13} />}
                        onClick={() => { setActionModal({ ...t, action: 'approve' }) }}>
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => setActionModal(null)}
        title={`${actionModal?.action === 'approve' ? 'Approve' : actionModal?.action === 'reject' ? 'Reject' : 'Suspend'} Teacher`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setActionModal(null)}>Cancel</Button>
            <Button
              variant={actionModal?.action === 'approve' ? 'success' : 'ghost'}
              loading={saving}
              onClick={() => handleAction(actionModal?.action)}
              style={actionModal?.action === 'approve' ? undefined : { color: 'var(--success)', border: '1.5px solid var(--success)' }}
            >
              {actionModal?.action === 'approve' ? 'Approve' : actionModal?.action === 'reject' ? 'Reject' : 'Suspend'}
            </Button>
          </>
        }
      >
        {actionModal && (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.9rem', background: 'var(--bg)',
              borderRadius: 'var(--radius-md)', marginBottom: '1.25rem',
            }}>
              <Avatar firstName={actionModal.first_name} lastName={actionModal.last_name} size={42} />
              <div>
                <p style={{ fontWeight: 700, color: 'var(--primary)' }}>
                  {formatName(actionModal.first_name, actionModal.last_name)}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{actionModal.course}</p>
              </div>
            </div>

            {actionModal.action !== 'approve' && (
              <div className="form-group">
                <label className="form-label">Reason / Note (optional)</label>
                <textarea
                  className="form-textarea" value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder={`Why are you ${actionModal.action === 'reject' ? 'rejecting' : 'suspending'} this teacher?`}
                  rows={3}
                />
              </div>
            )}

            {actionModal.action === 'approve' && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                This teacher will gain full access to create assignments, quizzes, manage students, and more.
              </p>
            )}
          </div>
        )}
      </Modal>

      <style>{`
        @media(max-width:600px){
          .teacher-row{flex-direction:column;align-items:flex-start!important}
          .teacher-actions{width:100%}
          .teacher-actions button{flex:1}
        }
      `}</style>
    </DashboardLayout>
  )
}