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

// ── Vote clusters ────────────────────────────────────────────────
export const getVoteClusters     = ()       => api.get('/api/admin/vote-clusters')
export const approveVoteCluster = (clusterId, blockData) =>
  api.post('/api/admin/blocks', { clusterId, ...blockData })
export const rejectVoteCluster   = (id, d)  => api.delete(`/api/admin/vote-clusters/${id}`, { data: d })

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

export default api