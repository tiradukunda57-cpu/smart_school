import React, { useState, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiZap } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import { ToastContext } from '../../context/ToastContext'
import { validate, validators } from '../../utils/validators'
import { AuthLayout, AuthInput, AuthSubmitButton, AuthLinks } from './StudentLogin'

const ADMIN_CREDENTIALS = {
  email: 'admin@edumanage.com',
  password: '123',
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { loading, execute } = useApi()
  const { addToast } = useContext(ToastContext)

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)
  const [filled, setFilled] = useState(false)

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: null }))
    setFilled(false)
  }

  const animateFill = (field, targetValue) => {
    let i = 0
    const interval = setInterval(() => {
      i++
      setForm(prev => ({
        ...prev,
        [field]: targetValue.substring(0, i),
      }))
      if (i >= targetValue.length) clearInterval(interval)
    }, 25)
  }

  const handleKeyDown = (e, field) => {
    if (e.key === 'Tab') {
      const currentValue = form[field]
      if (!currentValue || currentValue.length < ADMIN_CREDENTIALS[field].length) {
        e.preventDefault()
        setFilled(true)
        animateFill('email', ADMIN_CREDENTIALS.email)
        setTimeout(() => {
          animateFill('password', ADMIN_CREDENTIALS.password)
        }, 400)
      }
    }
  }

  const handleQuickFill = () => {
    setForm({
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
    })
    setErrors({})
    setFilled(true)
    addToast('Credentials auto-filled! Click Sign In.', 'info')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate(form, {
      email: [validators.required, validators.email],
      password: [validators.required],
    })
    if (Object.keys(errs).length) { setErrors(errs); return }

    await execute(() => login(form, 'admin'), {
      onSuccess: () => {
        addToast('Welcome, Admin! 🛡️', 'success')
        navigate('/admin/dashboard')
      },
      onError: (msg) => addToast(msg, 'error'),
    })
  }

  return (
    <AuthLayout title="Admin Login" subtitle="System administrator access">
      <form onSubmit={handleSubmit}>

        {/* Restricted banner */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.5rem', marginBottom: '1.25rem', padding: '0.65rem',
          background: 'var(--success-bg)', borderRadius: 'var(--radius-md)',
          border: '1px solid var(--success)',
        }}>
          <FiShield size={16} color="var(--success)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--success)' }}>
            Restricted Access — Administrators Only
          </span>
        </div>

        {/* Quick fill hint */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1rem', padding: '0.6rem 0.85rem',
          background: filled ? 'var(--success-bg)' : 'var(--primary-ghost)',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${filled ? 'var(--success)' : 'var(--primary-lighter)'}`,
          transition: 'all 0.3s ease',
          flexWrap: 'wrap', gap: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1, minWidth: 150 }}>
            <FiZap size={14} color={filled ? 'var(--success)' : 'var(--primary)'} />
            <span style={{
              fontSize: '0.75rem', fontWeight: 600,
              color: filled ? 'var(--success)' : 'var(--primary)',
            }}>
              {filled ? '✓ Credentials filled!' : 'Press Tab in any field to auto-fill'}
            </span>
          </div>
          <button type="button" onClick={handleQuickFill} style={{
            padding: '0.3rem 0.7rem',
            background: filled ? 'var(--success)' : 'var(--primary)',
            color: 'white', border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.72rem', fontWeight: 700,
            cursor: 'pointer', transition: 'var(--transition)',
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            minHeight: 30, whiteSpace: 'nowrap',
          }}>
            <FiZap size={12} />
            {filled ? 'Filled ✓' : 'Quick Fill'}
          </button>
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Admin Email</label>
          <div style={{ position: 'relative' }}>
            <FiMail size={16} style={{
              position: 'absolute', left: '0.9rem', top: '50%',
              transform: 'translateY(-50%)',
              color: errors.email ? 'var(--danger)' : 'var(--text-muted)',
              pointerEvents: 'none',
            }} />
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange}
              onKeyDown={e => handleKeyDown(e, 'email')}
              placeholder="Press Tab to auto-fill →"
              className={`form-input ${errors.email ? 'error' : ''}`}
              autoComplete="off"
              style={{
                paddingLeft: '2.5rem',
                transition: 'all 0.3s ease',
                borderColor: filled ? 'var(--success)' : undefined,
                background: filled ? 'var(--success-bg)' : undefined,
              }}
            />
            {filled && form.email && (
              <span style={{
                position: 'absolute', right: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--success)',
                display: 'flex', animation: 'popIn 0.3s ease',
              }}>✓</span>
            )}
          </div>
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <FiLock size={16} style={{
              position: 'absolute', left: '0.9rem', top: '50%',
              transform: 'translateY(-50%)',
              color: errors.password ? 'var(--danger)' : 'var(--text-muted)',
              pointerEvents: 'none',
            }} />
            <input
              type={showPass ? 'text' : 'password'}
              name="password" value={form.password}
              onChange={handleChange}
              onKeyDown={e => handleKeyDown(e, 'password')}
              placeholder="Press Tab to auto-fill →"
              className={`form-input ${errors.password ? 'error' : ''}`}
              autoComplete="off"
              style={{
                paddingLeft: '2.5rem', paddingRight: '2.5rem',
                transition: 'all 0.3s ease',
                borderColor: filled ? 'var(--success)' : undefined,
                background: filled ? 'var(--success-bg)' : undefined,
              }}
            />
            <button type="button" onClick={() => setShowPass(p => !p)} tabIndex={-1}
              style={{
                position: 'absolute', right: '0.9rem', top: '50%',
                transform: 'translateY(-50%)', background: 'none',
                color: 'var(--text-muted)', display: 'flex',
                border: 'none', cursor: 'pointer',
              }}>
              {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        {/* Credentials preview */}
        {filled && (
          <div style={{
            background: 'var(--bg)', borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem', marginBottom: '1rem',
            border: '1px solid var(--border)',
            animation: 'slideDown 0.3s ease',
          }}>
            <p style={{
              fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
              marginBottom: '0.4rem', letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              🔑 AUTO-FILLED CREDENTIALS
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}>{form.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Password</span>
              <span style={{ fontWeight: 600, color: 'var(--primary)', fontFamily: 'monospace' }}>
                {showPass ? form.password : '•••'}
              </span>
            </div>
          </div>
        )}

        <AuthSubmitButton loading={loading} label="Sign In as Admin" icon={<FiShield size={16} />} />

        <AuthLinks links={[
          { label: 'Teacher?', to: '/teacher/login', text: 'Teacher Login' },
          { label: 'Student?', to: '/student/login', text: 'Student Login' },
        ]} />
      </form>

      <style>{`
        @keyframes popIn {
          0%{transform:translateY(-50%) scale(0);opacity:0}
          50%{transform:translateY(-50%) scale(1.3)}
          100%{transform:translateY(-50%) scale(1);opacity:1}
        }
        @keyframes slideDown {
          from{transform:translateY(-10px);opacity:0;max-height:0}
          to{transform:translateY(0);opacity:1;max-height:200px}
        }
        .form-input:focus{border-color:var(--primary-lighter)!important;background:var(--white)!important}
      `}</style>
    </AuthLayout>
  )
}