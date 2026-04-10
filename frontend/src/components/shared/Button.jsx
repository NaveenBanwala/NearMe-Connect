import { cn } from '../../utils/cn.js'

const VARIANTS = {
  primary:   'bg-brand-500 text-white shadow-md hover:bg-brand-600 active:scale-[0.98] disabled:opacity-50 focus-visible:ring-brand-400',
  secondary: 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700',
  ghost:     'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200',
  danger:    'bg-red-500 text-white hover:bg-red-600 active:scale-[0.98] disabled:opacity-50',
}

export function Button({ children, variant = 'primary', className = '', type = 'button', disabled, onClick, ...rest }) {
  return (
    <button
      type={type} disabled={disabled} onClick={onClick}
      className={cn(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5',
        'text-sm font-semibold transition-all duration-150 disabled:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-2',
        VARIANTS[variant] || VARIANTS.primary,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  )
}