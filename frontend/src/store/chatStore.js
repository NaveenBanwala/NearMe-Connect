import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fetchMessages, sendMessage, connectChat } from '../services/chatService.js'

const EMPTY_MESSAGES = []

export const useChatStore = create(
  persist(
    (set, get) => ({
      threads:         {},
      connected:       false,
      connecting:      false,
      activeRequestId: null,
      _disconnect:     null,

      messagesFor: (requestId) => get().threads[requestId] ?? EMPTY_MESSAGES,

      setMessages: (requestId, msgs) =>
        set((s) => ({ threads: { ...s.threads, [requestId]: msgs } })),

      appendMessage: (requestId, msg) =>
        set((s) => {
          const cur = s.threads[requestId] || []

          if (msg.message_id && !msg.pending) {
            const withoutPending = cur.filter(
              (m) => !(m.pending && m.message === msg.message)
            )
            if (withoutPending.some((m) => m.message_id === msg.message_id)) return s
            return { threads: { ...s.threads, [requestId]: [...withoutPending, msg] } }
          }

          if (cur.some((m) => m.message_id === msg.message_id)) return s
          return { threads: { ...s.threads, [requestId]: [...cur, msg] } }
        }),

      sendMessage: async (requestId, message, token) => {
        const tempMsg = {
          message_id: `temp-${Date.now()}`,
          message,
          sender_id:  'me',
          sent_at:    new Date().toISOString(),
          pending:    true,
        }
        get().appendMessage(requestId, tempMsg)
        try {
          await sendMessage(requestId, message, token)
        } catch (e) {
          console.warn('Send failed:', e.message)
        }
      },

      loadMessages: async (requestId) => {
        try {
          const data = await fetchMessages(requestId)
          get().setMessages(requestId, data || [])
        } catch {}
      },

      connectToChat: (requestId, token) => {
        get()._disconnect?.()
        set({ connecting: true, connected: false, activeRequestId: requestId })

        const disconnect = connectChat(requestId, token, {
          onConnect: () => set({ connecting: false, connected: true }),
          onMessage: (msg) => get().appendMessage(requestId, msg),
          onError:   ()    => set({ connecting: false, connected: false }),
        })

        set({ _disconnect: disconnect })
      },

      disconnectChat: () => {
        get()._disconnect?.()
        set({ connected: false, connecting: false, activeRequestId: null, _disconnect: null })
      },

      clearThread: (requestId) =>
        set((s) => {
          const next = { ...s.threads }
          delete next[requestId]
          return { threads: next }
        }),
    }),
    {
      name: 'nearme-chats',
      partialize: (s) => ({
        threads: Object.fromEntries(
          Object.entries(s.threads).map(([id, msgs]) => [
            id,
            msgs.filter(m => !m.pending)    // ← never persist pending messages
          ])
        ),
      }),
    }
  )
)