import { api } from './api.js'

export async function fetchNearbyBlocks(lat, lng, radius = 50000) {
  const { data } = await api.get('/api/blocks/nearby', { params: { lat, lng, radius } })
  return data
}
export async function fetchNearbyCampusBlocks(lat, lng, radius = 10000) {
  const { data } = await api.get('/api/blocks/nearby/campus', { params: { lat, lng, radius } })
  return data
}
export async function searchBlocks(q) {
  const { data } = await api.get('/api/blocks/search', { params: { q } })
  return data
}
export async function fetchBlock(id) {
  const { data } = await api.get(`/api/blocks/${id}`)
  return data
}
export async function fetchBlockHeat(id) {
  const { data } = await api.get(`/api/blocks/${id}/heat`)
  return data
}
export async function fetchTopHotBlocks(limit = 10) {
  const { data } = await api.get('/api/heat/top', { params: { limit } })
  return data
}

export async function fetchAllBlocks() {
  const { data } = await api.get('/api/blocks')
  return Array.isArray(data) ? data : data?.content ?? data?.blocks ?? []
}