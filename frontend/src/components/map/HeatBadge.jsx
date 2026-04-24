import { heatPresentation } from '../../utils/heatUtils.js'
import { cn } from '../../utils/cn.js'

const RING = ['', '', '', 'shadow-orange-500/40', 'shadow-rose-500/60 shadow-md']

export function HeatBadge({ score, className }) {
  const p = heatPresentation(score)
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tabular-nums tracking-wide',
      p.className,
      RING[p.level],
      className
    )}>
      <span aria-hidden className="text-sm leading-none">{p.emoji}</span>
      <span>{p.label}</span>
      {/* <span className="opacity-70">({Math.round(p.score)})</span> */}
    </span>
  )
}