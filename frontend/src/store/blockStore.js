import { create } from 'zustand'
// Update import line
import { fetchNearbyBlocks, fetchBlock, fetchBlockHeat, fetchAllBlocks } from '../services/blockService.js'

export const useBlockStore = create((set, get) => ({
  blocks:          [],          // ← removed mockBlocks()
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

  loadAllBlocks: async () => {
  set({ loading: true, error: null })
  try {
    const data = await fetchAllBlocks()
    set({ blocks: data, loading: false })
  } catch (e) {
    set({ loading: false, error: e?.response?.data?.message || e.message })
  }
},

loadBlock: async (id) => {
  try {
    const [blockData, heatData] = await Promise.allSettled([
      fetchBlock(id),
      fetchBlockHeat(id),
    ])
    const block = blockData.status === 'fulfilled' ? blockData.value : null
    const heat  = heatData.status  === 'fulfilled' ? heatData.value  : {}
    if (!block) return null
    // const merged = { ...block, ...heat }
    const merged = { ...block, ...(heat.heat ?? heat) }
    get().upsertBlock(merged)
    return merged
  } catch { return null }
},
}))