import React, { useState, useEffect, useContext } from 'react'
import {
  FiCheckSquare, FiBookOpen, FiFileText, FiUsers,
  FiClipboard, FiTrendingUp, FiArrowRight
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import Button from '../../components/common/Button'
import { assignmentService } from '../../services/assignmentService'
import { noteService } from '../../services/noteService'
import { attendanceService } from '../../services/attendanceService'
import { teacherService } from '../../services/teacherService'
import { ToastContext } from '../../context/ToastContext'
import { useAuth } from '../../hooks/useAuth'
import { formatDate, timeAgo, formatName } from '../../utils/formatters'

function StatCard({ icon: Icon, label, value, color, bgColor, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: 'var(--white)', borderRadius: 'var(--radius-lg)',
      padding: '1.25rem', border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'flex-start',
      gap: '1rem', transition: 'all 0.22s ease',
      cursor: onClick ? 'pointer' : 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-md)',
        background: bgColor, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1, marginTop: '0.15rem' }}>
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
          assignmentService.getAll({ limit: 5 }).catch(() => ({ assignments: [] })),
          noteService.getAll({ limit: 5 }).catch(() => ({ notes: [] })),
          attendanceService.getMyAttendance({ limit: 5 }).catch(() => ({ records: [] })),
          teacherService.getAll({ limit: 4 }).catch(() => ({ teachers: [] })),
        ])
        setAssignments(asgn.assignments || [])
        setNotes(nt.notes || [])
        setAttendance(att.records || [])
        setTeachers(tch.teachers || [])
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const presentCount = attendance.filter(r => r.status === 'Present').length
  const excusedCount = attendance.filter(r => r.status === 'Excused').length
  const attendanceRate = attendance.length
    ? Math.round(((presentCount + excusedCount) / attendance.length) * 100)
    : 0

  return (
    <DashboardLayout>
      <div style={{ animation: 'pageFadeScale 0.45s cubic-bezier(0.22,1,0.36,1) both' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            Hello, {user?.first_name}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
            Level {user?.level} · Your academic overview
          </p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <StatCard icon={FiCheckSquare} label="Attendance Rate" value={`${attendanceRate}%`}
            color="var(--secondary)" bgColor="var(--secondary-ghost)"
            onClick={() => navigate('/student/attendance')} />
          <StatCard icon={FiBookOpen} label="Assignments" value={assignments.length}
            color="var(--warning)" bgColor="var(--warning-bg)"
            onClick={() => navigate('/student/assignments')} />
          <StatCard icon={FiFileText} label="Notes" value={notes.length}
            color="var(--primary)" bgColor="var(--primary-ghost)"
            onClick={() => navigate('/student/notes')} />
          <StatCard icon={FiUsers} label="Teachers" value={teachers.length}
            color="var(--info)" bgColor="var(--info-bg)"
            onClick={() => navigate('/student/teachers')} />
        </div>

        {/* Content */}
        <div className="stu-content-grid">

          {/* Assignments */}
          <Card title="Latest Assignments" subtitle="From your teachers"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/student/assignments')}>All <FiArrowRight size={12} /></Button>}>
            {loading ? <ShimmerBlock count={3} /> : assignments.length === 0 ? (
              <p className="stu-empty">No assignments yet</p>
            ) : (
              <div className="stu-list">
                {assignments.map((a, i) => (
                  <div key={a.id} className={`stu-assignment-item stagger-${i + 1}`}
                    style={{ animation: 'cardPopIn 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <p className="stu-item-title">{a.title}</p>
                      <span className="stu-due" style={{
                        color: new Date(a.due_date) < new Date() ? 'var(--danger)' : 'var(--text-muted)',
                      }}>
                        Due: {formatDate(a.due_date)}
                      </span>
                    </div>
                    <p className="stu-item-sub">
                      {a.course || 'General'} · {timeAgo(a.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Notes */}
          <Card title="Recent Notes" subtitle="Shared by teachers"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/student/notes')}>All <FiArrowRight size={12} /></Button>}>
            {loading ? <ShimmerBlock count={3} /> : notes.length === 0 ? (
              <p className="stu-empty">No notes yet</p>
            ) : (
              <div className="stu-list">
                {notes.map((n, i) => (
                  <div key={n.id} className={`stu-note-item stagger-${i + 1}`}
                    style={{ animation: 'cardPopIn 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <p className="stu-item-title">{n.title}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="stu-item-sub" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
                        {n.course || 'General'}
                      </span>
                      <span className="stu-time">{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Attendance */}
          <Card title="Attendance Snapshot" subtitle="Your recent records"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/student/attendance')}>All <FiArrowRight size={12} /></Button>}>
            {loading ? <ShimmerBlock count={3} /> : attendance.length === 0 ? (
              <p className="stu-empty">No attendance records yet</p>
            ) : (
              <div>
                <div className="stu-list" style={{ marginBottom: '1rem' }}>
                  {attendance.map((r, i) => (
                    <div key={r.id} className={`stu-att-item stagger-${i + 1}`}
                      style={{ animation: 'cardPopIn 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
                      <p className="stu-item-sub">
                        {r.course || 'General'} — {formatDate(r.date)}
                      </p>
                      <Badge type={r.status?.toLowerCase()} label={r.status} />
                    </div>
                  ))}
                </div>

                {/* Rate bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Attendance Rate</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>{attendanceRate}%</span>
                  </div>
                  <div style={{
                    height: 8, background: 'var(--border)',
                    borderRadius: 'var(--radius-full)', overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${attendanceRate}%`,
                      background: attendanceRate >= 75 ? 'var(--success)' :
                        attendanceRate >= 50 ? 'var(--warning)' : 'var(--danger)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Teachers */}
          <Card title="Your Teachers" subtitle="Available to message"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/student/teachers')}>All <FiArrowRight size={12} /></Button>}>
            {loading ? <ShimmerBlock count={3} /> : teachers.length === 0 ? (
              <p className="stu-empty">No teachers found</p>
            ) : (
              <div className="stu-list">
                {teachers.map((t, i) => (
                  <div key={t.id} onClick={() => navigate(`/student/teachers/${t.id}`)}
                    className={`stu-teacher-item stagger-${i + 1}`}
                    style={{ animation: 'cardPopIn 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <Avatar firstName={t.first_name} lastName={t.last_name} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="stu-item-title">{formatName(t.first_name, t.last_name)}</p>
                      <p className="stu-item-sub">{t.course}</p>
                    </div>
                    <Badge type="secondary" label="Teacher" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      <style>{`
        .stu-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .stu-list { display: flex; flex-direction: column; gap: 0.7rem; }
        .stu-empty {
          color: var(--text-muted); font-size: 0.875rem;
          text-align: center; padding: 2rem;
        }

        .stu-assignment-item {
          padding: 0.85rem 1rem; background: var(--bg);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--warning);
          transition: background 0.2s ease;
        }
        .stu-assignment-item:hover { background: var(--primary-ghost); }

        .stu-note-item {
          padding: 0.85rem 1rem; background: var(--bg);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--secondary);
          transition: background 0.2s ease;
        }
        .stu-note-item:hover { background: var(--secondary-ghost); }

        .stu-att-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.6rem 0.85rem; background: var(--bg);
          border-radius: var(--radius-sm);
        }

        .stu-teacher-item {
          display: flex; align-items: center; gap: 0.85rem;
          padding: 0.7rem; background: var(--bg);
          border-radius: var(--radius-md); cursor: pointer;
          transition: background 0.2s ease;
        }
        .stu-teacher-item:hover { background: var(--primary-ghost); }

        .stu-item-title {
          font-weight: 600; font-size: 0.875rem; color: var(--primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .stu-item-sub { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.15rem; }
        .stu-due { font-size: 0.72rem; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
        .stu-time { font-size: 0.72rem; color: var(--text-light); }

        @media (max-width: 992px) {
          .stu-content-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  )
}

function ShimmerBlock({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{
          height: 52, background: 'var(--bg)', borderRadius: 'var(--radius-md)',
          animation: `shimmer 1.4s ease infinite ${i * 0.12}s`,
        }} />
      ))}
    </div>
  )
}