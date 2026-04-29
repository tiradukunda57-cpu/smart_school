import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi'
import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import { ToastContext } from '../../context/ToastContext'
import { validate, validators } from '../../utils/validators'
import { AuthLayout, AuthInput, AuthSubmitButton, AuthLinks } from './StudentLogin'

export default function TeacherLogin() {
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

    await execute(() => login(form, 'teacher'), {
      onSuccess: () => {
        addToast('Welcome, Teacher! 🎓', 'success')
        navigate('/teacher/dashboard')
      },
      onError: (msg) => addToast(msg, 'error'),
    })
  }

  return (
    <AuthLayout title="Teacher Login" subtitle="Sign in to your teacher account">
      <form onSubmit={handleSubmit}>
        <AuthInput
          label="Email Address" name="email" type="email"
          value={form.email} onChange={handleChange}
          icon={FiMail} error={errors.email} placeholder="teacher@school.com"
        />
        <AuthInput
          label="Password" name="password" type={showPass ? 'text' : 'password'}
          value={form.password} onChange={handleChange}
          icon={FiLock} error={errors.password} placeholder="••••••••"
          rightIcon={showPass ? FiEyeOff : FiEye}
          onRightIconClick={() => setShowPass(p => !p)}
        />
        <AuthSubmitButton loading={loading} label="Sign In as Teacher" icon={<FiLogIn size={16} />} />
        <AuthLinks
          links={[
            { label: "Don't have an account?", to: '/teacher/register', text: 'Register here' },
            { label: 'Are you a student?', to: '/student/login', text: 'Student Login' },
          ]}
        />
      </form>
    </AuthLayout>
  )
}