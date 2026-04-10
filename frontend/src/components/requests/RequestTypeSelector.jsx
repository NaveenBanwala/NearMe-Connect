import { REQUEST_TYPES, REQUEST_TYPE_META } from '../../utils/constants.js'
import { cn } from '../../utils/cn.js'

export function RequestTypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2" role="group" aria-label="Request type">
      {REQUEST_TYPES.map((t) => {
        const meta   = REQUEST_TYPE_META[t]
        const active = value === t
        return (
          <button
            key={t} type="button"
            onClick={() => onChange(t)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 text-xs font-semibold transition-all duration-150',
              active
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:border-brand-300 dark:hover:border-brand-600'
            )}
          >
            <span className="text-2xl leading-none">{meta.emoji}</span>
            <span>{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}