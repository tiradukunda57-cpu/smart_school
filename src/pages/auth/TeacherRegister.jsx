import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiPhone, FiBook, FiEye, FiEyeOff, FiAward } from 'react-icons/fi'
import { useApi } from '../../hooks/useApi'
import { ToastContext } from '../../context/ToastContext'
import { validate, validators } from '../../utils/validators'
import { authService } from '../../services/authService'
import {
  AuthLayout, AuthInput, AuthLinks,
  StepIndicator, StepContainer, StepButtons
} from './StudentLogin'
import { PasswordStrength } from './StudentRegister'

const subjects = [
  'Mathematics', 'English', 'Science', 'History', 'Geography',
  'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Arts',
  'Music', 'Physical Education', 'Economics', 'Other'
]

const STEPS = ['Personal Info', 'Professional', 'Security']

export default function TeacherRegister() {
  const navigate = useNavigate()
  const { loading, execute } = useApi()
  const { addToast } = useContext(ToastContext)

  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState('forward')
  const [showPass, setShowPass] = useState(false)

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    password: '', confirm_password: '',
    phone: '', subject: '', qualification: '', bio: ''
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
        last_name: [validators.required, validators.minLength(2)],
        email: [validators.required, validators.email],
      }
    } else if (step === 1) {
      rules = {
        subject: [validators.required],
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

    await execute(() => authService.registerTeacher(form), {
      onSuccess: () => {
        addToast('Teacher account created! Please log in. 🎉', 'success')
        navigate('/teacher/login')
      },
      onError: (msg) => addToast(msg, 'error'),
    })
  }

  return (
    <AuthLayout title="Teacher Registration" subtitle="Create your teacher account">
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <form onSubmit={handleSubmit}>

        {/* Step 1: Personal Info */}
        {currentStep === 0 && (
          <StepContainer direction={direction} key="step0">
            <AuthInput
              label="First Name" name="first_name" value={form.first_name}
              onChange={handleChange} icon={FiUser} error={errors.first_name}
              placeholder="Jane"
            />
            <AuthInput
              label="Last Name" name="last_name" value={form.last_name}
              onChange={handleChange} icon={FiUser} error={errors.last_name}
              placeholder="Smith"
            />
            <AuthInput
              label="Email Address" name="email" type="email" value={form.email}
              onChange={handleChange} icon={FiMail} error={errors.email}
              placeholder="teacher@school.com"
            />
          </StepContainer>
        )}

        {/* Step 2: Professional */}
        {currentStep === 1 && (
          <StepContainer direction={direction} key="step1">
            <div className="form-group">
              <label className="form-label">Main Subject *</label>
              <select
                name="subject" value={form.subject} onChange={handleChange}
                className={`form-select ${errors.subject ? 'error' : ''}`}
              >
                <option value="">Select your subject</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.subject && <span className="form-error">{errors.subject}</span>}
            </div>
            <AuthInput
              label="Qualification (optional)" name="qualification"
              value={form.qualification}
              onChange={handleChange} icon={FiAward}
              placeholder="e.g. M.Ed., B.Sc."
            />
            <AuthInput
              label="Phone (optional)" name="phone"
              value={form.phone}
              onChange={handleChange} icon={FiPhone}
              placeholder="+250 7XX XXX XXX"
            />
            <div className="form-group">
              <label className="form-label">Bio (optional)</label>
              <textarea
                name="bio" value={form.bio} onChange={handleChange}
                className="form-textarea"
                placeholder="Tell students about yourself..."
                rows={3} style={{ minHeight: 75 }}
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

            {form.password && (
              <PasswordStrength password={form.password} />
            )}

            {/* Summary preview */}
            <div style={{
              background: 'var(--bg)', borderRadius: 'var(--radius-md)',
              padding: '1rem', marginBottom: '0.5rem',
              border: '1px solid var(--border)',
            }}>
              <p style={{
                fontSize: '0.75rem', fontWeight: 700,
                color: 'var(--text-muted)', marginBottom: '0.5rem',
                letterSpacing: '0.06em',
              }}>
                ACCOUNT SUMMARY
              </p>
              {[
                { l: 'Name', v: `${form.first_name} ${form.last_name}`.trim() || '—' },
                { l: 'Email', v: form.email || '—' },
                { l: 'Subject', v: form.subject || '—' },
                { l: 'Qualification', v: form.qualification || '—' },
              ].map(({ l, v }) => (
                <div key={l} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.3rem 0', fontSize: '0.8rem',
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 600, maxWidth: '60%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</span>
                </div>
              ))}
            </div>
          </StepContainer>
        )}

        <StepButtons
          currentStep={currentStep}
          totalSteps={STEPS.length}
          onBack={goBack}
          onNext={goNext}
          loading={loading}
          submitLabel="Create Teacher Account"
        />
      </form>

      <AuthLinks
        links={[
          { label: 'Already have an account?', to: '/teacher/login', text: 'Sign in' },
          { label: 'Are you a student?', to: '/student/register', text: 'Student Registration' },
        ]}
      />
    </AuthLayout>
  )
}