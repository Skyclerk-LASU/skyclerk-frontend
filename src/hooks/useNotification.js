import { emitEvent } from '../services/missionEventBus'
import { useState, useCallback } from 'react'
import {
  sendDepartureNotification,
  sendArrivalNotification,
  sendDelayNotification,
  sendCustomNotification,
} from '../services/notificationService'

export const CHANNELS = ['SMS', 'EMAIL', 'BOTH']

const INITIAL_SENDER = { name: '', location: 'LASU EPE WAREHOUSE', phone: '', email: '' }
const INITIAL_RECIPIENT = { name: '', phone: '', email: '' }

export function useNotification() {
  const [sender,       setSender]       = useState(INITIAL_SENDER)
  const [recipient,    setRecipient]    = useState(INITIAL_RECIPIENT)
  const [channel,      setChannel]      = useState('SMS')
  const [selectedPkg,  setSelectedPkg]  = useState('PKG-041')
  const [customBody,   setCustomBody]   = useState('')
  const [delayReason,  setDelayReason]  = useState('')
  const [sending,      setSending]      = useState(false)
  const [history,      setHistory]      = useState([])
  const [lastResult,   setLastResult]   = useState(null)

  const PACKAGES = [
    { id: 'PKG-041', dest: 'MECH', eta: '00:08:32' },
    { id: 'PKG-042', dest: 'CPE',  eta: '00:22:10' },
    { id: 'PKG-043', dest: 'ECE',  eta: '00:35:44' },
    { id: 'PKG-044', dest: 'ASE',  eta: '00:48:20' },
  ]

  const pkg = PACKAGES.find(p => p.id === selectedPkg) || PACKAGES[0]

  const addToHistory = (type, result, error = null) => {
    const now  = new Date()
    const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
    setHistory(prev => [{
      time,
      type,
      pkg:       selectedPkg,
      recipient: recipient.name || recipient.phone || '—',
      channel,
      success:   !error,
      messageId: result?.messageId,
      error:     error?.message,
    }, ...prev].slice(0, 20))
  }

  const validate = () => {
    if (!recipient.name) return 'Recipient name is required'
    if (channel !== 'EMAIL' && !recipient.phone) return 'Recipient phone is required for SMS'
    if (channel !== 'SMS'   && !recipient.email) return 'Recipient email is required'
    return null
  }

  const send = useCallback(async (type) => {
    const err = validate()
    if (err) { setLastResult({ success: false, error: err }); return }

    setSending(true)
    setLastResult(null)
    try {
      let result
      const base = { pkg, sender, recipient, channel }
      if      (type === 'DEPARTURE') result = await sendDepartureNotification(base)
      else if (type === 'ARRIVAL')   result = await sendArrivalNotification(base)
      else if (type === 'DELAY')     result = await sendDelayNotification({ ...base, reason: delayReason })
      else if (type === 'CUSTOM')    result = await sendCustomNotification({ ...base, body: customBody })
      setLastResult(result)
      addToHistory(type, result)
      emitEvent('NOTIF_SENT', `${type} notification sent to ${recipient.name || recipient.phone} for ${selectedPkg}`)
    } catch (e) {
      setLastResult({ success: false, error: e.message })
      addToHistory(type, null, e)
      emitEvent('NOTIF_FAIL', `${type} notification failed — ${e.message}`)
    } finally {
      setSending(false)
    }
  }, [pkg, sender, recipient, channel, delayReason, customBody])

  return {
    sender, setSender,
    recipient, setRecipient,
    channel, setChannel,
    selectedPkg, setSelectedPkg,
    customBody, setCustomBody,
    delayReason, setDelayReason,
    sending, history, lastResult,
    sendDeparture:  () => send('DEPARTURE'),
    sendArrival:    () => send('ARRIVAL'),
    sendDelay:      () => send('DELAY'),
    sendCustom:     () => send('CUSTOM'),
    PACKAGES,
  }
}
