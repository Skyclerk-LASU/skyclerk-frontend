// ─────────────────────────────────────────────────────────────────────
// In-App Notification Service
// Manages toast notifications displayed directly in the app
// Separate from email/SMS — these show immediately on screen
// ─────────────────────────────────────────────────────────────────────

const listeners = new Set()
let notificationId = 0

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  ALERT: 'alert',
}

export function showNotification(title, message, type = NOTIFICATION_TYPES.INFO, duration = 5000) {
  const id = ++notificationId
  const notification = {
    id,
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    duration,
  }

  // Emit to all listeners (toast display components subscribe here)
  listeners.forEach(fn => fn(notification))

  // Auto-dismiss after duration (if duration > 0)
  if (duration > 0) {
    setTimeout(() => dismissNotification(id), duration)
  }

  return id
}

export function dismissNotification(id) {
  listeners.forEach(fn => fn({ id, dismissed: true }))
}

export function subscribeToNotifications(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

// Quick helpers for common notification types
export const notify = {
  success: (title, msg, duration) => showNotification(title, msg, NOTIFICATION_TYPES.SUCCESS, duration),
  error: (title, msg, duration) => showNotification(title, msg, NOTIFICATION_TYPES.ERROR, duration ?? 7000),
  warning: (title, msg, duration) => showNotification(title, msg, NOTIFICATION_TYPES.WARNING, duration),
  info: (title, msg, duration) => showNotification(title, msg, NOTIFICATION_TYPES.INFO, duration),
  alert: (title, msg, duration) => showNotification(title, msg, NOTIFICATION_TYPES.ALERT, duration ?? 0), // Persistent
}
