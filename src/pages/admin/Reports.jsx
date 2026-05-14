import React, { useState, useEffect, useContext } from 'react'
import {
  FiBarChart2, FiCalendar, FiDownload,
  FiRefreshCw, FiArchive, FiTrendingUp
} from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import { adminService } from '../../services/adminService'
import { ToastContext } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatters'

export default function Reports() {
  const { addToast } = useContext(ToastContext)
  const [report, setReport] = useState(null)
  const [archive, setArchive] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [tab, setTab] = useState('today') // 'today' | 'archive'
  const [archiving, setArchiving] = useState(false)

  const fetchReport = async (date) => {
    setLoading(true)
    try {
      const data = await adminService.getDailyReport(date)
      setReport(data.report || null)
    } catch {
      addToast('Failed to load report', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchArchive = async () => {
    try {
      const data = await adminService.getReportArchive({})
      setArchive(data.reports || [])
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchReport(selectedDate)
    fetchArchive()
  }, [selectedDate])

  const handleArchive = async () => {
    setArchiving(true)
    try {
      await adminService.archiveReport()
      addToast('Today\'s report archived! 📊', 'success')
      fetchArchive()
    } catch {
      addToast('Failed to archive report', 'error')
    } finally {
      setArchiving(false)
    }
  }

  const r = report

  return (
    <DashboardLayout>
      <div style={{ animation: 'adminPageIn 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">Daily system reports and historical data</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button variant="outline" size="sm" icon={<FiArchive size={14} />}
              loading={archiving} onClick={handleArchive}>
              Archive Today
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Card style={{ marginBottom: '1.5rem' }}>
          <div style={{
            display: 'flex', gap: '1rem', alignItems: 'center',
            flexWrap: 'wrap', padding: '0.25rem',
          }}>
            <div style={{
              display: 'flex', gap: '2px', background: 'var(--bg)',
              borderRadius: 'var(--radius-md)', padding: 3,
            }}>
              {['today', 'archive'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '0.45rem 1rem',
                  background: tab === t ? 'var(--primary)' : 'transparent',
                  color: tab === t ? 'white' : 'var(--text-muted)',
                  border: 'none', borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                  textTransform: 'capitalize', minHeight: 36,
                }}>
                  {t === 'today' ? 'Live Report' : 'Archive'}
                </button>
              ))}
            </div>

            {tab === 'today' && (
              <input type="date" className="form-input" value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ width: 'auto', padding: '0.55rem 0.9rem' }} />
            )}
          </div>
        </Card>

        {/* Live Report */}
        {tab === 'today' && (
          <>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading report...</div>
            ) : !r ? (
              <Card><EmptyState icon={FiBarChart2} message="No data for this date" /></Card>
            ) : (
              <>
                {/* Stats grid */}
                <div className="rpt-stats-grid">
                  {[
                    { label: 'Total Users',     value: r.totalUsers,       color: '#6366f1' },
                    { label: 'New Users Today',  value: r.newUsersToday,    color: '#10b981' },
                    { label: 'Teachers',         value: r.totalTeachers,    color: 'var(--primary)' },
                    { label: 'Students',         value: r.totalStudents,    color: 'var(--secondary)' },
                    { label: 'Attendance Today', value: r.attendanceToday,  color: '#f59e0b' },
                    { label: 'Assignments Today',value: r.assignmentsToday, color: '#06b6d4' },
                    { label: 'Quizzes Today',    value: r.quizzesToday,     color: '#e94560' },
                    { label: 'Messages Today',   value: r.messagesToday,    color: '#8b5cf6' },
                    { label: 'Activity Logs',    value: r.activityLogsToday,color: 'var(--text-muted)' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      background: 'var(--white)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)', padding: '1rem',
                      borderTop: `3px solid ${s.color}`,
                      animation: `cardPopIn 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 0.04}s both`,
                    }}>
                      <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {s.value ?? 0}
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Attendance breakdown */}
                {r.attendanceBreakdown && r.attendanceBreakdown.length > 0 && (
                  <Card title="Attendance Breakdown" subtitle={`For ${formatDate(selectedDate)}`}
                    style={{ marginTop: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {r.attendanceBreakdown.map(ab => {
                        const colors = {
                          Present: 'var(--success)', Absent: 'var(--danger)',
                          Late: 'var(--warning)', Excused: 'var(--info)',
                        }
                        const total = r.attendanceBreakdown.reduce((s, x) => s + parseInt(x.count), 0)
                        const pct = total > 0 ? Math.round((parseInt(ab.count) / total) * 100) : 0
                        return (
                          <div key={ab.status} style={{
                            flex: 1, minWidth: 120,
                            background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                            padding: '1rem', textAlign: 'center',
                          }}>
                            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: colors[ab.status] || 'var(--primary)' }}>
                              {ab.count}
                            </p>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {ab.status}
                            </p>
                            <div style={{
                              height: 4, background: 'var(--border)',
                              borderRadius: 2, marginTop: '0.5rem', overflow: 'hidden',
                            }}>
                              <div style={{
                                height: '100%', width: `${pct}%`,
                                background: colors[ab.status] || 'var(--primary)',
                                borderRadius: 2, transition: 'width 0.5s ease',
                              }} />
                            </div>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                              {pct}%
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
        )}

        {/* Archive */}
        {tab === 'archive' && (
          <>
            {archive.length === 0 ? (
              <Card>
                <EmptyState icon={FiArchive}
                  message="No archived reports yet. Click 'Archive Today' to save today's report." />
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {archive.map((a, i) => {
                  const data = typeof a.data === 'string' ? JSON.parse(a.data) : a.data
                  return (
                    <Card key={a.id} style={{
                      animation: `cardPopIn 0.3s cubic-bezier(0.22,1,0.36,1) ${i * 0.05}s both`,
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: 'var(--radius-md)',
                            background: 'var(--primary-ghost)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <FiCalendar size={18} color="var(--primary)" />
                          </div>
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                              {formatDate(a.report_date)}
                            </p>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              Generated: {formatDate(a.generated_at)}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm"
                          onClick={() => { setSelectedDate(a.report_date); setTab('today') }}>
                          View Details
                        </Button>
                      </div>

                      {/* Mini stats */}
                      {data && (
                        <div style={{
                          display: 'flex', gap: '1rem', marginTop: '0.75rem',
                          flexWrap: 'wrap',
                        }}>
                          {Object.entries(data).slice(0, 6).map(([key, val]) => (
                            <div key={key} style={{
                              background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                              padding: '0.4rem 0.65rem',
                            }}>
                              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>
                                {val}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '0.3rem' }}>
                                {key}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .rpt-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.85rem;
        }
        @media(max-width:480px) {
          .rpt-stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </DashboardLayout>
  )
}