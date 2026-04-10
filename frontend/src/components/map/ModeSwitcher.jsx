import { MAP_MODES } from '../../utils/constants.js'
import { useVerification } from '../../hooks/useVerification.js'
import { cn } from '../../utils/cn.js'

const MODES = [
  { key: MAP_MODES.CAMPUS,          label: 'My Campus', emoji: '🏫', desc: 'Your campus feed' },
  { key: MAP_MODES.NEARBY_CAMPUSES, label: 'Nearby',    emoji: '🗺️',  desc: 'All nearby campuses' },
  { key: MAP_MODES.RADIUS,          label: 'Radius',    emoji: '📍',  desc: 'Custom radius' },
]

/** variant: 'dark' (over map) | 'light' (on white bg) */
export function ModeSwitcher({ value, onChange, variant = 'dark' }) {
  const { isStudent } = useVerification()
  if (!isStudent) return null

  const dark = variant === 'dark'

  return (
    <div
      className={cn(
        'flex gap-1 rounded-2xl p-1',
        dark ? 'bg-black/40 backdrop-blur-sm' : 'bg-slate-100 dark:bg-slate-800'
      )}
      role="tablist"
      aria-label="Map mode"
    >
      {MODES.map((m) => {
        const active = value === m.key
        return (
          <button
            key={m.key} type="button" role="tab" aria-selected={active}
            title={m.desc}
            onClick={() => onChange?.(m.key)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200',
              active
                ? 'bg-brand-500 text-white shadow-sm'
                : dark
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            <span className="text-sm">{m.emoji}</span>
            <span className="hidden xs:inline">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}