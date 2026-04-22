// ─────────────────────────────────────────────────────────────────────
// User & Role Management Service
// Stores user profiles with roles (admin, sender, receiver)
// Manages contact information and notification preferences
// ─────────────────────────────────────────────────────────────────────

import { collection, addDoc, getDocs, updateDoc, doc, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const COL = 'users'

export const USER_ROLES = {
  ADMIN: 'admin',
  SENDER: 'sender', 
  RECEIVER: 'receiver',
}

// Example users config (in real system, these come from Firebase)
const DEFAULT_USERS = {
  admin_01: {
    id: 'admin_01',
    name: 'LASU Operations Center',
    role: USER_ROLES.ADMIN,
    email: 'ops@lasu-skyclerk.edu.ng',
    phone: '+234 800 000 0001',
    location: 'LASU EPE Campus',
    active: true,
  },
  sender_01: {
    id: 'sender_01',
    name: 'Warehouse Manager',
    role: USER_ROLES.SENDER,
    email: 'warehouse@lasu-skyclerk.edu.ng',
    phone: '+234 800 000 0002',
    location: 'Main Warehouse',
    active: true,
  },
  receiver_001: {
    id: 'receiver_001',
    name: 'Department of Mechanical Engineering',
    role: USER_ROLES.RECEIVER,
    email: 'mech.dept@lasu.edu.ng',
    phone: '+234 800 111 0001',
    location: 'MECH Building',
    active: true,
  },
  receiver_002: {
    id: 'receiver_002',
    name: 'Department of Computer Engineering',
    role: USER_ROLES.RECEIVER,
    email: 'cpe.dept@lasu.edu.ng',
    phone: '+234 800 111 0002',
    location: 'CPE Building',
    active: true,
  },
  receiver_003: {
    id: 'receiver_003',
    name: 'Department of Electrical Engineering',
    role: USER_ROLES.RECEIVER,
    email: 'ece.dept@lasu.edu.ng',
    phone: '+234 800 111 0003',
    location: 'ECE Building',
    active: true,
  },
}

// Fetch all users (with fallback to defaults)
export async function fetchAllUsers() {
  try {
    const snap = await getDocs(collection(db, COL))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.warn('[Firebase] Users fetch fallback:', err.message)
    return Object.values(DEFAULT_USERS)
  }
}

// Fetch user by ID
export async function fetchUserById(userId) {
  try {
    const snap = await getDocs(query(collection(db, COL), where('id', '==', userId)))
    return snap.empty ? null : snap.docs[0].data()
  } catch (err) {
    console.warn('[Firebase] User fetch error:', err.message)
    return DEFAULT_USERS[userId] || null
  }
}

// Fetch users by role
export async function fetchUsersByRole(role) {
  try {
    const snap = await getDocs(query(collection(db, COL), where('role', '==', role)))
    return snap.docs.map(d => d.data())
  } catch (err) {
    console.warn('[Firebase] Role query fallback:', err.message)
    return Object.values(DEFAULT_USERS).filter(u => u.role === role)
  }
}

// Get receiver for a destination (e.g., "MECH" → Department of Mechanical Engineering)
export async function getReceiverForDestination(destination) {
  const receivers = await fetchUsersByRole(USER_ROLES.RECEIVER)
  // Map destination short codes to receivers
  const destMap = {
    'MECH': receivers.find(r => r.id === 'receiver_001'),
    'CPE': receivers.find(r => r.id === 'receiver_002'),
    'ECE': receivers.find(r => r.id === 'receiver_003'),
    'ASE': receivers.find(r => r.id === 'receiver_003'),
  }
  return destMap[destination] || receivers[0] // fallback to first receiver
}

// Get admin users
export async function getAdmins() {
  return fetchUsersByRole(USER_ROLES.ADMIN)
}

// Get sender (usually one warehouse)
export async function getSender() {
  const senders = await fetchUsersByRole(USER_ROLES.SENDER)
  return senders[0] || Object.values(DEFAULT_USERS).find(u => u.role === USER_ROLES.SENDER)
}

// Create/update user in Firebase
export async function saveUser(userData) {
  try {
    if (userData.id) {
      const docRef = doc(db, COL, userData.id)
      await updateDoc(docRef, { ...userData, updatedAt: serverTimestamp() })
    } else {
      await addDoc(collection(db, COL), { ...userData, createdAt: serverTimestamp() })
    }
    return { success: true }
  } catch (err) {
    console.error('[Firebase] Save user error:', err)
    throw err
  }
}

export default {
  fetchAllUsers,
  fetchUserById,
  fetchUsersByRole,
  getReceiverForDestination,
  getAdmins,
  getSender,
  saveUser,
  USER_ROLES,
  DEFAULT_USERS,
}
