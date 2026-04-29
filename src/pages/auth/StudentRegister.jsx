import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiCalendar, FiMapPin, FiBook } from 'react-icons/fi'
import { useApi } from '../../hooks/useApi'
import { ToastContext } from '../../context/ToastContext'
import { validate, validators } from '../../utils/validators'
import { authService } from '../../services/authService'
import {
  AuthLayout, AuthInput, AuthLinks,
  StepIndicator, StepContainer, StepButtons
} from './StudentLogin'

const grades = [
  'Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6',
  'Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'
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
    first_name: '', last_name: '', email: '',
    password: '', confirm_password: '',
    phone: '', grade: '', date_of_birth: '',
    address: ''
  })
  const [errors, setErrors] = useState({})

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setErrors(p => ({ ...p, [e.target.name]: null }))
  }

  // Step-based validation
  const validateStep = (step) => {
    let rules = {}
    if (step === 0) {
      rules = {
        first_name: [validators.required, validators.minLength(2)],
        last_name: [validators.required, validators.minLength(2)],
        email: [validators.required, validators.email],
      }
    } else if (step === 1) {
      rules = {
        grade: [validators.required],
      }
    } else if (step === 2) {
      rules = {
        password: [validators.password],
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

    await execute(() => authService.registerStudent(form), {
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

        {/* Step 1: Personal Info */}
        {currentStep === 0 && (
          <StepContainer direction={direction} key="step0">
            <AuthInput
              label="First Name" name="first_name" value={form.first_name}
              onChange={handleChange} icon={FiUser} error={errors.first_name}
              placeholder="John"
            />
            <AuthInput
              label="Last Name" name="last_name" value={form.last_name}
              onChange={handleChange} icon={FiUser} error={errors.last_name}
              placeholder="Doe"
            />
            <AuthInput
              label="Email Address" name="email" type="email" value={form.email}
              onChange={handleChange} icon={FiMail} error={errors.email}
              placeholder="john@student.com"
            />
          </StepContainer>
        )}

        {/* Step 2: School Details */}
        {currentStep === 1 && (
          <StepContainer direction={direction} key="step1">
            <div className="form-group">
              <label className="form-label">Grade / Class *</label>
              <select
                name="grade" value={form.grade} onChange={handleChange}
                className={`form-select ${errors.grade ? 'error' : ''}`}
              >
                <option value="">Select your grade</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.grade && <span className="form-error">{errors.grade}</span>}
            </div>
            <AuthInput
              label="Phone (optional)" name="phone" value={form.phone}
              onChange={handleChange} icon={FiPhone} placeholder="+250 7XX XXX XXX"
            />
            <AuthInput
              label="Date of Birth (optional)" name="date_of_birth" type="date"
              value={form.date_of_birth} onChange={handleChange} icon={FiCalendar}
            />
            <div className="form-group">
              <label className="form-label">Address (optional)</label>
              <textarea
                name="address" value={form.address} onChange={handleChange}
                className="form-textarea" placeholder="Your address..."
                rows={2} style={{ minHeight: 65 }}
              />
            </div>
          </StepContainer>
        )}

        {/* Step 3: Security */}
        {currentStep === 2 && (
          <StepContainer direction={direction} key="step2">
            <AuthInput
              label="Password" name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password} onChange={handleChange}
              icon={FiLock} error={errors.password}
              placeholder="Min. 6 characters"
              rightIcon={showPass ? FiEyeOff : FiEye}
              onRightIconClick={() => setShowPass(p => !p)}
            />
            <AuthInput
              label="Confirm Password" name="confirm_password"
              type="password"
              value={form.confirm_password} onChange={handleChange}
              icon={FiLock} error={errors.confirm_password}
              placeholder="Type your password again"
              preventPaste={true}
            />

            {/* Password strength indicator */}
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
          { label: 'Already have an account?', to: '/student/login', text: 'Sign in' },
          { label: 'Are you a teacher?', to: '/teacher/register', text: 'Teacher Registration' },
        ]}
      />
    </AuthLayout>
  )
}

// ── Password Strength Indicator ──────────────────────────

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
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['var(--danger)', 'var(--danger)', 'var(--warning)', 'var(--secondary)', 'var(--success)']

  const label = labels[Math.min(strength, 4)] || 'Very Weak'
  const color = colors[Math.min(strength, 4)] || 'var(--danger)'
  const width = Math.max((strength / 5) * 100, 10)

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