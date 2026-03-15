import { useState, useEffect } from 'react'
import { useTelemetry } from '../hooks/useTelemetry'

function formatUptime(seconds) {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(Math.floor(seconds % 60)).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function TeleCard({ metric }) {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (metric.value !== metric.prev) {
      setFlash(true)
      const t = setTimeout(() => setFlash(false), 400)
      return () => clearTimeout(t)
    }
  }, [metric.value])

  const trend = parseFloat(metric.value) > parseFloat(metric.prev) ? 'up'
              : parseFloat(metric.value) < parseFloat(metric.prev) ? 'down'
              : 'flat'

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

export default function TelemetryPanel() {
  const tele = useTelemetry(1200)

  const cards = [
    tele.altitude,
    tele.speed,
    tele.battery,
    tele.signal,
    tele.payloadWeight,
    tele.temp,
  ]

  const hasWarning = cards.some(c => c.status === 'warn')
  const hasDanger  = cards.some(c => c.status === 'danger')
  const statusLabel = hasDanger ? 'CRITICAL' : hasWarning ? 'WARNING' : 'NOMINAL'
  const statusClass = hasDanger ? 'danger' : hasWarning ? 'warn' : 'active'

  return (
    <div className="panel tele-panel">
      <div className="panel-header">
        <div className="panel-title">TELEMETRY</div>
        <div className={`badge ${statusClass}`}>{statusLabel}</div>
      </div>

      <div className="tele-grid">
        {cards.map((m) => (
          <TeleCard key={m.label} metric={m} />
        ))}
      </div>

      <div className="tele-coords">
        <div className="tele-coords__row">
          <span className="tele-coords__label">LAT</span>
          <span className="tele-coords__val">{tele.coords.lat}°N</span>
        </div>
        <div className="tele-coords__row">
          <span className="tele-coords__label">LNG</span>
          <span className="tele-coords__val">{tele.coords.lng}°E</span>
        </div>
        <div className="tele-coords__row">
          <span className="tele-coords__label">UPTIME</span>
          <span className="tele-coords__val">{formatUptime(tele.uptime)}</span>
        </div>
      </div>
    </div>
  )
}