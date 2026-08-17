// lib/fcm.ts
// Firebase Cloud Messaging — server-side helper for sending push notifications.
// Used by API routes to notify the admin on new orders, failed payments, refunds.

let _app: import("firebase-admin/app").App | null = null

function getFirebaseAdminApp() {
  if (_app) return _app

  // Lazily initialize to avoid errors if FCM env vars aren't set
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (!serviceAccountJson) {
    console.warn("[FCM] FIREBASE_SERVICE_ACCOUNT_JSON not set — notifications disabled")
    return null
  }

  try {
    const { initializeApp, getApps, cert } = require("firebase-admin/app")
    if (getApps().length > 0) {
      _app = getApps()[0]
      return _app
    }
    const serviceAccount = JSON.parse(serviceAccountJson)
    _app = initializeApp({ credential: cert(serviceAccount) })
    return _app
  } catch (err) {
    console.error("[FCM] Failed to initialize Firebase Admin:", err)
    return null
  }
}

export interface NotificationPayload {
  title: string
  body: string
  /** Optional URL to open when notification is clicked */
  link?: string
}

/**
 * Sends a push notification to all admin devices subscribed to the "admin" topic.
 * In Razorpay webhook and order creation routes this is called fire-and-forget.
 */
export async function sendAdminNotification(payload: NotificationPayload): Promise<void> {
  const app = getFirebaseAdminApp()
  if (!app) return

  try {
    const { getMessaging } = require("firebase-admin/messaging")
    const messaging = getMessaging(app)

    await messaging.send({
      topic: "admin-alerts",
      notification: {
        title: payload.title,
        body: payload.body,
      },
      webpush: payload.link
        ? {
            fcmOptions: { link: payload.link },
          }
        : undefined,
    })
  } catch (err) {
    console.error("[FCM] Failed to send notification:", err)
  }
}
