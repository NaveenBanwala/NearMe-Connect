import { REQUEST_VISIBILITIES } from '../../utils/constants.js'
import { useVerification } from '../../hooks/useVerification.js'
import { cn } from '../../utils/cn.js'

export function VisibilityToggle({ value, onChange }) {
  const { isStudent } = useVerification()

  if (!isStudent) return (
    <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3">
      🌐 Locals post publicly only.
    </p>
  )

  return (
    <div className="flex gap-2" role="group" aria-label="Visibility">
      {[
        { v: REQUEST_VISIBILITIES.STUDENTS, label:'🔒 Students Only' },
        { v: REQUEST_VISIBILITIES.PUBLIC,   label:'🌐 Public'        },
      ].map(({ v, label }) => (
        <button
          key={v} type="button"
          onClick={() => onChange(v)}
          className={cn(
            'flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all',
            value === v
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-brand-300'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}