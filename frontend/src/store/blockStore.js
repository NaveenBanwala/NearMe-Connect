import { create } from 'zustand'
import { fetchNearbyBlocks, fetchBlock } from '../services/blockService.js'
import { mockBlocks } from '../services/mockData.js'

export const useBlockStore = create((set, get) => ({
  // Seed with mock so the map isn't empty before API responds
  blocks:          mockBlocks(),
  selectedBlockId: null,
  searchQuery:     '',
  loading:         false,
  error:           null,

  setBlocks:          (blocks) => set({ blocks }),
  setSelectedBlockId: (id)     => set({ selectedBlockId: id }),
  setSearchQuery:     (q)      => set({ searchQuery: typeof q === 'string' ? q : '' }),
  clearSearchQuery:   ()       => set({ searchQuery: '' }),

  getBlockById: (id) => get().blocks.find((b) => b.block_id === id),

  upsertBlock: (block) =>
    set((s) => {
      const i = s.blocks.findIndex((b) => b.block_id === block.block_id)
      if (i === -1) return { blocks: [...s.blocks, block] }
      const next = [...s.blocks]
      next[i] = { ...next[i], ...block }
      return { blocks: next }
    }),

  loadNearbyBlocks: async (lat, lng, radius = 5000) => {
    set({ loading: true, error: null })
    try {
      const data = await fetchNearbyBlocks(lat, lng, radius)
      set({ blocks: data || [], loading: false })
    } catch (e) {
      set({ loading: false, error: e?.response?.data?.message || e.message })
    }
  },

  loadBlock: async (id) => {
    try {
      const data = await fetchBlock(id)
      get().upsertBlock(data)
      return data
    } catch { return null }
  },
}))