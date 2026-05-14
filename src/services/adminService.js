import api from './api'

export const adminService = {
  // Dashboard
  getStats:            ()            => api.get('/admin/stats'),

  // Users
  getAllUsers:          (params)      => api.get('/admin/users', { params }),
  toggleUserActive:    (id, data)    => api.put(`/admin/users/${id}/toggle`, data),
  changeUserPassword:  (id, data)    => api.put(`/admin/users/${id}/password`, data),
  viewUserPassword:    (id)          => api.get(`/admin/users/${id}/password`),

  // Teachers
  getAllTeachers:       (params)      => api.get('/admin/teachers', { params }),
  getPendingTeachers:  ()            => api.get('/admin/teachers/pending'),
  approveTeacher:      (id)          => api.put(`/admin/teachers/${id}/approve`),
  rejectTeacher:       (id, data)    => api.put(`/admin/teachers/${id}/reject`, data),
  suspendTeacher:      (id, data)    => api.put(`/admin/teachers/${id}/suspend`, data),

  // Recovery
  getRecoveryRequests: (params)      => api.get('/admin/recovery', { params }),
  handleRecovery:      (id, data)    => api.put(`/admin/recovery/${id}`, data),

  // Activity logs
  getActivityLogs:     (params)      => api.get('/admin/activity', { params }),

  // Reports
  getDailyReport:      (date)        => api.get(`/admin/reports/daily/${date || ''}`),
  archiveReport:       ()            => api.post('/admin/reports/archive'),
  getReportArchive:    (params)      => api.get('/admin/reports/archive', { params }),

  // Cleanup
  cleanupTeachers:     ()            => api.post('/admin/cleanup/teachers'),
}