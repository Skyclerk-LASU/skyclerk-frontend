import { useState, useEffect, useRef } from 'react'
import { ref, onValue }                from 'firebase/database'
import { rtdb }                        from '../firebase/config'
import { emitEvent }                   from '../services/missionEventBus'

// ─── Thresholds ────────────────────────────────────────────────────────────────
const LIMITS = {
  altitude:      { min: 0,  max: 250, warn: 200, danger: 240 },
  speed:         { min: 0,  max: 30,  warn: 25,  danger: 29  },
  battery:       { min: 0,  max: 100, warn: 30,  danger: 15  },
  signal:        { min: 0,  max: 100, warn: 40,  danger: 20  },
  payload:       { min: 0,  max: 5,   warn: 4,   danger: 4.8 },
  temp:          { min: 20, max: 80,  warn: 60,  danger: 72  },
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Returns 'danger' | 'warn' | 'normal' for a given metric value.
 * battery and signal are "lower is worse"; everything else is "higher is worse".
 */
function getStatus(key, value) {
  const l = LIMITS[key]
  if (!l) return 'normal'

  if (key === 'battery' || key === 'signal') {
    if (value <= l.danger) return 'danger'
    if (value <= l.warn)   return 'warn'
    return 'normal'
  }

  if (value >= l.danger) return 'danger'
  if (value >= l.warn)   return 'warn'
  return 'normal'
}

/**
 * Returns 0-100 representing where `value` sits within [min, max].
 */
function getPct(key, value) {
  const l = LIMITS[key]
  if (!l) return 50
  return Math.round(((value - l.min) / (l.max - l.min)) * 100)
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_RAW = {
  battery:        0,
  altitude:       0,
  speed:          0,
  signal:         0,
  temp:           0,
  lat:            6.5530,
  lon:            3.9806,
  heading:        0,
  payload:        0,
  payloadLocked:  false,
  payloadPresent: false,
  status:         'IDLE',
  armed:          false,
  uptime:         0,
}

// ─── Enrichment ────────────────────────────────────────────────────────────────
/**
 * Converts a raw Firebase telemetry object into the enriched shape
 * { value, unit, label, pct, status } that UI components consume.
 */
function enrich(raw) {
  return {
    altitude: {
      value:  Math.round(raw.altitude),
      unit:   'M',
      label:  'ALTITUDE',
      pct:    getPct('altitude', raw.altitude),
      status: getStatus('altitude', raw.altitude),
    },
    speed: {
      value:  Math.round(raw.speed),
      unit:   'M/S',
      label:  'SPEED',
      pct:    getPct('speed', raw.speed),
      status: getStatus('speed', raw.speed),
    },
    battery: {
      value:  Math.round(raw.battery),
      unit:   '%',
      label:  'BATTERY',
      pct:    getPct('battery', raw.battery),
      status: getStatus('battery', raw.battery),
    },
    signal: {
      value:  Math.round(raw.signal),
      unit:   '%',
      label:  'SIGNAL',
      pct:    getPct('signal', raw.signal),
      status: getStatus('signal', raw.signal),
    },
    heading: {
      value:  Math.round(raw.heading),
      unit:   '°',
      label:  'HEADING',
      pct:    getPct('altitude', raw.heading), // directional — no dedicated limit
      status: 'normal',
    },
    temp: {
      value:  Math.round(raw.temp),
      unit:   '°C',
      label:  'TEMP',
      pct:    getPct('temp', raw.temp),
      status: getStatus('temp', raw.temp),
    },
    payload: {
      value:  parseFloat(raw.payload).toFixed(1),
      unit:   'KG',
      label:  'PAYLOAD',
      pct:    getPct('payload', raw.payload),
      status: getStatus('payload', raw.payload),
    },
    // Pass-through fields — not gauge metrics but used by other panels
    coords:         { lat: parseFloat(raw.lat).toFixed(4), lon: parseFloat(raw.lon).toFixed(4) },
    payloadLocked:  raw.payloadLocked,
    payloadPresent: raw.payloadPresent,
    droneStatus:    raw.status,   // renamed to avoid clash with metric .status fields
    armed:          raw.armed,
    uptime:         raw.uptime,
  }
}

// ─── Event emission ────────────────────────────────────────────────────────────
// Keyed by metric name — persisted outside the component so it survives re-renders.
const _prevStatus = {}

function emitStatusChanges(enriched) {
  const GAUGE_KEYS = ['altitude', 'speed', 'battery', 'signal', 'temp', 'payload']

  GAUGE_KEYS.forEach(key => {
    const metric = enriched[key]
    if (!metric) return

    const prev = _prevStatus[key]
    const curr = metric.status

    if (prev === curr) return // nothing changed

    if (curr === 'danger') {
      emitEvent('TELE_DANGER', `${metric.label} critical — ${metric.value}${metric.unit}`)
    } else if (curr === 'warn' && prev !== 'danger') {
      emitEvent('TELE_WARN', `${metric.label} warning — ${metric.value}${metric.unit}`)
    } else if (curr === 'normal' && prev && prev !== 'normal') {
      emitEvent('TELE_NORMAL', `${metric.label} returned to normal — ${metric.value}${metric.unit}`)
    }

    _prevStatus[key] = curr
  })
}

// ─── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useTelemetry()
 *
 * Subscribes to Firebase Realtime Database at `drone/telemetry`, enriches
 * the raw values with status classification and percentage helpers, and
 * emits mission-bus events whenever a metric changes severity level.
 *
 * Returns:
 *   telemetry  — enriched metric map (see `enrich` above)
 *   connected  — true once Firebase has returned a valid snapshot
 *   latency    — round-trip ms from onValue callback firing to state set
 */
export function useTelemetry() {
  const [telemetry, setTelemetry] = useState(() => enrich(DEFAULT_RAW))
  const [connected, setConnected] = useState(false)
  const [latency,   setLatency]   = useState(0)

  useEffect(() => {
    const telemRef = ref(rtdb, 'drone/telemetry')

    const unsub = onValue(telemRef, snap => {
      const start = Date.now()

      if (snap.exists()) {
        const d = snap.val()

        // Normalise raw Firebase payload — guard every field with a fallback
        const raw = {
          battery:        d.battery        ?? 0,
          altitude:       d.altitude       ?? 0,
          speed:          d.speed          ?? 0,
          signal:         Math.abs(d.rssi  ?? d.signal ?? 0), // rssi is negative on some firmwares
          temp:           d.temp           ?? 0,
          lat:            d.lat            ?? 6.5530,
          lon:            d.lon            ?? 3.9806,
          heading:        d.heading        ?? 0,
          payload:        d.payload        ?? 0,
          payloadLocked:  d.payloadLocked  ?? false,
          payloadPresent: d.payloadPresent ?? false,
          status:         d.status         ?? 'IDLE',
          armed:          d.armed          ?? false,
          uptime:         d.uptime         ?? 0,
        }

        const enriched = enrich(raw)
        emitStatusChanges(enriched)

        setTelemetry(enriched)
        setConnected(true)
        setLatency(Date.now() - start)
      } else {
        // Snapshot missing — drone offline or path wrong
        setConnected(false)
      }
    })

    return () => unsub()
  }, [])

  return { telemetry, connected, latency }
}