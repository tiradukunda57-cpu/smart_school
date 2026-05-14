import React, { useState, useEffect, useContext } from 'react'
import {
  FiPlus, FiDownload, FiCalendar, FiSearch,
  FiTrash2, FiEdit, FiCheck, FiX, FiClock, FiFilter
} from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'
import PendingBanner from '../../components/common/PendingBanner'
import Table from '../../components/common/Table'
import SearchBar from '../../components/common/SearchBar'
import Avatar from '../../components/common/Avatar'
import { attendanceService } from '../../services/attendanceService'
import { studentService } from '../../services/studentService'
import { ToastContext } from '../../context/ToastContext'
import { formatDate, formatName } from '../../utils/formatters'
import { downloadAttendanceListPDF } from '../../utils/downloadHelper'

const STATUS_OPTIONS = ['Present', 'Absent', 'Late', 'Excused']

export default function Attendance() {
  const { addToast } = useContext(ToastContext)
  const [records, setRecords] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [total, setTotal] = useState(0)

  // Modals
  const [bulkModal, setBulkModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState(false)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)

  // Bulk form state
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0])
  const [bulkCourse, setBulkCourse] = useState('')
  const [bulkStatuses, setBulkStatuses] = useState({})
  const [bulkStudents, setBulkStudents] = useState([])

  // Edit form state
  const [editForm, setEditForm] = useState({ status: '', note: '' })

 const fetchRecords = async () => {
  setLoading(true)
  try {
    const data = await attendanceService.getAll({
      search, status: filterStatus, date: filterDate,
    })
    setRecords(data.records || [])
    setTotal(data.total || 0)
  } catch (err) {
    if (err?.response?.status === 403) {
      const msg = err?.response?.data?.message || 'Access denied'
      addToast(msg, 'warning')
    } else {
      addToast('Failed to load attendance records', 'error')
    }
  } finally {
    setLoading(false)
  }
}

 const fetchStudents = async () => {
  try {
    const data = await studentService.getAll({ limit: 1000 })
    setStudents(data.students || [])
    const init = {}
    data.students?.forEach(s => { init[s.id] = 'Present' })
    setBulkStatuses(init)
    setBulkStudents(data.students || [])
  } catch (err) {
    if (err?.response?.status !== 403) {
      addToast('Failed to load students', 'error')
    }
  }
}

  useEffect(() => { fetchRecords() }, [search, filterStatus, filterDate])
  useEffect(() => { fetchStudents() }, [])

  const handleBulkSubmit = async () => {
    if (!bulkDate) { addToast('Please select a date', 'warning'); return }
    setSaving(true)
    try {
      const entries = Object.entries(bulkStatuses).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        status,
        date: bulkDate,
        course: bulkCourse,
      }))
      await attendanceService.bulkCreate({ records: entries })
      addToast('Attendance recorded successfully!', 'success')
      setBulkModal(false)
      fetchRecords()
    } catch {
      addToast('Failed to save attendance', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async () => {
    setSaving(true)
    try {
      await attendanceService.update(selected.id, editForm)
      addToast('Record updated!', 'success')
      setEditModal(false)
      fetchRecords()
    } catch {
      addToast('Failed to update record', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    try {
      await attendanceService.delete(selected.id)
      addToast('Record deleted', 'success')
      setDeleteModal(false)
      fetchRecords()
    } catch {
      addToast('Failed to delete record', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = () => {
    if (!records.length) { addToast('No records to download', 'warning'); return }
    downloadAttendanceListPDF(records, 'Class Attendance Report')
    addToast('PDF downloaded!', 'success')
  }

  const statusColors = {
    Present: 'var(--success)', Absent: 'var(--danger)',
    Late: 'var(--warning)', Excused: 'var(--info)',
  }

  // Stats
  const presentCount = records.filter(r => r.status === 'Present').length
  const absentCount = records.filter(r => r.status === 'Absent').length
  const lateCount = records.filter(r => r.status === 'Late').length

  return (
    <DashboardLayout>
      <PendingBanner />
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">{total} total records</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" icon={<FiDownload size={16} />} onClick={handleDownload}>
            Download PDF
          </Button>
          <Button variant="primary" icon={<FiPlus size={16} />} onClick={() => setBulkModal(true)}>
            Take Attendance
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Present', count: presentCount, color: 'var(--success)', bg: 'var(--success-bg)', icon: FiCheck },
          { label: 'Absent', count: absentCount, color: 'var(--danger)', bg: 'var(--danger-bg)', icon: FiX },
          { label: 'Late', count: lateCount, color: 'var(--warning)', bg: 'var(--warning-bg)', icon: FiClock },
        ].map(({ label, count, color, bg, icon: Icon }) => (
          <div key={label} style={{
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '1rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ width: 44, height: 44, background: bg, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{count}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.25rem' }}>
          <SearchBar
            value={search} onChange={setSearch}
            placeholder="Search by student name..."
            style={{ flex: 1, minWidth: 200 }}
          />
          <div className="form-group" style={{ margin: 0, minWidth: 140 }}>
            <select
              className="form-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '0.62rem 2rem 0.62rem 0.9rem' }}
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="form-input"
            style={{ width: 'auto', padding: '0.62rem 0.9rem' }}
          />
          {(filterStatus || filterDate || search) && (
            <Button variant="ghost" size="sm" onClick={() => {
              setFilterStatus(''); setFilterDate(''); setSearch('')
            }}>
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          loading={loading}
          emptyMessage="No attendance records found. Take attendance to get started."
          columns={[
            {
              key: 'student', label: 'Student',
              render: (_, row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Avatar firstName={row.first_name} lastName={row.last_name} size={32} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)' }}>
                      {formatName(row.first_name, row.last_name)}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.grade}</p>
                  </div>
                </div>
              )
            },
            { key: 'date', label: 'Date', render: v => formatDate(v) },
            { key: 'course', label: 'Course', render: v => v || '—' },
            {
              key: 'status', label: 'Status',
              render: v => <Badge type={v?.toLowerCase()} label={v} />
            },
            { key: 'note', label: 'Note', render: v => v || '—' },
            {
              key: 'actions', label: 'Actions', align: 'right',
              render: (_, row) => (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setSelected(row)
                      setEditForm({ status: row.status, note: row.note || '' })
                      setEditModal(true)
                    }}
                    style={iconBtnStyle}
                  >
                    <FiEdit size={14} color="var(--secondary)" />
                  </button>
                  <button
                    onClick={() => { setSelected(row); setDeleteModal(true) }}
                    style={iconBtnStyle}
                  >
                    <FiTrash2 size={14} color="var(--danger)" />
                  </button>
                </div>
              )
            },
          ]}
          data={records}
        />
      </Card>

      {/* ── Bulk Take Attendance Modal ── */}
      <Modal
        isOpen={bulkModal}
        onClose={() => setBulkModal(false)}
        title="Take Attendance"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBulkModal(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleBulkSubmit}>
              Save Attendance
            </Button>
          </>
        }
      >
        {/* Date + Subject */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Date *</label>
            <input type="date" className="form-input" value={bulkDate}
              onChange={e => setBulkDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Course (optional)</label>
            <input type="text" className="form-input" value={bulkCourse}
              onChange={e => setBulkCourse(e.target.value)} placeholder="e.g. Mathematics" />
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center', marginRight: '0.5rem' }}>
            Mark all as:
          </p>
          {STATUS_OPTIONS.map(status => (
            <button
              key={status}
              onClick={() => {
                const all = {}
                bulkStudents.forEach(s => { all[s.id] = status })
                setBulkStatuses(all)
              }}
              style={{
                padding: '0.3rem 0.8rem',
                background: 'var(--bg)',
                border: `1.5px solid ${statusColors[status]}`,
                color: statusColors[status],
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Student list */}
        <div style={{
          maxHeight: 380, overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: '0.5rem',
          paddingRight: '0.25rem',
        }}>
          {bulkStudents.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: '0.9rem' }}>
              No students found. Please register students first.
            </p>
          )}
          {bulkStudents.map(s => (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.75rem 1rem',
              background: 'var(--bg)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
            }}>
              <Avatar firstName={s.first_name} lastName={s.last_name} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)' }}>
                  {formatName(s.first_name, s.last_name)}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.grade}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {STATUS_OPTIONS.map(status => {
                  const isSelected = bulkStatuses[s.id] === status
                  return (
                    <button
                      key={status}
                      onClick={() => setBulkStatuses(prev => ({ ...prev, [s.id]: status }))}
                      style={{
                        padding: '0.3rem 0.6rem',
                        background: isSelected ? statusColors[status] : 'var(--white)',
                        color: isSelected ? 'white' : statusColors[status],
                        border: `1.5px solid ${statusColors[status]}`,
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                        transition: 'var(--transition)',
                      }}
                    >
                      {status.charAt(0)}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{
          display: 'flex', gap: '1rem', marginTop: '1rem',
          padding: '0.75rem 1rem', background: 'var(--bg)',
          borderRadius: 'var(--radius-md)', flexWrap: 'wrap',
        }}>
          {STATUS_OPTIONS.map(s => (
            <span key={s} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              <span style={{
                display: 'inline-block', width: 10, height: 10,
                background: statusColors[s], borderRadius: '50%',
                marginRight: 4,
              }} />
              {s.charAt(0)} = {s}
            </span>
          ))}
        </div>
      </Modal>

      {/* ── Edit Record Modal ── */}
      <Modal
        isOpen={editModal} onClose={() => setEditModal(false)}
        title="Edit Attendance Record"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditModal(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleEdit}>Save Changes</Button>
          </>
        }
      >
        {selected && (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.9rem', background: 'var(--bg)',
              borderRadius: 'var(--radius-md)', marginBottom: '1.25rem',
            }}>
              <Avatar firstName={selected.first_name} lastName={selected.last_name} size={36} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                  {formatName(selected.first_name, selected.last_name)}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatDate(selected.date)}</p>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={editForm.status}
                onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <textarea className="form-textarea" rows={3} value={editForm.note}
                onChange={e => setEditForm(p => ({ ...p, note: e.target.value }))}
                placeholder="Add a note..." />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal
        isOpen={deleteModal} onClose={() => setDeleteModal(false)}
        title="Delete Record" size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" loading={saving} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
          <div style={{
            width: 56, height: 56, background: 'var(--danger-bg)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 1rem',
          }}>
            <FiTrash2 size={24} color="var(--danger)" />
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Delete attendance record for{' '}
            <strong>{selected && formatName(selected.first_name, selected.last_name)}</strong>?
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