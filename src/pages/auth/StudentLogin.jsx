import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowLeft, FiLogIn } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import { ToastContext } from '../../context/ToastContext'
import { validate, validators } from '../../utils/validators'

export default function StudentLogin() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const { loading, execute } = useApi()
  const { addToast } = useContext(ToastContext)

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [showPass, setShowPass] = useState(false)

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: null }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const errs = validate(form, {
      email: [validators.required, validators.email],
      password: [validators.required],
    })
    if (Object.keys(errs).length) { setErrors(errs); return }

    await execute(() => login(form, 'student'), {
      onSuccess: () => {
        addToast('Welcome back! 👋', 'success')
        navigate('/student/dashboard')
      },
      onError: (msg) => addToast(msg, 'error'),
    })
  }

  return (
    <AuthLayout title="Student Login" subtitle="Sign in to your student account">
      <form onSubmit={handleSubmit}>
        <AuthInput
          label="Email Address" name="email" type="email"
          value={form.email} onChange={handleChange}
          icon={FiMail} error={errors.email} placeholder="your@email.com"
        />
        <AuthInput
          label="Password" name="password" type={showPass ? 'text' : 'password'}
          value={form.password} onChange={handleChange}
          icon={FiLock} error={errors.password} placeholder="••••••••"
          rightIcon={showPass ? FiEyeOff : FiEye}
          onRightIconClick={() => setShowPass(p => !p)}
        />
        <AuthSubmitButton loading={loading} label="Sign In" icon={<FiLogIn size={16} />} />
        <AuthLinks
          links={[
            { label: "Don't have an account?", to: '/student/register', text: 'Register here' },
            { label: 'Are you a teacher?', to: '/teacher/login', text: 'Teacher Login' },
          ]}
        />
      </form>
    </AuthLayout>
  )
}

// ══════════════════════════════════════════════════════════════
// SHARED AUTH COMPONENTS — Exported for use in other auth pages
// ══════════════════════════════════════════════════════════════

export function AuthLayout({ title, subtitle, children }) {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 40%, var(--secondary) 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: '10%', left: '5%',
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(255,255,255,0.04)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '8%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)',
        pointerEvents: 'none',
      }} />

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute', top: '1.5rem', left: '1.5rem',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.25)',
          color: 'white', borderRadius: 'var(--radius-md)',
          padding: '0.5rem 1rem', cursor: 'pointer',
          fontSize: '0.85rem', fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          backdropFilter: 'blur(8px)',
          transition: 'var(--transition)',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
      >
        <FiArrowLeft size={16} /> Home
      </button>

      <div style={{
        background: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem',
        width: '100%',
        maxWidth: 440,
        boxShadow: 'var(--shadow-xl)',
        animation: 'formSlideIn 0.4s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, background: 'var(--primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 4px 14px rgba(27,43,75,0.3)',
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '1.5rem' }}>E</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            {title}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.4rem' }}>
            {subtitle}
          </p>
        </div>
        {children}
      </div>

      <style>{`
        @keyframes formSlideIn {
          from { transform: translateY(20px) scale(0.98); opacity: 0 }
          to   { transform: translateY(0) scale(1); opacity: 1 }
        }
      `}</style>
    </div>
  )
}

export function AuthInput({
  label, name, type = 'text', value, onChange, icon: Icon,
  error, placeholder, rightIcon: RightIcon, onRightIconClick,
  preventPaste = false,
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon size={16} style={{
            position: 'absolute', left: '0.9rem', top: '50%',
            transform: 'translateY(-50%)',
            color: error ? 'var(--danger)' : 'var(--text-muted)',
            pointerEvents: 'none',
          }} />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={preventPaste ? 'new-password' : undefined}
          onPaste={preventPaste ? (e) => {
            e.preventDefault()
            return false
          } : undefined}
          onCopy={preventPaste ? (e) => {
            e.preventDefault()
            return false
          } : undefined}
          onCut={preventPaste ? (e) => {
            e.preventDefault()
            return false
          } : undefined}
          onDrop={preventPaste ? (e) => {
            e.preventDefault()
            return false
          } : undefined}
          className={`form-input ${error ? 'error' : ''}`}
          style={{
            paddingLeft: Icon ? '2.5rem' : '1rem',
            paddingRight: RightIcon ? '2.5rem' : '1rem',
            transition: 'var(--transition)',
          }}
        />
        {RightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            tabIndex={-1}
            style={{
              position: 'absolute', right: '0.9rem', top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', color: 'var(--text-muted)', display: 'flex',
              border: 'none', cursor: 'pointer',
            }}
          >
            <RightIcon size={16} />
          </button>
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
      {preventPaste && (
        <span style={{
          fontSize: '0.7rem', color: 'var(--text-light)',
          display: 'flex', alignItems: 'center', gap: '0.3rem',
          marginTop: '0.2rem',
        }}>
          🔒 Paste disabled — please type your password
        </span>
      )}
    </div>
  )
}

export function AuthSubmitButton({ loading, label, icon }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%',
        padding: '0.85rem',
        background: 'var(--primary)',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        fontWeight: 700, fontSize: '0.95rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.8 : 1,
        transition: 'var(--transition)',
        marginTop: '0.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        boxShadow: '0 4px 14px rgba(27,43,75,0.25)',
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--primary-light)' }}
      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--primary)' }}
    >
      {loading && <span style={{
        width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)',
        borderTop: '2px solid white', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        display: 'inline-block',
      }} />}
      {!loading && icon}
      {label}
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </button>
  )
}

