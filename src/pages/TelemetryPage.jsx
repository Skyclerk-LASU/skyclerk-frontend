import { useTelemetry } from '../hooks/useTelemetry'
import TelemetryGraphs from '../components/TelemetryGraphs'
import Icon from '../components/Icon'

const METRICS = [
  { key:'altitude',      label:'Altitude',     unit:'M',   icon:'altitude', color:'blue'  },
  { key:'speed',         label:'Speed',        unit:'M/S', icon:'speed',    color:'cyan'  },
  { key:'battery',       label:'Battery',      unit:'%',   icon:'battery',  color:'green' },
  { key:'signal',        label:'Signal',       unit:'%',   icon:'signal',   color:'blue'  },
  { key:'temp',          label:'Temperature',  unit:'°C',  icon:'temp',     color:'amber' },
  { key:'payloadWeight', label:'Payload',      unit:'KG',  icon:'payload',  color:'cyan'  },
]

export default function TelemetryPage() {
  const tele = useTelemetry(1200)

  return (
    <div className="page standalone-page">

      <div className="page-header">
        <div>
          <div className="page-title">
            <Icon name="telemetry" size={22} style={{color:'var(--blue)'}}/>
            Telemetry
          </div>
          <div className="page-subtitle">LIVE DRONE FLIGHT DATA</div>
        </div>
        <div className="badge active">● LIVE</div>
      </div>

      <div className="section-label">Current Readings</div>
      <div className="stat-row">
        {METRICS.map(m => {
          const metric = tele[m.key]
          const status = metric?.status || 'normal'
          return (
            <div key={m.key} className={`stat-card stat-card--${m.color}`} style={{position:'relative'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
                <div className="stat-card__label">{m.label.toUpperCase()}</div>
                <Icon name={m.icon} size={16} style={{opacity:0.4}}/>
              </div>
              <div className="stat-card__value">
                {metric?.value ?? '—'}
                <span className="stat-card__unit">{m.unit}</span>
              </div>
              <div className="tele-bar" style={{marginTop:'12px'}}>
                <div
                  className={`tele-bar-fill tele-bar-fill--${status === 'warn' ? 'warn' : status === 'danger' ? 'danger' : 'normal'}`}
                  style={{width:`${metric?.pct || 0}%`}}
                />
              </div>
              <div className="stat-card__trend" style={{marginTop:'6px'}}>
                {status === 'warn' && <span style={{color:'var(--amber)',display:'flex',alignItems:'center',gap:'4px'}}><Icon name="warning" size={11}/>WARNING</span>}
                {status === 'danger' && <span style={{color:'var(--red)',display:'flex',alignItems:'center',gap:'4px'}}><Icon name="emergency" size={11}/>CRITICAL</span>}
                {status === 'normal' && <span style={{color:'var(--text3)'}}>NOMINAL</span>}
              </div>
            </div>
          )
        })}
      </div>

      <div className="section-label">GPS Position</div>
      <div className="content-card">
        <div className="content-card__body">
          <div style={{display:'flex',gap:'40px',flexWrap:'wrap'}}>
            {[
              { label:'LATITUDE',  val:`${tele.coords?.lat}°N`, icon:'mission' },
              { label:'LONGITUDE', val:`${tele.coords?.lng}°E`, icon:'mission' },
              { label:'UPTIME',    val:`${Math.floor(tele.uptime/60)}m ${Math.floor(tele.uptime%60)}s`, icon:'analytics' },
            ].map(item => (
              <div key={item.label} style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <Icon name={item.icon} size={18} style={{color:'var(--blue)',opacity:0.6}}/>
                <div>
                  <div style={{fontFamily:'var(--mono)',fontSize:'9px',color:'var(--text3)',letterSpacing:'2px',marginBottom:'3px'}}>{item.label}</div>
                  <div style={{fontFamily:'var(--mono)',fontSize:'15px',color:'var(--cyan)'}}>{item.val}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-label">Flight Analytics</div>
      <div style={{height:'200px'}}>
        <TelemetryGraphs embedded />
      </div>

    </div>
  )
}
