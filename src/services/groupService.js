import api from './api'

export const groupService = {
  getMyGroups:    ()           => api.get('/groups'),
  getById:        (id)         => api.get(`/groups/${id}`),
  create:         (data)       => api.post('/groups', data),
  getMessages:    (id)         => api.get(`/groups/${id}/messages`),
  sendMessage:    (id, data)   => api.post(`/groups/${id}/messages`, data),
  addMember:      (id, data)   => api.post(`/groups/${id}/members`, data),
  removeMember:   (id, userId) => api.delete(`/groups/${id}/members/${userId}`),
}