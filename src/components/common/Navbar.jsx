import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMenu, FiLogOut, FiUser, FiChevronDown } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import Avatar from './Avatar'
import { formatName } from '../../utils/formatters'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef()

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const profilePath = user?.role === 'teacher' ? '/teacher/profile' : null

  return (
    <nav style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      height: 'var(--navbar-height)',
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            background: 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '0.5rem',
            cursor: 'pointer',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            minWidth: 40, minHeight: 40, // touch target
            justifyContent: 'center',
          }}
        >
          <FiMenu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 30, height: 30,
            background: 'var(--primary)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>E</span>
          </div>
          <span style={{
            fontWeight: 800, fontSize: '1rem', color: 'var(--primary)',
            letterSpacing: '-0.02em',
          }}
            className="navbar-brand-text"
          >
            EduManage
          </span>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Role badge — hidden on very small screens */}
        <span
          className="navbar-role-badge"
          style={{
            background: user?.role === 'teacher' ? 'var(--primary-ghost)' : 'var(--secondary-ghost)',
            color: user?.role === 'teacher' ? 'var(--primary)' : 'var(--secondary)',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'capitalize',
          }}
        >
          {user?.role}
        </span>

        {/* User dropdown */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              padding: '0.3rem 0.7rem 0.3rem 0.3rem',
              cursor: 'pointer',
              minHeight: 40,
              transition: 'var(--transition)',
            }}
          >
            <Avatar firstName={user?.first_name} lastName={user?.last_name} size={28} />
            <span
              className="navbar-username"
              style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}
            >
              {user?.first_name}
            </span>
            <FiChevronDown
              size={14}
              style={{
                color: 'var(--text-muted)',
                transform: dropOpen ? 'rotate(180deg)' : 'none',
                transition: 'var(--transition)',
              }}
            />
          </button>

          {/* Dropdown */}
          {dropOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
              background: 'var(--white)', borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
              minWidth: 200, overflow: 'hidden',
              animation: 'scaleIn 0.15s ease', zIndex: 200,
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)' }}>
                  {formatName(user?.first_name, user?.last_name)}
                </p>
                <p style={{
                  fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem',
                  wordBreak: 'break-all',
                }}>
                  {user?.email}
                </p>
              </div>

              {profilePath && (
                <button
                  onClick={() => { navigate(profilePath); setDropOpen(false) }}
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    background: 'none', color: 'var(--text-secondary)',
                    fontSize: '0.875rem', fontWeight: 500,
                    cursor: 'pointer', minHeight: 44,
                    borderBottom: '1px solid var(--border-light)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <FiUser size={15} /> Profile
                </button>
              )}

              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: 'none', color: 'var(--danger)',
                  fontSize: '0.875rem', fontWeight: 600,
                  cursor: 'pointer', minHeight: 44,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <FiLogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0 }
          to { transform: scale(1); opacity: 1 }
        }
        @media (max-width: 480px) {
          .navbar-brand-text { display: none !important; }
          .navbar-role-badge { display: none !important; }
          .navbar-username { display: none !important; }
        }
        @media (max-width: 600px) {
          .navbar-username { display: none !important; }
        }
      `}</style>
    </nav>
  )
}