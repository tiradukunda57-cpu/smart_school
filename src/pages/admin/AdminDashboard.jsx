import React, { useState, useEffect, useContext } from 'react'
import {
  FiUsers, FiUserCheck, FiUserX, FiAlertCircle,
  FiShield, FiLayers, FiActivity, FiTrendingUp,
  FiBookOpen, FiClipboard, FiCheckCircle,
  FiArrowRight, FiRefreshCw, FiDatabase,
  FiMessageSquare, FiClock, FiBarChart2
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Avatar from '../../components/common/Avatar'
import Modal from '../../components/common/Modal'
import { adminService } from '../../services/adminService'
import { ToastContext } from '../../context/ToastContext'
import { useAuth } from '../../hooks/useAuth'
import { formatName, timeAgo } from '../../utils/formatters'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { addToast } = useContext(ToastContext)
  const navigate = useNavigate()

  const [stats, setStats] = useState({})
  const [pending, setPending] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectNote, setRejectNote] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [s, p, u] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingTeachers(),
        adminService.getAllUsers({}),
      ])
      setStats(s.stats || {})
      setPending(p.teachers || [])
      setRecentUsers(u.users?.slice(0, 8) || [])
    } catch {
      addToast('Failed to load dashboard', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleApprove = async (id) => {
    setSaving(true)
    try {
      await adminService.approveTeacher(id)
      addToast('Teacher approved ✅', 'success')
      setPending(prev => prev.filter(t => t.id !== id))
      setStats(prev => ({
        ...prev,
        pendingTeachers: Math.max(0, (prev.pendingTeachers || 1) - 1),
        approvedTeachers: (prev.approvedTeachers || 0) + 1,
      }))
    } catch {
      addToast('Failed to approve', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectModal) return
    setSaving(true)
    try {
      await adminService.rejectTeacher(rejectModal.id, { note: rejectNote })
      addToast('Teacher rejected', 'warning')
      setPending(prev => prev.filter(t => t.id !== rejectModal.id))
      setStats(prev => ({
        ...prev,
        pendingTeachers: Math.max(0, (prev.pendingTeachers || 1) - 1),
      }))
      setRejectModal(null)
      setRejectNote('')
    } catch {
      addToast('Failed to reject', 'error')
    } finally {
      setSaving(false)
    }
  }

  const roleColors = {
    admin: '#10b981',
    teacher: 'var(--primary)',
    student: 'var(--secondary)',
  }

  return (
    <DashboardLayout>
      <div className="admin-page-anim">

        {/* ═══ HERO ═══ */}
        <div className="adm-hero">
          <div className="adm-hero-deco1" />
          <div className="adm-hero-deco2" />
          <div className="adm-hero-left">
            <div className="adm-hero-icon">
              <FiShield size={24} />
            </div>
            <div>
              <h1 className="adm-hero-title">Admin Dashboard</h1>
              <p className="adm-hero-sub">System overview & management control</p>
            </div>
          </div>
          <div className="adm-hero-right">
            <Button variant="outline" size="sm" icon={<FiRefreshCw size={14} />}
              onClick={fetchData}
              style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', background: 'rgba(255,255,255,0.08)' }}>
              Refresh
            </Button>
          </div>
        </div>

        {/* ═══ STATS ═══ */}
        <div className="adm-stats">
          {[
            { icon: FiUsers,        label: 'Total Users',        value: stats.totalUsers,        color: '#16a34a', grad: 'linear-gradient(135deg,#16a34a,#22c55e)', click: '/admin/users' },
            { icon: FiUserCheck,    label: 'Approved Teachers',  value: stats.approvedTeachers,  color: '#10b981', grad: 'linear-gradient(135deg,#10b981,#059669)', click: '/admin/teachers' },
            { icon: FiAlertCircle,  label: 'Pending Approval',   value: stats.pendingTeachers,   color: '#15803d', grad: 'linear-gradient(135deg,#15803d,#16a34a)', click: '/admin/teachers', urgent: stats.pendingTeachers > 0 },
            { icon: FiUsers,        label: 'Total Students',     value: stats.totalStudents,     color: '#22c55e', grad: 'linear-gradient(135deg,#22c55e,#4ade80)' },
            { icon: FiBookOpen,     label: 'Assignments',        value: stats.totalAssignments,  color: '#0f766e', grad: 'linear-gradient(135deg,#0f766e,#14b8a6)' },
            { icon: FiClipboard,    label: 'Quizzes',            value: stats.totalQuizzes,      color: '#047857', grad: 'linear-gradient(135deg,#047857,#059669)' },
          ].map((s, i) => (
            <div
              key={i}
              className={`adm-stat-card stagger-${i + 1}`}
              onClick={s.click ? () => navigate(s.click) : undefined}
              style={{ cursor: s.click ? 'pointer' : 'default' }}
            >
              <div className="adm-stat-bar" style={{ background: s.grad }} />
              {s.urgent && <div className="adm-stat-dot" />}
              <div className="adm-stat-icon" style={{ background: `${s.color}14`, color: s.color }}>
                <s.icon size={18} />
              </div>
              <p className="adm-stat-value">{s.value ?? '—'}</p>
              <p className="adm-stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ═══ CONTENT GRID ═══ */}
        <div className="adm-content">

          {/* ── Left: Pending ── */}
          <div className="adm-main">
            <Card
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiAlertCircle size={16} color="var(--success)" />
                  Pending Approvals
                  {pending.length > 0 && (
                    <span className="adm-badge-count">{pending.length}</span>
                  )}
                </span>
              }
              subtitle="Review teacher applications"
              action={pending.length > 3 && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/teachers')}>
                  View All <FiArrowRight size={12} />
                </Button>
              )}
            >
              {loading ? (
                <ShimmerList count={3} />
              ) : pending.length === 0 ? (
                <div className="adm-empty">
                  <div className="adm-empty-icon">
                    <FiCheckCircle size={28} color="var(--success)" />
                  </div>
                  <p className="adm-empty-title">All Clear!</p>
                  <p className="adm-empty-sub">No pending approvals</p>
                </div>
              ) : (
                <div className="adm-pending-list">
                  {pending.slice(0, 5).map((t, i) => (
                    <div key={t.id} className={`adm-pending-card stagger-${i + 1}`}>
                      <div className="adm-pending-info">
                        <Avatar firstName={t.first_name} lastName={t.last_name} size={44} />
                        <div className="adm-pending-meta">
                          <p className="adm-pending-name">
                            {formatName(t.first_name, t.last_name)}
                          </p>
                          <p className="adm-pending-course">📚 {t.course}</p>
                          <div className="adm-pending-details">
                            <span>📧 {t.email}</span>
                            {t.qualification && <span>🎓 {t.qualification}</span>}
                            <span>🕐 {timeAgo(t.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="adm-pending-actions">
                        <button onClick={() => handleApprove(t.id)} disabled={saving}
                          className="adm-btn-approve">
                          <FiUserCheck size={14} /> Approve
                        </button>
                        <button onClick={() => { setRejectModal(t); setRejectNote('') }}
                          className="adm-btn-reject">
                          <FiUserX size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* ── Right: Sidebar Widgets ── */}
          <div className="adm-side">

            {/* Quick Actions */}
            <Card title="Quick Actions" subtitle="Navigate to key areas">
              <div className="adm-quick-grid">
                {[
                  { label: 'Teachers',  icon: FiUserCheck,      to: '/admin/teachers', color: '#0f766e', bg: '#ecfdf5' },
                  { label: 'Users',     icon: FiUsers,           to: '/admin/users',    color: '#16a34a', bg: '#d9f99d' },
                  { label: 'Groups',    icon: FiLayers,          to: '/admin/groups',   color: '#22c55e', bg: '#d1fae5' },
                  { label: 'Chats',     icon: FiMessageSquare,   to: '/groups',         color: '#059669', bg: '#ecfdf5' },
                ].map(({ label, icon: Icon, to, color, bg }) => (
                  <button key={to} onClick={() => navigate(to)} className="adm-quick-btn" style={{ background: bg }}>
                    <div className="adm-quick-icon" style={{ color }}>
                      <Icon size={18} />
                    </div>
                    <span className="adm-quick-label">{label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Recent Users */}
            <Card title="Recent Users" subtitle="Latest registrations" style={{ marginTop: '1.25rem' }}
              action={<Button variant="ghost" size="sm" onClick={() => navigate('/admin/users')}>All <FiArrowRight size={12} /></Button>}>
              {loading ? <ShimmerList count={4} height={40} /> : (
                <div className="adm-users-list">
                  {recentUsers.slice(0, 6).map(u => (
                    <div key={u.id} className="adm-user-row">
                      <div className="adm-user-dot" style={{
                        background: u.is_active ? 'var(--success)' : 'var(--text-muted)',
                      }} />
                      <p className="adm-user-email">{u.email}</p>
                      <span className="adm-user-role" style={{
                        color: roleColors[u.role] || 'var(--text-muted)',
                      }}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* System Status */}
            <Card title="System Status" subtitle="Platform health" style={{ marginTop: '1.25rem' }}>
              <div className="adm-status-list">
                {[
                  { label: 'API Server', status: 'Online',    color: 'var(--success)', icon: FiActivity },
                  { label: 'Database',   status: 'Connected', color: 'var(--success)', icon: FiDatabase },
                  { label: 'Auth',       status: 'Active',    color: 'var(--success)', icon: FiShield },
                ].map(({ label, status, color, icon: Icon }) => (
                  <div key={label} className="adm-status-row">
                    <div className="adm-status-left">
                      <Icon size={14} color="var(--text-muted)" />
                      <span>{label}</span>
                    </div>
                    <div className="adm-status-right">
                      <div className="adm-status-indicator" style={{ background: color }} />
                      <span style={{ color }}>{status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* ═══ REJECT MODAL ═══ */}
        <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)}
          title="Reject Teacher" size="sm"
          footer={<>
            <Button variant="ghost" onClick={() => setRejectModal(null)}>Cancel</Button>
            <Button variant="ghost" loading={saving} onClick={handleReject}
              style={{ color: 'var(--success)', border: '1.5px solid var(--success)' }}>
              Reject
            </Button>
          </>}>
          {rejectModal && (
            <div>
              <div className="adm-reject-preview">
                <Avatar firstName={rejectModal.first_name} lastName={rejectModal.last_name} size={42} />
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {formatName(rejectModal.first_name, rejectModal.last_name)}
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{rejectModal.course}</p>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Reason (optional)</label>
                <textarea className="form-textarea" value={rejectNote}
                  onChange={e => setRejectNote(e.target.value)}
                  placeholder="Why is this application being rejected?" rows={3} />
              </div>
            </div>
          )}
        </Modal>
      </div>

      {/* ═══ STYLES ═══ */}
      <style>{`
        .admin-page-anim {
          animation: adminPageIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* Hero */
        .adm-hero {
          background: linear-gradient(135deg, #082a18 0%, #0d3f29 55%, #0f6f4e 100%);
          border-radius: var(--radius-xl);
          padding: 2rem 2.25rem;
          margin-bottom: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(16,185,129,0.16);
        }
        .adm-hero-deco1 {
          position: absolute; top: -40%; right: -5%;
          width: 260px; height: 260px; border-radius: 50%;
          background: rgba(16,185,129,0.1); pointer-events: none;
        }
        .adm-hero-deco2 {
          position: absolute; bottom: -60%; left: 15%;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(5,150,105,0.08); pointer-events: none;
        }
        .adm-hero-left {
          display: flex; align-items: center; gap: 1rem;
          position: relative; z-index: 1;
        }
        .adm-hero-right { position: relative; z-index: 1; }
        .adm-hero-icon {
          width: 54px; height: 54px;
          background: linear-gradient(135deg,#10b981,#059669);
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(16,185,129,0.35);
          flex-shrink: 0; color: white;
        }
        .adm-hero-title {
          font-size: 1.6rem; font-weight: 800;
          color: white; letter-spacing: -0.025em; line-height: 1.2;
        }
        .adm-hero-sub {
          font-size: 0.85rem; color: rgba(255,255,255,0.55); margin-top: 0.2rem;
        }

        /* Stats */
        .adm-stats {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1rem;
          margin-bottom: 1.75rem;
        }
        .adm-stat-card {
          background: var(--white);
          border-radius: var(--radius-lg);
          padding: 1.1rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow-sm);
          position: relative;
          overflow: hidden;
          transition: all 0.22s ease;
          animation: cardPopIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        .adm-stat-card:hover {
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          transform: translateY(-3px);
        }
        .adm-stat-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
        }
        .adm-stat-dot {
          position: absolute; top: 10px; right: 10px;
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--success);
          animation: statusPulse 1.4s ease infinite;
        }
        .adm-stat-icon {
          width: 40px; height: 40px;
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.7rem; margin-top: 0.2rem;
        }
        .adm-stat-value {
          font-size: 1.6rem; font-weight: 800;
          color: var(--primary); line-height: 1;
        }
        .adm-stat-label {
          font-size: 0.72rem; color: var(--text-muted);
          font-weight: 500; margin-top: 0.25rem;
        }

        /* Content grid */
        .adm-content {
          display: grid;
          grid-template-columns: 1.65fr 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        /* Badge count */
        .adm-badge-count {
          background: var(--success); color: white;
          width: 22px; height: 22px; border-radius: 50%;
          display: inline-flex; align-items: center;
          justify-content: center; font-size: 0.68rem;
          font-weight: 800; flex-shrink: 0;
        }

        /* Empty state */
        .adm-empty {
          text-align: center; padding: 3rem 1rem;
        }
        .adm-empty-icon {
          width: 64px; height: 64px; border-radius: 50%;
          background: var(--success-bg);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1rem;
        }
        .adm-empty-title {
          font-weight: 700; color: var(--success); margin-bottom: 0.2rem;
        }
        .adm-empty-sub {
          color: var(--text-muted); font-size: 0.85rem;
        }

        /* Pending list */
        .adm-pending-list {
          display: flex; flex-direction: column; gap: 0.75rem;
        }
        .adm-pending-card {
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem; background: var(--bg);
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          transition: all 0.2s ease; flex-wrap: wrap;
          animation: cardPopIn 0.4s cubic-bezier(0.22,1,0.36,1) both;
        }
        .adm-pending-card:hover {
          border-color: var(--success);
          box-shadow: 0 2px 10px rgba(16,185,129,0.12);
        }
        .adm-pending-info {
          display: flex; align-items: center; gap: 0.85rem;
          flex: 1; min-width: 200px;
        }
        .adm-pending-meta { flex: 1; min-width: 0; }
        .adm-pending-name {
          font-weight: 700; font-size: 0.9rem; color: var(--primary);
        }
        .adm-pending-course {
          font-size: 0.78rem; color: var(--secondary); font-weight: 600;
        }
        .adm-pending-details {
          display: flex; gap: 0.75rem; margin-top: 0.2rem;
          font-size: 0.72rem; color: var(--text-muted); flex-wrap: wrap;
        }
        .adm-pending-actions {
          display: flex; gap: 0.4rem; flex-shrink: 0;
        }
        .adm-btn-approve, .adm-btn-reject {
          padding: 0.45rem 0.9rem;
          border-radius: var(--radius-sm);
          font-size: 0.78rem; font-weight: 700;
          cursor: pointer; display: flex;
          align-items: center; gap: 0.3rem;
          transition: all 0.2s ease; min-height: 36px; border: none;
        }
        .adm-btn-approve {
          background: var(--success); color: white;
        }
        .adm-btn-approve:hover:not(:disabled) { opacity: 0.88; }
        .adm-btn-approve:disabled { opacity: 0.5; cursor: not-allowed; }
        .adm-btn-reject {
          background: var(--white); color: var(--success);
          border: 1.5px solid var(--success) !important;
        }
        .adm-btn-reject:hover { background: rgba(16,185,129,0.06); }

        /* Quick actions */
        .adm-quick-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem;
        }
        .adm-quick-btn {
          display: flex; flex-direction: column;
          align-items: center; gap: 0.5rem;
          padding: 1rem 0.5rem;
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          cursor: pointer; transition: all 0.2s ease; min-height: 80px;
        }
        .adm-quick-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .adm-quick-icon {
          width: 36px; height: 36px;
          border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center;
        }
        .adm-quick-label {
          font-size: 0.78rem; font-weight: 700; color: var(--text-primary);
        }

        /* Users list */
        .adm-users-list {
          display: flex; flex-direction: column; gap: 0.5rem;
        }
        .adm-user-row {
          display: flex; align-items: center; gap: 0.65rem;
          padding: 0.5rem 0.65rem;
          border-radius: var(--radius-sm); background: var(--bg);
        }
        .adm-user-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }
        .adm-user-email {
          flex: 1; min-width: 0; font-size: 0.8rem;
          font-weight: 600; color: var(--primary);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .adm-user-role {
          font-size: 0.65rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em; flex-shrink: 0;
        }

        /* Status list */
        .adm-status-list {
          display: flex; flex-direction: column; gap: 0.65rem;
        }
        .adm-status-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.5rem 0.65rem; background: var(--bg);
          border-radius: var(--radius-sm);
        }
        .adm-status-left {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.8rem; color: var(--text-secondary);
        }
        .adm-status-right {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.72rem; font-weight: 600;
        }
        .adm-status-indicator {
          width: 7px; height: 7px; border-radius: 50%;
          animation: statusPulse 2s ease infinite;
        }

        /* Reject preview */
        .adm-reject-preview {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.9rem; background: var(--success-bg);
          border-radius: var(--radius-md);
          border: 1px solid var(--success); margin-bottom: 1.25rem;
        }

        /* ── Responsive ──────────────────────── */
        @media (max-width: 1400px) {
          .adm-stats { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 1100px) {
          .adm-content { grid-template-columns: 1fr !important; }
          .adm-stats { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 768px) {
          .adm-hero { padding: 1.4rem 1.25rem; border-radius: var(--radius-lg); }
          .adm-hero-title { font-size: 1.25rem; }
          .adm-hero-icon { width: 44px; height: 44px; }
          .adm-stats { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
          .adm-pending-info { min-width: 100%; }
          .adm-pending-actions { width: 100%; }
          .adm-pending-actions button { flex: 1; justify-content: center; }
        }
        @media (max-width: 480px) {
          .adm-hero { padding: 1.1rem; }
          .adm-hero-title { font-size: 1.1rem; }
          .adm-hero-sub { font-size: 0.75rem; }
          .adm-hero-right { width: 100%; }
          .adm-hero-right button { width: 100%; justify-content: center; }
          .adm-stats { grid-template-columns: 1fr 1fr; gap: 0.6rem; }
          .adm-stat-value { font-size: 1.3rem; }
        }
        @media (max-width: 360px) {
          .adm-stats { grid-template-columns: 1fr; }
        }
      `}</style>
    </DashboardLayout>
  )
}

function ShimmerList({ count = 3, height = 64 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{
          height, background: 'var(--bg)', borderRadius: 'var(--radius-md)',
          animation: `shimmer 1.4s ease infinite ${i * 0.15}s`,
        }} />
      ))}
    </div>
  )
}