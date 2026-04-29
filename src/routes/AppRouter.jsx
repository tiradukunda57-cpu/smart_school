import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Public pages
import LandingPage from '../pages/LandingPage'
import StudentLogin from '../pages/auth/StudentLogin'
import TeacherLogin from '../pages/auth/TeacherLogin'
import StudentRegister from '../pages/auth/StudentRegister'
import TeacherRegister from '../pages/auth/TeacherRegister'

// Teacher pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard'
import ManageStudents from '../pages/teacher/ManageStudents'
import Attendance from '../pages/teacher/Attendance'
import Assignments from '../pages/teacher/Assignments'
import Notes from '../pages/teacher/Notes'
import TeacherMessages from '../pages/teacher/Messages'
import TeacherProfile from '../pages/teacher/TeacherProfile'

// Student pages
import StudentDashboard from '../pages/student/StudentDashboard'
import MyAttendance from '../pages/student/MyAttendance'
import MyAssignments from '../pages/student/MyAssignments'
import MyNotes from '../pages/student/MyNotes'
import Teachers from '../pages/student/Teachers'
import ViewTeacherProfile from '../pages/student/TeacherProfile'
import StudentMessages from '../pages/student/Messages'

import ProtectedRoute from './ProtectedRoute'

function RedirectByRole() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  return <Navigate to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} replace />
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/teacher/login" element={<TeacherLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/teacher/register" element={<TeacherRegister />} />
      <Route path="/dashboard" element={<RedirectByRole />} />

      {/* Teacher Routes */}
      <Route path="/teacher/dashboard" element={
        <ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>
      }/>
      <Route path="/teacher/students" element={
        <ProtectedRoute role="teacher"><ManageStudents /></ProtectedRoute>
      }/>
      <Route path="/teacher/attendance" element={
        <ProtectedRoute role="teacher"><Attendance /></ProtectedRoute>
      }/>
      <Route path="/teacher/assignments" element={
        <ProtectedRoute role="teacher"><Assignments /></ProtectedRoute>
      }/>
      <Route path="/teacher/notes" element={
        <ProtectedRoute role="teacher"><Notes /></ProtectedRoute>
      }/>
      <Route path="/teacher/messages" element={
        <ProtectedRoute role="teacher"><TeacherMessages /></ProtectedRoute>
      }/>
      <Route path="/teacher/profile" element={
        <ProtectedRoute role="teacher"><TeacherProfile /></ProtectedRoute>
      }/>

      {/* Student Routes */}
      <Route path="/student/dashboard" element={
        <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
      }/>
      <Route path="/student/attendance" element={
        <ProtectedRoute role="student"><MyAttendance /></ProtectedRoute>
      }/>
      <Route path="/student/assignments" element={
        <ProtectedRoute role="student"><MyAssignments /></ProtectedRoute>
      }/>
      <Route path="/student/notes" element={
        <ProtectedRoute role="student"><MyNotes /></ProtectedRoute>
      }/>
      <Route path="/student/teachers" element={
        <ProtectedRoute role="student"><Teachers /></ProtectedRoute>
      }/>
      <Route path="/student/teachers/:id" element={
        <ProtectedRoute role="student"><ViewTeacherProfile /></ProtectedRoute>
      }/>
      <Route path="/student/messages" element={
        <ProtectedRoute role="student"><StudentMessages /></ProtectedRoute>
      }/>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}