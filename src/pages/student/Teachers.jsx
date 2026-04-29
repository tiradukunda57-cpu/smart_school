import React, { useState, useEffect, useContext } from 'react'
import { FiSearch, FiGrid, FiList, FiMessageSquare, FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import SearchBar from '../../components/common/SearchBar'
import EmptyState from '../../components/common/EmptyState'
import { teacherService } from '../../services/teacherService'
import { ToastContext } from '../../context/ToastContext'
import { formatName } from '../../utils/formatters'

export default function Teachers() {
  const { addToast } = useContext(ToastContext)
  const navigate = useNavigate()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await teacherService.getAll({ search })
        setTeachers(data.teachers || [])
      } catch {
        addToast('Failed to load teachers', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [search])

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Our Teachers</h1>
          <p className="page-subtitle">{teachers.length} teachers available</p>
        </div>
      </div>

      {/* Toolbar */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.25rem' }}>
          <SearchBar
            value={search} onChange={setSearch}
            placeholder="Search by name or subject..."
            style={{ flex: 1, minWidth: 200 }}
          />
          <div style={{
            display: 'flex', background: 'var(--bg)',
            borderRadius: 'var(--radius-md)', padding: '3px', gap: '2px',
          }}>
            {[{ mode: 'grid', icon: FiGrid }, { mode: 'list', icon: FiList }].map(({ mode, icon: Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                padding: '0.45rem 0.65rem',
                background: viewMode === mode ? 'var(--primary)' : 'transparent',
                color: viewMode === mode ? 'white' : 'var(--text-muted)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                transition: 'var(--transition)',
              }}>
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </Card>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
      )}

      {!loading && teachers.length === 0 && (
        <Card>
          <EmptyState icon={FiUser} message="No teachers found." />
        </Card>
      )}

      {/* Grid */}
      {!loading && teachers.length > 0 && viewMode === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {teachers.map(t => (
            <div
              key={t.id}
              style={{
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)', transition: 'var(--transition-slow)',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {/* Banner */}
              <div style={{
                height: 70,
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              }} />

              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                {/* Avatar overlapping banner */}
                <div style={{ marginTop: -32, marginBottom: '1rem' }}>
                  <Avatar
                    firstName={t.first_name} lastName={t.last_name} size={64}
                    style={{ border: '3px solid white', boxShadow: 'var(--shadow-sm)' }}
                  />
                </div>

                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                  {formatName(t.first_name, t.last_name)}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  {t.subject || 'General'}
                </p>

                {t.qualification && (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    🎓 {t.qualification}
                  </p>
                )}

                {t.bio && (
                  <p style={{
                    fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6,
                    marginBottom: '1rem',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {t.bio}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <button
                    onClick={() => navigate(`/student/teachers/${t.id}`)}
                    style={{
                      flex: 1, padding: '0.6rem',
                      background: 'var(--primary-ghost)', color: 'var(--primary)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary-ghost)'; e.currentTarget.style.color = 'var(--primary)' }}
                  >
                    <FiUser size={13} /> Profile
                  </button>
                  <button
                    onClick={() => navigate('/student/messages')}
                    style={{
                      flex: 1, padding: '0.6rem',
                      background: 'var(--secondary)', color: 'white',
                      border: 'none', borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--secondary-dark)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--secondary)'}
                  >
                    <FiMessageSquare size={13} /> Message
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {!loading && teachers.length > 0 && viewMode === 'list' && (
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {teachers.map((t, i) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 0.5rem',
                borderBottom: i < teachers.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <Avatar firstName={t.first_name} lastName={t.last_name} size={48} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                    {formatName(t.first_name, t.last_name)}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 600 }}>{t.subject}</p>
                  {t.qualification && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{t.qualification}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button onClick={() => navigate(`/student/teachers/${t.id}`)} style={listBtn('var(--primary)')}>
                    <FiUser size={14} /> View
                  </button>
                  <button onClick={() => navigate('/student/messages')} style={listBtn('var(--secondary)')}>
                    <FiMessageSquare size={14} /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </DashboardLayout>
  )
}

const listBtn = (color) => ({
  padding: '0.45rem 0.9rem', background: 'var(--bg)',
  border: `1.5px solid ${color}`, color,
  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
  fontSize: '0.8rem', fontWeight: 700,
  display: 'flex', alignItems: 'center', gap: '0.35rem',
  transition: 'var(--transition)',
})