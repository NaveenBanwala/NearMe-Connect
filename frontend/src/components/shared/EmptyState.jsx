import { cn } from '../../utils/cn.js'

export function EmptyState({ title, description, action, emoji, className }) {
  return (
    <div className={cn(
      'rounded-2xl border border-dashed border-slate-200 dark:border-slate-700',
      'bg-white/80 dark:bg-slate-800/60 px-6 py-12 text-center',
      className
    )}>
      {emoji && <div className="text-4xl mb-3">{emoji}</div>}
      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      {description && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}