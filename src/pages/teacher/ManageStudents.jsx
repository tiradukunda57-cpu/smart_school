import React, { useState, useEffect, useContext } from 'react'
import { FiSearch, FiGrid, FiList, FiTrash2, FiEdit, FiUserPlus, FiEye } from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Table from '../../components/common/Table'
import SearchBar from '../../components/common/SearchBar'
import { studentService } from '../../services/studentService'
import { ToastContext } from '../../context/ToastContext'
import { formatDate, formatName } from '../../utils/formatters'

export default function ManageStudents() {
  const { addToast } = useContext(ToastContext)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [selected, setSelected] = useState(null)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 12

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const data = await studentService.getAll({ search, page, limit })
      setStudents(data.students || [])
      setTotal(data.total || 0)
    } catch {
      addToast('Failed to load students', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStudents() }, [search, page])

  const handleDelete = async () => {
    setSaving(true)
    try {
      await studentService.delete(selected.id)
      addToast('Student removed successfully', 'success')
      setDeleteModal(false)
      fetchStudents()
    } catch {
      addToast('Failed to remove student', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await studentService.update(selected.id, editForm)
      addToast('Student updated!', 'success')
      setEditModal(false)
      fetchStudents()
    } catch {
      addToast('Failed to update student', 'error')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (s) => {
    setSelected(s)
    setEditForm({
      first_name: s.first_name,
      last_name: s.last_name,
      email: s.email,
      grade: s.grade,
      phone: s.phone || '',
      address: s.address || '',
    })
    setEditModal(true)
  }

  const filtered = students // server-side already

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage Students</h1>
          <p className="page-subtitle">{total} students registered</p>
        </div>
      </div>

      {/* Toolbar */}
      <Card style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1) }}
            placeholder="Search students..."
            style={{ flex: 1, minWidth: 220 }}
          />
          <div style={{
            display: 'flex', background: 'var(--bg)',
            borderRadius: 'var(--radius-md)', padding: '3px', gap: '2px',
          }}>
            {[
              { mode: 'grid', Icon: FiGrid },
              { mode: 'list', Icon: FiList },
            ].map(({ mode, Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '0.45rem 0.65rem',
                  background: viewMode === mode ? 'var(--primary)' : 'transparent',
                  color: viewMode === mode ? 'white' : 'var(--text-muted)',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  transition: 'var(--transition)',
                }}
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Grid View */}
      {viewMode === 'grid' && (
        loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1.25rem',
          }}>
            {students.map(s => (
              <StudentCard
                key={s.id} student={s}
                onView={() => { setSelected(s); setViewModal(true) }}
                onEdit={() => openEdit(s)}
                onDelete={() => { setSelected(s); setDeleteModal(true) }}
              />
            ))}
          </div>
        )
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <Table
            loading={loading}
            emptyMessage="No students found"
            columns={[
              {
                key: 'name', label: 'Student',
                render: (_, row) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Avatar firstName={row.first_name} lastName={row.last_name} size={34} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {formatName(row.first_name, row.last_name)}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.email}</p>
                    </div>
                  </div>
                )
              },
              { key: 'grade', label: 'Grade' },
              { key: 'phone', label: 'Phone' },
              { key: 'created_at', label: 'Joined', render: v => formatDate(v) },
              {
                key: 'actions', label: 'Actions', align: 'right',
                render: (_, row) => (
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => { setSelected(row); setViewModal(true) }}
                      style={{ ...iconBtnStyle, color: 'var(--primary)' }}>
                      <FiEye size={15} />
                    </button>
                    <button onClick={() => openEdit(row)}
                      style={{ ...iconBtnStyle, color: 'var(--secondary)' }}>
                      <FiEdit size={15} />
                    </button>
                    <button onClick={() => { setSelected(row); setDeleteModal(true) }}
                      style={{ ...iconBtnStyle, color: 'var(--danger)' }}>
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                )
              },
            ]}
            data={students}
          />
        </Card>
      )}

      {/* Pagination */}
      {total > limit && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              width: 36, height: 36,
              background: page === p ? 'var(--primary)' : 'var(--white)',
              color: page === p ? 'white' : 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
            }}>{p}</button>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={viewModal} onClose={() => setViewModal(false)} title="Student Profile" size="sm">
        {selected && <StudentProfileView student={selected} />}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModal} onClose={() => setEditModal(false)}
        title="Edit Student"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleEdit} type="submit">Save Changes</Button>
          </>
        }
      >
        {selected && (
          <form onSubmit={handleEdit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-input" value={editForm.first_name}
                  onChange={e => setEditForm(p => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-input" value={editForm.last_name}
                  onChange={e => setEditForm(p => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={editForm.email}
                onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Grade</label>
              <input className="form-input" value={editForm.grade}
                onChange={e => setEditForm(p => ({ ...p, grade: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={editForm.phone}
                onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea className="form-textarea" value={editForm.address}
                onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} rows={2} />
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal} onClose={() => setDeleteModal(false)}
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" loading={saving} onClick={handleDelete}>Delete Student</Button>
          </>
        }
      >
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            width: 60, height: 60, background: 'var(--danger-bg)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            <FiTrash2 size={26} color="var(--danger)" />
          </div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Delete Student?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Are you sure you want to remove <strong>{selected && formatName(selected.first_name, selected.last_name)}</strong>?
            This action cannot be undone.
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

const iconBtnStyle = {
  background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)', padding: '0.4rem',
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  transition: 'var(--transition)',
}

function StudentCard({ student: s, onView, onEdit, onDelete }) {
  return (
    <div style={{
      background: 'var(--white)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: '1rem',
      boxShadow: 'var(--shadow-sm)',
      transition: 'var(--transition-slow)',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Avatar firstName={s.first_name} lastName={s.last_name} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {formatName(s.first_name, s.last_name)}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {s.email}
          </p>
        </div>
        <Badge type="active" />
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {[
          { label: 'Grade', value: s.grade },
          { label: 'Phone', value: s.phone || '—' },
          { label: 'Joined', value: formatDate(s.created_at) },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{label}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
        <button onClick={onView} style={{ ...actionBtn, color: 'var(--primary)', flex: 1 }}>
          <FiEye size={14} /> View
        </button>
        <button onClick={onEdit} style={{ ...actionBtn, color: 'var(--secondary)', flex: 1 }}>
          <FiEdit size={14} /> Edit
        </button>
        <button onClick={onDelete} style={{ ...actionBtn, color: 'var(--danger)', flex: 1 }}>
          <FiTrash2 size={14} /> Delete
        </button>
      </div>
    </div>
  )
}

const actionBtn = {
  background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)', padding: '0.45rem 0.6rem',
  cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
  display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center',
  transition: 'var(--transition)',
}

function StudentProfileView({ student: s }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1rem', background: 'var(--bg)',
        borderRadius: 'var(--radius-md)', marginBottom: '1.25rem',
      }}>
        <Avatar firstName={s.first_name} lastName={s.last_name} size={60} />
        <div>
          <h3 style={{ fontWeight: 700, color: 'var(--primary)' }}>
            {formatName(s.first_name, s.last_name)}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.email}</p>
        </div>
      </div>
      {[
        { label: 'Grade', value: s.grade },
        { label: 'Phone', value: s.phone || '—' },
        { label: 'Date of Birth', value: formatDate(s.date_of_birth) },
        { label: 'Address', value: s.address || '—' },
        { label: 'Joined', value: formatDate(s.created_at) },
      ].map(({ label, value }) => (
        <div key={label} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '0.75rem 0', borderBottom: '1px solid var(--border-light)',
          gap: '1rem',
        }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', textAlign: 'right' }}>{value}</span>
        </div>
      ))}
    </div>
  )
}