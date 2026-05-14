import React, { useState, useEffect, useContext } from 'react'
import {
  FiUsers, FiToggleLeft, FiToggleRight,
  FiKey, FiEye, FiEyeOff, FiSearch
} from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Table from '../../components/common/Table'
import SearchBar from '../../components/common/SearchBar'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Avatar from '../../components/common/Avatar'
import { adminService } from '../../services/adminService'
import { ToastContext } from '../../context/ToastContext'
import { formatDate, formatName } from '../../utils/formatters'

export default function ManageUsers() {
  const { addToast } = useContext(ToastContext)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')

  // Password modal
  const [pwModal, setPwModal] = useState(null)
  const [newPw, setNewPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await adminService.getAllUsers({ role: filterRole, search })
      setUsers(data.users || [])
    } catch {
      addToast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [search, filterRole])

  const handleToggle = async (userId, currentState) => {
    try {
      await adminService.toggleUserActive(userId, { is_active: !currentState })
      addToast(`User ${!currentState ? 'activated' : 'deactivated'}`, 'success')
      fetchUsers()
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed', 'error')
    }
  }

  const handlePasswordChange = async () => {
    if (!newPw.trim()) {
      addToast('Please enter a new password', 'warning')
      return
    }
    setSavingPw(true)
    try {
      await adminService.changeUserPassword(pwModal.id, { new_password: newPw.trim() })
      addToast(`Password changed for ${pwModal.email} ✅`, 'success')
      setPwModal(null)
      setNewPw('')
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to change password', 'error')
    } finally {
      setSavingPw(false)
    }
  }

  const roleColors = {
    admin:   { bg: 'var(--danger-bg)',  color: 'var(--danger)' },
    teacher: { bg: 'var(--primary-ghost)', color: 'var(--primary)' },
    student: { bg: 'var(--secondary-ghost)', color: 'var(--secondary)' },
  }

  return (
    <DashboardLayout>
      <div style={{ animation: 'adminPageIn 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">All Users</h1>
            <p className="page-subtitle">{users.length} users in system</p>
          </div>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex', gap: '1rem', flexWrap: 'wrap',
            alignItems: 'center', padding: '0.25rem',
          }}>
            <SearchBar value={search} onChange={setSearch}
              placeholder="Search by email..." style={{ flex: 1, minWidth: 200 }} />
            <select className="form-select" value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              style={{ width: 'auto', padding: '0.6rem 2rem 0.6rem 0.9rem' }}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <Table
            loading={loading}
            emptyMessage="No users found"
            columns={[
              { key: 'email', label: 'Email' },
              {
                key: 'role', label: 'Role',
                render: v => {
                  const c = roleColors[v] || roleColors.student
                  return <Badge type="primary" label={v} custom={c} />
                },
              },
              {
                key: 'is_active', label: 'Status',
                render: v => v
                  ? <Badge type="active" label="Active" />
                  : <Badge type="inactive" label="Inactive" />,
              },
              {
                key: 'last_login', label: 'Last Login',
                render: v => v ? formatDate(v) : 'Never',
              },
              {
                key: 'created_at', label: 'Joined',
                render: v => formatDate(v),
              },
              {
                key: 'actions', label: 'Actions', align: 'right',
                render: (_, row) => {
                  if (row.role === 'admin') return (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Protected</span>
                  )
                  return (
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {/* Toggle active */}
                      <button onClick={() => handleToggle(row.id, row.is_active)}
                        title={row.is_active ? 'Deactivate' : 'Activate'}
                        style={{
                          background: 'var(--bg)', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)', padding: '0.35rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          color: row.is_active ? 'var(--success)' : 'var(--danger)',
                          minWidth: 32, minHeight: 32, justifyContent: 'center',
                        }}>
                        {row.is_active ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                      </button>

                      {/* Change password */}
                      <button onClick={() => { setPwModal(row); setNewPw(''); setShowPw(false) }}
                        title="Change Password"
                        style={{
                          background: 'var(--bg)', border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)', padding: '0.35rem',
                          cursor: 'pointer', display: 'flex', alignItems: 'center',
                          color: 'var(--primary)', minWidth: 32, minHeight: 32, justifyContent: 'center',
                        }}>
                        <FiKey size={14} />
                      </button>
                    </div>
                  )
                },
              },
            ]}
            data={users}
          />
        </Card>

        {/* Password Change Modal */}
        <Modal isOpen={!!pwModal} onClose={() => setPwModal(null)}
          title="Change User Password" size="sm"
          footer={<>
            <Button variant="ghost" onClick={() => setPwModal(null)}>Cancel</Button>
            <Button variant="primary" loading={savingPw} onClick={handlePasswordChange}
              icon={<FiKey size={14} />}>
              Set Password
            </Button>
          </>}>
          {pwModal && (
            <div>
              {/* User preview */}
              <div style={{
                padding: '0.85rem', background: 'var(--bg)',
                borderRadius: 'var(--radius-md)', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'var(--primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.9rem',
                }}>
                  {pwModal.email?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--primary)' }}>{pwModal.email}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {pwModal.role}
                  </p>
                </div>
              </div>

              {/* Current hash */}
              <div style={{
                background: 'var(--warning-bg)', border: '1px solid var(--warning)',
                borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.85rem',
                marginBottom: '1rem',
              }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--warning)', marginBottom: '0.2rem' }}>
                  ⚠️ CURRENT PASSWORD HASH (cannot be reversed)
                </p>
                <p style={{
                  fontFamily: 'monospace', fontSize: '0.65rem',
                  color: 'var(--text-muted)', wordBreak: 'break-all',
                }}>
                  {pwModal.password_hash?.substring(0, 40)}...
                </p>
              </div>

              {/* New password */}
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input"
                    type={showPw ? 'text' : 'password'}
                    value={newPw}
                    onChange={e => setNewPw(e.target.value)}
                    placeholder="Enter new password for this user"
                    style={{ paddingRight: '2.5rem' }} />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    tabIndex={-1}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', display: 'flex',
                    }}>
                    {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                  This will immediately change the user's password. They can log in with it right away.
                </p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}