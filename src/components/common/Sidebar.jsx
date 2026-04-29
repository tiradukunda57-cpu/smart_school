import React, { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  FiHome, FiUsers, FiCheckSquare, FiBookOpen,
  FiFileText, FiMessageSquare, FiUser, FiChevronRight, FiX
} from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'

const teacherLinks = [
  { to: '/teacher/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/teacher/students', icon: FiUsers, label: 'Students' },
  { to: '/teacher/attendance', icon: FiCheckSquare, label: 'Attendance' },
  { to: '/teacher/assignments', icon: FiBookOpen, label: 'Assignments' },
  { to: '/teacher/notes', icon: FiFileText, label: 'Notes' },
  { to: '/teacher/messages', icon: FiMessageSquare, label: 'Messages' },
  { to: '/teacher/profile', icon: FiUser, label: 'My Profile' },
]

const studentLinks = [
  { to: '/student/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/student/attendance', icon: FiCheckSquare, label: 'My Attendance' },
  { to: '/student/assignments', icon: FiBookOpen, label: 'Assignments' },
  { to: '/student/notes', icon: FiFileText, label: 'Notes' },
  { to: '/student/teachers', icon: FiUsers, label: 'Teachers' },
  { to: '/student/messages', icon: FiMessageSquare, label: 'Messages' },
]

export default function Sidebar({ collapsed, mobileOpen, onCloseMobile }) {
  const { user } = useAuth()
  const links = user?.role === 'teacher' ? teacherLinks : studentLinks
  const location = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && onCloseMobile) onCloseMobile()
  }, [location.pathname])

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 992

  // Desktop sidebar
  const sidebarStyle = {
    position: 'fixed',
    top: 'var(--navbar-height)',
    left: 0,
    bottom: 0,
    width: collapsed ? 'var(--sidebar-collapsed)' : '260px',
    background: 'var(--primary)',
    transition: 'all 0.3s ease',
    overflowX: 'hidden',
    overflowY: 'auto',
    zIndex: 99,
    display: 'flex',
    flexDirection: 'column',
  }

  // Mobile: completely different behavior
  if (isMobile || mobileOpen !== undefined) {
    if (!mobileOpen) {
      // Hidden on mobile
      sidebarStyle.transform = 'translateX(-100%)'
      sidebarStyle.width = '280px'
      sidebarStyle.top = 0
      sidebarStyle.zIndex = 1001
    } else {
      // Visible on mobile
      sidebarStyle.transform = 'translateX(0)'
      sidebarStyle.width = '280px'
      sidebarStyle.top = 0
      sidebarStyle.zIndex = 1001
    }
  }

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(17,28,48,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      <aside style={sidebarStyle}>
        {/* Mobile close button */}
        {mobileOpen && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{
                width: 32, height: 32, background: 'rgba(255,255,255,0.15)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>E</span>
              </div>
              <span style={{
                fontWeight: 800, fontSize: '1rem', color: 'white', letterSpacing: '-0.02em'
              }}>
                EduManage
              </span>
            </div>
            <button
              onClick={onCloseMobile}
              style={{
                background: 'rgba(255,255,255,0.1)', border: 'none',
                borderRadius: 'var(--radius-sm)',
                padding: '0.4rem', cursor: 'pointer',
                color: 'white', display: 'flex', alignItems: 'center',
              }}
            >
              <FiX size={18} />
            </button>
          </div>
        )}

        {/* Role label */}
        {(!collapsed || mobileOpen) && (
          <div style={{
            padding: '1.25rem 1.25rem 0.5rem',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            {user?.role === 'teacher' ? 'Teacher Panel' : 'Student Panel'}
          </div>
        )}

        {/* Nav links */}
        <nav style={{
          flex: 1,
          padding: '0.5rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.15rem',
        }}>
          {links.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to
            const showLabel = !collapsed || mobileOpen
            return (
              <NavLink
                key={to}
                to={to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: showLabel ? '0.85rem' : 0,
                  padding: showLabel ? '0.75rem 1rem' : '0.8rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'var(--white)' : 'rgba(255,255,255,0.65)',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  transition: 'var(--transition)',
                  justifyContent: showLabel ? 'flex-start' : 'center',
                  position: 'relative',
                  textDecoration: 'none',
                  minHeight: 44, // touch target
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.background = 'transparent'
                }}
                title={!showLabel ? label : ''}
              >
                {isActive && (
                  <span style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: 3, background: 'var(--secondary-lighter)',
                    borderRadius: '0 3px 3px 0',
                  }} />
                )}
                <Icon size={18} style={{ flexShrink: 0 }} />
                {showLabel && <span style={{ flex: 1 }}>{label}</span>}
                {showLabel && isActive && <FiChevronRight size={14} style={{ opacity: 0.6 }} />}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        {(!collapsed || mobileOpen) && (
          <div style={{
            padding: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.72rem',
            color: 'rgba(255,255,255,0.3)',
            textAlign: 'center',
          }}>
            EduManage © 2024
          </div>
        )}
      </aside>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @media (max-width: 992px) {
          aside { transform: translateX(-100%); top: 0 !important; }
        }
      `}</style>
    </>
  )
}