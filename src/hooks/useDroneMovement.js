import { useState, useEffect, useRef } from 'react'

// Warehouse origin and delivery destinations (Lagos area coords)
export const WAREHOUSE = { lat: 6.5500, lng: 3.9800, label: 'WAREHOUSE' }

export const DESTINATIONS = [
  { id: 'PKG-041', label: 'MECH', lat: 6.5520, lng: 3.9830 },
  { id: 'PKG-042', label: 'CPE',  lat: 6.5510, lng: 3.9770 },
  { id: 'PKG-043', label: 'ECE',  lat: 6.5490, lng: 3.9820 },
  { id: 'PKG-044', label: 'ASE',  lat: 6.5480, lng: 3.9760 },
]

function lerp(a, b, t) {
  return a + (b - a) * t
}

function buildRoute(from, to, steps = 60) {
  const points = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    // Add slight arc to make path look natural
    const arc = Math.sin(t * Math.PI) * 0.004
    points.push({
      lat: lerp(from.lat, to.lat, t) + arc,
      lng: lerp(from.lng, to.lng, t),
    })
  }
  return points
}

export function useDroneMovement(intervalMs = 800) {
  const destIndex = useRef(0)
  const stepRef   = useRef(0)
  const routeRef  = useRef(buildRoute(WAREHOUSE, DESTINATIONS[0]))
  const [state, setState] = useState({
    position:    { lat: WAREHOUSE.lat, lng: WAREHOUSE.lng },
    route:       routeRef.current,
    destination: DESTINATIONS[0],
    destIndex:   0,
    progress:    0,         // 0–100
    status:      'EN ROUTE',
    heading:     0,
    pathHistory: [{ lat: WAREHOUSE.lat, lng: WAREHOUSE.lng }],
  })

  useEffect(() => {
    const id = setInterval(() => {
      const route = routeRef.current
      const step  = stepRef.current

      if (step >= route.length - 1) {
        // Arrived — pick next destination
        const nextDestIdx = (destIndex.current + 1) % DESTINATIONS.length
        destIndex.current = nextDestIdx
        stepRef.current   = 0
        const nextDest    = DESTINATIONS[nextDestIdx]
        const currentPos  = route[route.length - 1]
        routeRef.current  = buildRoute(currentPos, nextDest)

        setState(prev => ({
          ...prev,
          destination: nextDest,
          destIndex:   nextDestIdx,
          route:       routeRef.current,
          status:      'EN ROUTE',
          progress:    0,
          pathHistory: [], // reset trail
        }))
        return
      }

      const current = route[step]
      const next    = route[step + 1]

      // Calculate heading angle
      const dLat = next.lat - current.lat
      const dLng = next.lng - current.lng
      const heading = Math.atan2(dLng, dLat) * (180 / Math.PI)

      stepRef.current = step + 1
      const progress  = Math.round((step / (route.length - 1)) * 100)

      setState(prev => ({
        ...prev,
        position:    next,
        heading:     heading,
        progress:    progress,
        status:      progress >= 95 ? 'ARRIVING' : 'EN ROUTE',
        pathHistory: [...prev.pathHistory.slice(-80), next],
      }))
    }, intervalMs)

    return () => clearInterval(id)
  }, [intervalMs])

  return state
}
