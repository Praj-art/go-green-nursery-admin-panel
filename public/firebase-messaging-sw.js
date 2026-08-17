// public/firebase-messaging-sw.js
// Firebase Cloud Messaging Service Worker
// Handles background push notifications when the browser tab is not in focus.
// This file must be at the root of your domain (served from /public).

importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js")
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js")

// These values are safe to be public (they are the NEXT_PUBLIC_ vars)
// Replace with your actual Firebase config after setup
firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: self.FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: self.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: self.FIREBASE_APP_ID || "YOUR_APP_ID",
})

const messaging = firebase.messaging()

// Handle background messages (when the admin tab is in the background)
messaging.onBackgroundMessage((payload) => {
  console.log("[SW] Received background message:", payload)

  const { title, body } = payload.notification ?? {}
  if (!title) return

  self.registration.showNotification(title, {
    body: body ?? "",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "gogreen-admin",
    data: payload.data,
  })
})

// Click handler — open the admin dashboard when notification is clicked
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.link ?? "/"
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
