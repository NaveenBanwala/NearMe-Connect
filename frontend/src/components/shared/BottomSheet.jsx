import { useEffect } from 'react'
import { cn } from '../../utils/cn.js'

export function BottomSheet({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog" aria-modal="true" aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'max-h-[88dvh] w-full max-w-lg rounded-t-3xl',
          'border-t border-slate-200 dark:border-slate-700',
          'bg-white dark:bg-slate-900 shadow-2xl',
          'pb-[env(safe-area-inset-bottom)] animate-slide-up'
        )}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-slate-200 dark:bg-slate-700" />
        {title && (
          <h2 className="px-5 pb-2 pt-4 text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
        )}
        <div className="max-h-[70dvh] overflow-y-auto px-5 pb-8 pt-2 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  )
}