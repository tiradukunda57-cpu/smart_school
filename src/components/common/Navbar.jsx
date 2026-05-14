import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMenu, FiLogOut, FiUser, FiChevronDown, FiKey } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import Avatar from './Avatar'
import RecoveryModal from './RecoveryModal'
import { formatName } from '../../utils/formatters'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const [recoveryOpen, setRecoveryOpen] = useState(false)
  const dropRef = useRef()

  useEffect(() => {
    const handle = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  const profilePath = user?.role === 'teacher' ? '/teacher/profile' : null
  const isAdmin = user?.role === 'admin'

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 'var(--navbar-height)',
        background: 'var(--white)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem', zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onToggleSidebar} style={{
            background: 'var(--bg)', border: 'none',
            borderRadius: 'var(--radius-sm)', padding: '0.5rem',
            cursor: 'pointer', color: 'var(--primary)',
            display: 'flex', alignItems: 'center',
            minWidth: 40, minHeight: 40, justifyContent: 'center',
          }}>
            <FiMenu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 30, height: 30,
              background: isAdmin ? '#e94560' : 'var(--primary)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '0.9rem' }}>E</span>
            </div>
            <span className="navbar-brand" style={{
              fontWeight: 800, fontSize: '1rem',
              color: 'var(--primary)', letterSpacing: '-0.02em',
            }}>
              EduManage
            </span>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="navbar-role" style={{
            background: isAdmin ? 'rgba(233,69,96,0.1)' :
              user?.role === 'teacher' ? 'var(--primary-ghost)' : 'var(--secondary-ghost)',
            color: isAdmin ? '#e94560' :
              user?.role === 'teacher' ? 'var(--primary)' : 'var(--secondary)',
            padding: '0.25rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize',
          }}>
            {user?.role}
          </span>

          <div ref={dropRef} style={{ position: 'relative' }}>
            <button onClick={() => setDropOpen(o => !o)} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              padding: '0.3rem 0.7rem 0.3rem 0.3rem',
              cursor: 'pointer', minHeight: 40,
            }}>
              <Avatar firstName={user?.first_name} lastName={user?.last_name} size={28} />
              <span className="navbar-name" style={{
                fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)',
              }}>
                {user?.first_name}
              </span>
              <FiChevronDown size={14} style={{
                color: 'var(--text-muted)',
                transform: dropOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }} />
            </button>

            {dropOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 0.5rem)', right: 0,
                background: 'var(--white)', borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                minWidth: 200, overflow: 'hidden',
                animation: 'pageFadeScale 0.15s ease', zIndex: 200,
              }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)' }}>
                    {formatName(user?.first_name, user?.last_name)}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', wordBreak: 'break-all', marginTop: '0.1rem' }}>
                    {user?.email}
                  </p>
                </div>

                {profilePath && (
                  <button onClick={() => { navigate(profilePath); setDropOpen(false) }}
                    style={{ ...dropBtn, borderBottom: '1px solid var(--border-light)' }}>
                    <FiUser size={15} /> Profile
                  </button>
                )}

                {!isAdmin && (
                  <button onClick={() => { setRecoveryOpen(true); setDropOpen(false) }}
                    style={{ ...dropBtn, borderBottom: '1px solid var(--border-light)' }}>
                    <FiKey size={15} /> Password Recovery
                  </button>
                )}

                <button onClick={handleLogout}
                  style={{ ...dropBtn, color: 'var(--danger)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--danger-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                  <FiLogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <RecoveryModal isOpen={recoveryOpen} onClose={() => setRecoveryOpen(false)} />

      <style>{`
        @media(max-width:480px) {
          .navbar-brand { display: none !important; }
          .navbar-role  { display: none !important; }
          .navbar-name  { display: none !important; }
        }
        @media(max-width:600px) {
          .navbar-name { display: none !important; }
        }
      `}</style>
    </>
  )
}

const dropBtn = {
  width: '100%', padding: '0.75rem 1rem',
  display: 'flex', alignItems: 'center', gap: '0.75rem',
  background: 'none', color: 'var(--text-secondary)',
  fontSize: '0.875rem', fontWeight: 500,
  cursor: 'pointer', minHeight: 44,
  border: 'none', textAlign: 'left',
  transition: 'background 0.15s ease',
}