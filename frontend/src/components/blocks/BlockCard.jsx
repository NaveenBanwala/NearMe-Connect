import { Link } from 'react-router-dom'
import { HeatBadge } from '../map/HeatBadge.jsx'
import { formatDistanceKm } from '../../utils/formatters.js'
import { cn } from '../../utils/cn.js'

const CAT_EMOJI  = { campus:'🏫', locality:'📍', society:'🏘️', market:'🛒' }
const CAT_COLORS = {
  campus:   'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  locality: 'bg-blue-100   dark:bg-blue-900/30   text-blue-700   dark:text-blue-300',
  society:  'bg-green-100  dark:bg-green-900/30  text-green-700  dark:text-green-300',
  market:   'bg-amber-100  dark:bg-amber-900/30  text-amber-700  dark:text-amber-300',
}

export function BlockCard({ block, to, distanceKm }) {
  const cat = (block.category || 'locality').toLowerCase()
  return (
    <Link to={to}
      className="block rounded-2xl border border-slate-100 dark:border-slate-700/60
                 bg-white dark:bg-slate-800 p-4 shadow-sm transition-all
                 hover:shadow-md active:scale-[0.99] duration-150">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0', CAT_COLORS[cat] || CAT_COLORS.locality)}>
            {CAT_EMOJI[cat] || '📍'}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{block.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize mt-0.5">{block.category}</p>
          </div>
        </div>
        <HeatBadge score={block.heat_score} className="shrink-0 text-[10px] px-2 py-0.5" />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span aria-hidden>👥</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{block.live_user_count ?? 0}</span> live
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden>💬</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{block.open_request_count ?? 0}</span> requests
        </span>
        {distanceKm != null && (
          <span className="ml-auto text-slate-400 dark:text-slate-500">📏 {formatDistanceKm(distanceKm)}</span>
        )}
      </div>
    </Link>
  )
}