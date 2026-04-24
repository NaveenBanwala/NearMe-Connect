import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, ExternalLink, RefreshCw, Inbox } from 'lucide-react'
import clsx from 'clsx'
import ClusterStatsCard from '../components/ClusterStatsCard'
import ClusterPreviewMap from '../components/ClusterPreviewMap'
import BoundaryDrawer    from '../components/BoundaryDrawer'
// import adminApi          from '../services/adminApi'


import { getFlaggedClusters, approveCluster, dismissCluster } from '../services/adminApi'

import { useNavigate } from 'react-router-dom'

// ============================================================
// ClusterReview.jsx
// Admin page — shows all activity clusters flagged for review.
// Replaces the old BlockRequests.jsx (vote-cluster flow).
//
// Layout per cluster card:
//   LEFT  — ClusterPreviewMap (small map blob preview)
//   MID   — ClusterStatsCard (users, requests, days, heat)
//   RIGHT — Action buttons (Approve → opens drawer, Dismiss)
//
// On "Approve":
//   - Expands inline BoundaryDrawer pre-loaded with suggested boundary
//   - Admin names the block, picks category, confirms/reshapes boundary
//   - Submits POST /admin/blocks with sourceClusterId
//
// On "Dismiss":
//   - Calls DELETE /admin/clusters/:id
//   - Removes card from list
// ============================================================
const CATEGORIES = ['CAMPUS', 'LOCALITY', 'SOCIETY', 'MARKET', 'VILLAGE']

