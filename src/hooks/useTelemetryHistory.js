import { useState, useEffect, useRef } from 'react'
import { useTelemetry } from './useTelemetry'

const MAX_POINTS   = 60   // 60 data points visible at a time
const SAMPLE_MS    = 1200 // match telemetry interval

function nowLabel() {
  const d = new Date()
  return `${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`
}

const EMPTY_SERIES = () => ({
  labels:   [],
  battery:  [],
  altitude: [],
  speed:    [],
  signal:   [],
  temp:     [],
})

export function useTelemetryHistory() {
  const tele    = useTelemetry(SAMPLE_MS)
  const [series, setSeries] = useState(EMPTY_SERIES)
  const tickRef = useRef(0)

  useEffect(() => {
    tickRef.current += 1
    const tick  = tickRef.current
    const label = nowLabel()

    setSeries(prev => {
      const trim = arr => arr.length >= MAX_POINTS ? arr.slice(1) : arr
      return {
        labels:   [...trim(prev.labels),   label],
        battery:  [...trim(prev.battery),  Number(tele.battery.value)],
        altitude: [...trim(prev.altitude), Number(tele.altitude.value)],
        speed:    [...trim(prev.speed),    Number(tele.speed.value)],
        signal:   [...trim(prev.signal),   Number(tele.signal.value)],
        temp:     [...trim(prev.temp),     Number(tele.temp.value)],
      }
    })
  }, [tele.battery.value, tele.altitude.value, tele.speed.value])

  return { series, tele }
}
