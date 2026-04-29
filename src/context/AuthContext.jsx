import React, { createContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('school_user')
    const token = localStorage.getItem('school_token')
    if (stored && token) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('school_user')
        localStorage.removeItem('school_token')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (credentials, role) => {
    const data = await authService.login(credentials, role)
    localStorage.setItem('school_token', data.token)
    localStorage.setItem('school_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('school_token')
    localStorage.removeItem('school_user')
    setUser(null)
  }, [])

  const updateUser = useCallback((updatedUser) => {
    const merged = { ...user, ...updatedUser }
    localStorage.setItem('school_user', JSON.stringify(merged))
    setUser(merged)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}