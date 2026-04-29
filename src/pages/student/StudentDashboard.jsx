import React, { useState, useEffect, useContext } from 'react'
import {
  FiCheckSquare, FiBookOpen, FiFileText,
  FiUsers, FiMessageSquare, FiTrendingUp, FiCalendar
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import { assignmentService } from '../../services/assignmentService'
import { noteService } from '../../services/noteService'
import { attendanceService } from '../../services/attendanceService'
import { teacherService } from '../../services/teacherService'
import { ToastContext } from '../../context/ToastContext'
import { useAuth } from '../../hooks/useAuth'
import { formatDate, timeAgo, formatName } from '../../utils/formatters'

function StatCard({ icon: Icon, label, value, color, bgColor, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--white)', borderRadius: 'var(--radius-lg)',
        padding: '1.5rem', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'flex-start',
        gap: '1rem', transition: 'var(--transition-slow)',
        cursor: onClick ? 'pointer' : 'default',
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
        width: 52, height: 52, borderRadius: 'var(--radius-md)',
        background: bgColor, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1, marginTop: '0.2rem' }}>
          {value ?? '—'}
        </p>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const { addToast } = useContext(ToastContext)
  const navigate = useNavigate()
  const [assignments, setAssignments] = useState([])
  const [notes, setNotes] = useState([])
  const [attendance, setAttendance] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [asgn, nt, att, tch] = await Promise.all([
          assignmentService.getAll({ limit: 5 }),
          noteService.getAll({ limit: 5 }),
          attendanceService.getMyAttendance({ limit: 5 }),
          teacherService.getAll({ limit: 4 }),
        ])
        setAssignments(asgn.assignments || [])
        setNotes(nt.notes || [])
        setAttendance(att.records || [])
        setTeachers(tch.teachers || [])
      } catch {
        addToast('Failed to load dashboard data', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const presentCount = attendance.filter(r => r.status === 'Present').length
  const attendanceRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
          Hello, {user?.first_name}! 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
          {user?.grade} · Here's your academic overview
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard
          icon={FiCheckSquare} label="Attendance Rate" value={`${attendanceRate}%`}
          color="var(--secondary)" bgColor="var(--secondary-ghost)"
          onClick={() => navigate('/student/attendance')}
        />
        <StatCard
          icon={FiBookOpen} label="Assignments" value={assignments.length}
          color="var(--warning)" bgColor="var(--warning-bg)"
          onClick={() => navigate('/student/assignments')}
        />
        <StatCard
          icon={FiFileText} label="Notes Available" value={notes.length}
          color="var(--primary)" bgColor="var(--primary-ghost)"
          onClick={() => navigate('/student/notes')}
        />
        <StatCard
          icon={FiUsers} label="Teachers" value={teachers.length}
          color="var(--info)" bgColor="var(--info-bg)"
          onClick={() => navigate('/student/teachers')}
        />
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* Recent Assignments */}
        <Card
          title="Latest Assignments"
          subtitle="Broadcast by your teachers"
          action={
            <button onClick={() => navigate('/student/assignments')}
              style={{ ...linkBtn }}>View all</button>
          }
        >
          {loading ? <LoadingPlaceholder /> : assignments.length === 0 ? (
            <p style={emptyMsg}>No assignments yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {assignments.map(a => (
                <div key={a.id} style={{
                  padding: '0.9rem 1rem',
                  background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                  borderLeft: `3px solid ${a.priority === 'High' ? 'var(--danger)' : a.priority === 'Low' ? 'var(--success)' : 'var(--warning)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary)', flex: 1 }}>
                      {a.title}
                    </p>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700,
                      color: new Date(a.due_date) < new Date() ? 'var(--danger)' : 'var(--text-muted)',
                    }}>
                      Due: {formatDate(a.due_date)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.77rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {a.subject || 'General'} · {timeAgo(a.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Notes */}
        <Card
          title="Recent Notes"
          subtitle="Shared by teachers"
          action={
            <button onClick={() => navigate('/student/notes')} style={{ ...linkBtn }}>View all</button>
          }
        >
          {loading ? <LoadingPlaceholder /> : notes.length === 0 ? (
            <p style={emptyMsg}>No notes yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notes.map(n => (
                <div key={n.id} style={{
                  padding: '0.9rem 1rem',
                  background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid var(--secondary)',
                  display: 'flex', flexDirection: 'column', gap: '0.25rem',
                }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary)' }}>{n.title}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.77rem', color: 'var(--secondary)', fontWeight: 600 }}>
                      {n.subject || 'General'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{timeAgo(n.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Attendance snapshot */}
        <Card
          title="Attendance Snapshot"
          subtitle="Your recent records"
          action={
            <button onClick={() => navigate('/student/attendance')} style={{ ...linkBtn }}>View all</button>
          }
        >
          {loading ? <LoadingPlaceholder /> : attendance.length === 0 ? (
            <p style={emptyMsg}>No attendance records yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {attendance.map(r => (
                <div key={r.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.6rem 0.9rem', background: 'var(--bg)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div>
                    <p style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--primary)' }}>
                      {r.subject || 'General'} — {formatDate(r.date)}
                    </p>
                  </div>
                  <Badge type={r.status?.toLowerCase()} label={r.status} />
                </div>
              ))}
              {/* Rate bar */}
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Attendance Rate</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>{attendanceRate}%</span>
                </div>
                <div style={{ height: 8, background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${attendanceRate}%`,
                    background: attendanceRate >= 75 ? 'var(--success)' : attendanceRate >= 50 ? 'var(--warning)' : 'var(--danger)',
                    borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease',
                  }} />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Teachers */}
        <Card
          title="Your Teachers"
          subtitle="Available to message"
          action={
            <button onClick={() => navigate('/student/teachers')} style={{ ...linkBtn }}>View all</button>
          }
        >
          {loading ? <LoadingPlaceholder /> : teachers.length === 0 ? (
            <p style={emptyMsg}>No teachers found</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {teachers.map(t => (
                <div
                  key={t.id}
                  onClick={() => navigate(`/student/teachers/${t.id}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.9rem',
                    padding: '0.75rem', background: 'var(--bg)',
                    borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-ghost)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
                >
                  <Avatar firstName={t.first_name} lastName={t.last_name} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--primary)' }}>
                      {formatName(t.first_name, t.last_name)}
                    </p>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{t.subject}</p>
                  </div>
                  <Badge type="secondary" label="Teacher" />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}

const linkBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--secondary)', fontSize: '0.8rem', fontWeight: 700,
  padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)',
  transition: 'var(--transition)',
}

const emptyMsg = {
  color: 'var(--text-muted)', fontSize: '0.875rem',
  textAlign: 'center', padding: '2rem', margin: 0,
}

function LoadingPlaceholder() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          height: 56, background: 'var(--bg)',
          borderRadius: 'var(--radius-md)',
          animation: 'pulse 1.5s ease infinite',
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }`}</style>
    </div>
  )
}