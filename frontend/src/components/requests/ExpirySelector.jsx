import { useState } from 'react'
import { cn } from '../../utils/cn.js'

const OPTIONS = [
  { label:'15 min', ms: 15 * 60 * 1000 },
  { label:'1 hr',   ms: 60 * 60 * 1000 },
  { label:'3 hrs',  ms: 3 * 60 * 60 * 1000 },
]

export function ExpirySelector({ onSelectMs }) {
  const [selected, setSelected] = useState(OPTIONS[1].ms)

  const pick = (ms) => { setSelected(ms); onSelectMs(ms) }

  return (
    <div className="flex gap-2" role="group" aria-label="Expires in">
      {OPTIONS.map((o) => (
        <button
          key={o.label} type="button"
          onClick={() => pick(o.ms)}
          className={cn(
            'flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all',
            selected === o.ms
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-brand-300'
          )}
        >
          ⏱ {o.label}
        </button>
      ))}
    </div>
  )
}
