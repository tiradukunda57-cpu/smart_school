import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner fullPage />

  // Not logged in at all
  if (!user) return <Navigate to="/" replace />

  // Role check — if a specific role is required and user doesn't match
  if (role && user.role !== role) {
    // Redirect to correct dashboard based on actual role
    const dashboards = {
      admin:   '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
    }
    const target = dashboards[user.role] || '/'
    return <Navigate to={target} replace />
  }

  return children
}