import { cn } from '../../utils/cn.js'

export function VoteProgressBar({ current = 0, threshold = 50 }) {
  const pct     = threshold ? Math.min(100, Math.round((current / threshold) * 100)) : 0
  const reached = pct >= 100
  const barColor= reached ? 'bg-green-500' : pct >= 75 ? 'bg-brand-500' : pct >= 40 ? 'bg-amber-500' : 'bg-slate-400'

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-600 dark:text-slate-300">{current} votes</span>
        <span className={cn(reached ? 'text-green-600 dark:text-green-400 font-bold' : 'text-slate-400')}>
          {reached ? '🎉 Threshold reached!' : `${threshold} needed`}
        </span>
      </div>
      <div
        role="progressbar" aria-valuemin={0} aria-valuemax={threshold} aria-valuenow={current}
        className="relative h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700"
      >
        <div
          className={cn('absolute inset-y-0 left-0 rounded-full transition-[width] duration-700', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-right text-slate-400 dark:text-slate-500">{pct}%</p>
    </div>
  )
}