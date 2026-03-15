// ─────────────────────────────────────────────
// Skycleck Mission Event Bus
// Lightweight pub/sub — no external dependencies
// All panels import { emitEvent } to log events
// MissionLog subscribes via useMissionLog hook
// ─────────────────────────────────────────────

const listeners = new Set()

export const EVENT_TYPES = {
  // Drone / Flight
  TAKEOFF:       { label: 'TAKEOFF', color: 'ok',      category: 'FLT' },
  LAND:          { label: 'LAND',    color: 'ok',      category: 'FLT' },
  ALTITUDE:      { label: 'ALT',     color: 'info',    category: 'FLT' },
  ROUTE_CHANGE:  { label: 'NAV',     color: 'info',    category: 'NAV' },
  WAYPOINT:      { label: 'WPT',     color: 'info',    category: 'NAV' },
  HEADING:       { label: 'HDG',     color: 'info',    category: 'NAV' },
  // Delivery / Mission
  MISSION_START: { label: 'MISSION', color: 'ok',      category: 'PKG' },
  DEPARTED:      { label: 'DEPART',  color: 'ok',      category: 'PKG' },
  EN_ROUTE:      { label: 'ENRTE',   color: 'info',    category: 'PKG' },
  ARRIVING:      { label: 'ARVNG',   color: 'warn',    category: 'PKG' },
  DELIVERED:     { label: 'DLVRD',   color: 'ok',      category: 'PKG' },
  RETURNING:     { label: 'RTB',     color: 'info',    category: 'PKG' },
  EMERGENCY:     { label: 'EMRG',    color: 'err',     category: 'PKG' },
  RESET:         { label: 'RESET',   color: 'neutral', category: 'PKG' },
  // Sensors
  SENSOR_CMD:    { label: 'SENS',    color: 'cyan',    category: 'SEN' },
  SENSOR_OK:     { label: 'SENS',    color: 'ok',      category: 'SEN' },
  SENSOR_WARN:   { label: 'SENS',    color: 'warn',    category: 'SEN' },
  SENSOR_ERR:    { label: 'SENS',    color: 'err',     category: 'SEN' },
  // Notifications
  NOTIF_SENT:    { label: 'NOTIF',   color: 'cyan',    category: 'COM' },
  NOTIF_FAIL:    { label: 'NOTIF',   color: 'err',     category: 'COM' },
  // Telemetry warnings
  TELE_WARN:     { label: 'TELE',    color: 'warn',    category: 'TLM' },
  TELE_DANGER:   { label: 'TELE',    color: 'err',     category: 'TLM' },
  TELE_NORMAL:   { label: 'TELE',    color: 'ok',      category: 'TLM' },
  // System
  SYS:           { label: 'SYS',     color: 'neutral', category: 'SYS' },
  SYS_OK:        { label: 'SYS',     color: 'ok',      category: 'SYS' },
  SYS_WARN:      { label: 'SYS',     color: 'warn',    category: 'SYS' },
  SYS_ERR:       { label: 'SYS',     color: 'err',     category: 'SYS' },
}

function timestamp() {
  const now = new Date()
  return [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join(':')
}

let idCounter = 0

export function emitEvent(typeKey, message, meta = {}) {
  const def = EVENT_TYPES[typeKey] || EVENT_TYPES.SYS
  const entry = {
    id:       ++idCounter,
    time:     timestamp(),
    typeKey,
    label:    def.label,
    color:    def.color,
    category: def.category,
    message,
    meta,
  }
  listeners.forEach(fn => fn(entry))
  return entry
}

export function subscribeMissionLog(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
