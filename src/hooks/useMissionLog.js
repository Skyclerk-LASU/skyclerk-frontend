import { useState, useEffect, useRef, useCallback } from 'react'
import { subscribeMissionLog, emitEvent, EVENT_TYPES } from '../services/missionEventBus'

const MAX_ENTRIES = 200

const BOOT_ENTRIES = [
  { id: -4, time: '00:00:00', label: 'SYS',   color: 'neutral', category: 'SYS', message: '─────────────────────────────────────────' },
  { id: -3, time: '00:00:00', label: 'SYS',   color: 'ok',      category: 'SYS', message: 'SKYCLECK DRONE OPS v2.4 — SYSTEM BOOT' },
  { id: -2, time: '00:00:00', label: 'SYS',   color: 'neutral', category: 'SYS', message: 'Mission log initialised — monitoring active' },
  { id: -1, time: '00:00:00', label: 'SYS',   color: 'neutral', category: 'SYS', message: '─────────────────────────────────────────' },
]

export const FILTER_CATEGORIES = [
  { id: 'ALL', label: 'ALL' },
  { id: 'FLT', label: 'FLIGHT' },
  { id: 'PKG', label: 'DELIVERY' },
  { id: 'SEN', label: 'SENSOR' },
  { id: 'COM', label: 'COMMS' },
  { id: 'TLM', label: 'TELEM' },
  { id: 'SYS', label: 'SYSTEM' },
]

export function useMissionLog() {
  const [entries,    setEntries]    = useState(BOOT_ENTRIES)
  const [filter,     setFilter]     = useState('ALL')
  const [paused,     setPaused]     = useState(false)
  const [search,     setSearch]     = useState('')
  const pauseRef                    = useRef(false)
  const bufferRef                   = useRef([])

  useEffect(() => {
    pauseRef.current = paused
  }, [paused])

  useEffect(() => {
    const unsub = subscribeMissionLog((entry) => {
      if (pauseRef.current) {
        bufferRef.current.push(entry)
        return
      }
      setEntries(prev => [...prev, entry].slice(-MAX_ENTRIES))
    })

    // Emit boot system events after short delay
    const t1 = setTimeout(() => emitEvent('SYS_OK',  'All subsystems nominal — ready for mission'), 800)
    const t2 = setTimeout(() => emitEvent('SYS',     'Drone SKYCLECK-01 registered on network'), 1400)
    const t3 = setTimeout(() => emitEvent('TAKEOFF',  'Drone airborne — altitude climb initiated'), 2200)
    const t4 = setTimeout(() => emitEvent('WAYPOINT', 'Route loaded — MECH → CPE → ECE → ASE'), 3000)

    return () => {
      unsub()
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4)
    }
  }, [])

  const resume = useCallback(() => {
    setPaused(false)
    if (bufferRef.current.length > 0) {
      setEntries(prev => [...prev, ...bufferRef.current].slice(-MAX_ENTRIES))
      bufferRef.current = []
    }
  }, [])

  const clearLog = useCallback(() => {
    setEntries([{ id: Date.now(), time: new Date().toTimeString().slice(0,8), label: 'SYS', color: 'neutral', category: 'SYS', message: 'Log cleared by operator' }])
  }, [])

  const filtered = entries.filter(e => {
    const catMatch    = filter === 'ALL' || e.category === filter
    const searchMatch = !search || e.message.toLowerCase().includes(search.toLowerCase()) || e.label.toLowerCase().includes(search.toLowerCase())
    return catMatch && searchMatch
  })

  return {
    entries: filtered,
    totalCount: entries.length,
    filter, setFilter,
    paused, setPaused: (v) => { if (!v) resume(); else setPaused(true) },
    search, setSearch,
    clearLog,
    buffered: bufferRef.current.length,
  }
}
