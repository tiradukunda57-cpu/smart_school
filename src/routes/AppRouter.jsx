import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Public
import LandingPage from '../pages/LandingPage'
import StudentLogin from '../pages/auth/StudentLogin'
import TeacherLogin from '../pages/auth/TeacherLogin'
import AdminLogin from '../pages/auth/AdminLogin'
import StudentRegister from '../pages/auth/StudentRegister'
import TeacherRegister from '../pages/auth/TeacherRegister'

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard'
import ManageTeachers from '../pages/admin/ManageTeachers'
import ManageUsers from '../pages/admin/ManageUsers'
import ManageGroups from '../pages/admin/ManageGroups'
import ActivityLogs from '../pages/admin/ActivityLogs'
import Reports from '../pages/admin/Reports'
import RecoveryRequests from '../pages/admin/RecoveryRequests'

// Teacher
import TeacherDashboard from '../pages/teacher/TeacherDashboard'
import ManageStudents from '../pages/teacher/ManageStudents'
import Attendance from '../pages/teacher/Attendance'
import Assignments from '../pages/teacher/Assignments'
import Notes from '../pages/teacher/Notes'
import TeacherMessages from '../pages/teacher/Messages'
import TeacherProfile from '../pages/teacher/TeacherProfile'
import TeacherQuizzes from '../pages/teacher/Quizzes'
import QuizBuilder from '../pages/teacher/QuizBuilder'
import QuizProgress from '../pages/teacher/QuizProgress'

// Student
import StudentDashboard from '../pages/student/StudentDashboard'
import MyAttendance from '../pages/student/MyAttendance'
import MyAssignments from '../pages/student/MyAssignments'
import MyNotes from '../pages/student/MyNotes'
import Teachers from '../pages/student/Teachers'
import ViewTeacherProfile from '../pages/student/TeacherProfile'
import StudentMessages from '../pages/student/Messages'
import AvailableQuizzes from '../pages/student/AvailableQuizzes'
import TakeQuiz from '../pages/student/TakeQuiz'

// Shared
import GroupChat from '../pages/shared/GroupChat'
import GroupList from '../pages/shared/GroupList'

import ProtectedRoute from './ProtectedRoute'

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  const d = { admin: '/admin/dashboard', teacher: '/teacher/dashboard', student: '/student/dashboard' }
  return <Navigate to={d[user.role] || '/'} replace />
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/teacher/login" element={<TeacherLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/teacher/register" element={<TeacherRegister />} />
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/teachers" element={<ProtectedRoute role="admin"><ManageTeachers /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/groups" element={<ProtectedRoute role="admin"><ManageGroups /></ProtectedRoute>} />
      <Route path="/admin/activity" element={<ProtectedRoute role="admin"><ActivityLogs /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
      <Route path="/admin/recovery" element={<ProtectedRoute role="admin"><RecoveryRequests /></ProtectedRoute>} />

      {/* Teacher */}
      <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/students" element={<ProtectedRoute role="teacher"><ManageStudents /></ProtectedRoute>} />
      <Route path="/teacher/attendance" element={<ProtectedRoute role="teacher"><Attendance /></ProtectedRoute>} />
      <Route path="/teacher/assignments" element={<ProtectedRoute role="teacher"><Assignments /></ProtectedRoute>} />
      <Route path="/teacher/notes" element={<ProtectedRoute role="teacher"><Notes /></ProtectedRoute>} />
      <Route path="/teacher/messages" element={<ProtectedRoute role="teacher"><TeacherMessages /></ProtectedRoute>} />
      <Route path="/teacher/profile" element={<ProtectedRoute role="teacher"><TeacherProfile /></ProtectedRoute>} />
      <Route path="/teacher/quizzes" element={<ProtectedRoute role="teacher"><TeacherQuizzes /></ProtectedRoute>} />
      <Route path="/teacher/quizzes/new" element={<ProtectedRoute role="teacher"><QuizBuilder /></ProtectedRoute>} />
      <Route path="/teacher/quizzes/:id/progress" element={<ProtectedRoute role="teacher"><QuizProgress /></ProtectedRoute>} />

      {/* Student */}
      <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute role="student"><MyAttendance /></ProtectedRoute>} />
      <Route path="/student/assignments" element={<ProtectedRoute role="student"><MyAssignments /></ProtectedRoute>} />
      <Route path="/student/notes" element={<ProtectedRoute role="student"><MyNotes /></ProtectedRoute>} />
      <Route path="/student/teachers" element={<ProtectedRoute role="student"><Teachers /></ProtectedRoute>} />
      <Route path="/student/teachers/:id" element={<ProtectedRoute role="student"><ViewTeacherProfile /></ProtectedRoute>} />
      <Route path="/student/messages" element={<ProtectedRoute role="student"><StudentMessages /></ProtectedRoute>} />
      <Route path="/student/quizzes" element={<ProtectedRoute role="student"><AvailableQuizzes /></ProtectedRoute>} />
      <Route path="/student/quizzes/:id/take" element={<ProtectedRoute role="student"><TakeQuiz /></ProtectedRoute>} />

      {/* Shared */}
      <Route path="/groups" element={<ProtectedRoute><GroupList /></ProtectedRoute>} />
      <Route path="/groups/:id" element={<ProtectedRoute><GroupChat /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}