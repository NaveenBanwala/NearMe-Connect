// ============================================================
// useClusterHeat.js
// Place at: src/hooks/useClusterHeat.js
// ============================================================

import { useEffect } from 'react'
import { useClusterStore } from '../store/clusterStore.js'

const HEAT_POLL_MS = 2 * 60 * 1000  // 2 minutes — matches backend scheduler

export function useClusterHeat(clusterId, enabled = true) {
  const refreshClusterHeat = useClusterStore((s) => s.refreshClusterHeat)
  const nearbyClusters     = useClusterStore((s) => s.nearbyClusters)

  const cluster  = nearbyClusters.find((c) => c.clusterId === clusterId)
  const heatScore = cluster?.heatScore ?? 0
  const heatLevel = cluster?.heatLevel ?? 'cold'

  useEffect(() => {
    if (!clusterId || !enabled) return
    refreshClusterHeat(clusterId)
    const interval = setInterval(() => refreshClusterHeat(clusterId), HEAT_POLL_MS)
    return () => clearInterval(interval)
  }, [clusterId, enabled])

  return { heatScore, heatLevel }
}