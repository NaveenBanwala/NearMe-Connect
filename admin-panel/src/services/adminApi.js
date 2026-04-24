import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('admin_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ── Stats ────────────────────────────────────────────────────────
export const getStats       = ()        => api.get('/api/admin/stats')
export const getLiveMetrics = ()        => api.get('/api/admin/metrics/live')

// ── Blocks ───────────────────────────────────────────────────────
export const getBlocks      = ()        => api.get('/api/admin/blocks')
export const createBlock    = (data)    => api.post('/api/admin/blocks', data)
export const updateBlock    = (id, d)   => api.put(`/api/admin/blocks/${id}`, d)
export const deleteBlock    = (id)      => api.delete(`/api/admin/blocks/${id}`)



// ── Users ────────────────────────────────────────────────────────
export const getUsers       = (params)  => api.get('/api/admin/users', { params })
export const banUser   = (id) => api.patch(`/api/admin/users/${id}/ban`)    // was api.post
export const unbanUser = (id) => api.patch(`/api/admin/users/${id}/unban`)  // was api.post
export const deleteUser     = (id)      => api.delete(`/api/admin/users/${id}`)

// ── Verification queue ───────────────────────────────────────────
export const getVerifyQueue = ()        => api.get('/api/admin/verification-queue')
export const approveVerify  = (userId)  => api.patch(`/api/admin/verify/${userId}`, { status: 'approved' })
export const rejectVerify   = (userId, reason) => api.patch(`/api/admin/verify/${userId}`, { status: 'rejected', reason })

// ── Reports ──────────────────────────────────────────────────────
export const getReports     = ()        => api.get('/api/admin/reports')
export const resolveReport  = (id)      => api.patch(`/api/admin/reports/${id}/resolve`)
export const dismissReport  = (id)      => api.patch(`/api/admin/reports/${id}/dismiss`)

// ── Thresholds ───────────────────────────────────────────────────
export const getThresholds  = ()        => api.get('/api/admin/thresholds')
export const updateThresholds = (data)  => api.put('/api/admin/thresholds', data)



// ── Clusters ──────────────────────────────────────────────────────

// Normalize snake_case API response → camelCase for frontend
const normalizeCluster = (c) => ({
  clusterId:         c.cluster_id,
  centerLat:         c.center_lat,
  centerLng:         c.center_lng,
  radiusMeters:      c.radius_meters,
  suggestedName:     c.suggested_name,
  suggestedCategory: c.suggested_category,
  uniqueUserCount:   c.unique_user_count,
  requestCount:      c.request_count,
  activeDays:        c.active_days,
  heatScore:         c.heat_score,
  heatLevel:         c.heat_level,
  status:            c.status,
  flaggedAt:         c.flagged_at,
  displayName:       c.suggested_name || 'Active Area',
})

export const getFlaggedClusters = () =>
  api.get('/api/admin/clusters/flagged').then(r => r.data.map(normalizeCluster))

// Send snake_case to match Jackson config
// export const approveCluster = (data) =>
//   api.post('/api/admin/blocks', {
//     cluster_id:        data.clusterId,
//     name:              data.name,
//     category:          data.category,
//     boundary_geo_json: data.boundaryGeoJson,  // array of {lat,lng} points
//     center_lat:        data.centerLat,
//     center_lng:        data.centerLng,
//   }).then(r => r.data)
export const approveCluster = (data) => {
  // Convert [{lat,lng},...] points → GeoJSON Polygon string that backend expects
  const points = data.boundaryGeoJson  // array from BoundaryDrawer
  const coords = points.map(p => [p.lng, p.lat])
  coords.push(coords[0])  // close the ring

  const geoJsonStr = JSON.stringify({
    type: 'Polygon',
    coordinates: [coords],
  })

  return api.post('/api/admin/blocks', {
    cluster_id:        data.clusterId,   // @NotNull field
    source_cluster_id: data.clusterId,   // @Nullable field — same value
    name:              data.name,
    category:          data.category,
    boundary_geo_json: geoJsonStr,       // String, not object
    center_lat:        data.centerLat,
    center_lng:        data.centerLng,
  }).then(r => r.data)
}

export const dismissCluster = (id, reason) =>
  api.delete(`/api/admin/clusters/${id}`, { data: { reason } }).then(r => r.data)
// ── Clusters (new) ────────────────────────────────────────────────
// export const getFlaggedClusters = ()            => api.get('/api/admin/clusters/flagged').then(r => r.data)
// export const approveCluster = (data) => api.post('/api/admin/blocks', data)
// export const dismissCluster     = (id, reason)  => api.delete(`/api/admin/clusters/${id}`, { data: { reason } }).then(r => r.data)

export default api