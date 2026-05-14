import React, { useState, useEffect, useContext } from 'react'
import { FiPlus, FiLayers, FiUsers, FiTrash2 } from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'
import EmptyState from '../../components/common/EmptyState'
import { groupService } from '../../services/groupService'
import { adminService } from '../../services/adminService'
import { ToastContext } from '../../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../../utils/formatters'

const typeConfig = {
  teachers_only: { label: 'Teachers Only', bg: 'var(--primary-ghost)', color: 'var(--primary)' },
  students_only: { label: 'Students Only', bg: 'var(--secondary-ghost)', color: 'var(--secondary)' },
  mixed:         { label: 'Mixed', bg: 'var(--success-bg)', color: 'var(--success)' },
  custom:        { label: 'Custom', bg: 'var(--info-bg)', color: 'var(--info)' },
}

export default function ManageGroups() {
  const { addToast } = useContext(ToastContext)
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [createModal, setCreateModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ name: '', description: '', type: 'custom', member_ids: [] })

  const fetchGroups = async () => {
    setLoading(true)
    try {
      const data = await groupService.getMyGroups()
      setGroups(data.groups || [])
    } catch {
      addToast('Failed to load groups', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await adminService.getAllUsers({})
      setUsers(data.users?.filter(u => u.role !== 'admin') || [])
    } catch {}
  }

  useEffect(() => { fetchGroups(); fetchUsers() }, [])

  const handleCreate = async () => {
    if (!form.name.trim()) { addToast('Name is required', 'warning'); return }
    setSaving(true)
    try {
      await groupService.create(form)
      addToast('Group created! ✅', 'success')
      setCreateModal(false)
      setForm({ name: '', description: '', type: 'custom', member_ids: [] })
      fetchGroups()
    } catch {
      addToast('Failed to create group', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleMember = (userId) => {
    setForm(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(userId)
        ? prev.member_ids.filter(id => id !== userId)
        : [...prev.member_ids, userId],
    }))
  }

  const filteredUsers = users.filter(u => {
    if (form.type === 'teachers_only') return u.role === 'teacher'
    if (form.type === 'students_only') return u.role === 'student'
    return true
  })

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Groups</h1>
          <p className="page-subtitle">Create and manage chat groups</p>
        </div>
        <Button variant="primary" icon={<FiPlus size={16} />}
          onClick={() => setCreateModal(true)}>
          New Group
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState icon={FiLayers} message="No groups yet. Create one!"
            action={<Button variant="primary" icon={<FiPlus size={14} />}
              onClick={() => setCreateModal(true)}>Create Group</Button>} />
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {groups.map(g => {
            const tc = typeConfig[g.type] || typeConfig.custom
            return (
              <div key={g.id} onClick={() => navigate(`/groups/${g.id}`)} style={{
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                transition: 'var(--transition-slow)',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: tc.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FiLayers size={20} color={tc.color} />
                  </div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)', background: tc.bg, color: tc.color,
                  }}>
                    {tc.label}
                  </span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '0.3rem' }}>
                  {g.name}
                </h3>
                {g.description && (
                  <p style={{
                    fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {g.description}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  <span>{g.member_count} members</span>
                  <span>{formatDate(g.created_at)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)}
        title="Create Group" size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateModal(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleCreate}>Create Group</Button>
          </>
        }>
        <div className="form-group">
          <label className="form-label">Group Name *</label>
          <input className="form-input" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Science Teachers" />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Group description..." rows={2} />
        </div>
        <div className="form-group">
          <label className="form-label">Group Type</label>
          <select className="form-select" value={form.type}
            onChange={e => setForm(p => ({ ...p, type: e.target.value, member_ids: [] }))}>
            <option value="teachers_only">Teachers Only</option>
            <option value="students_only">Students Only</option>
            <option value="mixed">Mixed</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Add Members ({form.member_ids.length} selected)</label>
          <div style={{
            maxHeight: 200, overflowY: 'auto', display: 'flex',
            flexDirection: 'column', gap: '0.35rem',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            padding: '0.5rem',
          }}>
            {filteredUsers.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>
                No matching users
              </p>
            )}
            {filteredUsers.map(u => (
              <label key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.5rem', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', fontSize: '0.85rem',
                background: form.member_ids.includes(u.id) ? 'var(--primary-ghost)' : 'transparent',
                minHeight: 40,
              }}>
                <input type="checkbox" checked={form.member_ids.includes(u.id)}
                  onChange={() => toggleMember(u.id)}
                  style={{ width: 16, height: 16 }} />
                <span style={{ flex: 1 }}>{u.email}</span>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700,
                  color: u.role === 'teacher' ? 'var(--primary)' : 'var(--secondary)',
                  textTransform: 'capitalize',
                }}>
                  {u.role}
                </span>
              </label>
            ))}
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}