import React, { useState, useEffect, useContext } from 'react'
import {
  FiUsers, FiCheckSquare, FiBookOpen, FiFileText,
  FiTrendingUp, FiClipboard, FiAlertCircle,
  FiArrowRight, FiClock
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Avatar from '../../components/common/Avatar'
import Button from '../../components/common/Button'
import { studentService } from '../../services/studentService'
import { attendanceService } from '../../services/attendanceService'
import { assignmentService } from '../../services/assignmentService'
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

export default function TeacherDashboard() {
  const { user } = useAuth()
  const { addToast } = useContext(ToastContext)
  const navigate = useNavigate()

  const [stats, setStats] = useState({})
  const [recentStudents, setRecentStudents] = useState([])
  const [recentAssignments, setRecentAssignments] = useState([])
  const [recentAttendance, setRecentAttendance] = useState([])
  const [loading, setLoading] = useState(true)

 useEffect(() => {
  const fetchAll = async () => {
    // Don't attempt data fetches if teacher is pending/rejected/suspended
    if (user?.status === 'pending' || user?.status === 'rejected' || user?.status === 'suspended') {
      setLoading(false)
      return
    }

    try {
      const [stuData, attData, asgData] = await Promise.all([
        studentService.getAll({ limit: 5 }).catch(() => ({ students: [], total: 0 })),
        attendanceService.getAll({ limit: 5 }).catch(() => ({ records: [], total: 0 })),
        assignmentService.getAll({ limit: 5 }).catch(() => ({ assignments: [], total: 0 })),
      ])
      setRecentStudents(stuData.students || [])
      setRecentAttendance(attData.records || [])
      setRecentAssignments(asgData.assignments || [])
      setStats({
        students:    stuData.total    || 0,
        attendance:  attData.total    || 0,
        assignments: asgData.total    || 0,
      })
    } catch (err) {
      // 403 errors are expected for pending teachers — handle silently
      if (err?.response?.status !== 403) {
        addToast('Failed to load some dashboard data', 'warning')
      }
    } finally {
      setLoading(false)
    }
  }
  fetchAll()
}, [user?.status])

  const isPending = user?.status === 'pending'
  const isRejected = user?.status === 'rejected'
  const isSuspended = user?.status === 'suspended'

  return (
    <DashboardLayout>
      <div style={{ animation: 'pageSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) both' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.35rem', fontSize: '0.9rem' }}>
            {user?.course ? `${user.course} Teacher · ` : ''}Here's your school overview
          </p>
        </div>

        {/* Status banners */}
        {isPending && (
          <div className="tch-banner tch-banner-warning">
            <div className="tch-banner-icon" style={{ background: 'var(--warning)' }}>⏳</div>
            <div className="tch-banner-text">
              <p className="tch-banner-title" style={{ color: 'var(--warning)' }}>Account Pending Approval</p>
              <p className="tch-banner-sub">
                Your account is awaiting admin approval. You can view the dashboard but cannot manage data until approved.
              </p>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="tch-banner tch-banner-danger">
            <div className="tch-banner-icon" style={{ background: 'var(--danger)' }}>❌</div>
            <div className="tch-banner-text">
              <p className="tch-banner-title" style={{ color: 'var(--danger)' }}>Teaching Request Rejected</p>
              <p className="tch-banner-sub">Your application was not approved. Contact the administrator.</p>
            </div>
          </div>
        )}

        {isSuspended && (
          <div className="tch-banner tch-banner-info">
            <div className="tch-banner-icon" style={{ background: 'var(--info)' }}>🔒</div>
            <div className="tch-banner-text">
              <p className="tch-banner-title" style={{ color: 'var(--info)' }}>Account Suspended</p>
              <p className="tch-banner-sub">Your account has been suspended. Contact admin for details.</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          <StatCard icon={FiUsers} label="Total Students" value={stats.students}
            color="var(--primary)" bgColor="var(--primary-ghost)"
            onClick={() => navigate('/teacher/students')} />
          <StatCard icon={FiCheckSquare} label="Attendance Records" value={stats.attendance}
            color="var(--secondary)" bgColor="var(--secondary-ghost)"
            onClick={() => navigate('/teacher/attendance')} />
          <StatCard icon={FiBookOpen} label="Assignments" value={stats.assignments}
            color="var(--warning)" bgColor="var(--warning-bg)"
            onClick={() => navigate('/teacher/assignments')} />
          <StatCard icon={FiClipboard} label="Course" value={user?.course || '—'}
            color="var(--info)" bgColor="var(--info-bg)" />
        </div>

        {/* Content grid */}
        <div className="tch-content-grid">

          {/* Recent Students */}
          <Card title="Recent Students" subtitle="Newest registrations"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/teacher/students')}>All <FiArrowRight size={12} /></Button>}>
            {loading ? <ShimmerBlock count={3} /> : recentStudents.length === 0 ? (
              <p className="tch-empty">No students yet</p>
            ) : (
              <div className="tch-list">
                {recentStudents.map((s, i) => (
                  <div key={s.id} className={`tch-list-item stagger-${i + 1}`}
                    style={{ animation: 'cardPopIn 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <Avatar firstName={s.first_name} lastName={s.last_name} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="tch-list-name">{formatName(s.first_name, s.last_name)}</p>
                      <p className="tch-list-sub">Level {s.level}</p>
                    </div>
                    <Badge type="active" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Assignments */}
          <Card title="Recent Assignments" subtitle="Latest broadcasts"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/teacher/assignments')}>All <FiArrowRight size={12} /></Button>}>
            {loading ? <ShimmerBlock count={3} /> : recentAssignments.length === 0 ? (
              <p className="tch-empty">No assignments yet</p>
            ) : (
              <div className="tch-list">
                {recentAssignments.map((a, i) => (
                  <div key={a.id} className={`tch-assignment-item stagger-${i + 1}`}
                    style={{ animation: 'cardPopIn 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <p className="tch-list-name">{a.title}</p>
                      <span className="tch-time">{timeAgo(a.created_at)}</span>
                    </div>
                    <p className="tch-list-sub">
                      {a.course || 'General'} · Due: {formatDate(a.due_date)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Attendance */}
          <Card title="Recent Attendance" subtitle="Latest records"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/teacher/attendance')}>All <FiArrowRight size={12} /></Button>}>
            {loading ? <ShimmerBlock count={3} /> : recentAttendance.length === 0 ? (
              <p className="tch-empty">No records yet</p>
            ) : (
              <div className="tch-list">
                {recentAttendance.map((r, i) => (
                  <div key={r.id} className={`tch-att-item stagger-${i + 1}`}
                    style={{ animation: 'cardPopIn 0.35s cubic-bezier(0.22,1,0.36,1) both' }}>
                    <div>
                      <p className="tch-list-name">{formatName(r.first_name, r.last_name)}</p>
                      <p className="tch-list-sub">{formatDate(r.date)}</p>
                    </div>
                    <Badge type={r.status?.toLowerCase()} label={r.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Profile Card */}
          <Card title="Your Profile" subtitle="Quick info">
            <div className="tch-profile-card">
              <Avatar firstName={user?.first_name} lastName={user?.last_name} size={56} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="tch-profile-name">{formatName(user?.first_name, user?.last_name)}</p>
                <p className="tch-profile-email">{user?.email}</p>
                <Badge type="secondary" label={user?.course || 'Teacher'} />
              </div>
            </div>
            <div className="tch-profile-details">
              {[
                { l: 'Course', v: user?.course },
                { l: 'Qualification', v: user?.qualification },
                { l: 'Phone', v: user?.phone },
              ].filter(x => x.v).map(({ l, v }) => (
                <div key={l} className="tch-profile-row">
                  <span className="tch-profile-label">{l}</span>
                  <span className="tch-profile-value">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        /* Banner */
        .tch-banner {
          border-radius: var(--radius-lg);
          padding: 1.15rem 1.5rem;
          margin-bottom: 1.5rem;
          display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;
        }
        .tch-banner-warning { background: var(--warning-bg); border: 1.5px solid var(--warning); }
        .tch-banner-danger  { background: var(--danger-bg); border: 1.5px solid var(--danger); }
        .tch-banner-info    { background: var(--info-bg); border: 1.5px solid var(--info); }
        .tch-banner-icon {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; flex-shrink: 0;
        }
        .tch-banner-text { flex: 1; min-width: 200px; }
        .tch-banner-title { font-weight: 700; font-size: 0.92rem; }
        .tch-banner-sub { font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem; }

        /* Content grid */
        .tch-content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        /* Lists */
        .tch-list { display: flex; flex-direction: column; gap: 0.7rem; }
        .tch-list-item {
          display: flex; align-items: center; gap: 0.85rem;
          padding: 0.7rem; background: var(--bg);
          border-radius: var(--radius-md);
          transition: background 0.2s ease;
        }
        .tch-list-item:hover { background: var(--primary-ghost); }
        .tch-list-name {
          font-weight: 600; font-size: 0.875rem; color: var(--primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .tch-list-sub { font-size: 0.75rem; color: var(--text-muted); }
        .tch-time { font-size: 0.72rem; color: var(--text-light); white-space: nowrap; flex-shrink: 0; }

        .tch-assignment-item {
          padding: 0.85rem 1rem; background: var(--bg);
          border-radius: var(--radius-md);
          border-left: 3px solid var(--primary);
        }
        .tch-att-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.6rem 0.85rem; background: var(--bg);
          border-radius: var(--radius-sm);
        }
        .tch-empty {
          color: var(--text-muted); font-size: 0.875rem;
          text-align: center; padding: 2rem;
        }

        /* Profile */
        .tch-profile-card {
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem; background: var(--primary-ghost);
          border-radius: var(--radius-md); margin-bottom: 1rem;
        }
        .tch-profile-name {
          font-weight: 700; font-size: 1rem; color: var(--primary);
        }
        .tch-profile-email {
          font-size: 0.8rem; color: var(--text-muted); margin-top: 0.1rem;
          margin-bottom: 0.35rem;
        }
        .tch-profile-details { display: flex; flex-direction: column; }
        .tch-profile-row {
          display: flex; justify-content: space-between;
          padding: 0.55rem 0; border-bottom: 1px solid var(--border-light);
        }
        .tch-profile-label { font-size: 0.83rem; color: var(--text-muted); }
        .tch-profile-value { font-size: 0.83rem; font-weight: 600; color: var(--primary); }

        /* ── Responsive ────────────────────── */
        @media (max-width: 992px) {
          .tch-content-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .tch-banner { flex-direction: column; align-items: flex-start; }
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