export default function ClusterReview() {
  const [clusters,      setClusters]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)
  const [expandedId,    setExpandedId]    = useState(null)  // cluster being approved
  const [dismissingId,  setDismissingId]  = useState(null)  // cluster being dismissed
  const [approvingId,   setApprovingId]   = useState(null)  // cluster being submitted

  // Per-cluster form state for the approval drawer
  const [formState, setFormState] = useState({})   // { [clusterId]: { blockName, category, boundary } }

  // -------------------------------------------------------
  // Fetch flagged clusters on mount
  // -------------------------------------------------------

  const navigate = useNavigate()


  useEffect(() => {
    fetchClusters()
  }, [])

  const fetchClusters = async () => {
    setLoading(true)
    setError(null)
    try {
     const data = await getFlaggedClusters()
      setClusters(data)
    } catch (e) {
      setError('Failed to load flagged clusters. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------
  // Expand / collapse approval drawer for a cluster
  // -------------------------------------------------------
const toggleExpand = (cluster) => {
  setExpandedId(prev => prev === cluster.clusterId ? null : cluster.clusterId)
  setFormState(prev => ({
    ...prev,
    [cluster.clusterId]: prev[cluster.clusterId] ?? {
      blockName: cluster.displayName !== 'Active Area' ? cluster.displayName : '',
      category:  cluster.suggestedCategory ?? 'LOCALITY',
      boundary:  null,
    },
  }))
}

  const updateForm = (clusterId, field, value) => {
    setFormState(prev => ({
      ...prev,
      [clusterId]: { ...prev[clusterId], [field]: value },
    }))
  }

  // -------------------------------------------------------
  // Approve — submit POST /admin/blocks
  // -------------------------------------------------------
const handleApprove = async (cluster) => {
  const form = formState[cluster.clusterId]
  if (!form?.blockName?.trim()) return

  setApprovingId(cluster.clusterId)
  try {
   // In handleApprove, replace the approveCluster call:
const result = await approveCluster({
  clusterId:       cluster.clusterId,        // ← was sourceClusterId
  name:            form.blockName.trim(),
  category:        form.category,
  boundaryGeoJson: form.boundary,            // ← no longer null
  centerLat:       cluster.centerLat,
  centerLng:       cluster.centerLng,
})
    setClusters(prev => prev.filter(c => c.clusterId !== cluster.clusterId))
    setExpandedId(null)

    // Go straight to Block Editor to draw the boundary
    const newBlockId = result?.data?.blockId ?? result?.blockId
    if (newBlockId) navigate(`/block-editor/${newBlockId}`)
  } catch (e) {
    alert('Failed to approve cluster. Please try again.')
  } finally {
    setApprovingId(null)
  }
}

  // -------------------------------------------------------
  // Dismiss — DELETE /admin/clusters/:id
  // -------------------------------------------------------
  const handleDismiss = async (clusterId, reason = '') => {
    if (!window.confirm('Dismiss this cluster? It will be removed from the map.')) return

    setDismissingId(clusterId)
    try {
     await dismissCluster(clusterId, reason)
      setClusters(prev => prev.filter(c => c.clusterId !== clusterId))
    } catch (e) {
      alert('Failed to dismiss cluster. Please try again.')
    } finally {
      setDismissingId(null)
    }
  }

  // -------------------------------------------------------
  // Loading state
  // -------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
        <RefreshCw size={16} className="animate-spin" />
        <span className="text-sm">Loading flagged clusters…</span>
      </div>
    )
  }

  // -------------------------------------------------------
  // Error state
  // -------------------------------------------------------
  if (error) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-red-400 text-sm">{error}</p>
        <button onClick={fetchClusters} className="btn-secondary text-xs">
          Retry
        </button>
      </div>
    )
  }

  // -------------------------------------------------------
  // Empty state
  // -------------------------------------------------------
  if (clusters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
        <Inbox size={32} className="opacity-30" />
        <p className="text-sm">No clusters pending review</p>
        <button
          onClick={fetchClusters}
          className="btn-secondary text-xs flex items-center gap-1.5"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>
    )
  }

  // -------------------------------------------------------
  // Main render
  // -------------------------------------------------------
  return (
    <div className="space-y-4">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-200">Cluster Review</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {clusters.length} area{clusters.length !== 1 ? 's' : ''} ready for review
          </p>
        </div>
        <button
          onClick={fetchClusters}
          className="btn-secondary text-xs flex items-center gap-1.5"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* Cluster cards */}
      {clusters.map(cluster => {
        const isExpanded  = expandedId   === cluster.clusterId
        const isDismissing = dismissingId === cluster.clusterId
        const isApproving  = approvingId  === cluster.clusterId
        const form         = formState[cluster.clusterId] ?? {}
        const canSubmit = form.blockName?.trim() && form.boundary

        return (
          <div
            key={cluster.clusterId}
            className="bg-base-800 border border-base-600 rounded-xl overflow-hidden"
          >
            {/* ── Top row: preview map + stats + actions ── */}
            <div className="flex gap-4 p-4">

              {/* Preview map */}
              <ClusterPreviewMap
                cluster={cluster}
                className="w-36 h-28 shrink-0 hidden sm:block"
              />

              {/* Stats */}
              <div className="flex-1 min-w-0">
                <ClusterStatsCard cluster={cluster} />
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 shrink-0 justify-start pt-0.5">
                <button
                 onClick={() => toggleExpand(cluster)}
                  className={clsx(
                    'flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-colors',
                    isExpanded
                      ? 'bg-green-800/50 text-green-300 border border-green-600/40'
                      : 'bg-green-900/40 text-green-400 border border-green-600/30 hover:bg-green-800/50'
                  )}
                >
                  <CheckCircle size={13} />
                  {isExpanded ? 'Cancel' : 'Approve'}
                </button>

                <button
                  onClick={() => handleDismiss(cluster.clusterId)}
                  disabled={isDismissing}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium
                             bg-red-900/30 text-red-400 border border-red-600/25
                             hover:bg-red-900/50 disabled:opacity-50 transition-colors"
                >
                  <XCircle size={13} />
                  {isDismissing ? 'Dismissing…' : 'Dismiss'}
                </button>
              </div>
            </div>

            {/* ── Approval drawer (expanded inline) ── */}
            {isExpanded && (
              <div className="border-t border-base-600 p-4 space-y-4 bg-base-750">

                <p className="text-xs text-slate-400">
                  Review the suggested boundary below. Accept it as-is or draw a custom one,
                  then fill in the block details and submit.
                </p>

                {/* Boundary drawer pre-loaded with cluster suggestion */}
                <BoundaryDrawer
                  cluster={cluster}
                  onSave={(points) => updateForm(cluster.clusterId, 'boundary', points)}
                />

                {/* Block details form */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">

                  {/* Block name */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">
                      Block name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={cluster.displayName !== 'Active Area'
                        ? cluster.displayName
                        : 'e.g. KIIT Gate 4 Area'
                      }
                      value={form.blockName ?? ''}
                      onChange={e => updateForm(cluster.clusterId, 'blockName', e.target.value)}
                      maxLength={100}
                      className="w-full bg-base-700 border border-base-500 rounded-lg px-3 py-2
                                 text-sm text-slate-200 placeholder-slate-600
                                 focus:outline-none focus:border-amber-500/60"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400 font-medium">
                      Category <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={form.category ?? 'LOCALITY'}
                      onChange={e => updateForm(cluster.clusterId, 'category', e.target.value)}
                      className="w-full bg-base-700 border border-base-500 rounded-lg px-3 py-2
                                 text-sm text-slate-200 focus:outline-none focus:border-amber-500/60"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Validation hints */}
                <div className="flex items-center gap-4 text-[11px]">
                  <span className={clsx(
                    form.blockName?.trim() ? 'text-green-400' : 'text-slate-600'
                  )}>
                    {form.blockName?.trim() ? '✓' : '○'} Block name
                  </span>
                  <span key="boundary-hint" className={clsx(
  form.boundary ? 'text-green-400' : 'text-slate-600'
)}>
  {form.boundary ? '✓' : '○'} Boundary drawn
</span>
                </div>

                {/* Submit button */}
                <button
                  onClick={() => handleApprove(cluster)}
                  disabled={!canSubmit || isApproving}
                  className={clsx(
                    'w-full py-2.5 rounded-lg text-sm font-semibold transition-colors',
                    canSubmit && !isApproving
                      ? 'bg-green-600 hover:bg-green-500 text-white'
                      : 'bg-base-600 text-slate-500 cursor-not-allowed'
                  )}
                >
                  {isApproving ? 'Creating block…' : 'Create Official Block'}
                </button>

              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}