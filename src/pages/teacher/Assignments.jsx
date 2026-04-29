import React, { useState, useEffect, useContext } from 'react'
import {
  FiPlus, FiTrash2, FiEdit, FiBookOpen,
  FiCalendar, FiClock, FiSearch
} from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'
import SearchBar from '../../components/common/SearchBar'
import EmptyState from '../../components/common/EmptyState'
import { assignmentService } from '../../services/assignmentService'
import { ToastContext } from '../../context/ToastContext'
import { formatDate, timeAgo } from '../../utils/formatters'
import { useAuth } from '../../hooks/useAuth'

// ── Constants (declared ONCE at module level) ─────────────────
const emptyForm = {
  title: '', description: '', subject: '',
  due_date: '', priority: 'Medium'
}

const PRIORITIES = ['Low', 'Medium', 'High']

const priorityColors = {
  High:   { bg: 'var(--danger-bg)',  color: 'var(--danger)'  },
  Medium: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  Low:    { bg: 'var(--success-bg)', color: 'var(--success)' },
}

const iconBtnStyle = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '0.4rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  transition: 'var(--transition)',
}

const actionBtn = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: '0.45rem 0.5rem',
  cursor: 'pointer',
  fontSize: '0.78rem',
  fontWeight: 600,
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
  justifyContent: 'center',
  transition: 'var(--transition)',
  color: 'var(--text-primary)',
}

// ── Sub-components ────────────────────────────────────────────

function PriorityBadge({ priority }) {
  const c = priorityColors[priority] || priorityColors.Medium
  return (
    <span style={{
      fontSize: '0.72rem',
      fontWeight: 700,
      flexShrink: 0,
      background: c.bg,
      color: c.color,
      padding: '0.2rem 0.55rem',
      borderRadius: 'var(--radius-full)',
    }}>
      {priority}
    </span>
  )
}

