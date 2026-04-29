import React, { useState, useEffect, useContext } from 'react'
import {
  FiUsers, FiCheckSquare, FiBookOpen, FiFileText,
  FiMessageSquare, FiTrendingUp, FiCalendar, FiClock
} from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import { studentService } from '../../services/studentService'
import { attendanceService } from '../../services/attendanceService'
import { assignmentService } from '../../services/assignmentService'
import { noteService } from '../../services/noteService'
import { messageService } from '../../services/messageService'
import { formatDate, timeAgo, formatName } from '../../utils/formatters'
import { useAuth } from '../../hooks/useAuth'
import { ToastContext } from '../../context/ToastContext'

function StatCard({ icon: Icon, label, value, color, bgColor, trend }) {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      transition: 'var(--transition-slow)',
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
      <div style={{
        width: 52, height: 52,
        borderRadius: 'var(--radius-md)',
        background: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1, marginTop: '0.2rem' }}>
          {value ?? '—'}
        </p>
        {trend && (
          <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.3rem', fontWeight: 600 }}>
            <FiTrendingUp size={12} style={{ marginRight: 3 }} />{trend}
          </p>
        )}
      </div>
    </div>
  )
}

export default function TeacherDashboard() {
  const { user } = useAuth()
  const { addToast } = useContext(ToastContext)
  const [stats, setStats] = useState({})
  const [recentStudents, setRecentStudents] = useState([])
  const [recentAttendance, setRecentAttendance] = useState([])
  const [recentAssignments, setRecentAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [studentsData, attData, assignData] = await Promise.all([
          studentService.getAll({ limit: 5 }),
          attendanceService.getAll({ limit: 5 }),
          assignmentService.getAll({ limit: 5 }),
        ])
        setRecentStudents(studentsData.students || [])
        setRecentAttendance(attData.records || [])
        setRecentAssignments(assignData.assignments || [])
        setStats({
          students: studentsData.total || 0,
          attendance: attData.total || 0,
          assignments: assignData.total || 0,
        })
      } catch {
        addToast('Failed to load dashboard data', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return (
    <DashboardLayout>
      {/* Welcome header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '1.75rem', fontWeight: 800,
          color: 'var(--primary)', letterSpacing: '-0.02em',
        }}>
          Welcome back, {user?.first_name}! 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
          Here's what's happening in your school today.
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          icon={FiUsers} label="Total Students" value={stats.students}
          color="var(--primary)" bgColor="var(--primary-ghost)"
          trend="+3 this month"
        />
        <StatCard
          icon={FiCheckSquare} label="Attendance Records" value={stats.attendance}
          color="var(--secondary)" bgColor="var(--secondary-ghost)"
        />
        <StatCard
          icon={FiBookOpen} label="Assignments" value={stats.assignments}
          color="var(--warning)" bgColor="var(--warning-bg)"
        />
        <StatCard
          icon={FiFileText} label="Subject" value={user?.subject || '—'}
          color="var(--info)" bgColor="var(--info-bg)"
        />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Recent Students */}
        <Card title="Recent Students" subtitle="Newly registered students">
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
              Loading...
            </p>
          ) : recentStudents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
              No students yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentStudents.map(s => (
                <div key={s.id} style={{
                  display: 'flex', alignItems: 'center', gap: '0.9rem',
                  padding: '0.75rem',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <Avatar firstName={s.first_name} lastName={s.last_name} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {formatName(s.first_name, s.last_name)}
                    </p>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{s.grade}</p>
                  </div>
                  <Badge type="active" />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Assignments */}
        <Card title="Recent Assignments" subtitle="Latest broadcasts">
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>Loading...</p>
          ) : recentAssignments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>No assignments yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentAssignments.map(a => (
                <div key={a.id} style={{
                  padding: '0.9rem 1rem',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid var(--primary)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)' }}>
                      {a.title}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {timeAgo(a.created_at)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Due: {formatDate(a.due_date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Attendance */}
        <Card title="Recent Attendance" subtitle="Latest attendance records">
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>Loading...</p>
          ) : recentAttendance.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>No records yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {recentAttendance.map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.6rem 0.9rem',
                  background: 'var(--bg)', borderRadius: 'var(--radius-sm)',
                }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {formatName(r.first_name, r.last_name)}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(r.date)}</p>
                  </div>
                  <Badge type={r.status?.toLowerCase()} label={r.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick info */}
        <Card title="Your Profile" subtitle="Quick info">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1rem', background: 'var(--primary-ghost)', borderRadius: 'var(--radius-md)',
            }}>
              <Avatar firstName={user?.first_name} lastName={user?.last_name} size={56} />
              <div>
                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)' }}>
                  {formatName(user?.first_name, user?.last_name)}
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{user?.email}</p>
                <Badge type="primary" label={user?.subject || 'Teacher'} />
              </div>
            </div>
            {[
              { label: 'Subject', value: user?.subject },
              { label: 'Qualification', value: user?.qualification },
              { label: 'Phone', value: user?.phone },
            ].map(({ label, value }) => value && (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '0.6rem 0',
                borderBottom: '1px solid var(--border-light)',
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}