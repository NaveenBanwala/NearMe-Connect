// ============================================================
// ClusterOverlay.jsx  —  Web React
// Renders all active cluster blobs on the map and handles
// the detail sheet when a blob is clicked
//
// Usage — drop inside your existing <GoogleMap> in HomeMapScreen:
//
//   <GoogleMap ...>
//     {blocks.map(b => <BlockBoundary key={b.id} block={b} />)}
//     <ClusterOverlay onPostRequest={handlePostRequest} />
//   </GoogleMap>
//
//   Then render the sheet outside <GoogleMap>:
//   <ClusterSheet ... />   ← see bottom of this file
// ============================================================

import { useState } from 'react'
import useNearbyClusters from '../../hooks/useNearbyClusters'
import useClusterStore   from '../../store/clusterStore'
import ClusterBlob       from './ClusterBlob'
import ClusterCard       from './ClusterCard'

// ── ClusterOverlay ────────────────────────────────────────────
// Place this INSIDE <GoogleMap> — it renders Circle overlays
export function ClusterOverlay({ onBlobClick, mapCenter }) {
  const { nearbyClusters } = useNearbyClusters(mapCenter)
  const clusters = Array.isArray(nearbyClusters) ? nearbyClusters : []

  console.log('cluster[0]:', clusters[0])  // ← add this

  return (
    <>
      {clusters.map((cluster, index) => (
        <ClusterBlob
          key={cluster.clusterId ?? cluster.cluster_id ?? index}
          cluster={cluster}
          onPress={onBlobClick}
        />
      ))}
    </>
  )
}
// ── ClusterSheet ──────────────────────────────────────────────
// Place this OUTSIDE <GoogleMap> — it renders the bottom sheet UI
export function ClusterSheet({ onPostRequest }) {
  const { selectedCluster, loadingSelected, selectCluster, clearSelectedCluster } = useClusterStore()
  const [open, setOpen] = useState(false)

  // Called by parent when a blob is clicked
  // Parent should call: selectCluster(clusterId) then setSheetOpen(true)
  const handleClose = () => {
    setOpen(false)
    clearSelectedCluster()
  }

  if (!selectedCluster && !loadingSelected) return null

  return (
    // Fixed overlay
    <div
      className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none"
    >
      {/* Dim backdrop — only shown when sheet is open */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-md bg-white rounded-t-2xl px-5 pt-3 pb-8 pointer-events-auto z-10"
        style={{ animation: 'slideUp 0.22s ease-out', maxHeight: '75vh', overflowY: 'auto' }}
      >
        {/* Handle + close */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />
          <button
            onClick={handleClose}
            className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <ClusterCard
          clusterId={selectedCluster?.clusterId}
          onPostRequest={(clusterId) => {
            handleClose()
            onPostRequest?.(clusterId)
          }}
          onClose={handleClose}
        />
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── Default export: combined hook for HomeMapScreen ───────────
// Gives the map screen everything it needs in one import
//
// Usage in HomeMapScreen.jsx:
//
//   import useClusterOverlay from './components/clusters/ClusterOverlay'
//
//   const { onBlobClick, sheetVisible } = useClusterOverlay()
//
//   // Inside GoogleMap:
//   <ClusterOverlay onBlobClick={onBlobClick} />
//
//   // Outside GoogleMap:
//   <ClusterSheet onPostRequest={(cid) => navigate('/create-request', { state: { clusterId: cid } })} />

export default function useClusterOverlay() {
  const { selectCluster } = useClusterStore()
  const [sheetVisible, setSheetVisible] = useState(false)

  const onBlobClick = async (clusterId) => {
    await selectCluster(clusterId)
    setSheetVisible(true)
  }

  return { onBlobClick, sheetVisible, setSheetVisible }
}