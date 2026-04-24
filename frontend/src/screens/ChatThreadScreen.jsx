import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, Wifi, WifiOff } from 'lucide-react'
import { useChat } from '../hooks/useChat.js'
import { useAuthStore } from '../store/authStore.js'
import { useChatStore } from '../store/chatStore.js'
import { useRequestStore } from '../store/requestStore.js'
import { formatRelativeTime } from '../utils/helpers.js'
import { BackButton } from '../components/shared/BackButton.jsx'
import { cn } from '../utils/helpers.js'


export function ChatThreadScreen() {
  const { requestId }  = useParams()
  const navigate       = useNavigate()
  const [text, setText]= useState('')
  const bottomRef      = useRef(null)
  const userId         = useAuthStore((s) => s.user?.user_id || 'me')
  const getRequest     = useRequestStore((s) => s.getRequestById)
  const connected      = useChatStore((s) => s.connected)
  const connecting     = useChatStore((s) => s.connecting)
  const { messages, send } = useChat(requestId)
  const request        = getRequest(requestId)

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const msg = text.trim()
    if (!msg) return
    setText('')
    send(msg)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex flex-col h-dvh bg-app">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-safe pt-3 pb-3 border-b border-app
                      bg-app/95 backdrop-blur-sm flex-shrink-0 sticky top-0 z-10">
        <BackButton />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-app truncate">
            {request?.title || `Chat #${requestId?.slice(-6)}`}
          </p>
          <div className="flex items-center gap-1.5 text-xs">
            {connecting ? (
              <span className="text-amber-500 flex items-center gap-1">
                <Wifi size={11} className="animate-pulse" /> Connecting…
              </span>
            ) : connected ? (
              <span className="text-green-500 flex items-center gap-1">
                <Wifi size={11} /> Live
              </span>
            ) : (
              <span className="text-muted-app flex items-center gap-1">
                <WifiOff size={11} /> Offline mode
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-2">👋</p>
            <p className="text-sm text-muted-app">Chat started! Say hello.</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.sender_id === userId || msg.sender_id === 'me'
          return (
            <div key={msg.message_id || `${msg.sent_at}-${i}`}
              className={cn('flex flex-col gap-0.5', isMe ? 'items-end' : 'items-start')}>
              <div className={cn('max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                isMe
                  ? 'bg-brand-500 text-white rounded-br-md'
                  : 'bg-subtle border border-app text-app rounded-bl-md',
                msg.pending && 'opacity-60'
              )}>
                {msg.message}
              </div>
              {msg.sent_at && (
                <p className="text-[10px] text-faint-app px-1">
                  {formatRelativeTime(msg.sent_at)}
                  {msg.pending && ' · sending…'}
                </p>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3 pb-safe border-t border-app bg-surface">
        <div className="flex items-end gap-2">
          <textarea
            className="input flex-1 resize-none max-h-28 py-2.5 text-sm leading-relaxed"
            placeholder="Type a message…"
            rows={1} value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKey}
            style={{ minHeight: '44px' }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="w-11 h-11 rounded-xl bg-brand-500 text-white flex items-center justify-center
                       disabled:opacity-40 hover:bg-brand-600 active:scale-95 transition-all flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}