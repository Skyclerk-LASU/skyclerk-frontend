// Skycleck — Firebase Notification Service
// Firestore: /notifications/{autoId}
// Also calls backend Cloud Function or direct SMS/email API

import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore'
import { db }        from './firebase'
import { emitEvent } from './missionEventBus'

const COL = 'notifications'

const TEMPLATES = {
  DEPARTURE: (pkg, sender, recipient) =>
    `Hello ${recipient.name}, your delivery ${pkg.id} to ${pkg.dest} has departed from ${sender.location}. ETA: ${pkg.eta || "TBD"}. — Skycleck`,
  ARRIVAL:   (pkg, sender, recipient) =>
    `Hello ${recipient.name}, your delivery ${pkg.id} has arrived at ${pkg.dest}. Please collect your package. — Skycleck`,
  DELAY:     (pkg, sender, recipient, reason) =>
    `Hello ${recipient.name}, your delivery ${pkg.id} to ${pkg.dest} has been delayed. Reason: ${reason || "Operational hold"}. — Skycleck`,
  CUSTOM:    (pkg, sender, recipient, body) => body,
}

async function sendNotification(type, { pkg, sender, recipient, channel, extra }) {
  const message = TEMPLATES[type](pkg, sender, recipient, extra)

  // 1. Log to Firestore
  const logRef = await addDoc(collection(db, COL), {
    type, pkg: pkg.id, dest: pkg.dest,
    sender: sender.name, recipient: recipient.name,
    phone: recipient.phone || null, email: recipient.email || null,
    channel, message, status: 'sent',
    createdAt: serverTimestamp(),
  })

  // 2. Trigger real send via backend API (when backend is deployed)
  if (channel === 'EMAIL' || channel === 'BOTH') {
    sendEmailViaBackend({
      to: recipient.email,
      subject: `${type} Notification - ${pkg.id}`,
      body: message,
      recipientName: recipient.name,
    }).catch(err => console.warn('[Backend] Email send failed:', err.message))
  }

  // 3. Simulate send delay
  await new Promise(r => setTimeout(r, 700 + Math.random() * 500))
  if (Math.random() < 0.08) throw new Error('Network timeout — retry')

  emitEvent('NOTIF_SENT', `${type} notification sent to ${recipient.name} for ${pkg.id}`)
  return { success: true, messageId: logRef.id, channel, timestamp: new Date().toISOString() }
}

export async function sendDepartureNotification(args) { return sendNotification('DEPARTURE', { ...args, extra: null }) }
export async function sendArrivalNotification(args)   { return sendNotification('ARRIVAL',   { ...args, extra: null }) }
export async function sendDelayNotification(args)     { return sendNotification('DELAY',     { ...args, extra: args.reason }) }
export async function sendCustomNotification(args)    { return sendNotification('CUSTOM',    { ...args, extra: args.body }) }

export async function fetchNotificationHistory(limitCount = 20) {
  try {
    const snap = await getDocs(query(collection(db, COL), orderBy('createdAt', 'desc'), limit(limitCount)))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error('[Firebase] Notification history error:', err)
    return []
  }
}

export { TEMPLATES }

// ─────────────────────────────────────────────────────────────────────
// Backend Email Integration
// Sends email via your backend API
// ─────────────────────────────────────────────────────────────────────

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api'

export async function sendEmailViaBackend(emailData) {
  try {
    const response = await fetch(`${BACKEND_API_URL}/notifications/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_KEY}`,
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        recipientName: emailData.recipientName,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Email send failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('[Backend] Email sent:', result)
    return result
  } catch (err) {
    console.error('[Backend] Email API error:', err.message)
    // Don't throw — notifications should not break if backend is down
    return { success: false, error: err.message }
  }
}
