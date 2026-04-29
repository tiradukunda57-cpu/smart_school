import React, { useState, useEffect, useContext } from 'react'
import { FiDownload, FiCalendar, FiTrendingUp, FiCheck, FiX, FiClock } from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Table from '../../components/common/Table'
import { attendanceService } from '../../services/attendanceService'
import { ToastContext } from '../../context/ToastContext'
import { useAuth } from '../../hooks/useAuth'
import { formatDate, formatName } from '../../utils/formatters'
import { downloadAttendancePDF } from '../../utils/downloadHelper'

export default function MyAttendance() {
  const { addToast } = useContext(ToastContext)
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await attendanceService.getMyAttendance({ status: filterStatus, date: filterDate })
        setRecords(data.records || [])
      } catch {
        addToast('Failed to load attendance', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [filterStatus, filterDate])

  const presentCount = records.filter(r => r.status === 'Present').length
  const absentCount = records.filter(r => r.status === 'Absent').length
  const lateCount = records.filter(r => r.status === 'Late').length
  const excusedCount = records.filter(r => r.status === 'Excused').length
  const attendanceRate = records.length
    ? Math.round(((presentCount + excusedCount) / records.length) * 100) : 0

  const handleDownload = () => {
    if (!records.length) { addToast('No records to download', 'warning'); return }
    downloadAttendancePDF(records, formatName(user?.first_name, user?.last_name))
    addToast('PDF downloaded!', 'success')
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Attendance</h1>
          <p className="page-subtitle">{records.length} total records</p>
        </div>
        <Button variant="outline" icon={<FiDownload size={15} />} onClick={handleDownload}>
          Download PDF
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Present', count: presentCount, icon: FiCheck, color: 'var(--success)', bg: 'var(--success-bg)' },
          { label: 'Absent', count: absentCount, icon: FiX, color: 'var(--danger)', bg: 'var(--danger-bg)' },
          { label: 'Late', count: lateCount, icon: FiClock, color: 'var(--warning)', bg: 'var(--warning-bg)' },
          { label: 'Excused', count: excusedCount, icon: FiCalendar, color: 'var(--info)', bg: 'var(--info-bg)' },
        ].map(({ label, count, icon: Icon, color, bg }) => (
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
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rate card */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>Overall Attendance Rate</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Present + Excused counted as attended</p>
          </div>
          <span style={{
            fontSize: '2rem', fontWeight: 800,
            color: attendanceRate >= 75 ? 'var(--success)' : attendanceRate >= 50 ? 'var(--warning)' : 'var(--danger)',
          }}>
            {attendanceRate}%
          </span>
        </div>
        <div style={{ height: 12, background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${attendanceRate}%`,
            background: attendanceRate >= 75 ? 'var(--success)' : attendanceRate >= 50 ? 'var(--warning)' : 'var(--danger)',
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.6s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>0%</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: 600 }}>75% Threshold</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>100%</span>
        </div>
      </Card>

      {/* Filters */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.25rem' }}>
          <select
            className="form-select"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{ width: 'auto', padding: '0.62rem 2rem 0.62rem 0.9rem' }}
          >
            <option value="">All Statuses</option>
            {['Present', 'Absent', 'Late', 'Excused'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            type="date" value={filterDate}
            onChange={e => setFilterDate(e.target.value)}
            className="form-input" style={{ width: 'auto', padding: '0.62rem 0.9rem' }}
          />
          {(filterStatus || filterDate) && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterStatus(''); setFilterDate('') }}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          loading={loading}
          emptyMessage="No attendance records found."
          columns={[
            { key: 'date', label: 'Date', render: v => formatDate(v) },
            { key: 'subject', label: 'Subject', render: v => v || '—' },
            {
              key: 'status', label: 'Status',
              render: v => <Badge type={v?.toLowerCase()} label={v} />
            },
            { key: 'note', label: 'Note', render: v => v || '—' },
          ]}
          data={records}
        />
      </Card>
    </DashboardLayout>
  )
}