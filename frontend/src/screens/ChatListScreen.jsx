import { useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { useChatStore } from '../store/chatStore.js'
import { useRequestStore } from '../store/requestStore.js'
import { useAuthStore } from '../store/authStore.js'
import { formatRelativeTime } from '../utils/helpers.js'
import { EmptyState } from '../components/shared/EmptyState.jsx'
import { ROUTES } from '../navigation/routes.js'

export function ChatListScreen() {
  const threads     = useChatStore((s) => s.threads)
  const getRequest  = useRequestStore((s) => s.getRequestById)
  const userId      = useAuthStore((s) => s.user?.user_id)
  const navigate    = useNavigate()

  const items = Object.entries(threads).map(([requestId, msgs]) => {
    const req  = getRequest(requestId)
    const last = msgs.length ? msgs[msgs.length - 1] : null
    const unread = msgs.filter(m => m.sender_id !== userId && !m.read).length
    return { requestId, title: req?.title || `Request #${requestId.slice(-4)}`, last, unread }
  }).sort((a, b) => {
    const ta = a.last?.sent_at ? new Date(a.last.sent_at) : 0
    const tb = b.last?.sent_at ? new Date(b.last.sent_at) : 0
    return tb - ta
  })

  return (
    <div className="min-h-dvh bg-app pb-28 pt-safe">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-app/95 backdrop-blur-sm border-b border-app px-4 pt-4 pb-3">
        <h1 className="text-2xl font-display font-bold text-app">Chats</h1>
        <p className="text-xs text-muted-app mt-0.5">Active conversations</p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          emoji="💬"
          title="No chats yet"
          subtitle="Accept a request to start chatting with someone nearby."
        />
      ) : (
        <div className="divide-y divide-app">
          {items.map(({ requestId, title, last, unread }) => (
            <div key={requestId}
              className="flex items-center gap-3 px-4 py-4 hover:bg-subtle transition-colors cursor-pointer active:bg-muted-app"
              onClick={() => navigate(ROUTES.chat(requestId))}>
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600
                              flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                💬
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-app truncate">{title}</p>
                  {last?.sent_at && (
                    <span className="text-xs text-faint-app flex-shrink-0">
                      {formatRelativeTime(last.sent_at)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-app truncate">
                  {last?.message || 'Tap to open chat'}
                </p>
              </div>

              {unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs
                                 flex items-center justify-center font-bold flex-shrink-0">
                  {unread}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}