import React, { useState, useEffect, useContext } from 'react'
import { FiActivity, FiFilter, FiClock } from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Table from '../../components/common/Table'
import Badge from '../../components/common/Badge'
import SearchBar from '../../components/common/SearchBar'
import { adminService } from '../../services/adminService'
import { ToastContext } from '../../context/ToastContext'
import { formatDatetime } from '../../utils/formatters'

const actionColors = {
  APPROVE_TEACHER:    { bg: 'var(--success-bg)', color: 'var(--success)' },
  REJECT_TEACHER:     { bg: 'var(--danger-bg)',  color: 'var(--danger)' },
  SUSPEND_TEACHER:    { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  ACTIVATE_USER:      { bg: 'var(--success-bg)', color: 'var(--success)' },
  DEACTIVATE_USER:    { bg: 'var(--danger-bg)',  color: 'var(--danger)' },
  CHANGE_PASSWORD:    { bg: 'var(--info-bg)',    color: 'var(--info)' },
  VIEW_PASSWORD_HASH: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  APPROVE_RECOVERY:   { bg: 'var(--success-bg)', color: 'var(--success)' },
  ARCHIVE_DAILY_REPORT: { bg: 'var(--primary-ghost)', color: 'var(--primary)' },
}

export default function ActivityLogs() {
  const { addToast } = useContext(ToastContext)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filterAction, setFilterAction] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const data = await adminService.getActivityLogs({
        action: filterAction, date: filterDate, page, limit: 25,
      })
      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } catch {
      addToast('Failed to load activity logs', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [page, filterAction, filterDate])

  const totalPages = Math.ceil(total / 25)

  return (
    <DashboardLayout>
      <div style={{ animation: 'adminPageIn 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Activity Logs</h1>
            <p className="page-subtitle">{total} total entries</p>
          </div>
        </div>

        {/* Filters */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex', gap: '1rem', flexWrap: 'wrap',
            alignItems: 'center', padding: '0.25rem',
          }}>
            <select className="form-select" value={filterAction}
              onChange={e => { setFilterAction(e.target.value); setPage(1) }}
              style={{ width: 'auto', padding: '0.6rem 2rem 0.6rem 0.9rem' }}>
              <option value="">All Actions</option>
              {Object.keys(actionColors).map(a => (
                <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
              ))}
            </select>
            <input type="date" className="form-input" value={filterDate}
              onChange={e => { setFilterDate(e.target.value); setPage(1) }}
              style={{ width: 'auto', padding: '0.6rem 0.9rem' }} />
            {(filterAction || filterDate) && (
              <button onClick={() => { setFilterAction(''); setFilterDate(''); setPage(1) }}
                style={{
                  background: 'none', border: 'none', color: 'var(--primary)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                }}>
                Clear
              </button>
            )}
          </div>
        </Card>

        {/* Logs table */}
        <Card>
          <Table
            loading={loading}
            emptyMessage="No activity logs found"
            columns={[
              {
                key: 'action', label: 'Action',
                render: v => {
                  const c = actionColors[v] || { bg: 'var(--bg)', color: 'var(--text-muted)' }
                  return (
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      background: c.bg, color: c.color,
                      padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)',
                      whiteSpace: 'nowrap',
                    }}>
                      {v?.replace(/_/g, ' ')}
                    </span>
                  )
                },
              },
              { key: 'user_email', label: 'By User', render: v => v || 'System' },
              {
                key: 'entity_type', label: 'Target',
                render: (v, row) => v ? `${v} #${row.entity_id || ''}` : '—',
              },
              {
                key: 'details', label: 'Details',
                render: v => {
                  if (!v) return '—'
                  const parsed = typeof v === 'string' ? JSON.parse(v) : v
                  return (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {JSON.stringify(parsed).substring(0, 60)}...
                    </span>
                  )
                },
              },
              {
                key: 'created_at', label: 'Time',
                render: v => (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {formatDatetime(v)}
                  </span>
                ),
              },
            ]}
            data={logs}
          />
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: 34, height: 34,
                background: page === p ? 'var(--primary)' : 'var(--white)',
                color: page === p ? 'white' : 'var(--text-primary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
              }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}