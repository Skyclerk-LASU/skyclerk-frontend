import { emitEvent } from '../services/missionEventBus'
import { useState, useEffect, useRef } from 'react'

const LIMITS = {
  altitude:      { min: 0,    max: 250,  warn: 200,  danger: 240  },
  speed:         { min: 0,    max: 30,   warn: 25,   danger: 29   },
  battery:       { min: 0,    max: 100,  warn: 30,   danger: 15   },
  signal:        { min: 0,    max: 100,  warn: 40,   danger: 20   },
  payloadWeight: { min: 0,    max: 5,    warn: 4,    danger: 4.8  },
  temp:          { min: 20,   max: 80,   warn: 60,   danger: 72   },
}

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val))
}

function drift(current, min, max, step) {
  const change = (Math.random() - 0.5) * step
  return clamp(parseFloat((current + change).toFixed(2)), min, max)
}

function getStatus(key, value) {
  const l = LIMITS[key]
  if (!l) return 'normal'
  // battery and signal — lower is worse
  if (key === 'battery' || key === 'signal') {
    if (value <= l.danger) return 'danger'
    if (value <= l.warn)   return 'warn'
    return 'normal'
  }
  // others — higher is worse
  if (value >= l.danger) return 'danger'
  if (value >= l.warn)   return 'warn'
  return 'normal'
}

function getPct(key, value) {
  const l = LIMITS[key]
  if (!l) return 50
  return Math.round(((value - l.min) / (l.max - l.min)) * 100)
}

const INITIAL = {
  altitude:      120,
  speed:         14,
  battery:       67,
  signal:        92,
  heading:       247,
  temp:          38,
  payloadWeight: 1.2,
  lat:           6.5244,
  lng:           3.3792,
  uptime:        0,
}

export function useTelemetry(intervalMs = 1200) {
  const [data, setData] = useState(INITIAL)
  const [prevData, setPrevData] = useState(INITIAL)
  const uptimeRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => {
        setPrevData(prev)
        uptimeRef.current += intervalMs / 1000

        return {
          altitude:      drift(prev.altitude,      0,    250,  2),
          speed:         drift(prev.speed,         0,    30,   1.5),
          battery:       drift(prev.battery,       0,    100,  0.3),
          signal:        drift(prev.signal,        0,    100,  1),
          heading:       drift(prev.heading,       0,    360,  3),
          temp:          drift(prev.temp,          20,   80,   0.5),
          payloadWeight: drift(prev.payloadWeight, 0,    5,    0.02),
          lat:           drift(prev.lat,           6.40, 6.60, 0.0003),
          lng:           drift(prev.lng,           3.25, 3.50, 0.0003),
          uptime:        uptimeRef.current,
        }
      })
    }, intervalMs)

    return () => clearInterval(id)
  }, [intervalMs])

  const enriched = {
    altitude:      { value: Math.round(data.altitude),           unit: 'M',   label: 'ALTITUDE',       pct: getPct('altitude', data.altitude),           status: getStatus('altitude', data.altitude),           prev: Math.round(prevData.altitude) },
    speed:         { value: Math.round(data.speed),              unit: 'M/S', label: 'SPEED',          pct: getPct('speed', data.speed),                 status: getStatus('speed', data.speed),                 prev: Math.round(prevData.speed) },
    battery:       { value: Math.round(data.battery),            unit: '%',   label: 'BATTERY',        pct: getPct('battery', data.battery),             status: getStatus('battery', data.battery),             prev: Math.round(prevData.battery) },
    signal:        { value: Math.round(data.signal),             unit: '%',   label: 'SIGNAL',         pct: getPct('signal', data.signal),               status: getStatus('signal', data.signal),               prev: Math.round(prevData.signal) },
    heading:       { value: Math.round(data.heading),            unit: '°',   label: 'HEADING',        pct: getPct('altitude', data.heading),            status: 'normal',                                       prev: Math.round(prevData.heading) },
    temp:          { value: Math.round(data.temp),               unit: '°C',  label: 'TEMP',           pct: getPct('temp', data.temp),                   status: getStatus('temp', data.temp),                   prev: Math.round(prevData.temp) },
    payloadWeight: { value: data.payloadWeight.toFixed(1),       unit: 'KG',  label: 'PAYLOAD',        pct: getPct('payloadWeight', data.payloadWeight), status: getStatus('payloadWeight', data.payloadWeight), prev: prevData.payloadWeight.toFixed(1) },
    coords:        { lat: data.lat.toFixed(4),                   lng: data.lng.toFixed(4) },
    uptime:        data.uptime,
  }


  // Emit telemetry warning events
  const prevStatusRef = typeof window !== 'undefined' ? (window.__skycleckTeleStatus = window.__skycleckTeleStatus || {}) : {}
  Object.entries(enriched).forEach(([key, metric]) => {
    if (!metric || typeof metric.status === 'undefined') return
    const prev = prevStatusRef[key]
    if (prev !== metric.status) {
      if (metric.status === 'danger') emitEvent('TELE_DANGER', `${metric.label} critical — ${metric.value}${metric.unit}`)
      else if (metric.status === 'warn' && prev !== 'danger') emitEvent('TELE_WARN', `${metric.label} warning — ${metric.value}${metric.unit}`)
      else if (metric.status === 'normal' && prev && prev !== 'normal') emitEvent('TELE_NORMAL', `${metric.label} returned to normal — ${metric.value}${metric.unit}`)
      prevStatusRef[key] = metric.status
    }
  })

  return enriched
}
