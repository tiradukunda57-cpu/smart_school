import api from './api'

export const authService = {
  login: (credentials, role) =>
    api.post(`/auth/${role}/login`, credentials),

  registerStudent: (data) =>
    api.post('/auth/student/register', data),

  registerTeacher: (data) =>
    api.post('/auth/teacher/register', data),

  getProfile: () =>
    api.get('/auth/profile'),

  updateProfile: (data) =>
    api.put('/auth/profile', data),
}