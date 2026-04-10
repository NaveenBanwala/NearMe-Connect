import { useAuthStore } from '../../store/authStore.js'
import { cn } from '../../utils/cn.js'

export function ChatBubble({ message }) {
  const userId = useAuthStore((s) => s.user?.user_id || s.user?.id || 'me')
  const mine   = message.sender_id === userId || message.sender_id === 'me'
  const time   = message.sent_at
    ? new Date(message.sent_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
    : ''

  return (
    <div className={cn('flex flex-col gap-0.5 max-w-[82%]', mine ? 'ml-auto items-end' : 'items-start')}>
      <div className={cn(
        'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
        mine
          ? 'bg-brand-500 text-white rounded-br-md shadow-sm'
          : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-md shadow-sm',
        message.pending && 'opacity-60'
      )}>
        {message.message}
      </div>
      <div className={cn('flex items-center gap-1.5 px-1 text-[10px] text-slate-400 dark:text-slate-500', mine && 'flex-row-reverse')}>
        {time && <time>{time}</time>}
        {message.pending && <span>· sending</span>}
        {mine && !message.pending && <span className="text-brand-400">✓✓</span>}
      </div>
    </div>
  )
}