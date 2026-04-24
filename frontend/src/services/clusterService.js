import { api } from './api.js'   // ← confirm this line exists

function normalizeCluster(c) {
  if (!c) return null
  return {
    clusterId:     c.cluster_id     ?? c.clusterId,
    centerLat:     c.center_lat     ?? c.centerLat,
    centerLng:     c.center_lng     ?? c.centerLng,
    radiusMeters:  c.radius_meters  ?? c.radiusMeters,
    heatScore:     c.heat_score     ?? c.heatScore,
    heatLevel:     c.heat_level     ?? c.heatLevel,
    status:        c.status,
    suggestedName: c.suggested_name ?? c.suggestedName,
    uniqueUserCount: c.unique_user_count ?? c.uniqueUserCount,
    requestCount:  c.request_count  ?? c.requestCount,
    lastActiveAt:  c.last_active_at ?? c.lastActiveAt,
  }
}

export async function fetchNearbyClusters(lat, lng, radius = 3000) {
  const { data } = await api.get('/api/clusters/nearby', { params: { lat, lng, radius } })
  const arr = Array.isArray(data) ? data : data?.content ?? data?.clusters ?? []
  return arr.map(normalizeCluster)
}
export async function fetchClusterById(clusterId) {
  const { data } = await api.get(`/api/clusters/${clusterId}`)
  return normalizeCluster(data)
}

export async function fetchClusterHeat(clusterId) {
  const { data } = await api.get(`/api/clusters/${clusterId}/heat`)
  return data   // heat response only has heatScore/heatLevel — already camelCase from backend
}
export async function suggestClusterName(clusterId, suggestedName) {
  const { data } = await api.post(`/api/clusters/${clusterId}/suggest-name`, { suggestedName })
  return data
}
export async function pingLocation(lat, lng) {
  try {
    const { data } = await api.post('/api/clusters/ping', { lat, lng })
    return normalizeCluster(data)   // ← was missing this
  } catch (error) {
    console.warn('Location ping failed silently:', error?.message)
    return null
  }
}