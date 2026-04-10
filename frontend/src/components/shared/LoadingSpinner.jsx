import { cn } from '../../utils/cn.js'

export function LoadingSpinner({ label = 'Loading', className }) {
  return (
    <div className={cn('inline-flex items-center justify-center gap-2', className)} role="status" aria-live="polite">
      <span className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 dark:border-slate-700 border-t-brand-500" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export function FullPageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-app">
      <LoadingSpinner label="Loading…" />
    </div>
  )
}