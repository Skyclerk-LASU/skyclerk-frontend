import { useState } from 'react'
import TelemetryPanel from './TelemetryPanel'
import ControlPanel from './ControlPanel'
import DeliveryControlPanel from './DeliveryControlPanel'
import NotificationPanel from './NotificationPanel'
import SensorControlPanel from './SensorControlPanel'

const TABS = [
  { id: 'telemetry',    icon: '📡', label: 'TELEM' },
  { id: 'mission',      icon: '📦', label: 'MISSION' },
  { id: 'sensor',       icon: '🔬', label: 'SENSOR' },
  { id: 'notify',       icon: '🔔', label: 'NOTIFY' },
  { id: 'control',      icon: '🕹', label: 'CTRL' },
]

export default function Sidebar() {
  const [active, setActive] = useState('telemetry')

  return (
    <div className="sidebar">
      {/* Tab strip */}
      <div className="sidebar-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`sidebar-tab ${active === tab.id ? 'sidebar-tab--active' : ''}`}
            onClick={() => setActive(tab.id)}
          >
            <span className="sidebar-tab__icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="sidebar-content">
        {active === 'telemetry' && <TelemetryPanel />}
        {active === 'mission'   && <DeliveryControlPanel />}
        {active === 'sensor'    && <SensorControlPanel />}
        {active === 'notify'    && <NotificationPanel />}
        {active === 'control'   && <ControlPanel />}
      </div>
    </div>
  )
}
