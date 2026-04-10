import { REQUEST_TYPES, REQUEST_TYPE_META } from '../../utils/constants.js'
import { cn } from '../../utils/cn.js'

const ALL = 'all'

export function RequestFilters({ type, onTypeChange }) {
  const tabs = [{ key: ALL, label: '📋 All', emoji: '' }, ...REQUEST_TYPES.map(t => ({
    key: t, label: REQUEST_TYPE_META[t].label, emoji: REQUEST_TYPE_META[t].emoji,
  }))]

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {tabs.map(({ key, label, emoji }) => (
        <button
          key={key} type="button"
          onClick={() => onTypeChange(key)}
          className={cn(
            'shrink-0 flex items-center gap-1 rounded-full px-3.5 py-2 text-xs font-semibold transition-all',
            type === key
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-brand-300 dark:hover:ring-brand-600'
          )}
        >
          {emoji && <span>{emoji}</span>}
          <span className={emoji ? '' : ''}>{label}</span>
        </button>
      ))}
    </div>
  )
}