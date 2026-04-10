import { create } from 'zustand'
import { mockRequests } from '../services/mockData.js'
import {
  fetchRequests as apiFetchRequests,
  createRequest as apiCreate,
  acceptRequest as apiAccept,
  closeRequest  as apiClose,
  deleteRequest as apiDelete,
} from '../services/requestService.js'

export const useRequestStore = create((set, get) => ({
  // Seed with mock data for offline dev
  requestsByBlock: { b1: mockRequests('b1'), b2: mockRequests('b2') },
  loading:         false,
  error:           null,

  setRequestsForBlock: (blockId, rows) =>
    set((s) => ({ requestsByBlock: { ...s.requestsByBlock, [blockId]: rows } })),

  addRequest: (blockId, request) =>
    set((s) => {
      const cur = s.requestsByBlock[blockId] || []
      return { requestsByBlock: { ...s.requestsByBlock, [blockId]: [request, ...cur] } }
    }),

  requestsForBlock: (blockId) => get().requestsByBlock[blockId] || [],

  getRequestById: (id) => {
    for (const list of Object.values(get().requestsByBlock)) {
      const found = list.find((r) => r.request_id === id)
      if (found) return found
    }
    return null
  },

  loadRequests: async (blockId, params = {}) => {
    set({ loading: true, error: null })
    try {
      const data = await apiFetchRequests({ blockId, ...params })
      set((s) => ({
        loading: false,
        requestsByBlock: { ...s.requestsByBlock, [blockId]: data || [] },
      }))
    } catch (e) {
      set({ loading: false, error: e?.response?.data?.message || e.message })
    }
  },

  createRequest: async (blockId, payload) => {
    const data = await apiCreate({ ...payload, block_id: blockId })
    get().addRequest(blockId, data)
    return data
  },

  acceptRequest: async (requestId) => {
    const data = await apiAccept(requestId)
    return data
  },

  closeRequest: async (requestId) => {
    await apiClose(requestId)
    set((s) => {
      const next = { ...s.requestsByBlock }
      for (const [blockId, list] of Object.entries(next)) {
        next[blockId] = list.map((r) =>
          r.request_id === requestId ? { ...r, status: 'closed' } : r
        )
      }
      return { requestsByBlock: next }
    })
  },

  deleteRequest: async (requestId) => {
    await apiDelete(requestId)
    set((s) => {
      const next = { ...s.requestsByBlock }
      for (const [blockId, list] of Object.entries(next)) {
        next[blockId] = list.filter((r) => r.request_id !== requestId)
      }
      return { requestsByBlock: next }
    })
  },
}))