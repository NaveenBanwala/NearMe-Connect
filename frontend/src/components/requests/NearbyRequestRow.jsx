import { REQUEST_TYPE_META } from '../../utils/constants.js'
import { formatRelativeTime } from '../../utils/formatters.js'
import { cn } from '../../utils/cn.js'

export function NearbyRequestRow({ request, onClick }) {
  const meta       = REQUEST_TYPE_META[request.type] || REQUEST_TYPE_META.help
  const visibility = request.visibility === 'public' ? 'Public' : 'Students'
  const author     = request.author_name || 'NearMe user'

  return (
    <button
      type="button" onClick={onClick}
      className="flex w-full gap-3 rounded-2xl border border-slate-100 dark:border-slate-700/60
                 bg-white dark:bg-slate-800 p-4 text-left shadow-sm
                 transition-all hover:shadow-md active:scale-[0.99] duration-150"
    >
      <div className={cn('h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-2xl', meta.color)}>
        {meta.emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{request.title}</h3>
          {request.author_verified !== false && (
            <span className="shrink-0 text-xs text-brand-500" title="Verified user">✓</span>
          )}
        </div>
        {request.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-snug mb-1.5">{request.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
          <span className="font-medium text-slate-600 dark:text-slate-300">{author}</span>
          <span>🕐 {formatRelativeTime(request.created_at)}</span>
          <span>👁 {visibility}</span>
        </div>
      </div>
    </button>
  )
}