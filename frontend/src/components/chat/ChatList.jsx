import { useNavigate } from 'react-router-dom'
import { formatRelativeTime } from '../../utils/formatters.js'
import { cn } from '../../utils/cn.js'

export function ChatList({ items }) {
  const navigate = useNavigate()

  if (!items?.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="text-5xl mb-3">💬</div>
      <p className="font-semibold text-slate-700 dark:text-slate-300">No conversations yet</p>
      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Accept a request to start chatting</p>
    </div>
  )

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
      {items.map((item) => (
        <div key={item.request_id}
          onClick={() => navigate(item.to)}
          className="flex items-center gap-3 px-1 py-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100 dark:active:bg-slate-800"
        >
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600
                          flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-sm">
            💬
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-0.5">
              <p className={cn('text-sm font-semibold truncate', item.unread > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400')}>
                {item.title}
              </p>
              {item.timeAgo && (
                <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">{item.timeAgo}</span>
              )}
            </div>
            <p className={cn('text-xs truncate', item.unread > 0 ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400 dark:text-slate-500')}>
              {item.preview || 'Tap to open chat'}
            </p>
          </div>

          {item.unread > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px]
                             flex items-center justify-center font-bold flex-shrink-0">
              {item.unread > 9 ? '9+' : item.unread}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}