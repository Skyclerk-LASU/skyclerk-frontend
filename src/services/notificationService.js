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

  // 2. Trigger real send via Cloud Function (uncomment when ready)
  // await fetch('https://us-central1-skyclerk-85677.cloudfunctions.net/sendNotification', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ type, message, recipient, channel }),
  // })

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
