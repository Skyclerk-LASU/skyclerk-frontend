// ─────────────────────────────────────────────────────────────────────
// Automated Notification Trigger Service
// Listens to mission/telemetry events and AUTO-SENDS notifications
// to admin, sender, and receiver based on event type
// ─────────────────────────────────────────────────────────────────────

import { notify } from './inAppNotificationService'
import { 
  getAdmins, 
  getSender, 
  getReceiverForDestination,
  USER_ROLES,
} from './userService'
import { 
  sendDepartureNotification,
  sendArrivalNotification,
  sendCustomNotification,
} from './notificationService'
import { emitEvent } from './missionEventBus'

// Track which missions have already triggered notifications (prevent duplicates)
const notificationsSent = new Set()

// ─────────────────────────────────────────────────────────────────────
// AUTOMATIC TRIGGER: MISSION START (Drone Loaded)
// ─────────────────────────────────────────────────────────────────────
export async function triggerDroneLoadedNotifications(mission) {
  const key = `loaded_${mission.id}`
  if (notificationsSent.has(key)) return

  try {
    const [admins, sender] = await Promise.all([
      getAdmins(),
      getSender(),
    ])

    // In-app notification (immediate)
    notify.success(
      '📦 DRONE LOADED',
      `Package ${mission.id} loaded. Ready to depart to ${mission.dest}`,
      6000
    )

    // Email to admins
    for (const admin of admins) {
      await sendCustomNotification({
        pkg: mission,
        sender: admin,
        recipient: admin,
        channel: 'EMAIL',
        body: `🟢 DRONE LOADED\n\nPackage: ${mission.id}\nDestination: ${mission.dest}\nTime: ${new Date().toLocaleTimeString()}\n\nDrone is ready to depart for delivery.`,
      }).catch(err => console.warn('Admin email failed:', err.message))
    }

    emitEvent('SYS_OK', `✅ Loaded notifications sent for ${mission.id}`)
    notificationsSent.add(key)
  } catch (err) {
    console.error('Trigger loaded notification error:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────
// AUTOMATIC TRIGGER: EN ROUTE
// ─────────────────────────────────────────────────────────────────────
export async function triggerEnRouteNotifications(mission) {
  const key = `enroute_${mission.id}`
  if (notificationsSent.has(key)) return

  try {
    const [admins, sender] = await Promise.all([
      getAdmins(),
      getSender(),
    ])

    // In-app notification
    notify.info(
      '🚁 IN ROUTE',
      `${mission.id} departed. En route to ${mission.dest}`,
      5000
    )

    // Email to admins
    for (const admin of admins) {
      await sendCustomNotification({
        pkg: mission,
        sender: admin,
        recipient: admin,
        channel: 'EMAIL',
        body: `🔵 DRONE EN ROUTE\n\nPackage: ${mission.id}\nDestination: ${mission.dest}\nETA: ${mission.eta}\nTime: ${new Date().toLocaleTimeString()}\n\nDrone is airborne and on course.`,
      }).catch(err => console.warn('Admin email failed:', err.message))
    }

    emitEvent('SYS_OK', `✅ En-route notifications sent for ${mission.id}`)
    notificationsSent.add(key)
  } catch (err) {
    console.error('Trigger en-route notification error:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────
// AUTOMATIC TRIGGER: LANDED
// ─────────────────────────────────────────────────────────────────────
export async function triggerLandedNotifications(mission) {
  const key = `landed_${mission.id}`
  if (notificationsSent.has(key)) return

  try {
    const [admins, receiver] = await Promise.all([
      getAdmins(),
      getReceiverForDestination(mission.dest),
    ])

    // In-app notification
    notify.success(
      '🎯 DRONE LANDED',
      `${mission.id} arrived at ${mission.dest}`,
      6000
    )

    // Email to admins
    for (const admin of admins) {
      await sendCustomNotification({
        pkg: mission,
        sender: admin,
        recipient: admin,
        channel: 'EMAIL',
        body: `🟡 DRONE LANDED\n\nPackage: ${mission.id}\nDestination: ${mission.dest}\nTime: ${new Date().toLocaleTimeString()}\n\nDrone has landed. Awaiting offload.`,
      }).catch(err => console.warn('Admin email failed:', err.message))
    }

    // Email to receiver
    if (receiver) {
      await sendCustomNotification({
        pkg: mission,
        sender: receiver,
        recipient: receiver,
        channel: 'EMAIL',
        body: `📬 YOUR PACKAGE HAS ARRIVED!\n\nPackage: ${mission.id}\nLocation: ${mission.dest}\nTime: ${new Date().toLocaleTimeString()}\n\nYour delivery has arrived. Please proceed to collect your package.`,
      }).catch(err => console.warn('Receiver email failed:', err.message))
    }

    emitEvent('SYS_OK', `✅ Landed notifications sent for ${mission.id}`)
    notificationsSent.add(key)
  } catch (err) {
    console.error('Trigger landed notification error:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────
// AUTOMATIC TRIGGER: PACKAGE OFFLOADED
// ─────────────────────────────────────────────────────────────────────
export async function triggerOffloadedNotifications(mission) {
  const key = `offloaded_${mission.id}`
  if (notificationsSent.has(key)) return

  try {
    const [admins, receiver] = await Promise.all([
      getAdmins(),
      getReceiverForDestination(mission.dest),
    ])

    // In-app notification
    notify.success(
      '📦 PACKAGE OFFLOADED',
      `${mission.id} successfully delivered and unloaded`,
      6000
    )

    // Email to admins
    for (const admin of admins) {
      await sendCustomNotification({
        pkg: mission,
        sender: admin,
        recipient: admin,
        channel: 'EMAIL',
        body: `✅ PACKAGE OFFLOADED\n\nPackage: ${mission.id}\nDestination: ${mission.dest}\nTime: ${new Date().toLocaleTimeString()}\n\nPackage has been successfully delivered and offloaded.`,
      }).catch(err => console.warn('Admin email failed:', err.message))
    }

    // Email to receiver
    if (receiver) {
      await sendCustomNotification({
        pkg: mission,
        sender: receiver,
        recipient: receiver,
        channel: 'EMAIL',
        body: `✅ PACKAGE READY FOR PICKUP\n\nPackage: ${mission.id}\nLocation: ${mission.dest}\nTime: ${new Date().toLocaleTimeString()}\n\nYour package has been offloaded and is ready for collection.`,
      }).catch(err => console.warn('Receiver email failed:', err.message))
    }

    emitEvent('SYS_OK', `✅ Offloaded notifications sent for ${mission.id}`)
    notificationsSent.add(key)
  } catch (err) {
    console.error('Trigger offloaded notification error:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────
// AUTOMATIC TRIGGER: RETURNING TO BASE
// ─────────────────────────────────────────────────────────────────────
export async function triggerReturningNotifications(mission) {
  const key = `returning_${mission.id}`
  if (notificationsSent.has(key)) return

  try {
    const admins = await getAdmins()

    // In-app notification
    notify.info(
      '🏠 RETURNING TO BASE',
      `${mission.id} RTB after successful delivery`,
      5000
    )

    // Email to admins
    for (const admin of admins) {
      await sendCustomNotification({
        pkg: mission,
        sender: admin,
        recipient: admin,
        channel: 'EMAIL',
        body: `🔵 DRONE RETURNING\n\nPackage: ${mission.id}\nETA to Base: --:--\nTime: ${new Date().toLocaleTimeString()}\n\nDrone is returning to base after successful delivery.`,
      }).catch(err => console.warn('Admin email failed:', err.message))
    }

    emitEvent('SYS_OK', `✅ Returning notifications sent for ${mission.id}`)
    notificationsSent.add(key)
  } catch (err) {
    console.error('Trigger returning notification error:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────
// TELEMETRY ANOMALY ALERTS
// ─────────────────────────────────────────────────────────────────────
export async function triggerTelemetryAlert(alertType, details) {
  const key = `telemetry_${alertType}_${Date.now()}`
  
  try {
    const admins = await getAdmins()

    // In-app alert (persistent until dismissed)
    notify.alert(
      `⚠️ TELEMETRY ALERT: ${alertType.toUpperCase()}`,
      `${details.message}`,
      0 // Persistent
    )

    // Email to admins
    for (const admin of admins) {
      await sendCustomNotification({
        pkg: { id: 'TELEMETRY', dest: 'DRONE' },
        sender: admin,
        recipient: admin,
        channel: 'EMAIL',
        body: `🔴 TELEMETRY ALERT\n\nType: ${alertType}\nMessage: ${details.message}\nTime: ${new Date().toLocaleTimeString()}\n\nPlease review drone status immediately.`,
      }).catch(err => console.warn('Admin email failed:', err.message))
    }

    emitEvent('SYS_WARN', `⚠️ Telemetry alert: ${alertType}`)
  } catch (err) {
    console.error('Trigger telemetry alert error:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────
// Helper: Reset notification tracker (for testing)
// ─────────────────────────────────────────────────────────────────────
export function resetNotificationTracker() {
  notificationsSent.clear()
  console.log('✅ Notification tracker reset')
}

export default {
  triggerDroneLoadedNotifications,
  triggerEnRouteNotifications,
  triggerLandedNotifications,
  triggerOffloadedNotifications,
  triggerReturningNotifications,
  triggerTelemetryAlert,
  resetNotificationTracker,
}
