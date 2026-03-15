// ─────────────────────────────────────────────────────────────
// Skycleck — Firebase Telemetry Service
// Realtime Database: /telemetry/live  (drone pushes here)
// Firestore:         /drones/{droneId}/status
// ─────────────────────────────────────────────────────────────

import { ref, onValue, off, set } from 'firebase/database'
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { rtdb, db } from './firebase'
import { emitEvent } from './missionEventBus'

const DRONE_ID       = 'SKYCLECK-01'
const TELE_LIVE_PATH = 'telemetry/live'

// Subscribe to live telemetry from Firebase Realtime DB
// Falls back to simulation if Firebase unreachable
export function subscribeLiveTelemetry(onData, onError) {
  const teleRef = ref(rtdb, TELE_LIVE_PATH)

  onValue(
    teleRef,
    (snapshot) => {
      const data = snapshot.val()
      if (data) onData(data)
    },
    (err) => {
      console.error('[Firebase] Telemetry error:', err)
      onError?.(err)
      emitEvent('SYS_WARN', 'Firebase unreachable — using simulated telemetry')
      startSimulatedTelemetry(onData)
    }
  )

  emitEvent('SYS_OK', 'Firebase telemetry stream connected')
  return () => off(teleRef)
}

// Push telemetry from drone / for testing
export async function pushTelemetry(data) {
  await set(ref(rtdb, TELE_LIVE_PATH), { ...data, timestamp: Date.now() })
}

// Firestore drone status
export async function fetchDroneStatus() {
  try {
    const snap = await getDoc(doc(db, 'drones', DRONE_ID))
    return snap.exists() ? snap.data() : null
  } catch (err) {
    console.error('[Firebase] Drone status error:', err)
    return null
  }
}

export function subscribeDroneStatus(onData) {
  return onSnapshot(doc(db, 'drones', DRONE_ID), snap => {
    if (snap.exists()) onData(snap.data())
  })
}

// ── Simulated fallback ──
let simInterval = null
let _s = { altitude:120, speed:14, battery:67, signal:92, heading:247, temp:38, payloadWeight:1.2, lat:6.5500, lng:3.9800 }
const drift = (v,mn,mx,st) => Math.min(mx,Math.max(mn,parseFloat((v+(Math.random()-.5)*st).toFixed(2))))

export function startSimulatedTelemetry(onData, ms=1200) {
  stopSimulatedTelemetry()
  simInterval = setInterval(() => {
    _s = { altitude:drift(_s.altitude,0,250,2), speed:drift(_s.speed,0,30,1.5), battery:drift(_s.battery,0,100,0.3),
           signal:drift(_s.signal,0,100,1), heading:drift(_s.heading,0,360,3), temp:drift(_s.temp,20,80,0.5),
           payloadWeight:drift(_s.payloadWeight,0,5,0.02), lat:drift(_s.lat,6.54,6.56,0.0003),
           lng:drift(_s.lng,3.97,3.99,0.0003), timestamp:Date.now() }
    onData(_s)
  }, ms)
  return stopSimulatedTelemetry
}

export function stopSimulatedTelemetry() {
  if (simInterval) { clearInterval(simInterval); simInterval = null }
}
