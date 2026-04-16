import { useState, useEffect, useRef } from 'react'
import { useTelemetry } from './useTelemetry'

// ─── Config ────────────────────────────────────────────────────────────────────
const MAX_POINTS = 50   // matches your original backend version

// ─── Helpers ───────────────────────────────────────────────────────────────────
function nowLabel() {
  const d = new Date()
  return `${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

function trimmed(arr) {
  return arr.length >= MAX_POINTS ? arr.slice(1) : arr
}

const EMPTY_SERIES = () => ({
  labels:   [],
  battery:  [],
  altitude: [],
  speed:    [],
  signal:   [],
  temp:     [],
})

// ─── Hook ──────────────────────────────────────────────────────────────────────
/**
 * useTelemetryHistory()
 *
 * Builds a rolling time-series from live Firebase telemetry.
 * Appends one data point per telemetry update, capped at MAX_POINTS.
 *
 * Returns:
 *   series     — { labels, battery, altitude, speed, signal, temp }
 *                each an array of numbers ready for charting
 *   telemetry  — the current enriched telemetry snapshot (pass-through)
 *   connected  — Firebase connection state
 *   latency    — Firebase round-trip ms
 */
export function useTelemetryHistory() {
  const { telemetry, connected, latency } = useTelemetry()
  const [series, setSeries] = useState(EMPTY_SERIES)
  const tickRef = useRef(0)

  useEffect(() => {
    // Guard: skip if telemetry values are still at defaults (not yet connected)
    if (!connected) return

    tickRef.current += 1
    const label = nowLabel()

    setSeries(prev => ({
      labels:   [...trimmed(prev.labels),   label],
      // Use .value from the enriched metric objects (set by useTelemetry enrich())
      battery:  [...trimmed(prev.battery),  Number(telemetry.battery.value)],
      altitude: [...trimmed(prev.altitude), Number(telemetry.altitude.value)],
      speed:    [...trimmed(prev.speed),    Number(telemetry.speed.value)],
      signal:   [...trimmed(prev.signal),   Number(telemetry.signal.value)],
      temp:     [...trimmed(prev.temp),     Number(telemetry.temp.value)],
    }))

  // Only append a new point when a core value actually changes —
  // avoids duplicate entries if Firebase re-emits the same snapshot
  }, [
    telemetry.battery.value,
    telemetry.altitude.value,
    telemetry.speed.value,
    telemetry.signal.value,
    telemetry.temp.value,
    connected,
  ])

  return { series, telemetry, connected, latency }
}