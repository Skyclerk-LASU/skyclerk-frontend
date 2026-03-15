import { useState, useEffect, useRef, useCallback } from 'react'
import { emitEvent } from '../services/missionEventBus'

export const MISSION_STATES = {
  IDLE:       { label: 'IDLE',       color: 'neutral', next: ['PREPARING'] },
  PREPARING:  { label: 'PREPARING',  color: 'info',    next: ['DEPARTED', 'IDLE'] },
  DEPARTED:   { label: 'DEPARTED',   color: 'info',    next: ['EN_ROUTE'] },
  EN_ROUTE:   { label: 'EN ROUTE',   color: 'active',  next: ['ARRIVING', 'RETURNING'] },
  ARRIVING:   { label: 'ARRIVING',   color: 'warn',    next: ['DELIVERED', 'RETURNING'] },
  DELIVERED:  { label: 'DELIVERED',  color: 'success', next: ['RETURNING', 'IDLE'] },
  RETURNING:  { label: 'RETURNING',  color: 'info',    next: ['IDLE'] },
  EMERGENCY:  { label: 'EMERGENCY',  color: 'danger',  next: ['IDLE'] },
}

const INITIAL_PACKAGES = [
  { id: 'PKG-041', dest: 'MECH', state: 'IDLE', progress: 0, eta: '00:00:00' },
  { id: 'PKG-042', dest: 'CPE',  state: 'IDLE', progress: 0, eta: '00:00:00' },
  { id: 'PKG-043', dest: 'ECE',  state: 'IDLE', progress: 0, eta: '00:00:00' },
  { id: 'PKG-044', dest: 'ASE',  state: 'IDLE', progress: 0, eta: '00:00:00' },
]

function calcEta(progress) {
  const remaining = Math.max(0, 100 - progress)
  const seconds   = Math.round((remaining / 100) * 480)
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `00:${m}:${s}`
}

export function useMission() {
  const [packages, setPackages]       = useState(INITIAL_PACKAGES)
  const [activeIndex, setActiveIndex] = useState(null)
  const prevStates                    = useRef({})
  const intervalRef                   = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setPackages(prev => prev.map(pkg => {
        if (pkg.state === 'EN_ROUTE' || pkg.state === 'ARRIVING') {
          const next     = Math.min(100, pkg.progress + 0.8)
          const newState = next >= 85 ? 'ARRIVING' : 'EN_ROUTE'
          return { ...pkg, progress: next, eta: calcEta(next), state: newState }
        }
        if (pkg.state === 'PREPARING') {
          const next = Math.min(100, pkg.progress + 2)
          return { ...pkg, progress: next, state: next >= 100 ? 'DEPARTED' : 'PREPARING' }
        }
        if (pkg.state === 'DEPARTED') {
          const next = Math.min(100, pkg.progress + 3)
          return { ...pkg, progress: next, state: next >= 100 ? 'EN_ROUTE' : 'DEPARTED', eta: calcEta(0) }
        }
        if (pkg.state === 'RETURNING') {
          const next = Math.max(0, pkg.progress - 1.2)
          return { ...pkg, progress: next, state: next <= 0 ? 'IDLE' : 'RETURNING' }
        }
        return pkg
      }))
    }, 300)
    return () => clearInterval(intervalRef.current)
  }, [])

  // Emit events on state transitions
  useEffect(() => {
    packages.forEach(pkg => {
      const prev = prevStates.current[pkg.id]
      if (prev && prev !== pkg.state) {
        const eventMap = {
          PREPARING:  ['MISSION_START', `${pkg.id} preparing for departure to ${pkg.dest}`],
          DEPARTED:   ['DEPARTED',      `${pkg.id} departed — en route to ${pkg.dest}`],
          EN_ROUTE:   ['EN_ROUTE',      `${pkg.id} en route to ${pkg.dest} — ETA ${pkg.eta}`],
          ARRIVING:   ['ARRIVING',      `${pkg.id} arriving at ${pkg.dest} — final approach`],
          DELIVERED:  ['DELIVERED',     `${pkg.id} delivered to ${pkg.dest} — mission complete`],
          RETURNING:  ['RETURNING',     `${pkg.id} returning to base`],
          IDLE:       ['RESET',         `${pkg.id} returned to base — ready`],
          EMERGENCY:  ['EMERGENCY',     `EMERGENCY STOP — ${pkg.id} halted`],
        }
        const ev = eventMap[pkg.state]
        if (ev) emitEvent(ev[0], ev[1], { pkgId: pkg.id, dest: pkg.dest })
      }
      prevStates.current[pkg.id] = pkg.state
    })
  }, [packages])

  const startDelivery = useCallback((pkgId) => {
    const pkg = packages.find(p => p.id === pkgId)
    if (!pkg || pkg.state !== 'IDLE') return
    setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, state: 'PREPARING', progress: 0 } : p))
    setActiveIndex(packages.findIndex(p => p.id === pkgId))
  }, [packages])

  const returnToBase = useCallback((pkgId) => {
    const pkg = packages.find(p => p.id === pkgId)
    if (!pkg || ['IDLE', 'RETURNING', 'EMERGENCY'].includes(pkg.state)) return
    setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, state: 'RETURNING' } : p))
    emitEvent('RETURNING', `${pkgId} RTB commanded by operator`)
  }, [packages])

  const markDelivered = useCallback((pkgId) => {
    const pkg = packages.find(p => p.id === pkgId)
    if (!pkg || !['ARRIVING', 'EN_ROUTE'].includes(pkg.state)) return
    setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, state: 'DELIVERED', progress: 100, eta: '00:00:00' } : p))
  }, [packages])

  const emergencyStop = useCallback((pkgId) => {
    if (pkgId) {
      setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, state: 'EMERGENCY' } : p))
    } else {
      setPackages(prev => prev.map(p =>
        !['IDLE', 'DELIVERED'].includes(p.state) ? { ...p, state: 'EMERGENCY' } : p
      ))
      emitEvent('EMERGENCY', 'EMERGENCY STOP — all active missions halted by operator')
    }
  }, [])

  const reset = useCallback((pkgId) => {
    setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, state: 'IDLE', progress: 0, eta: '00:00:00' } : p))
    emitEvent('RESET', `${pkgId} mission reset to IDLE`)
  }, [])

  return { packages, activeIndex, startDelivery, returnToBase, markDelivered, emergencyStop, reset }
}
