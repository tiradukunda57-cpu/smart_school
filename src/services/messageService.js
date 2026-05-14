import api from './api'

export const messageService = {
  getConversations: ()           => api.get('/messages/conversations'),
  getUnreadCount:   ()           => api.get('/messages/unread/count'),
  getMessages:      (userId)     => api.get(`/messages/${userId}`),
  send:             (data)       => api.post('/messages', data),
  markRead:         (id)         => api.put(`/messages/${id}/read`),
}