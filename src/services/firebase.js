import { initializeApp } from 'firebase/app'
import { getAuth }       from 'firebase/auth'
import { getFirestore }  from 'firebase/firestore'
import { getDatabase }   from 'firebase/database'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY             || 'AIzaSyC6xrIup-HYfty0_qSvr3xH_LL7PJyB9-k',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN         || 'skyclerk-df8eb.firebaseapp.com',
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL        || 'https://skyclerk-df8eb-default-rtdb.firebaseio.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID          || 'skyclerk-df8eb',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET      || 'skyclerk-df8eb.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '204070457139',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID              || '1:204070457139:web:ce82ba4d774824c0273846',
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID      || 'G-01KJM9WN7N',
}

const app  = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db   = getFirestore(app)
export const rtdb = getDatabase(app)
export default app
