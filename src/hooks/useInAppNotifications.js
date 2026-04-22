import { useState, useEffect, useCallback } from 'react'
import { subscribeToNotifications } from '../services/inAppNotificationService'

export function useInAppNotifications() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notification) => {
      if (notification.dismissed) {
        // Remove notification
        setNotifications(prev => prev.filter(n => n.id !== notification.id))
      } else {
        // Add notification
        setNotifications(prev => [...prev, notification])
      }
    })

    return unsubscribe
  }, [])

  const dismissById = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return { notifications, dismissById }
}
