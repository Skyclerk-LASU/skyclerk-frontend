import { useState, useEffect } from 'react'
import { ref, onValue, off } from 'firebase/database'
import { rtdb } from '../services/firebase'

export default function ConnectionStatus() {
  const [status,  setStatus]  = useState('checking')
  const [latency, setLatency] = useState(null)

  useEffect(() => {
    // Firebase has a built-in .info/connected path in Realtime DB
    const connRef = ref(rtdb, '.info/connected')
    const start   = Date.now()

    onValue(connRef, (snap) => {
      const connected = snap.val()
      setStatus(connected ? 'online' : 'offline')
      setLatency(connected ? Date.now() - start : null)
    })

    return () => off(connRef)
  }, [])

  const label     = status === 'online'   ? `FIREBASE ${latency ? latency + 'ms' : 'OK'}`
                  : status === 'offline'  ? 'FIREBASE OFFLINE'
                  : 'CONNECTING'
  const pillClass = status === 'online'  ? 'online'  : status === 'offline' ? 'offline' : 'warning'
  const dotClass  = status === 'online'  ? 'green'   : status === 'offline' ? 'red'     : 'amber'

  return (
    <div className={`status-pill ${pillClass}`}>
      <div className={`dot ${dotClass}`} />
      {label}
    </div>
  )
}
