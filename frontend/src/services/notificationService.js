/**
 * Browser push notification helpers.
 * Firebase FCM wiring is stubbed — uncomment after `npm install firebase`.
 */

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  return await Notification.requestPermission()
}

export function showLocalNotification(title, body, icon = '/favicon.ico') {
  if (Notification.permission !== 'granted') return
  new Notification(title, { body, icon })
}

// ── Firebase FCM stub ─────────────────────────────────────────────────────────
// Uncomment after: npm install firebase
//
// import { getMessaging, getToken, onMessage } from 'firebase/messaging'
// import { firebaseConfig } from '../config/firebase.js'
// import { initializeApp } from 'firebase/app'
//
// const app       = initializeApp(firebaseConfig)
// const messaging = getMessaging(app)
//
// export async function getFcmToken() {
//   return await getToken(messaging, {
//     vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
//   })
// }
//
// export function onForegroundMessage(callback) {
//   return onMessage(messaging, callback)
// }