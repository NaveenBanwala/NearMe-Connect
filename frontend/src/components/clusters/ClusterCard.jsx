// ============================================================
// ClusterCard.jsx
// Place at: src/components/clusters/ClusterCard.jsx
// ============================================================

import { useState } from 'react'
import { useClusterStore }   from '../../store/clusterStore.js'
import NameSuggestionSheet   from './NameSuggestionSheet.jsx'

const HEAT_BADGE = {
  cold:    { label: 'Cold',       bg: '#E3F2FD', color: '#1565C0' },
  mild:    { label: 'Mild',       bg: '#FFF9C4', color: '#F57F17' },
  warm:    { label: 'Warm',       bg: '#FFE0B2', color: '#E65100' },
  hot:     { label: 'Hot',        bg: '#FFCCBC', color: '#BF360C' },
  on_fire: { label: 'On Fire 🔥', bg: '#FF8A65', color: '#FFFFFF' },
}

export default function ClusterCard({ clusterId, onPostRequest, onClose }) {
  const selectedCluster  = useClusterStore((s) => s.selectedCluster)
  const loadingSelected  = useClusterStore((s) => s.loadingSelected)
  const suggestName      = useClusterStore((s) => s.suggestName)

  const [showNameSheet, setShowNameSheet] = useState(false)
  const [nameSaving,    setNameSaving]    = useState(false)
  const [nameError,     setNameError]     = useState(null)

  if (loadingSelected) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading area info…</p>
      </div>
    )
  }

  if (!selectedCluster) return null

  const {
    displayName, heatScore, heatLevel,
    uniqueUserCount, requestCount, activeDays,
    acceptingRequests, suggestedName,
  } = selectedCluster

  const badge = HEAT_BADGE[heatLevel] ?? HEAT_BADGE.cold

  const handleNameSubmit = async (name) => {
    setNameSaving(true)
    setNameError(null)
    try {
      await suggestName(clusterId, name)
      setShowNameSheet(false)
    } catch {
      setNameError('Failed to save name. Please try again.')
    } finally {
      setNameSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 px-1">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: badge.bg, border: `1.5px solid ${badge.color}` }}
          />
          <h2 className="text-base font-bold text-gray-900 leading-tight">{displayName}</h2>
        </div>
        <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
          Unofficial Area
        </span>
      </div>

      {/* Heat badge */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-xl"
        style={{ backgroundColor: badge.bg }}
      >
        <span className="text-sm font-semibold" style={{ color: badge.color }}>
          {badge.label}
        </span>
        <span className="text-xs font-mono" style={{ color: badge.color, opacity: 0.8 }}>
          score {heatScore?.toFixed(1)}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <Stat emoji="👥" value={uniqueUserCount} label="users"    />
        <Stat emoji="📌" value={requestCount}    label="requests" />
        <Stat emoji="📅" value={activeDays}      label="days"     />
      </div>

      {/* Suggest name */}
      {!suggestedName && (
        <button
          onClick={() => setShowNameSheet(true)}
          className="w-full py-3 rounded-xl text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
        >
          💬 Suggest a name for this area
        </button>
      )}

      {/* Post request */}
      {acceptingRequests && (
        <button
          onClick={() => onPostRequest?.(clusterId)}
          className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors"
        >
          + Post a Request Here
        </button>
      )}

      {showNameSheet && (
        <NameSuggestionSheet
          visible={showNameSheet}
          saving={nameSaving}
          error={nameError}
          onSubmit={handleNameSubmit}
          onClose={() => { setShowNameSheet(false); setNameError(null) }}
        />
      )}
    </div>
  )
}

function Stat({ emoji, value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 bg-gray-50 rounded-xl py-2.5">
      <span className="text-lg">{emoji}</span>
      <span className="text-base font-bold text-gray-900">{value ?? 0}</span>
      <span className="text-[11px] text-gray-400">{label}</span>
    </div>
  )
}