import React, { useState, useEffect, useContext } from 'react'
import { FiFileText, FiDownload, FiEye, FiSearch } from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import SearchBar from '../../components/common/SearchBar'
import EmptyState from '../../components/common/EmptyState'
import { noteService } from '../../services/noteService'
import { ToastContext } from '../../context/ToastContext'
import { formatDate, timeAgo } from '../../utils/formatters'
import { downloadNotePDF } from '../../utils/downloadHelper'

const categoryColors = {
  Lecture:      { bg: 'var(--primary-ghost)', color: 'var(--primary)' },
  Summary:      { bg: 'var(--secondary-ghost)', color: 'var(--secondary)' },
  Reference:    { bg: 'var(--info-bg)', color: 'var(--info)' },
  Exercise:     { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  Announcement: { bg: 'var(--danger-bg)', color: 'var(--danger)' },
}

export default function MyNotes() {
  const { addToast } = useContext(ToastContext)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await noteService.getAll({ search, category: filterCategory })
        setNotes(data.notes || [])
      } catch {
        addToast('Failed to load notes', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [search, filterCategory])

  const handleDownload = (note) => {
    downloadNotePDF(note)
    addToast('Note downloaded as PDF!', 'success')
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notes & Resources</h1>
          <p className="page-subtitle">{notes.length} notes available from your teachers</p>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.25rem' }}>
          <SearchBar
            value={search} onChange={setSearch}
            placeholder="Search notes..."
            style={{ flex: 1, minWidth: 200 }}
          />
          <select
            className="form-select"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            style={{ width: 'auto', padding: '0.62rem 2rem 0.62rem 0.9rem' }}
          >
            <option value="">All Categories</option>
            {Object.keys(categoryColors).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(filterCategory || search) && (
            <Button variant="ghost" size="sm" onClick={() => { setFilterCategory(''); setSearch('') }}>
              Clear
            </Button>
          )}
        </div>
      </Card>

      {/* Notes */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
      ) : notes.length === 0 ? (
        <Card>
          <EmptyState icon={FiFileText} message="No notes available yet. Your teachers will share notes here." />
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.25rem',
        }}>
          {notes.map(note => {
            const cat = categoryColors[note.category] || categoryColors.Lecture
            return (
              <div
                key={note.id}
                style={{
                  background: 'var(--white)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)', padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)', transition: 'var(--transition-slow)',
                  display: 'flex', flexDirection: 'column', gap: '1rem',
                  borderLeft: `4px solid ${cat.color}`,
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                {/* Header */}
                <div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700,
                    background: cat.bg, color: cat.color,
                    padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)',
                    display: 'inline-block', marginBottom: '0.5rem',
                  }}>
                    {note.category || 'Lecture'}
                  </span>
                  <p style={{
                    fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {note.title}
                  </p>
                  {note.subject && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: 600, marginTop: '0.15rem' }}>
                      {note.subject}
                    </p>
                  )}
                </div>

                {/* Preview */}
                <p style={{
                  fontSize: '0.83rem', color: 'var(--text-muted)', lineHeight: 1.65,
                  display: '-webkit-box', WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1,
                }}>
                  {note.content}
                </p>

                {/* Teacher info */}
                {note.teacher_name && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    By {note.teacher_name} · {timeAgo(note.created_at)}
                  </p>
                )}

                {/* Actions */}
                <div style={{
                  display: 'flex', gap: '0.5rem',
                  borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem',
                }}>
                  <button
                    onClick={() => setSelected(note)}
                    style={{ ...btnStyle, flex: 2, color: 'var(--primary)' }}
                  >
                    <FiEye size={13} /> View
                  </button>
                  <button
                    onClick={() => handleDownload(note)}
                    style={{ ...btnStyle, flex: 2, color: 'var(--secondary)' }}
                  >
                    <FiDownload size={13} /> Download
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={!!selected} onClose={() => setSelected(null)}
        title="Note Details" size="lg"
        footer={
          selected && (
            <Button variant="secondary" icon={<FiDownload size={15} />} onClick={() => { handleDownload(selected); setSelected(null) }}>
              Download PDF
            </Button>
          )
        }
      >
        {selected && (
          <div>
            <div style={{
              background: 'var(--primary-ghost)', borderRadius: 'var(--radius-md)',
              padding: '1.25rem', marginBottom: '1.5rem',
            }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.6rem' }}>
                {selected.title}
              </h2>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {selected.subject && <span style={{ fontSize: '0.82rem', color: 'var(--secondary)', fontWeight: 700 }}>📖 {selected.subject}</span>}
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>🗂 {selected.category}</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>📅 {formatDate(selected.created_at)}</span>
              </div>
            </div>
            <div style={{
              fontSize: '0.9rem', color: 'var(--text-secondary)',
              lineHeight: 1.85, whiteSpace: 'pre-wrap',
              background: 'var(--bg)', padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              maxHeight: 420, overflowY: 'auto',
            }}>
              {selected.content}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}

const btnStyle = {
  background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.6rem',
  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
  display: 'flex', alignItems: 'center', gap: '0.35rem', justifyContent: 'center',
  transition: 'var(--transition)',
}