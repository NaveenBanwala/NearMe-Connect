import { api } from './api.js'

export async function fetchUser(id) {
  const { data } = await api.get(`/api/users/${id}`)
  return data
}

export async function updateProfile(payload) {
  // payload: { name, email, fcm_token, profile_emoji }
  const { data } = await api.patch('/api/users/profile', payload)
  return data
}

export async function reportUser(userId, reason) {
  const { data } = await api.post('/api/users/report', { userId, reason })
  return data
}

export async function blockUser(userId) {
  const { data } = await api.post('/api/users/block', { userId })
  return data
}

export async function updateFcmToken(fcmToken) {
  const { data } = await api.patch('/api/users/profile', { fcm_token: fcmToken })
  return data
}