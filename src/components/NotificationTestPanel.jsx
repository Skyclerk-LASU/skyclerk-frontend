import { useState } from 'react'
import { notify } from '../services/inAppNotificationService'
import {
  markDroneLoaded,
  markEnRoute,
  markLanded,
  markPackageOffloaded,
  markReturningToBase
} from '../services/missionService'

export default function NotificationTestPanel() {
  const [selectedPkg, setSelectedPkg] = useState('PKG-041')
  const [eta, setEta] = useState('00:15:30')
  const [isOpen, setIsOpen] = useState(false)

  const packages = ['PKG-041', 'PKG-042', 'PKG-043', 'PKG-044']

  const testToast = (type) => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'An error occurred during operation',
      warning: 'Warning: Check system status',
      info: 'Information: System running normally',
      alert: 'ALERT: Critical system issue detected'
    }

    notify[type](`${type.toUpperCase()} TEST`, messages[type])
  }

  const triggerMissionEvent = async (eventType) => {
    try {
      switch (eventType) {
        case 'loaded':
          await markDroneLoaded(selectedPkg)
          break
        case 'enroute':
          await markEnRoute(selectedPkg, eta)
          break
        case 'landed':
          await markLanded(selectedPkg)
          break
        case 'offloaded':
          await markPackageOffloaded(selectedPkg)
          break
        case 'returning':
          await markReturningToBase(selectedPkg)
          break
      }
    } catch (error) {
      notify.error('Mission Update Failed', error.message)
    }
  }

  return (
    <div className="notification-test-dock">
      {isOpen && (
        <div className="notification-test-panel">
          <div className="notification-test-panel__header">
            <h3 className="notification-test-panel__title">Notification Test Panel</h3>
            <button
              type="button"
              className="notification-test-panel__collapse"
              onClick={() => setIsOpen(false)}
              aria-label="Collapse notification test panel"
            >
              x
            </button>
          </div>

          <div className="notification-test-panel__section">
            <label className="notification-test-panel__label" htmlFor="notification-test-package">
              Package ID:
            </label>
            <select
              id="notification-test-package"
              value={selectedPkg}
              onChange={(e) => setSelectedPkg(e.target.value)}
              className="notification-test-panel__field"
            >
              {packages.map(pkg => (
                <option key={pkg} value={pkg}>{pkg}</option>
              ))}
            </select>
          </div>

          <div className="notification-test-panel__section">
            <label className="notification-test-panel__label" htmlFor="notification-test-eta">
              ETA (for en-route):
            </label>
            <input
              id="notification-test-eta"
              type="text"
              value={eta}
              onChange={(e) => setEta(e.target.value)}
              placeholder="00:15:30"
              className="notification-test-panel__field"
            />
          </div>

          <div className="notification-test-panel__section">
            <div className="notification-test-panel__label">Toast Tests:</div>
            <div className="notification-test-panel__actions">
              {['success', 'error', 'warning', 'info', 'alert'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => testToast(type)}
                  className="notification-test-panel__action notification-test-panel__action--blue"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="notification-test-panel__section">
            <div className="notification-test-panel__label">Mission Events (ESP Triggers):</div>
            <div className="notification-test-panel__actions">
              {[
                { key: 'loaded', label: 'Loaded', colorClass: 'green' },
                { key: 'enroute', label: 'En Route', colorClass: 'cyan' },
                { key: 'landed', label: 'Landed', colorClass: 'amber' },
                { key: 'offloaded', label: 'Offloaded', colorClass: 'green' },
                { key: 'returning', label: 'Returning', colorClass: 'slate' }
              ].map(event => (
                <button
                  key={event.key}
                  type="button"
                  onClick={() => triggerMissionEvent(event.key)}
                  className={`notification-test-panel__action notification-test-panel__action--${event.colorClass}`}
                >
                  {event.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        className="notification-test-dock__toggle"
        onClick={() => setIsOpen(open => !open)}
        aria-expanded={isOpen}
      >
        {isOpen ? 'Hide Test Panel' : 'Open Test Panel'}
      </button>
    </div>
  )
}
