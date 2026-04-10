import { api } from './api.js'

export async function fetchNearbyBlocks(lat, lng, radius = 5000) {
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

export async function submitBlockVote(payload) {
  // payload: { suggested_name, category, user_lat, user_lng }
  const { data } = await api.post('/api/blocks/vote', payload)
  return data
}

export async function fetchVoteStatus(clusterId) {
  const { data } = await api.get('/api/blocks/vote/status', { params: { clusterId } })
  return data
}

export async function fetchNearbyClusters(lat, lng) {
  const { data } = await api.get('/api/blocks/vote/nearby', { params: { lat, lng } })
  return data
}