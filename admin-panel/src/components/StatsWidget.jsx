import clsx from 'clsx'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function StatsWidget({ label, value, sub, trend, trendValue, icon: Icon, accent = 'amber', className }) {
  const accents = {
    amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  icon: 'text-amber-400',  text: 'text-amber-400'  },
    blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: 'text-blue-400',   text: 'text-blue-400'   },
    green:  { bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: 'text-green-400',  text: 'text-green-400'  },
    red:    { bg: 'bg-red-500/10',    border: 'border-red-500/20',    icon: 'text-red-400',    text: 'text-red-400'    },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400', text: 'text-purple-400' },
  }
  const a = accents[accent] || accents.amber

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-500'

  return (
    <div className={clsx('card p-4 lg:p-5 animate-slide-in', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-mono uppercase tracking-wider text-slate-500">{label}</p>
        {Icon && (
          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center border', a.bg, a.border)}>
            <Icon size={15} className={a.icon} />
          </div>
        )}
      </div>

      <p className="stat-number mb-1">{value}</p>

      <div className="flex items-center justify-between mt-2">
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
        {trendValue && (
          <div className={clsx('flex items-center gap-1 text-xs font-mono', trendColor)}>
            <TrendIcon size={12} />
            {trendValue}
          </div>
        )}
      </div>
    </div>
  )
}