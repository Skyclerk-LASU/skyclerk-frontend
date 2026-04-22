import { useInAppNotifications } from '../hooks/useInAppNotifications'
import '../styles/toast-notifications.css'

export default function ToastNotificationContainer() {
  const { notifications, dismissById } = useInAppNotifications()

  return (
    <div className="toast-container">
      {notifications.map(notif => (
        <Toast
          key={notif.id}
          notification={notif}
          onDismiss={() => dismissById(notif.id)}
        />
      ))}
    </div>
  )
}

function Toast({ notification, onDismiss }) {
  const { id, title, message, type } = notification

  return (
    <div className={`toast toast--${type}`} role="alert">
      <div className="toast-content">
        <div className="toast-icon">{getIconForType(type)}</div>
        <div className="toast-text">
          <div className="toast-title">{title}</div>
          <div className="toast-message">{message}</div>
        </div>
      </div>
      <button className="toast-close" onClick={onDismiss} aria-label="Close">
        ✕
      </button>
    </div>
  )
}

function getIconForType(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ⓘ',
    alert: '🔴',
  }
  return icons[type] || 'ⓘ'
}
