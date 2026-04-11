import { useState } from 'react'
import Icon from './Icon'
import TelemetryPanel from './TelemetryPanel'
import ControlPanel from './ControlPanel'
import DeliveryControlPanel from './DeliveryControlPanel'
import NotificationPanel from './NotificationPanel'
import SensorControlPanel from './SensorControlPanel'

const TABS = [
  { id: 'telemetry', icon: 'telemetry', label: 'TELEM'   },
  { id: 'mission',   icon: 'mission',   label: 'MISSION' },
  { id: 'sensor',    icon: 'sensor',    label: 'SENSOR'  },
  { id: 'notify',    icon: 'notify',    label: 'NOTIFY'  },
  { id: 'control',   icon: 'control',   label: 'CTRL'    },
]

export default function Sidebar() {
  const [active, setActive] = useState('telemetry')

  return (
    <div className="sidebar">
      <div className="sidebar-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`sidebar-tab ${active === tab.id ? 'sidebar-tab--active' : ''}`}
            onClick={() => setActive(tab.id)}
            title={tab.label}
          >
            <Icon name={tab.icon} size={15} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
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
