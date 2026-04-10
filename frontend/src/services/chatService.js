import { api } from './api.js'
import { env } from '../config/env.js'

// ── REST ─────────────────────────────────────────────────────────────────────
export async function fetchMessages(requestId) {
  const { data } = await api.get(`/api/chat/${requestId}/messages`)
  return data
}

export async function sendMessageRest(requestId, message) {
  const { data } = await api.post(`/api/chat/${requestId}/messages`, { message })
  return data
}

// ── WebSocket (STOMP) ─────────────────────────────────────────────────────────
let stompClient = null

export function connectChat(requestId, token, { onMessage, onConnect, onError }) {
  // Lazy-load @stomp/stompjs to avoid breaking if not installed yet
  import('@stomp/stompjs').then(({ Client }) => {
    if (stompClient?.connected) stompClient.deactivate()

    stompClient = new Client({
      brokerURL:      `${env.wsBaseUrl}/ws/chat`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 4000,
      onConnect: () => {
        onConnect?.()
        stompClient.subscribe(`/topic/chat/${requestId}`, (frame) => {
          try { onMessage?.(JSON.parse(frame.body)) } catch {}
        })
      },
      onStompError:    (frame) => onError?.(frame.headers?.message || 'STOMP error'),
      onWebSocketError:()      => onError?.('WebSocket error'),
    })

    stompClient.activate()
  }).catch(() => {
    // @stomp/stompjs not installed — REST-only mode
    onError?.('WebSocket unavailable — using REST fallback')
  })

  return () => { stompClient?.deactivate(); stompClient = null }
}

export async function sendMessage(requestId, message, token) {
  if (stompClient?.connected) {
    stompClient.publish({
      destination: `/app/chat/${requestId}`,
      body:        JSON.stringify({ message }),
      headers:     { Authorization: `Bearer ${token}` },
    })
  } else {
    await sendMessageRest(requestId, message)
  }
}