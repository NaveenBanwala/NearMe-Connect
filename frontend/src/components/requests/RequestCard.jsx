import { Link } from 'react-router-dom'
import { Pill } from '../shared/Pill.jsx'
import { REQUEST_TYPE_META } from '../../utils/constants.js'
import { formatRelativeTime } from '../../utils/formatters.js'
import { cn } from '../../utils/cn.js'

export function RequestCard({ request, to }) {
  const meta = REQUEST_TYPE_META[request.type] || REQUEST_TYPE_META.help

  return (
    <Link to={to}
      className="block rounded-2xl border border-slate-100 dark:border-slate-700/60
                 bg-white dark:bg-slate-800 p-4 shadow-sm transition-all
                 hover:shadow-md active:scale-[0.99] duration-150">
      <div className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0', meta.color)}>
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={cn('badge text-xs font-semibold capitalize', meta.color)}>{meta.label}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500">{formatRelativeTime(request.created_at)}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">{request.title}</h3>
          {request.description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{request.description}</p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Pill tone="neutral">{request.visibility === 'public' ? '🌐 Public' : '🔒 Students'}</Pill>
            {request.status !== 'open' && (
              <Pill tone={request.status === 'accepted' ? 'success' : 'neutral'} className="capitalize">
                {request.status}
              </Pill>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}