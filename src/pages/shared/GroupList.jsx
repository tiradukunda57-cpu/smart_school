import React, { useState, useEffect, useContext } from 'react'
import { FiLayers, FiMessageSquare } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import EmptyState from '../../components/common/EmptyState'
import { groupService } from '../../services/groupService'
import { ToastContext } from '../../context/ToastContext'
import { timeAgo } from '../../utils/formatters'

const typeConfig = {
  teachers_only: { label: 'Teachers', bg: 'var(--primary-ghost)', color: 'var(--primary)' },
  students_only: { label: 'Students', bg: 'var(--secondary-ghost)', color: 'var(--secondary)' },
  mixed:         { label: 'Mixed', bg: 'var(--warning-bg)', color: 'var(--warning)' },
  custom:        { label: 'Custom', bg: 'var(--info-bg)', color: 'var(--info)' },
}

export default function GroupList() {
  const { addToast } = useContext(ToastContext)
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await groupService.getMyGroups()
        setGroups(data.groups || [])
      } catch {
        addToast('Failed to load groups', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Groups</h1>
          <p className="page-subtitle">{groups.length} groups</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState icon={FiLayers} message="You are not a member of any groups yet." />
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {groups.map(g => {
            const tc = typeConfig[g.type] || typeConfig.custom
            return (
              <div key={g.id} onClick={() => navigate(`/groups/${g.id}`)} style={{
                background: 'var(--white)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '1.25rem',
                cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition-slow)',
                display: 'flex', flexDirection: 'column', gap: '0.65rem',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FiLayers size={18} color={tc.color} />
                  </div>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-full)', background: tc.bg, color: tc.color,
                  }}>
                    {tc.label}
                  </span>
                </div>

                <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>{g.name}</p>

                {g.last_message && (
                  <p style={{
                    fontSize: '0.78rem', color: 'var(--text-muted)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    💬 {g.last_message}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-light)' }}>
                  <span>{g.member_count} members</span>
                  {g.last_at && <span>{timeAgo(g.last_at)}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}