import { useState, useEffect, useRef } from 'react'
import { useTelemetry } from '../hooks/useTelemetry'

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatUptime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(Math.floor(seconds % 60)).padStart(2, '0')
  return `${h}:${m}:${s}`
}

// ─── TeleCard ──────────────────────────────────────────────────────────────────
function TeleCard({ metric }) {
  const [flash, setFlash] = useState(false)
  const prevRef = useRef(metric.value)

  useEffect(() => {
    if (metric.value !== prevRef.current) {
      prevRef.current = metric.value
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 400)
      return () => clearTimeout(t)
    }
  }, [metric.value])

  // Safe numeric trend — metric.value may be a string e.g. "1.2"
  const curr = parseFloat(metric.value)
  const prev = parseFloat(metric.prev ?? metric.value)
  const trend = curr > prev ? 'up' : curr < prev ? 'down' : 'flat'

  return (
    <div className={`tele-card tele-card--${metric.status} ${flash ? 'tele-card--flash' : ''}`}>
      <div className="tele-label">
        {metric.label}
        {metric.status === 'warn'   && <span className="tele-alert tele-alert--warn">!</span>}
        {metric.status === 'danger' && <span className="tele-alert tele-alert--danger">!!</span>}
      </div>
      <div className={`tele-val tele-val--${metric.status}`}>
        {metric.value}
        <span className="tele-unit">{metric.unit}</span>
        <span className={`tele-trend tele-trend--${trend}`}>
          {trend === 'up' ? '▲' : trend === 'down' ? '▼' : ''}
        </span>
      </div>
      <div className="tele-bar">
        <div
          className={`tele-bar-fill tele-bar-fill--${metric.status}`}
          style={{ width: `${metric.pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── TelemetryPanel ────────────────────────────────────────────────────────────
export default function TelemetryPanel() {
  // useTelemetry() now takes no arguments — interval is driven by Firebase onValue
  const { telemetry, connected, latency } = useTelemetry()

  const cards = [
    telemetry.altitude,
    telemetry.speed,
    telemetry.battery,
    telemetry.signal,
    telemetry.payload,    // renamed from payloadWeight in merged useTelemetry
    telemetry.temp,
  ]

  const hasWarning  = cards.some(c => c.status === 'warn')
  const hasDanger   = cards.some(c => c.status === 'danger')
  const statusLabel = hasDanger  ? 'CRITICAL' : hasWarning ? 'WARNING' : connected ? 'NOMINAL' : 'OFFLINE'
  const statusClass = hasDanger  ? 'danger'   : hasWarning ? 'warn'    : connected ? 'active'  : 'danger'

  return (
    <div className="panel tele-panel">
      <div className="panel-header">
        <div className="panel-title">TELEMETRY</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Latency indicator — only shown when connected */}
          {connected && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text3)', letterSpacing: '1px' }}>
              {latency}ms
            </span>
          )}
          <div className={`badge ${statusClass}`}>{statusLabel}</div>
        </div>
      </div>

      <div className="tele-grid">
        {cards.map((m) => (
          <TeleCard key={m.label} metric={m} />
        ))}
      </div>

      <div className="tele-coords">
        <div className="tele-coords__row">
          <span className="tele-coords__label">LAT</span>
          {/* coords uses lon (not lng) to match Firebase field name */}
          <span className="tele-coords__val">{telemetry.coords.lat}°N</span>
        </div>
        <div className="tele-coords__row">
          <span className="tele-coords__label">LNG</span>
          <span className="tele-coords__val">{telemetry.coords.lon}°E</span>
        </div>
        <div className="tele-coords__row">
          <span className="tele-coords__label">UPTIME</span>
          <span className="tele-coords__val">{formatUptime(telemetry.uptime)}</span>
        </div>
        {/* Extra Firebase fields exposed for visibility */}
        <div className="tele-coords__row">
          <span className="tele-coords__label">ARMED</span>
          <span className="tele-coords__val" style={{ color: telemetry.armed ? 'var(--red)' : 'var(--green)' }}>
            {telemetry.armed ? 'YES' : 'NO'}
          </span>
        </div>
        <div className="tele-coords__row">
          <span className="tele-coords__label">PAYLOAD</span>
          <span className="tele-coords__val" style={{ color: telemetry.payloadPresent ? 'var(--cyan)' : 'var(--text3)' }}>
            {telemetry.payloadPresent ? (telemetry.payloadLocked ? 'LOCKED' : 'PRESENT') : 'NONE'}
          </span>
        </div>
      </div>
    </div>
  )
}