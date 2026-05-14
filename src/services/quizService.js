import api from './api'

export const quizService = {
  // ── Teacher (no approval required) ────────────────────────
  create:          (data)       => api.post('/quizzes', data),
  getMyQuizzes:    ()           => api.get('/quizzes/my'),
  getById:         (id)         => api.get(`/quizzes/${id}`),
  togglePublish:   (id, data)   => api.put(`/quizzes/${id}/publish`, data),
  delete:          (id)         => api.delete(`/quizzes/${id}`),
  getProgress:     (id)         => api.get(`/quizzes/${id}/progress`),
  getAnswerSheet:  (sessionId)  => api.get(`/quizzes/sessions/${sessionId}/answers`),

  // ── Student ────────────────────────────────────────────────
  getAvailable:    ()           => api.get('/quizzes/available'),
  start:           (id)         => api.post(`/quizzes/${id}/start`),
  answer:          (data)       => api.post('/quizzes/answer', data),
  submit:          (sessionId)  => api.put(`/quizzes/sessions/${sessionId}/submit`),
}