import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'  // ← add this
import { useChatStore } from '../store/chatStore.js'
import { useAuthStore }  from '../store/authStore.js'

export function useChat(requestId) {
  const token        = useAuthStore((s) => s.token)
  const messages     = useChatStore((s) => s.messagesFor(requestId))  // stable now
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
    send:   (text) => sendMsg(requestId, text, token),
    append: (reqId, msg) => appendMsg(reqId, msg),
  }
}