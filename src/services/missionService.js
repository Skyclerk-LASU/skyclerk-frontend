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
