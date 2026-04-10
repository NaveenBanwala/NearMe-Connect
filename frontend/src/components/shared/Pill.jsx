import { cn } from '../../utils/cn.js'

const TONES = {
  accent:  'border-brand-200  dark:border-brand-800  bg-brand-50  dark:bg-brand-900/40  text-brand-700  dark:text-brand-300',
  success: 'border-green-200  dark:border-green-800  bg-green-50  dark:bg-green-900/40  text-green-700  dark:text-green-300',
  danger:  'border-red-200    dark:border-red-800    bg-red-50    dark:bg-red-900/40    text-red-700    dark:text-red-300',
  warning: 'border-amber-200  dark:border-amber-800  bg-amber-50  dark:bg-amber-900/40  text-amber-700  dark:text-amber-300',
  neutral: 'border-slate-200  dark:border-slate-700  bg-slate-50  dark:bg-slate-800     text-slate-600  dark:text-slate-400',
}

export function Pill({ children, tone = 'neutral', className = '' }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
      TONES[tone] || TONES.neutral, className
    )}>
      {children}
    </span>
  )
}