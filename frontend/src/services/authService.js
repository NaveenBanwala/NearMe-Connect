import { api } from './api.js'

// NOTE: No /api prefix here — api.js baseURL is '' in dev and Vite proxies
// /api/* → localhost:8082, where Spring's context-path=/api handles it.
// Adding /api here would result in /api/api/... which 404s.

export const sendOtp = (phone) =>
  api.post('/api/auth/send-otp', { phone })

export const verifyOtp = (phone, code) =>
  api.post('/api/auth/verify-otp', { phone, code })

export const getMe = () =>
  api.get('/api/auth/me').then(r => r.data)

export const uploadCollegeId = (formData) =>
  api.post('/api/auth/upload-college-id', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)

export const updateProfile = (data) =>
  api.patch('/api/users/profile', data).then(r => r.data)