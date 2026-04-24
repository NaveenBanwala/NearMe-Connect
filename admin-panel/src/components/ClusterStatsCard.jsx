import { Users, MapPin, Calendar, Flame, Clock } from 'lucide-react'
import clsx from 'clsx'

// ============================================================
// ClusterStatsCard.jsx
// Displays activity stats for a single cluster in the
// admin Cluster Review page.
//
// Shows:
//   - Unique user count
//   - Total request count
//   - Active days
//   - Heat score + heat level badge
//   - Time since flagged
//   - Cluster center coordinates
//
// Used by: ClusterReview.jsx
// ============================================================

// -------------------------------------------------------
// Heat badge config — mirrors frontend ClusterCard
// -------------------------------------------------------
const HEAT_BADGE = {
  cold:    { label: 'Cold',       bg: 'bg-blue-900/40',   text: 'text-blue-300',   border: 'border-blue-500/30'   },
  mild:    { label: 'Mild',       bg: 'bg-yellow-900/40', text: 'text-yellow-300', border: 'border-yellow-500/30' },
  warm:    { label: 'Warm',       bg: 'bg-orange-900/40', text: 'text-orange-300', border: 'border-orange-500/30' },
  hot:     { label: 'Hot',        bg: 'bg-red-900/40',    text: 'text-red-300',    border: 'border-red-500/30'    },
  on_fire: { label: 'On Fire 🔥', bg: 'bg-red-800/60',    text: 'text-red-200',    border: 'border-red-400/50'    },
}

// -------------------------------------------------------
// Threshold config — same values as ClusterPromotionService
// Used to show progress bars per stat
// -------------------------------------------------------
const THRESHOLDS = {
  CAMPUS:   { users: 20, requests: 10, days: 3 },
  LOCALITY: { users: 10, requests: 5,  days: 2 },
  SOCIETY:  { users: 8,  requests: 4,  days: 2 },
  MARKET:   { users: 6,  requests: 3,  days: 1 },
  VILLAGE:  { users: 5,  requests: 3,  days: 1 },
}

const clamp = (val, max) => Math.min((val / max) * 100, 100)

const timeAgo = (isoString) => {
  if (!isoString) return '—'
  const diff = Date.now() - new Date(isoString).getTime()
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 1)  return 'Less than 1 hour ago'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function ClusterStatsCard({ cluster }) {
  if (!cluster) return null

  const {
    displayName,
    centerLat,
    centerLng,
    radiusMeters,
    heatScore,
    heatLevel,
    uniqueUserCount,
    requestCount,
    activeDays,
    flaggedAt,
  } = cluster

  const badge      = HEAT_BADGE[heatLevel] ?? HEAT_BADGE.cold
  // Use lane thresholds as the base bar — most lenient, always visible
 const thresholds = THRESHOLDS[cluster.suggestedCategory] ?? THRESHOLDS.LOCALITY

  return (
    <div className="space-y-4">

      {/* ── Header: name + heat badge ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 leading-tight">
            {displayName}
          </h3>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
            {centerLat?.toFixed(4)}°N, {centerLng?.toFixed(4)}°E · ~{radiusMeters}m radius
          </p>
        </div>
        <span className={clsx(
          'shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full border',
          badge.bg, badge.text, badge.border
        )}>
          {badge.label}
        </span>
      </div>

      {/* ── Heat score ── */}
      <div className="flex items-center gap-2">
        <Flame size={13} className="text-orange-400 shrink-0" />
        <span className="text-xs text-slate-400">Heat score</span>
        <span className="ml-auto text-xs font-mono font-semibold text-orange-300">
          {heatScore?.toFixed(1)}
        </span>
      </div>

      {/* ── Activity stats with progress bars ── */}
      <div className="space-y-3">

        <StatBar
          icon={<Users size={12} className="text-blue-400" />}
          label="Unique users"
          value={uniqueUserCount}
          threshold={thresholds.users}
          color="bg-blue-500"
        />

        <StatBar
          icon={<MapPin size={12} className="text-green-400" />}
          label="Requests posted"
          value={requestCount}
          threshold={thresholds.requests}
          color="bg-green-500"
        />

        <StatBar
          icon={<Calendar size={12} className="text-purple-400" />}
          label="Active days"
          value={activeDays}
          threshold={thresholds.days}
          color="bg-purple-500"
        />

      </div>

      {/* ── Flagged at ── */}
      <div className="flex items-center gap-2 pt-1 border-t border-base-600">
        <Clock size={12} className="text-slate-500 shrink-0" />
        <span className="text-[11px] text-slate-500">
          Flagged {timeAgo(flaggedAt)}
        </span>
      </div>

    </div>
  )
}

// -------------------------------------------------------
// StatBar sub-component
// Shows value / threshold with a fill bar
// -------------------------------------------------------
function StatBar({ icon, label, value, threshold, color }) {
  const pct     = clamp(value, threshold)
  const reached = value >= threshold

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[11px] text-slate-400 flex-1">{label}</span>
        <span className={clsx(
          'text-[11px] font-mono font-semibold',
          reached ? 'text-green-400' : 'text-slate-300'
        )}>
          {value}
          <span className="text-slate-600 font-normal"> / {threshold}</span>
        </span>
        {reached && (
          <span className="text-[10px] text-green-400">✓</span>
        )}
      </div>
      {/* Progress bar */}
      <div className="h-1 bg-base-600 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}