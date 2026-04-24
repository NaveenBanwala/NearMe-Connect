// ============================================================
// clusterStore.js
// Place at: src/store/clusterStore.js
// Matches project pattern: authStore.js, blockStore.js etc.
// ============================================================

import { create } from 'zustand'
import {
  fetchNearbyClusters,
  fetchClusterById,
  fetchClusterHeat,
  suggestClusterName,
  pingLocation,
} from '../services/clusterService.js'

export const useClusterStore = create((set, get) => ({

  // ── State ──────────────────────────────────────────────────
  nearbyClusters:  [],
  currentCluster:  null,   // cluster user is physically inside (from ping)
  selectedCluster: null,   // cluster tapped on map

  loadingNearby:   false,
  loadingSelected: false,
  pinging:         false,
  error:           null,

  // ── Fetch nearby clusters ──────────────────────────────────
  fetchNearbyClusters: async (lat, lng, radius = 3000) => {
  set({ loadingNearby: true, error: null })
  // Replace the fetchNearbyClusters action's try block:
try {
  const result = await fetchNearbyClusters(lat, lng, radius)
  const clusters = Array.isArray(result) ? result : []   // ← simplified
  set({ nearbyClusters: clusters, loadingNearby: false })
} catch (e) {
    set({
      error: e?.response?.data?.message || 'Failed to load nearby clusters',
      loadingNearby: false,
    })
  }
},

  // ── Select a cluster (tap on blob) ────────────────────────
  selectCluster: async (clusterId) => {
    set({ loadingSelected: true, error: null })
    try {
      const cluster = await fetchClusterById(clusterId)
      set({ selectedCluster: cluster, loadingSelected: false })
    } catch (e) {
      set({
        error: e?.response?.data?.message || 'Failed to load cluster',
        loadingSelected: false,
      })
    }
  },

  clearSelectedCluster: () => set({ selectedCluster: null }),

  // ── Refresh heat for one cluster in the list ──────────────
  refreshClusterHeat: async (clusterId) => {
    try {
      const heat = await fetchClusterHeat(clusterId)
      set((state) => ({
        nearbyClusters: state.nearbyClusters.map((c) =>
          c.clusterId === clusterId
            ? { ...c, heatScore: heat.heatScore, heatLevel: heat.heatLevel }
            : c
        ),
        selectedCluster:
          state.selectedCluster?.clusterId === clusterId
            ? { ...state.selectedCluster, heatScore: heat.heatScore, heatLevel: heat.heatLevel }
            : state.selectedCluster,
      }))
    } catch {
      // Heat refresh is non-critical — fail silently
    }
  },

  // ── Silent location ping ───────────────────────────────────
  sendPing: async (lat, lng) => {
    set({ pinging: true })
    try {
      const cluster = await pingLocation(lat, lng)
      set((state) => {
        const exists = cluster
          ? state.nearbyClusters.some((c) => c.clusterId === cluster.clusterId)
          : true
        return {
          currentCluster:  cluster,
          pinging:         false,
          nearbyClusters:  cluster && !exists
            ? [...state.nearbyClusters, cluster]
            : state.nearbyClusters,
        }
      })
    } catch {
      set({ pinging: false })
    }
  },

  // ── Suggest a name ─────────────────────────────────────────
  suggestName: async (clusterId, name) => {
    const updated = await suggestClusterName(clusterId, name)
    set((state) => ({
      nearbyClusters: state.nearbyClusters.map((c) =>
        c.clusterId === clusterId ? updated : c
      ),
      selectedCluster:
        state.selectedCluster?.clusterId === clusterId
          ? updated
          : state.selectedCluster,
    }))
    return updated
  },

  clearError: () => set({ error: null }),
}))
// ============================================================
// REDUX TOOLKIT VERSION
// If your project uses Redux Toolkit instead of Zustand,
// replace this file with the following slice structure:
//
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { getNearbyClusters, ... } from '../services/clusterService';
//
// export const fetchNearbyClusters = createAsyncThunk(
//   'clusters/fetchNearby',
//   async ({ lat, lng, radius }) => {
//     return await getNearbyClusters(lat, lng, radius);
//   }
// );
//
// const clusterSlice = createSlice({
//   name: 'clusters',
//   initialState: {
//     nearbyClusters: [],
//     currentCluster: null,
//     selectedCluster: null,
//     loading: false,
//     error: null,
//   },
//   reducers: {
//     clearSelectedCluster: (state) => { state.selectedCluster = null; },
//     clearError: (state) => { state.error = null; },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchNearbyClusters.pending, (state) => { state.loading = true; })
//       .addCase(fetchNearbyClusters.fulfilled, (state, action) => {
//         state.nearbyClusters = action.payload;
//         state.loading = false;
//       })
//       .addCase(fetchNearbyClusters.rejected, (state, action) => {
//         state.error = action.error.message;
//         state.loading = false;
//       });
//   },
// });
//
// export const { clearSelectedCluster, clearError } = clusterSlice.actions;
// export default clusterSlice.reducer;
// ============================================================