export function AuthLinks({ links }) {
  return (
    <div style={{
      marginTop: '1.5rem',
      display: 'flex', flexDirection: 'column',
      gap: '0.6rem', alignItems: 'center',
    }}>
      {links.map(({ label, to, text }) => (
        <p key={to} style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {label}{' '}
          <Link
            to={to}
            style={{
              color: 'var(--primary)', fontWeight: 700,
              textDecoration: 'none', transition: 'var(--transition)',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--secondary)'}
            onMouseLeave={e => e.target.style.color = 'var(--primary)'}
          >
            {text}
          </Link>
        </p>
      ))}
    </div>
  )
}

// ── Multi-Step Form Components ────────────────────────────

export function StepIndicator({ steps, currentStep }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Progress bar */}
      <div style={{
        height: 4, background: 'var(--border)',
        borderRadius: 'var(--radius-full)',
        marginBottom: '1rem', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${((currentStep + 1) / steps.length) * 100}%`,
          background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Step dots */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '0.5rem',
        alignItems: 'center',
      }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: i <= currentStep ? 'var(--primary)' : 'var(--border)',
              color: i <= currentStep ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.72rem', fontWeight: 700,
              transition: 'all 0.3s ease',
              boxShadow: i === currentStep ? '0 2px 8px rgba(27,43,75,0.3)' : 'none',
              transform: i === currentStep ? 'scale(1.15)' : 'scale(1)',
            }}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: 30, height: 2,
                background: i < currentStep ? 'var(--primary)' : 'var(--border)',
                borderRadius: 1,
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Step label */}
      <p style={{
        textAlign: 'center', marginTop: '0.7rem',
        fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600,
      }}>
        Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
      </p>
    </div>
  )
}

export function StepContainer({ children, direction }) {
  return (
    <div style={{
      animation: direction === 'forward' ? 'stepForward 0.35s ease' : 'stepBackward 0.35s ease',
    }}>
      {children}
      <style>{`
        @keyframes stepForward {
          from { transform: translateX(40px); opacity: 0 }
          to   { transform: translateX(0); opacity: 1 }
        }
        @keyframes stepBackward {
          from { transform: translateX(-40px); opacity: 0 }
          to   { transform: translateX(0); opacity: 1 }
        }
      `}</style>
    </div>
  )
}

export function StepButtons({ currentStep, totalSteps, onBack, onNext, loading, submitLabel }) {
  const isLast = currentStep === totalSteps - 1

  return (
    <div style={{
      display: 'flex', gap: '0.75rem',
      marginTop: '1.25rem',
    }}>
      {currentStep > 0 && (
        <button
          type="button"
          onClick={onBack}
          style={{
            flex: 1, padding: '0.8rem',
            background: 'var(--bg)', color: 'var(--text-primary)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700, fontSize: '0.9rem',
            cursor: 'pointer', transition: 'var(--transition)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.4rem',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
        >
          ← Back
        </button>
      )}
      <button
        type={isLast ? 'submit' : 'button'}
        onClick={isLast ? undefined : onNext}
        disabled={loading}
        style={{
          flex: currentStep > 0 ? 2 : 1,
          padding: '0.8rem',
          background: isLast
            ? 'linear-gradient(135deg, var(--primary), var(--secondary))'
            : 'var(--primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontWeight: 700, fontSize: '0.9rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.8 : 1,
          transition: 'var(--transition)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 14px rgba(27,43,75,0.25)',
        }}
      >
        {loading && <span style={{
          width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)',
          borderTop: '2px solid white', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
          display: 'inline-block',
        }} />}
        {isLast ? (submitLabel || 'Create Account') : 'Continue →'}
      </button>
    </div>
  )
}