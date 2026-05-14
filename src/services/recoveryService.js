import api from './api'

export const recoveryService = {
  submit:     (data)   => api.post('/recovery', data),
  getMyRequests: ()    => api.get('/recovery/my'),
}