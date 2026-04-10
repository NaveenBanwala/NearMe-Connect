import axios from 'axios'

const BASE = import.meta.env.DEV
  ? ''                                   // relative → Vite proxies /api/* → localhost:8082
  : import.meta.env.VITE_API_BASE_URL    // production → absolute URL

export const api = axios.create({
  baseURL: BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`
  else       delete api.defaults.headers.common.Authorization
}

// Auth endpoints that are allowed to return 401 without triggering logout
const AUTH_PATHS = ['/api/auth/send-otp', '/api/auth/verify-otp']

// Auto-logout on 401 — but NOT for auth endpoints themselves
// (a wrong OTP returns 401, that must NOT wipe session and reload the page)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const url    = error.config?.url ?? ''
    const status = error.response?.status

    const isAuthEndpoint = AUTH_PATHS.some((p) => url.includes(p))

    if (status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('nearme-auth')
      setAuthToken(null)
      window.location.replace('/login')
    }

    return Promise.reject(error)
  }
)

export function apiError(e) {
  return e?.response?.data?.message || e?.message || 'Something went wrong'
}