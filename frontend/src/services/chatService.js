import { api } from './api.js'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const isDev = import.meta.env.DEV

// ── REST ─────────────────────────────────────────────────────────────────────

function mapMessage(raw) {
  return {
    message_id:  raw.chat_id,
    request_id:  raw.request_id,
    sender_id:   raw.sender_id,
    sender_name: raw.sender_name,
    message:     raw.message,
    read:        raw.read,
    sent_at:     raw.sent_at,
    pending:     false,
  }
}

export async function fetchMessages(requestId) {
  const { data } = await api.get(`/api/chat/${requestId}/messages`)
  return (data || []).map(mapMessage)        // ← add .map(mapMessage)
}

export async function sendMessageRest(requestId, message) {
  const { data } = await api.post(`/api/chat/${requestId}/messages`, { message })
  return data
}

// ── WebSocket (STOMP over SockJS) ─────────────────────────────────────────────
let stompClient = null

export function connectChat(requestId, token, { onMessage, onConnect, onError }) {
  if (stompClient?.connected) stompClient.deactivate()

  stompClient = new Client({
  webSocketFactory: () => new SockJS('/ws/chat'),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 4000,
    onConnect: () => {
      onConnect?.()
 stompClient.subscribe(`/topic/chat/${requestId}`, (frame) => {
  try {
    onMessage?.(mapMessage(JSON.parse(frame.body)))   // ← use mapMessage
  } catch (e) {
    console.error('Failed to parse message body', e)
  }
})
    },
    onStompError:    (frame) => onError?.(frame.headers?.message || 'STOMP error'),
    onWebSocketError: ()     => onError?.('WebSocket error'),
  })

  stompClient.activate()

  return () => {
    if (stompClient) {
      stompClient.deactivate()
      stompClient = null
    }
  }
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