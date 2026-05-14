import React, { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  FiHome, FiUsers, FiCheckSquare, FiBookOpen,
  FiFileText, FiMessageSquare, FiUser, FiChevronRight,
  FiX, FiShield, FiUserCheck, FiLayers, FiClipboard,
  FiActivity, FiDatabase
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'

const adminLinks = [
  { section: 'Overview' },
  { to: '/admin/dashboard',  icon: FiHome,         label: 'Dashboard' },
  { to: '/admin/users',      icon: FiUsers,        label: 'All Users' },
  { section: 'Management' },
  { to: '/admin/teachers',   icon: FiUserCheck,    label: 'Teacher Approvals' },
  { to: '/admin/groups',     icon: FiLayers,       label: 'Groups' },
  { to: '/admin/recovery',   icon: FiShield,       label: 'Recovery Requests' },
  { section: 'Analytics' },
  { to: '/admin/activity',   icon: FiActivity,     label: 'Activity Logs' },
  { to: '/admin/reports',    icon: FiDatabase,     label: 'Reports' },
  { section: 'Communication' },
  { to: '/groups',           icon: FiMessageSquare, label: 'Group Chats' },
]

const teacherLinks = [
  { section: 'Main' },
  { to: '/teacher/dashboard',   icon: FiHome,         label: 'Dashboard' },
  { to: '/teacher/students',    icon: FiUsers,        label: 'Students' },
  { section: 'Academic' },
  { to: '/teacher/attendance',  icon: FiCheckSquare,  label: 'Attendance' },
  { to: '/teacher/assignments', icon: FiBookOpen,     label: 'Assignments' },
  { to: '/teacher/quizzes',     icon: FiClipboard,    label: 'Quizzes' },
  { to: '/teacher/notes',       icon: FiFileText,     label: 'Notes' },
  { section: 'Communication' },
  { to: '/teacher/messages',    icon: FiMessageSquare, label: 'Messages' },
  { to: '/groups',              icon: FiLayers,       label: 'Groups' },
  { section: 'Account' },
  { to: '/teacher/profile',     icon: FiUser,         label: 'My Profile' },
]

const studentLinks = [
  { section: 'Main' },
  { to: '/student/dashboard',   icon: FiHome,         label: 'Dashboard' },
  { section: 'Academic' },
  { to: '/student/attendance',  icon: FiCheckSquare,  label: 'My Attendance' },
  { to: '/student/assignments', icon: FiBookOpen,     label: 'Assignments' },
  { to: '/student/quizzes',     icon: FiClipboard,    label: 'Quizzes' },
  { to: '/student/notes',       icon: FiFileText,     label: 'Notes' },
  { section: 'Communication' },
  { to: '/student/teachers',    icon: FiUsers,        label: 'Teachers' },
  { to: '/student/messages',    icon: FiMessageSquare, label: 'Messages' },
  { to: '/groups',              icon: FiLayers,       label: 'Groups' },
]

export default function Sidebar({ collapsed, isMobile, mobileOpen, onCloseMobile }) {
  const { user } = useAuth()
  const location = useLocation()

  const links = user?.role === 'admin'
    ? adminLinks
    : user?.role === 'teacher'
      ? teacherLinks
      : studentLinks

  const isAdmin = user?.role === 'admin'

  // Close mobile sidebar on navigation
  useEffect(() => {
    if (mobileOpen && onCloseMobile) onCloseMobile()
  }, [location.pathname])

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Determine what to show
  const showLabels = isMobile ? true : !collapsed

  // Colors
  const sidebarBg = isAdmin
    ? 'linear-gradient(180deg, #062b18 0%, #0b4029 50%, #0f472f 100%)'
    : 'linear-gradient(180deg, var(--primary-dark) 0%, var(--primary) 100%)'

  const accentColor = isAdmin ? '#10b981'
    : user?.role === 'teacher' ? 'var(--secondary-lighter)'
    : 'rgba(255,255,255,0.6)'

  const activeItemBg = isAdmin
    ? 'rgba(16,185,129,0.18)'
    : 'rgba(255,255,255,0.12)'

  const activeBorderColor = isAdmin ? '#10b981' : 'var(--secondary-lighter)'

  // Build styles
  const desktopWidth = showLabels ? 272 : 72
  let sidebarStyle = {}

  if (isMobile) {
    sidebarStyle = {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: 285,
      background: sidebarBg,
      zIndex: 1001,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: mobileOpen ? '6px 0 24px rgba(0,0,0,0.35)' : 'none',
    }
  } else {
    sidebarStyle = {
      position: 'fixed',
      top: 'var(--navbar-height)',
      left: 0,
      bottom: 0,
      width: desktopWidth,
      background: sidebarBg,
      zIndex: 99,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: isAdmin ? '3px 0 16px rgba(0,0,0,0.15)' : '1px 0 4px rgba(0,0,0,0.08)',
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            animation: 'sidebarFadeIn 0.25s ease',
          }}
        />
      )}

      <aside style={sidebarStyle}>
        {/* ── Mobile Header ────────────────────── */}
        {isMobile && (
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.1rem 1.15rem',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 34, height: 34,
                background: isAdmin
                  ? 'linear-gradient(135deg,#10b981,#059669)'
                  : 'rgba(255,255,255,0.12)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isAdmin ? '0 2px 8px rgba(16,185,129,0.35)' : 'none',
              }}>
                {isAdmin
                  ? <FiShield size={15} color="white" />
                  : <span style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem' }}>E</span>
                }
              </div>
              <span style={{
                fontWeight: 800, fontSize: '1rem', color: 'white',
                letterSpacing: '-0.02em',
              }}>
                {isAdmin ? 'Admin Panel' : 'EduManage'}
              </span>
            </div>
            <button
              onClick={onCloseMobile}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem', cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)',
                display: 'flex', alignItems: 'center',
                minWidth: 34, minHeight: 34,
                justifyContent: 'center',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            >
              <FiX size={18} />
            </button>
          </div>
        )}

        {/* ── Role Badge ───────────────────────── */}
        {showLabels && (
          <div style={{ padding: '1.1rem 1rem 0.6rem', flexShrink: 0 }}>
            {isAdmin ? (
              <div style={{
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.85rem',
                display: 'flex', alignItems: 'center', gap: '0.6rem',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <FiShield size={13} color="white" />
                </div>
                <div>
                  <p style={{
                    fontSize: '0.68rem', fontWeight: 800,
                    color: '#10b981',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>
                    ADMINISTRATOR
                  </p>
                  <p style={{
                    fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)',
                  }}>
                    Full System Access
                  </p>
                </div>
              </div>
            ) : (
              <p style={{
                fontSize: '0.65rem', fontWeight: 700,
                color: accentColor, letterSpacing: '0.1em',
                textTransform: 'uppercase', paddingLeft: '0.25rem',
              }}>
                {user?.role === 'teacher' ? 'Teacher Panel' : 'Student Panel'}
              </p>
            )}
          </div>
        )}

        {/* ── Navigation ───────────────────────── */}
        <nav style={{
          flex: 1, padding: '0.35rem 0.65rem',
          display: 'flex', flexDirection: 'column',
          gap: '1px',
        }}>
          {links.map((item, idx) => {
            if (item.section) {
              if (!showLabels) return null
              return (
                <div key={`sec-${idx}`} style={{
                  padding: '0.85rem 0.85rem 0.3rem',
                  fontSize: '0.6rem', fontWeight: 700,
                  color: isAdmin ? 'rgba(16,185,129,0.45)' : 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  {item.section}
                </div>
              )
            }

            const { to, icon: Icon, label } = item
            const isActive = location.pathname === to ||
              (to.length > 1 && location.pathname.startsWith(to + '/'))

            return (
              <NavLink
                key={to}
                to={to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: showLabels ? '0.75rem' : 0,
                  padding: showLabels ? '0.6rem 0.9rem' : '0.7rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                  background: isActive ? activeItemBg : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.83rem',
                  transition: 'all 0.18s ease',
                  justifyContent: showLabels ? 'flex-start' : 'center',
                  position: 'relative',
                  textDecoration: 'none',
                  minHeight: 40,
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)'
                  }
                }}
                title={!showLabels ? label : undefined}
              >
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    left: 0, top: '16%', bottom: '16%',
                    width: 3,
                    background: activeBorderColor,
                    borderRadius: '0 4px 4px 0',
                  }} />
                )}
                <Icon size={17} style={{ flexShrink: 0 }} />
                {showLabels && (
                  <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{label}</span>
                )}
                {showLabels && isActive && (
                  <FiChevronRight size={13} style={{ opacity: 0.45, flexShrink: 0 }} />
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* ── Footer ───────────────────────────── */}
        {showLabels && (
          <div style={{
            padding: '0.8rem 1rem',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            fontSize: '0.65rem',
            color: 'rgba(255,255,255,0.18)',
            textAlign: 'center',
            flexShrink: 0,
          }}>
            {isAdmin ? '🛡️ EduManage Admin v2.0' : 'EduManage © 2024'}
          </div>
        )}
      </aside>

      <style>{`
        @keyframes sidebarFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}