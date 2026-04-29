import api from './api'

export const attendanceService = {
  getAll: (params) => api.get('/attendance', { params }),
  getMyAttendance: (params) => api.get('/attendance/my', { params }),
  create: (data) => api.post('/attendance', data),
  update: (id, data) => api.put(`/attendance/${id}`, data),
  delete: (id) => api.delete(`/attendance/${id}`),
  getSummary: (studentId) => api.get(`/attendance/summary/${studentId}`),
  bulkCreate: (data) => api.post('/attendance/bulk', data),
}   