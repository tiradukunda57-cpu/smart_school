import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiUser, FiMail, FiLock, FiPhone,
  FiBook, FiEye, FiEyeOff, FiAward
} from 'react-icons/fi'
import { useApi } from '../../hooks/useApi'
import { ToastContext } from '../../context/ToastContext'
import { validate, validators } from '../../utils/validators'
import { authService } from '../../services/authService'
import {
  AuthLayout, AuthInput, AuthLinks,
  StepIndicator, StepContainer, StepButtons
} from './StudentLogin'
import { PasswordStrength } from './StudentRegister'

const courses = [
  'Mathematics', 'English Language', 'Science',
  'History', 'Geography', 'Physics', 'Chemistry',
  'Biology', 'Computer Science', 'Arts & Design',
  'Music', 'Physical Education', 'Economics',
  'Accounting', 'Literature', 'French', 'Other',
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
    first_name:       '',
    last_name:        '',
    email:            '',
    password:         '',
    confirm_password: '',
    phone:            '',
    course:           '',   // ← matches DB column exactly
    qualification:    '',
    bio:              '',
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
        course: [validators.required],
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

    // Build payload — only fields the backend expects
    const payload = {
      first_name:    form.first_name.trim(),
      last_name:     form.last_name.trim(),
      email:         form.email.trim().toLowerCase(),
      password:      form.password,
      phone:         form.phone.trim() || undefined,
      course:        form.course.trim(),        // ← correct field name
      qualification: form.qualification.trim() || undefined,
      bio:           form.bio.trim() || undefined,
    }

    await execute(() => authService.registerTeacher(payload), {
      onSuccess: () => {
        addToast(
          'Teacher account created! Awaiting admin approval before you can access features. 🎓',
          'success',
          5000
        )
        navigate('/teacher/login')
      },
      onError: (msg) => addToast(msg, 'error'),
    })
  }

  return (
    <AuthLayout title="Teacher Registration" subtitle="Create your teacher account">
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
              placeholder="Jane"
            />
            <AuthInput
              label="Last Name *"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              icon={FiUser}
              error={errors.last_name}
              placeholder="Smith"
            />
            <AuthInput
              label="Email Address *"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              icon={FiMail}
              error={errors.email}
              placeholder="teacher@school.com"
            />
          </StepContainer>
        )}

        {/* ── Step 1: Professional ── */}
        {currentStep === 1 && (
          <StepContainer direction={direction} key="step1">

            {/* Course select — matches DB column "course" */}
            <div className="form-group">
              <label className="form-label">Course (Subject) *</label>
              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                className={`form-select ${errors.course ? 'error' : ''}`}
              >
                <option value="">Select your course</option>
                {courses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.course && (
                <span className="form-error">{errors.course}</span>
              )}
              <p style={{
                fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem',
              }}>
                ⚠️ Each course can only have one teacher. Choose carefully.
              </p>
            </div>

            <AuthInput
              label="Qualification (optional)"
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              icon={FiAward}
              placeholder="e.g. M.Ed., B.Sc., PhD"
            />

            <AuthInput
              label="Phone (optional)"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              icon={FiPhone}
              placeholder="+1 234 567 8900"
            />

            <div className="form-group">
              <label className="form-label">Bio (optional)</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Tell students about yourself and your teaching style..."
                rows={3}
                style={{ minHeight: 80 }}
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

            {/* Summary before submitting */}
            <div style={{
              background: 'var(--bg)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '0.5rem',
              border: '1px solid var(--border)',
            }}>
              <p style={{
                fontSize: '0.72rem', fontWeight: 700,
                color: 'var(--text-muted)', marginBottom: '0.6rem',
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                Account Summary
              </p>
              {[
                { l: 'Name',          v: `${form.first_name} ${form.last_name}`.trim() || '—' },
                { l: 'Email',         v: form.email || '—' },
                { l: 'Course',        v: form.course || '—' },
                { l: 'Qualification', v: form.qualification || '—' },
              ].map(({ l, v }) => (
                <div key={l} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.3rem 0', fontSize: '0.8rem',
                  borderBottom: '1px solid var(--border-light)',
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{l}</span>
                  <span style={{
                    color: 'var(--primary)', fontWeight: 600,
                    maxWidth: '60%', textAlign: 'right',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>

            {/* Pending approval notice */}
            <div style={{
              background: 'var(--warning-bg)',
              border: '1px solid var(--warning)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
            }}>
              <span style={{ flexShrink: 0, marginTop: '0.05rem' }}>⏳</span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                After registration, your account requires <strong>admin approval</strong> before
                you can access teaching features.
              </p>
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
          { label: 'Already have an account?', to: '/teacher/login',  text: 'Sign in' },
          { label: 'Are you a student?',        to: '/student/register', text: 'Student Registration' },
        ]}
      />
    </AuthLayout>
  )
}