import { useEffect, useRef, useState } from 'react'
import { notify } from '../services/inAppNotificationService'
import { fetchWeatherSafety } from '../services/weatherService'

export function useWeatherSafety() {
  const [state, setState] = useState({
    loading: true,
    error: '',
    advisory: null,
  })
  const lastStatusRef = useRef('')

  const refresh = async ({ silent = false } = {}) => {
    if (!silent) {
      setState(prev => ({ ...prev, loading: true, error: '' }))
    }

    try {
      const advisory = await fetchWeatherSafety()
      setState({ loading: false, error: '', advisory })

      if (lastStatusRef.current && lastStatusRef.current !== advisory.status) {
        if (advisory.status === 'unsafe') {
          notify.alert('Weather Hold Recommended', advisory.reasons[0] || 'Conditions are unsafe for drone flight', 7000)
        } else if (advisory.status === 'caution') {
          notify.warning('Weather Caution', advisory.reasons[0] || 'Review conditions before takeoff', 6000)
        } else if (lastStatusRef.current !== 'safe') {
          notify.success('Weather Cleared', 'Current conditions are back within the safe flight window', 5000)
        }
      }

      lastStatusRef.current = advisory.status
    } catch (error) {
      setState({ loading: false, error: error.message || 'Unable to load weather advisory', advisory: null })
    }
  }

  useEffect(() => {
    refresh()
    const intervalId = window.setInterval(() => refresh({ silent: true }), 5 * 60 * 1000)
    return () => window.clearInterval(intervalId)
  }, [])

  return {
    ...state,
    refresh,
  }
}
