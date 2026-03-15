import { useState } from 'react'

const flightControls = ['TAKEOFF', 'HOVER', 'LAND', '↑ ALT+', 'RTH', '↓ ALT−', '← YAW', 'FWD', 'YAW →']
const flightModes = ['AUTO', 'MANUAL', 'FOLLOW']

export default function ControlPanel() {
  const [activeControl, setActiveControl] = useState('TAKEOFF')
  const [activeMode, setActiveMode] = useState('AUTO')

  return (
    <div className="panel ctrl-panel">
      <div className="panel-header">
        <div className="panel-title">CONTROL PANEL</div>
      </div>

      <div className="ctrl-grid">
        {flightControls.map((label) => (
          <button
            key={label}
            className={`ctrl-btn ${activeControl === label ? 'active' : ''}`}
            onClick={() => setActiveControl(label)}
          >
            {label}
          </button>
        ))}
        <button
          className="ctrl-btn danger"
          style={{ gridColumn: '1 / 4' }}
          onClick={() => alert('EMERGENCY STOP TRIGGERED')}
        >
          EMERGENCY STOP
        </button>
      </div>

      <div className="panel-header" style={{ marginTop: '10px' }}>
        <div className="panel-title">FLIGHT MODE</div>
      </div>

      <div className="ctrl-grid">
        {flightModes.map((mode) => (
          <button
            key={mode}
            className={`ctrl-btn ${activeMode === mode ? 'active' : ''}`}
            onClick={() => setActiveMode(mode)}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  )
}
