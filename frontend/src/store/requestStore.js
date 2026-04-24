import { create } from 'zustand'
import { mockRequests } from '../services/mockData.js'
import {
  fetchRequests     as apiFetchRequests,
  createRequest     as apiCreate,
  acceptRequest     as apiAccept,
  closeRequest      as apiClose,
  deleteRequest     as apiDelete,
  fetchRequestsInRadius as apiFetchInRadius,
} from '../services/requestService.js'

export const useRequestStore = create((set, get) => ({
  // Block-keyed requests (existing)
  requestsByBlock: { b1: mockRequests('b1'), b2: mockRequests('b2') },

  // ── Free-pin requests (no block, no cluster) ──────────────────
  freePinRequests: [],

  // Nearby radius results (shown on HomeMapScreen)
  nearbyRequests:  [],

  loading: false,
  error:   null,

  // ── Block helpers ─────────────────────────────────────────────
  setRequestsForBlock: (blockId, rows) =>
    set((s) => ({ requestsByBlock: { ...s.requestsByBlock, [blockId]: rows } })),

  addRequest: (blockId, request) =>
    set((s) => {
      const cur = s.requestsByBlock[blockId] || []
      return { requestsByBlock: { ...s.requestsByBlock, [blockId]: [request, ...cur] } }
    }),

  requestsForBlock: (blockId) => get().requestsByBlock[blockId] || [],

  // ── Free-pin helpers ──────────────────────────────────────────
  addFreePinRequest: (request) =>
    set((s) => ({ freePinRequests: [request, ...s.freePinRequests] })),

  // ── Universal lookup (block + free-pin) ───────────────────────
  getRequestById: (id) => {
    for (const list of Object.values(get().requestsByBlock)) {
      const found = list.find((r) => r.request_id === id)
      if (found) return found
    }
    return get().freePinRequests.find((r) => r.request_id === id) ?? null
  },

  // ── Load by block ─────────────────────────────────────────────
  loadRequests: async (blockId, params = {}) => {
  set({ loading: true, error: null })
  try {
    // const raw = await apiFetchRequests({ block_id: blockId, ...params })
    const { mode, ...apiParams } = params
// revert to camelCase for query param:
const raw = await apiFetchRequests({ blockId: blockId, ...apiParams })
    const data = Array.isArray(raw) ? raw : (raw?.content ?? [])  // ← handles both
    set((s) => ({
      loading: false,
      requestsByBlock: { ...s.requestsByBlock, [blockId]: data },
    }))
  } catch (e) {
    set({ loading: false, error: e?.response?.data?.message || e.message })
  }
},
  // loadRequests: async (blockId, params = {}) => {
  //   set({ loading: true, error: null })
  //   try {
  //     // const data = await apiFetchRequests({ blockId, ...params })
  //     const data = await apiFetchRequests({ block_id: blockId, ...params })
  //     set((s) => ({
  //       loading: false,
  //       requestsByBlock: { ...s.requestsByBlock, [blockId]: data || [] },
  //     }))
  //   } catch (e) {
  //     set({ loading: false, error: e?.response?.data?.message || e.message })
  //   }
  // },

  // ── Load nearby (radius) for HomeMapScreen ────────────────────
  loadNearbyRequests: async (lat, lng, radius = 2000) => {
    try {
      const data = await apiFetchInRadius(lat, lng, radius)
        if (data && data.length > 0) {       // ← only update if server returned results
      set({ nearbyRequests: data })
    }
    } catch {
      // non-critical, fail silently
    }
  },

  // ── Create — handles block, cluster, or free-pin ──────────────
  // payload should contain ONE of: block_id | cluster_id | { lat, lng }
// createRequest: async (payload) => {
//   const data = await apiCreate(payload)
//   if (payload.blockId) {
//     get().addRequest(payload.blockId, data)
//   } else if (payload.clusterId) {
//     set((s) => ({ nearbyRequests: [data, ...s.nearbyRequests] }))
//   } else {
//     get().addFreePinRequest(data)
//     set((s) => ({ nearbyRequests: [data, ...s.nearbyRequests] }))
//   }
//   return data
// },
// replace createRequest:
createRequest: async (payload) => {
  const data = await apiCreate(payload)
  const bid = payload.block_id ?? payload.blockId   // handles both cases
  if (bid) {
    get().addRequest(bid, data)
    await get().loadRequests(bid)
  } else if (payload.cluster_id ?? payload.clusterId) {
    set((s) => ({ nearbyRequests: [data, ...s.nearbyRequests] }))
  } else {
    get().addFreePinRequest(data)
    set((s) => ({ nearbyRequests: [data, ...s.nearbyRequests] }))
  }
  return data
},
// createRequest: async (payload) => {
//   const data = await apiCreate(payload)
//   if (payload.blockId) {
//     get().addRequest(payload.blockId, data)
//     // also reload so list is fresh from backend
//     await get().loadRequests(payload.blockId)
//   } else if (payload.clusterId) {
//     set((s) => ({ nearbyRequests: [data, ...s.nearbyRequests] }))
//   } else {
//     get().addFreePinRequest(data)
//     set((s) => ({ nearbyRequests: [data, ...s.nearbyRequests] }))
//   }
//   return data
// },

  acceptRequest: async (requestId) => apiAccept(requestId),

  closeRequest: async (requestId) => {
    await apiClose(requestId)
    set((s) => {
      const nextByBlock = { ...s.requestsByBlock }
      for (const [id, list] of Object.entries(nextByBlock)) {
        nextByBlock[id] = list.map((r) =>
          r.request_id === requestId ? { ...r, status: 'closed' } : r
        )
      }
      return {
        requestsByBlock: nextByBlock,
        freePinRequests: s.freePinRequests.map((r) =>
          r.request_id === requestId ? { ...r, status: 'closed' } : r
        ),
        nearbyRequests: s.nearbyRequests.map((r) =>
          r.request_id === requestId ? { ...r, status: 'closed' } : r
        ),
      }
    })
  },

  deleteRequest: async (requestId) => {
    await apiDelete(requestId)
    set((s) => {
      const nextByBlock = { ...s.requestsByBlock }
      for (const [id, list] of Object.entries(nextByBlock)) {
        nextByBlock[id] = list.filter((r) => r.request_id !== requestId)
      }
      return {
        requestsByBlock: nextByBlock,
        freePinRequests: s.freePinRequests.filter((r) => r.request_id !== requestId),
        nearbyRequests:  s.nearbyRequests.filter((r)  => r.request_id !== requestId),
      }
    })
  },
}))