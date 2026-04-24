import { useState, useCallback, useRef } from 'react'
import { useNearbyClusters } from '../../hooks/useNearbyClusters.js'
import { useClusterStore }   from '../../store/clusterStore.js'
import ClusterBlob           from './ClusterBlob.jsx'
import ClusterCard           from './ClusterCard.jsx'

// ── ClusterOverlay ────────────────────────────────────────────
// Place INSIDE <MapView>
export function ClusterOverlay({ onBlobClick, mapCenter }) {
  const { nearbyClusters } = useNearbyClusters(mapCenter)
  const clusters = Array.isArray(nearbyClusters) ? nearbyClusters : []

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
// Place OUTSIDE <MapView>
export function ClusterSheet({ onPostRequest }) {
  const selectedCluster      = useClusterStore((s) => s.selectedCluster)
  const loadingSelected      = useClusterStore((s) => s.loadingSelected)
  const clearSelectedCluster = useClusterStore((s) => s.clearSelectedCluster)

  if (!selectedCluster && !loadingSelected) return null

  const handleClose = () => clearSelectedCluster()

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-md bg-white rounded-t-2xl px-5 pt-3 pb-8 z-10"
        style={{ animation: 'slideUp 0.22s ease-out', maxHeight: '75vh', overflowY: 'auto' }}
      >
        {/* Handle + close */}
        <div className="relative flex justify-center mb-4">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
          <button
            onClick={handleClose}
            className="absolute right-0 top-[-4px] text-gray-400 hover:text-gray-600 text-lg leading-none"
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

// ── Default export: hook for HomeMapScreen ────────────────────
export default function useClusterOverlay() {
  const selectCluster = useClusterStore((s) => s.selectCluster)

  const onBlobClick = useCallback(async (clusterId) => {
    await selectCluster(clusterId)
  }, [selectCluster])

  return { onBlobClick }
}