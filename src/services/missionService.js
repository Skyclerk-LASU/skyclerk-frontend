// Skycleck — Firebase Mission Service
// Firestore collection: /missions/{pkgId}

import { collection, doc, getDocs, updateDoc, onSnapshot, serverTimestamp, setDoc, query, orderBy } from 'firebase/firestore'
import { db }        from './firebase'
import { emitEvent } from './missionEventBus'

const COL = 'missions'

export async function fetchMissions() {
  try {
    const snap = await getDocs(query(collection(db, COL), orderBy('id')))
    if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) { console.warn('[Firebase] fetchMissions fallback:', err.message) }
  return [
    { id: 'PKG-041', dest: 'MECH', state: 'IDLE', progress: 0, eta: '00:00:00' },
    { id: 'PKG-042', dest: 'CPE',  state: 'IDLE', progress: 0, eta: '00:00:00' },
    { id: 'PKG-043', dest: 'ECE',  state: 'IDLE', progress: 0, eta: '00:00:00' },
    { id: 'PKG-044', dest: 'ASE',  state: 'IDLE', progress: 0, eta: '00:00:00' },
  ]
}

export function subscribeMissions(onData) {
  return onSnapshot(query(collection(db, COL), orderBy('id')), snap => {
    onData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, err => emitEvent('SYS_ERR', `Mission sync error — ${err.message}`))
}

export async function startMission(pkgId, destination) {
  try {
    await updateDoc(doc(db, COL, pkgId), { state: 'PREPARING', progress: 0, startedAt: serverTimestamp() })
    emitEvent('MISSION_START', `${pkgId} started — preparing for departure to ${destination}`)
    return { success: true }
  } catch (err) { emitEvent('SYS_ERR', `Failed to start ${pkgId}`); throw err }
}

export async function updateMission(pkgId, updates) {
  await updateDoc(doc(db, COL, pkgId), { ...updates, updatedAt: serverTimestamp() })
}

export async function markDelivered(pkgId) {
  await updateDoc(doc(db, COL, pkgId), { state: 'DELIVERED', progress: 100, eta: '00:00:00', deliveredAt: serverTimestamp() })
  emitEvent('DELIVERED', `${pkgId} delivery confirmed`)
}

export async function returnToBase(pkgId) {
  await updateDoc(doc(db, COL, pkgId), { state: 'RETURNING', updatedAt: serverTimestamp() })
  emitEvent('RETURNING', `${pkgId} returning to base`)
}

export async function emergencyStopAll(ids) {
  await Promise.all(ids.map(id => updateDoc(doc(db, COL, id), { state: 'EMERGENCY', updatedAt: serverTimestamp() })))
  emitEvent('EMERGENCY', 'EMERGENCY STOP — all missions halted')
}

export async function resetMission(pkgId) {
  await updateDoc(doc(db, COL, pkgId), { state: 'IDLE', progress: 0, eta: '00:00:00', updatedAt: serverTimestamp() })
  emitEvent('RESET', `${pkgId} reset to IDLE`)
}

// ─────────────────────────────────────────────────────────────────────
// NEW: Notification-Triggered Mission Updates
// These functions update mission state AND trigger appropriate notifications
// ─────────────────────────────────────────────────────────────────────

export async function markDroneLoaded(pkgId) {
  const mission = { id: pkgId, state: 'LOADED' }
  await updateDoc(doc(db, COL, pkgId), { state: 'LOADED', progress: 5, updatedAt: serverTimestamp() })
  emitEvent('SYS_OK', `${pkgId} marked as LOADED`)
  
  // Trigger automated notifications
  const { triggerDroneLoadedNotifications } = await import('./automatedNotificationService')
  try {
    await triggerDroneLoadedNotifications(mission)
  } catch (err) {
    console.warn('Notification trigger error:', err.message)
  }
}

export async function markEnRoute(pkgId, eta) {
  const mission = { id: pkgId, state: 'EN_ROUTE', eta: eta || '00:15:00' }
  await updateDoc(doc(db, COL, pkgId), { state: 'EN_ROUTE', progress: 25, eta: eta || '00:15:00', updatedAt: serverTimestamp() })
  emitEvent('EN_ROUTE', `${pkgId} is en route — ETA: ${eta}`)
  
  // Trigger automated notifications
  const { triggerEnRouteNotifications } = await import('./automatedNotificationService')
  try {
    await triggerEnRouteNotifications(mission)
  } catch (err) {
    console.warn('Notification trigger error:', err.message)
  }
}

export async function markLanded(pkgId) {
  const mission = { id: pkgId, state: 'LANDED' }
  await updateDoc(doc(db, COL, pkgId), { state: 'LANDED', progress: 60, updatedAt: serverTimestamp() })
  emitEvent('LAND', `${pkgId} has LANDED`)
  
  // Trigger automated notifications  
  const { triggerLandedNotifications } = await import('./automatedNotificationService')
  try {
    await triggerLandedNotifications(mission)
  } catch (err) {
    console.warn('Notification trigger error:', err.message)
  }
}

export async function markPackageOffloaded(pkgId) {
  const mission = { id: pkgId, state: 'OFFLOADED' }
  await updateDoc(doc(db, COL, pkgId), { state: 'OFFLOADED', progress: 80, updatedAt: serverTimestamp() })
  emitEvent('SYS_OK', `${pkgId} PACKAGE OFFLOADED`)
  
  // Trigger automated notifications
  const { triggerOffloadedNotifications } = await import('./automatedNotificationService')
  try {
    await triggerOffloadedNotifications(mission)
  } catch (err) {
    console.warn('Notification trigger error:', err.message)
  }
}

export async function markReturningToBase(pkgId) {
  const mission = { id: pkgId, state: 'RETURNING' }
  await updateDoc(doc(db, COL, pkgId), { state: 'RETURNING', progress: 90, updatedAt: serverTimestamp() })
  emitEvent('RETURNING', `${pkgId} RETURNING TO BASE`)
  
  // Trigger automated notifications
  const { triggerReturningNotifications } = await import('./automatedNotificationService')
  try {
    await triggerReturningNotifications(mission)
  } catch (err) {
    console.warn('Notification trigger error:', err.message)
  }
}

// Run once to seed Firestore: import('./services/missionService').then(m => m.seedMissions())
export async function seedMissions() {
  const pkgs = [
    { id: 'PKG-041', dest: 'MECH' }, { id: 'PKG-042', dest: 'CPE' },
    { id: 'PKG-043', dest: 'ECE'  }, { id: 'PKG-044', dest: 'ASE' },
  ]
  for (const p of pkgs) {
    await setDoc(doc(db, COL, p.id), { ...p, state: 'IDLE', progress: 0, eta: '00:00:00', createdAt: serverTimestamp() }, { merge: true })
  }
  console.log('[Firebase] Missions seeded')
}
