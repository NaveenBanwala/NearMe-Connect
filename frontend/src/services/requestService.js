import { api } from './api.js'

export async function fetchRequests(params) {
  // params: { blockId, mode, type, page }
  const { data } = await api.get('/api/requests', { params })
  return data
}

export async function fetchRequestsInRadius(lat, lng, radius = 2000) {
  const { data } = await api.get('/api/requests/radius', { params: { lat, lng, radius } })
  return data
}

export async function fetchRequest(id) {
  const { data } = await api.get(`/api/requests/${id}`)
  return data
}

export async function createRequest(payload) {
  const { data } = await api.post('/api/requests', payload)
  return data
}

export async function acceptRequest(id) {
  const { data } = await api.post(`/api/requests/${id}/accept`)
  return data
}

export async function closeRequest(id) {
  const { data } = await api.patch(`/api/requests/${id}/close`)
  return data
}

export async function deleteRequest(id) {
  const { data } = await api.delete(`/api/requests/${id}`)
  return data
}