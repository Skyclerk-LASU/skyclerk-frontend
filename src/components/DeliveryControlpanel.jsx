import { useState } from 'react'
import { useMission, MISSION_STATES } from '../hooks/useMission'

const STATE_COLORS = {
  IDLE:      'mc-state--neutral',
  PREPARING: 'mc-state--info',
  DEPARTED:  'mc-state--info',
  EN_ROUTE:  'mc-state--active',
  ARRIVING:  'mc-state--warn',
  DELIVERED: 'mc-state--success',
  RETURNING: 'mc-state--returning',
  EMERGENCY: 'mc-state--danger',
}

const PIPELINE = ['IDLE', 'PREPARING', 'DEPARTED', 'EN_ROUTE', 'ARRIVING', 'DELIVERED']

function MissionCard({ pkg, onStart, onRTB, onDeliver, onStop, onReset }) {
  const [expanded, setExpanded] = useState(false)
  const stateInfo  = MISSION_STATES[pkg.state] || MISSION_STATES.IDLE
  const colorClass = STATE_COLORS[pkg.state] || 'mc-state--neutral'
  const isActive   = !['IDLE', 'DELIVERED', 'EMERGENCY'].includes(pkg.state)
  const pipelineIdx = PIPELINE.indexOf(pkg.state)

  return (
    <div className={`mc-card ${pkg.state === 'EMERGENCY' ? 'mc-card--emergency' : ''}`}>

      {/* Card header */}
      <div className="mc-card__header" onClick={() => setExpanded(e => !e)}>
        <div className="mc-card__id">{pkg.id}</div>
        <div className="mc-card__dest">{pkg.dest}</div>
        <div className={`mc-state ${colorClass}`}>{stateInfo.label}</div>
        <div className="mc-card__chevron">{expanded ? '▲' : '▼'}</div>
      </div>

      {/* Pipeline progress dots */}
      <div className="mc-pipeline">
        {PIPELINE.map((s, i) => (
          <div key={s} className={`mc-pipeline__step ${i <= pipelineIdx ? 'mc-pipeline__step--done' : ''} ${i === pipelineIdx ? 'mc-pipeline__step--active' : ''}`}>
            <div className="mc-pipeline__dot" />
            {i < PIPELINE.length - 1 && <div className="mc-pipeline__line" />}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {pkg.state !== 'IDLE' && (
        <div className="mc-progress">
          <div className="mc-progress__bar">
            <div
              className={`mc-progress__fill mc-progress__fill--${pkg.state.toLowerCase().replace('_','-')}`}
              style={{ width: `${pkg.progress}%` }}
            />
          </div>
          <div className="mc-progress__meta">
            <span className="tele-coords__label">{Math.round(pkg.progress)}%</span>
            {pkg.eta !== '00:00:00' && <span className="tele-coords__val">ETA {pkg.eta}</span>}
          </div>
        </div>
      )}

      {/* Expanded controls */}
      {expanded && (
        <div className="mc-actions">
          {pkg.state === 'IDLE' && (
            <button className="mc-btn mc-btn--start" onClick={() => onStart(pkg.id)}>
              ▶ START DELIVERY
            </button>
          )}
          {isActive && (
            <>
              <button className="mc-btn mc-btn--rtb" onClick={() => onRTB(pkg.id)}>
                ↩ RETURN TO BASE
              </button>
              {['EN_ROUTE', 'ARRIVING'].includes(pkg.state) && (
                <button className="mc-btn mc-btn--deliver" onClick={() => onDeliver(pkg.id)}>
                  ✓ MARK DELIVERED
                </button>
              )}
              <button className="mc-btn mc-btn--stop" onClick={() => onStop(pkg.id)}>
                ■ EMERGENCY STOP
              </button>
            </>
          )}
          {pkg.state === 'DELIVERED' && (
            <button className="mc-btn mc-btn--reset" onClick={() => onReset(pkg.id)}>
              ↺ RESET MISSION
            </button>
          )}
          {pkg.state === 'EMERGENCY' && (
            <button className="mc-btn mc-btn--reset" onClick={() => onReset(pkg.id)}>
              ↺ RESET MISSION
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function DeliveryControlPanel() {
  const { packages, startDelivery, returnToBase, markDelivered, emergencyStop, reset } = useMission()

  const active    = packages.filter(p => !['IDLE', 'DELIVERED', 'EMERGENCY'].includes(p.state)).length
  const delivered = packages.filter(p => p.state === 'DELIVERED').length

  return (
    <div className="panel delivery-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0', overflow: 'hidden' }}>

      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">MISSION CONTROL</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {active > 0    && <div className="badge active">{active} ACTIVE</div>}
          {delivered > 0 && <div className="badge active">{delivered} DONE</div>}
        </div>
      </div>

      {/* Global emergency stop */}
      <button
        className="mc-btn mc-btn--stop mc-btn--global"
        onClick={() => emergencyStop(null)}
      >
        ■ EMERGENCY STOP — ALL
      </button>

      {/* Package cards */}
      <div className="mc-list">
        {packages.map(pkg => (
          <MissionCard
            key={pkg.id}
            pkg={pkg}
            onStart={startDelivery}
            onRTB={returnToBase}
            onDeliver={markDelivered}
            onStop={emergencyStop}
            onReset={reset}
          />
        ))}
      </div>

    </div>
  )
}
