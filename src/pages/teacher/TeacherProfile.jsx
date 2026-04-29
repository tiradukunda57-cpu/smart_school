import React, { useState, useContext } from 'react'
import { FiEdit, FiSave, FiUser, FiMail, FiPhone, FiBook, FiAward, FiX } from 'react-icons/fi'
import DashboardLayout from '../../components/common/DashboardLayout'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import { authService } from '../../services/authService'
import { ToastContext } from '../../context/ToastContext'
import { useAuth } from '../../hooks/useAuth'
import { formatDate, formatName } from '../../utils/formatters'

export default function TeacherProfile() {
  const { user, updateUser } = useAuth()
  const { addToast } = useContext(ToastContext)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    subject: user?.subject || '',
    qualification: user?.qualification || '',
    bio: user?.bio || '',
  })

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      addToast('Name fields are required', 'warning'); return
    }
    setSaving(true)
    try {
      const data = await authService.updateProfile(form)
      updateUser(data.user || form)
      addToast('Profile updated successfully!', 'success')
      setEditing(false)
    } catch {
      addToast('Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      subject: user?.subject || '',
      qualification: user?.qualification || '',
      bio: user?.bio || '',
    })
    setEditing(false)
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
        {!editing ? (
          <Button variant="outline" icon={<FiEdit size={15} />} onClick={() => setEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="ghost" icon={<FiX size={15} />} onClick={handleCancel}>Cancel</Button>
            <Button variant="primary" icon={<FiSave size={15} />} loading={saving} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left – Avatar & quick info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <Avatar
                firstName={user?.first_name}
                lastName={user?.last_name}
                size={96}
                style={{ margin: '0 auto 1rem' }}
              />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatName(user?.first_name, user?.last_name)}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {user?.email}
              </p>
              <div style={{ marginTop: '0.75rem' }}>
                <Badge type="secondary" label={user?.subject || 'Teacher'} />
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              {[
                { label: 'Role', value: 'Teacher' },
                { label: 'Joined', value: formatDate(user?.created_at) },
                { label: 'Status', value: 'Active' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--border-light)',
                  fontSize: '0.83rem',
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right – Edit form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card title="Personal Information">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.25rem' }}>
              <ProfileField
                label="First Name" name="first_name" value={form.first_name}
                editing={editing} onChange={handleChange} icon={FiUser}
              />
              <ProfileField
                label="Last Name" name="last_name" value={form.last_name}
                editing={editing} onChange={handleChange} icon={FiUser}
              />
            </div>
            <ProfileField
              label="Email Address" name="email" value={user?.email}
              editing={false} icon={FiMail}
              hint="Email cannot be changed"
            />
            <ProfileField
              label="Phone Number" name="phone" value={form.phone}
              editing={editing} onChange={handleChange} icon={FiPhone}
              placeholder="+1 234 567 8900"
            />
          </Card>

          <Card title="Professional Information">
            <ProfileField
              label="Subject / Specialization" name="subject" value={form.subject}
              editing={editing} onChange={handleChange} icon={FiBook}
              placeholder="e.g. Mathematics"
            />
            <ProfileField
              label="Qualification" name="qualification" value={form.qualification}
              editing={editing} onChange={handleChange} icon={FiAward}
              placeholder="e.g. M.Ed., B.Sc."
            />
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Bio / About
              </label>
              {editing ? (
                <textarea
                  name="bio" value={form.bio} onChange={handleChange}
                  className="form-textarea" rows={4}
                  placeholder="Tell students about yourself..."
                />
              ) : (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--bg)', borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem', color: 'var(--text-secondary)',
                  lineHeight: 1.7, minHeight: 80,
                }}>
                  {form.bio || <span style={{ color: 'var(--text-light)' }}>No bio added yet</span>}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

function ProfileField({ label, name, value, editing, onChange, icon: Icon, placeholder, hint }) {
  return (
    <div className="form-group">
      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {Icon && <Icon size={13} />} {label}
      </label>
      {editing && onChange ? (
        <input
          className="form-input" name={name} value={value}
          onChange={onChange} placeholder={placeholder}
        />
      ) : (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'var(--bg)', borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem', color: 'var(--text-secondary)',
          border: '1.5px solid transparent',
        }}>
          {value || <span style={{ color: 'var(--text-light)' }}>—</span>}
        </div>
      )}
      {hint && <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>{hint}</p>}
    </div>
  )
}