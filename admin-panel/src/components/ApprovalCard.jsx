import { MapPin, Users, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'

const CATEGORY_COLORS = {
  campus:   'bg-purple-500/15 text-purple-400 border-purple-500/25',
  locality: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  society:  'bg-green-500/15 text-green-400 border-green-500/25',
  market:   'bg-amber-500/15 text-amber-400 border-amber-500/25',
}

export default function ApprovalCard({ cluster, onApprove, onReject, onView }) {
  const progress = Math.min((cluster.vote_count / cluster.threshold_required) * 100, 100)
  const catColor = CATEGORY_COLORS[cluster.category] || CATEGORY_COLORS.locality

  return (
    <div className="card-hover p-4 animate-slide-in">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-base-600 border border-base-500 flex items-center justify-center flex-shrink-0">
            <MapPin size={16} className="text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">{cluster.suggested_name}</p>
            <p className="text-slate-500 text-xs font-mono mt-0.5">
              {cluster.geo_lat?.toFixed(4)}, {cluster.geo_lng?.toFixed(4)}
            </p>
          </div>
        </div>
        <span className={clsx('badge border flex-shrink-0', catColor)}>
          {cluster.category}
        </span>
      </div>

      {/* Vote progress */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={11} />
            <span className="font-mono">{cluster.vote_count} / {cluster.threshold_required} votes</span>
          </div>
          <span className="text-xs font-mono text-amber-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-base-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 font-mono">
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {formatDistanceToNow(new Date(cluster.created_at), { addSuffix: true })}
        </span>
        <span className="text-base-500">·</span>
        <span>{cluster.unique_voters} unique voters</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => onApprove(cluster)} className="btn-success flex-1 justify-center">
          <CheckCircle size={14} />
          Approve
        </button>
        <button onClick={() => onReject(cluster)} className="btn-danger flex-1 justify-center">
          <XCircle size={14} />
          Reject
        </button>
        <button onClick={() => onView(cluster)} className="btn-secondary px-3">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}