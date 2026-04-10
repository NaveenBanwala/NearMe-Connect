import { useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn.js'

export function BackButton({ to, label, className }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => to ? navigate(to) : navigate(-1)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-semibold',
        'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200',
        'hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95',
        className
      )}
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M15 19l-7-7 7-7" />
      </svg>
      {label || 'Back'}
    </button>
  )
}