function AssignmentCard({ assignment: a, isOverdue, onView, onEdit, onDelete }) {
  const pc = priorityColors[a.priority] || priorityColors.Medium
  return (
    <div
      style={{
        background: 'var(--white)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        transition: 'var(--transition-slow)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        borderTop: `3px solid ${pc.color}`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'var(--primary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {a.title}
          </p>
          {a.subject && (
            <p style={{
              fontSize: '0.78rem',
              color: 'var(--secondary)',
              fontWeight: 600,
              marginTop: '0.2rem',
            }}>
              {a.subject}
            </p>
          )}
        </div>
        <PriorityBadge priority={a.priority} />
      </div>

      {/* Description preview */}
      <p style={{
        fontSize: '0.83rem',
        color: 'var(--text-muted)',
        lineHeight: 1.6,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {a.description}
      </p>

      {/* Due date */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: isOverdue ? 'var(--danger)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}>
            <FiCalendar size={12} />
            Due: {formatDate(a.due_date)}
            {isOverdue && ' (Overdue)'}
          </span>
          <span style={{
            fontSize: '0.72rem',
            color: 'var(--text-light)',
            display: 'block',
            marginTop: '0.15rem',
          }}>
            {timeAgo(a.created_at)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderTop: '1px solid var(--border-light)',
        paddingTop: '0.75rem',
      }}>
        <button
          onClick={onView}
          style={{ ...actionBtn, flex: 2, color: 'var(--primary)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-ghost)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
        >
          View
        </button>
        <button
          onClick={onEdit}
          style={{ ...actionBtn, flex: 1, color: 'var(--secondary)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary-ghost)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
        >
          <FiEdit size={13} />
        </button>
        <button
          onClick={onDelete}
          style={{ ...actionBtn, flex: 1, color: 'var(--danger)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
        >
          <FiTrash2 size={13} />
        </button>
      </div>
    </div>
  )
}

function AssignmentFormModal({
  isOpen, onClose, title, form, setForm,
  errors, saving, onSubmit, submitLabel
}) {
  const handleChange = e =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={onSubmit}>
            {submitLabel}
          </Button>
        </>
      }
    >
      {/* Title */}
      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          className={`form-input ${errors.title ? 'error' : ''}`}
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Assignment title"
        />
        {errors.title && <span className="form-error">{errors.title}</span>}
      </div>

      {/* Subject + Priority */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Subject</label>
          <input
            className="form-input"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="e.g. Mathematics"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select
            className="form-select"
            name="priority"
            value={form.priority}
            onChange={handleChange}
          >
            {PRIORITIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date */}
      <div className="form-group">
        <label className="form-label">Due Date *</label>
        <input
          className={`form-input ${errors.due_date ? 'error' : ''}`}
          type="date"
          name="due_date"
          value={form.due_date}
          onChange={handleChange}
        />
        {errors.due_date && <span className="form-error">{errors.due_date}</span>}
      </div>

      {/* Description */}
      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea
          className={`form-textarea ${errors.description ? 'error' : ''}`}
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the assignment in detail..."
          rows={5}
        />
        {errors.description && (
          <span className="form-error">{errors.description}</span>
        )}
      </div>
    </Modal>
  )
}

// ── Main Page Component ───────────────────────────────────────

export default function Assignments() {
  const { addToast } = useContext(ToastContext)
  const { user } = useAuth()

  const [assignments, setAssignments] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [viewMode, setViewMode]       = useState('grid')

  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal]     = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)

  const [selected, setSelected] = useState(null)
  const [form, setForm]         = useState(emptyForm)
  const [errors, setErrors]     = useState({})
  const [saving, setSaving]     = useState(false)

  // ── Fetch ───────────────────────────────────────────────────
  const fetchAssignments = async () => {
    setLoading(true)
    try {
      const data = await assignmentService.getAll({ search })
      setAssignments(data.assignments || [])
    } catch {
      addToast('Failed to load assignments', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAssignments() }, [search])

  // ── Validation ──────────────────────────────────────────────
  const validateForm = () => {
    const errs = {}
    if (!form.title.trim())       errs.title       = 'Title is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (!form.due_date)           errs.due_date    = 'Due date is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Handlers ────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!validateForm()) return
    setSaving(true)
    try {
      await assignmentService.create({ ...form, teacher_id: user?.id })
      addToast('Assignment broadcast to all students!', 'success')
      setCreateModal(false)
      setForm(emptyForm)
      fetchAssignments()
    } catch {
      addToast('Failed to create assignment', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    if (!validateForm()) return
    setSaving(true)
    try {
      await assignmentService.update(selected.id, form)
      addToast('Assignment updated!', 'success')
      setEditModal(false)
      fetchAssignments()
    } catch {
      addToast('Failed to update assignment', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await assignmentService.delete(selected.id)
      addToast('Assignment deleted', 'success')
      setDeleteModal(false)
      fetchAssignments()
    } catch {
      addToast('Failed to delete assignment', 'error')
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (a) => {
    setSelected(a)
    setForm({
      title:       a.title,
      description: a.description,
      subject:     a.subject    || '',
      due_date:    a.due_date?.split('T')[0] || '',
      priority:    a.priority   || 'Medium',
    })
    setErrors({})
    setEditModal(true)
  }

  const isOverdue = (due_date) =>
    due_date && new Date(due_date) < new Date()

  // ── Render ──────────────────────────────────────────────────
  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-subtitle">{assignments.length} assignments broadcast</p>
        </div>
        <Button
          variant="primary"
          icon={<FiPlus size={16} />}
          onClick={() => {
            setForm(emptyForm)
            setErrors({})
            setCreateModal(true)
          }}
        >
          New Assignment
        </Button>
      </div>

      {/* Toolbar */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '0.25rem',
        }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search assignments..."
            style={{ flex: 1, minWidth: 200 }}
          />
          {/* View mode toggle */}
          <div style={{
            display: 'flex',
            background: 'var(--bg)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            gap: '2px',
          }}>
            {['grid', 'list'].map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '0.45rem 0.8rem',
                  background: viewMode === mode ? 'var(--primary)' : 'transparent',
                  color: viewMode === mode ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  transition: 'var(--transition)',
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Loading */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '4rem',
          color: 'var(--text-muted)',
        }}>
          Loading...
        </div>
      )}

      {/* Empty state */}
      {!loading && assignments.length === 0 && (
        <Card>
          <EmptyState
            message="No assignments yet. Create your first assignment to broadcast to students!"
            icon={FiBookOpen}
            action={
              <Button
                variant="primary"
                icon={<FiPlus size={14} />}
                onClick={() => {
                  setForm(emptyForm)
                  setCreateModal(true)
                }}
              >
                Create Assignment
              </Button>
            }
          />
        </Card>
      )}

      {/* Grid View */}
      {!loading && assignments.length > 0 && viewMode === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}>
          {assignments.map(a => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              isOverdue={isOverdue(a.due_date)}
              onView={() => { setSelected(a); setDetailModal(true) }}
              onEdit={() => openEdit(a)}
              onDelete={() => { setSelected(a); setDeleteModal(true) }}
            />
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && assignments.length > 0 && viewMode === 'list' && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {assignments.map((a, i) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem 0.5rem',
                  borderBottom: i < assignments.length - 1
                    ? '1px solid var(--border-light)'
                    : 'none',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 44, height: 44,
                  background: 'var(--primary-ghost)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <FiBookOpen size={20} color="var(--primary)" />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}>
                    <p style={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: 'var(--primary)',
                    }}>
                      {a.title}
                    </p>
                    <PriorityBadge priority={a.priority} />
                    {isOverdue(a.due_date) && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--danger)',
                        background: 'var(--danger-bg)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                      }}>
                        Overdue
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-muted)',
                    marginTop: '0.2rem',
                  }}>
                    Due: {formatDate(a.due_date)} ·{' '}
                    {a.subject || 'General'} ·{' '}
                    {timeAgo(a.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexShrink: 0,
                }}>
                  <button
                    onClick={() => { setSelected(a); setDetailModal(true) }}
                    style={iconBtnStyle}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-ghost)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
                  >
                    <FiBookOpen size={14} color="var(--primary)" />
                  </button>
                  <button
                    onClick={() => openEdit(a)}
                    style={iconBtnStyle}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary-ghost)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
                  >
                    <FiEdit size={14} color="var(--secondary)" />
                  </button>
                  <button
                    onClick={() => { setSelected(a); setDeleteModal(true) }}
                    style={iconBtnStyle}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
                  >
                    <FiTrash2 size={14} color="var(--danger)" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Create Modal ── */}
      <AssignmentFormModal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="New Assignment"
        form={form}
        setForm={setForm}
        errors={errors}
        saving={saving}
        onSubmit={handleCreate}
        submitLabel="Broadcast Assignment"
      />

      {/* ── Edit Modal ── */}
      <AssignmentFormModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Assignment"
        form={form}
        setForm={setForm}
        errors={errors}
        saving={saving}
        onSubmit={handleEdit}
        submitLabel="Save Changes"
      />

      {/* ── Detail Modal ── */}
      <Modal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title="Assignment Details"
        size="md"
      >
        {selected && (
          <div>
            {/* Header block */}
            <div style={{
              padding: '1rem',
              background: 'var(--primary-ghost)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}>
                <h2 style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: 'var(--primary)',
                  flex: 1,
                }}>
                  {selected.title}
                </h2>
                <PriorityBadge priority={selected.priority} />
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '0.75rem',
                flexWrap: 'wrap',
              }}>
                <span style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}>
                  <FiCalendar size={12} />
                  Due: {formatDate(selected.due_date)}
                </span>
                <span style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}>
                  <FiClock size={12} />
                  Created: {timeAgo(selected.created_at)}
                </span>
              </div>
            </div>

            {/* Subject */}
            {selected.subject && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginBottom: '0.3rem',
                  fontWeight: 600,
                }}>
                  SUBJECT
                </p>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--primary)',
                  fontWeight: 600,
                }}>
                  {selected.subject}
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <p style={{
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                marginBottom: '0.5rem',
                fontWeight: 600,
              }}>
                DESCRIPTION
              </p>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                background: 'var(--bg)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
              }}>
                {selected.description}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        title="Delete Assignment"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={saving} onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div style={{
            width: 56, height: 56,
            background: 'var(--danger-bg)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <FiTrash2 size={24} color="var(--danger)" />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Delete <strong>"{selected?.title}"</strong>?
            This cannot be undone.
          </p>
        </div>
      </Modal>
    </DashboardLayout>
  )
}