import api from './api'

export const assignmentService = {
  getAll:   (params)    => api.get('/assignments', { params }),
  getById:  (id)        => api.get(`/assignments/${id}`),
  create:   (data)      => {
    // Use FormData for file uploads
    if (data instanceof FormData) {
      return api.post('/assignments', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }
    return api.post('/assignments', data)
  },
  update:   (id, data)  => api.put(`/assignments/${id}`, data),
  delete:   (id)        => api.delete(`/assignments/${id}`),
}