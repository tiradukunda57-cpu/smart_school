import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiUser, FiMail, FiLock, FiPhone,
  FiEye, FiEyeOff, FiCalendar
} from 'react-icons/fi'
import { useApi } from '../../hooks/useApi'
import { ToastContext } from '../../context/ToastContext'
import { validate, validators } from '../../utils/validators'
import { authService } from '../../services/authService'
import {
  AuthLayout, AuthInput, AuthLinks,
  StepIndicator, StepContainer, StepButtons
} from './StudentLogin'

// Levels match DB CHECK constraint: level IN ('5','4','3')
const LEVELS = [
  { value: '5', label: 'Level 5 (Senior)'  },
  { value: '4', label: 'Level 4 (Intermediate)' },
  { value: '3', label: 'Level 3 (Junior)'  },
]

const STEPS = ['Personal Info', 'School Details', 'Security']

export default function StudentRegister() {
  const navigate = useNavigate()
  const { loading, execute } = useApi()
  const { addToast } = useContext(ToastContext)

  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState('forward')
  const [showPass, setShowPass] = useState(false)

  const [form, setForm] = useState({
    first_name:       '',
    last_name:        '',
    email:            '',
    password:         '',
    confirm_password: '',
    phone:            '',
    level:            '',   // ← matches DB column exactly ('5','4','3')
    date_of_birth:    '',
    address:          '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: null }))
  }

  const validateStep = (step) => {
    let rules = {}

    if (step === 0) {
      rules = {
        first_name: [validators.required, validators.minLength(2)],
        last_name:  [validators.required, validators.minLength(2)],
        email:      [validators.required, validators.email],
      }
    } else if (step === 1) {
      rules = {
        level: [validators.required],
      }
    } else if (step === 2) {
      rules = {
        password:         [validators.password],
        confirm_password: [validators.confirmPassword(form.password)],
      }
    }

    const errs = validate(form, rules)
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const goNext = () => {
    if (!validateStep(currentStep)) return
    setDirection('forward')
    setCurrentStep(p => Math.min(p + 1, STEPS.length - 1))
  }

  const goBack = () => {
    setDirection('backward')
    setCurrentStep(p => Math.max(p - 1, 0))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateStep(2)) return

    // Build payload matching backend schema exactly
    const payload = {
      first_name:    form.first_name.trim(),
      last_name:     form.last_name.trim(),
      email:         form.email.trim().toLowerCase(),
      password:      form.password,
      phone:         form.phone.trim()         || undefined,
      level:         form.level,                // '5', '4', or '3'
      date_of_birth: form.date_of_birth        || undefined,
      address:       form.address.trim()       || undefined,
    }

    await execute(() => authService.registerStudent(payload), {
      onSuccess: () => {
        addToast('Account created! Please log in. 🎉', 'success')
        navigate('/student/login')
      },
      onError: (msg) => addToast(msg, 'error'),
    })
  }

  return (
    <AuthLayout title="Student Registration" subtitle="Create your student account">
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <form onSubmit={handleSubmit}>

        {/* ── Step 0: Personal Info ── */}
        {currentStep === 0 && (
          <StepContainer direction={direction} key="step0">
            <AuthInput
              label="First Name *"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              icon={FiUser}
              error={errors.first_name}
              placeholder="John"
            />
            <AuthInput
              label="Last Name *"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              icon={FiUser}
              error={errors.last_name}
              placeholder="Doe"
            />
            <AuthInput
              label="Email Address *"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              icon={FiMail}
              error={errors.email}
              placeholder="your@email.com"
            />
          </StepContainer>
        )}

        {/* ── Step 1: School Details ── */}
        {currentStep === 1 && (
          <StepContainer direction={direction} key="step1">

            {/* Level select — matches DB CHECK constraint */}
            <div className="form-group">
              <label className="form-label">Level / Class *</label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className={`form-select ${errors.level ? 'error' : ''}`}
              >
                <option value="">Select your level</option>
                {LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              {errors.level && (
                <span className="form-error">{errors.level}</span>
              )}
            </div>

            <AuthInput
              label="Phone (optional)"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              icon={FiPhone}
              placeholder="+1 234 567 8900"
            />

            <AuthInput
              label="Date of Birth (optional)"
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={handleChange}
              icon={FiCalendar}
            />

            <div className="form-group">
              <label className="form-label">Address (optional)</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Your home address..."
                rows={2}
                style={{ minHeight: 70 }}
              />
            </div>
          </StepContainer>
        )}

        {/* ── Step 2: Security ── */}
        {currentStep === 2 && (
          <StepContainer direction={direction} key="step2">
            <AuthInput
              label="Password *"
              name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              icon={FiLock}
              error={errors.password}
              placeholder="Min. 6 characters"
              rightIcon={showPass ? FiEyeOff : FiEye}
              onRightIconClick={() => setShowPass(p => !p)}
            />

            <AuthInput
              label="Confirm Password *"
              name="confirm_password"
              type="password"
              value={form.confirm_password}
              onChange={handleChange}
              icon={FiLock}
              error={errors.confirm_password}
              placeholder="Type your password again"
              preventPaste={true}
            />

            {form.password && (
              <PasswordStrength password={form.password} />
            )}
          </StepContainer>
        )}

        <StepButtons
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onBack={goBack}
          onNext={goNext}
          loading={loading}
          submitLabel="Create Student Account"
        />
      </form>

      <AuthLinks
        links={[
          { label: 'Already have an account?', to: '/student/login',    text: 'Sign in' },
          { label: 'Are you a teacher?',        to: '/teacher/register', text: 'Teacher Registration' },
        ]}
      />
    </AuthLayout>
  )
}

// ── Password Strength Indicator ──────────────────────────────

export function PasswordStrength({ password }) {
  const getStrength = (pwd) => {
    let score = 0
    if (pwd.length >= 6) score++
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const strength = getStrength(password)
  const labels   = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors   = [
    'var(--danger)', 'var(--danger)',
    'var(--warning)', 'var(--secondary)', 'var(--success)',
  ]
  const label = labels[Math.min(strength, 4)] || 'Very Weak'
  const color = colors[Math.min(strength, 4)] || 'var(--danger)'
  const width = Math.max((strength / 5) * 100, 8)

  return (
    <div style={{ marginTop: '-0.5rem', marginBottom: '1rem' }}>
      <div style={{
        height: 4, background: 'var(--border)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden', marginBottom: '0.3rem',
      }}>
        <div style={{
          height: '100%', width: `${width}%`,
          background: color, borderRadius: 'var(--radius-full)',
          transition: 'all 0.4s ease',
        }} />
      </div>
      <p style={{ fontSize: '0.72rem', color, fontWeight: 600 }}>
        Password strength: {label}
      </p>
    </div>
  )
}