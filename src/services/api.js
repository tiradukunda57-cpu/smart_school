import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('school_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear and redirect if token is actually invalid
      // Don't redirect during login attempts
      const isLoginRequest = error.config?.url?.includes('/login')
      const isRegisterRequest = error.config?.url?.includes('/register')

      if (!isLoginRequest && !isRegisterRequest) {
        localStorage.removeItem('school_token')
        localStorage.removeItem('school_user')
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api