import { useEffect } from 'react'
import { useChatStore } from '../store/chatStore.js'
import { useAuthStore }  from '../store/authStore.js'

export function useChat(requestId) {
  const token        = useAuthStore((s) => s.token)
  const messages     = useChatStore((s) => s.messagesFor(requestId))
  const loadMessages = useChatStore((s) => s.loadMessages)
  const connectToChat= useChatStore((s) => s.connectToChat)
  const disconnect   = useChatStore((s) => s.disconnectChat)
  const sendMsg      = useChatStore((s) => s.sendMessage)
  const appendMsg    = useChatStore((s) => s.appendMessage)

  useEffect(() => {
    if (!requestId || !token) return
    loadMessages(requestId)
    connectToChat(requestId, token)
    return () => disconnect()
  }, [requestId, token])

  return {
    messages,
    // send via WS (falls back to REST)
    send:   (text) => sendMsg(requestId, text, token),
    // local optimistic append (for legacy callers)
    append: (reqId, msg) => appendMsg(reqId, msg),
  }
}