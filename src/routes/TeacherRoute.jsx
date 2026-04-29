import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function TeacherRoute({ children }) {
  const { user } = useAuth()
  if (!user || user.role !== 'teacher') return <Navigate to="/student/dashboard" replace />
  return children
}