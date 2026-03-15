import { useTelemetry } from '../hooks/useTelemetry'
import TelemetryGraphs from '../components/TelemetryGraphs'

const METRICS = [
  { key:'altitude',      label:'ALTITUDE',      unit:'M',   color:'blue' },
  { key:'speed',         label:'SPEED',         unit:'M/S', color:'cyan' },
  { key:'battery',       label:'BATTERY',       unit:'%',   color:'green' },
  { key:'signal',        label:'SIGNAL',        unit:'%',   color:'blue' },
  { key:'temp',          label:'TEMPERATURE',   unit:'°C',  color:'amber' },
  { key:'payloadWeight', label:'PAYLOAD',       unit:'KG',  color:'cyan' },
]

export default function TelemetryPage() {
  const tele = useTelemetry(1200)

  return (
    <div className="page standalone-page">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="page-title__icon">📡</span>Telemetry</div>
          <div className="page-subtitle">LIVE DRONE FLIGHT DATA</div>
        </div>
        <div className="badge active">LIVE</div>
      </div>

      <div className="section-label">CURRENT READINGS</div>
      <div className="stat-row">
        {METRICS.map(m => {
          const metric = tele[m.key]
          return (
            <div key={m.key} className={`stat-card stat-card--${m.color}`}>
              <div className="stat-card__label">{m.label}</div>
              <div className="stat-card__value">
                {metric?.value ?? '—'}
                <span className="stat-card__unit">{m.unit}</span>
              </div>
              <div className="stat-card__trend">
                STATUS: {metric?.status?.toUpperCase() || 'NOMINAL'}
              </div>
              <div className="tele-bar" style={{marginTop:'8px'}}>
                <div className={`tele-bar-fill tele-bar-fill--${metric?.status === 'warn' ? 'warn' : metric?.status === 'danger' ? 'danger' : 'normal'}`}
                  style={{width:`${metric?.pct || 0}%`}} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="section-label">GPS COORDINATES</div>
      <div className="content-card" style={{marginTop:0}}>
        <div className="content-card__body">
          <div style={{display:'flex', gap:'32px', fontFamily:'var(--mono)', fontSize:'13px'}}>
            <div><span style={{color:'var(--text3)', marginRight:'12px', fontSize:'10px', letterSpacing:'2px'}}>LAT</span><span style={{color:'var(--cyan)'}}>{tele.coords?.lat}°N</span></div>
            <div><span style={{color:'var(--text3)', marginRight:'12px', fontSize:'10px', letterSpacing:'2px'}}>LNG</span><span style={{color:'var(--cyan)'}}>{tele.coords?.lng}°E</span></div>
            <div><span style={{color:'var(--text3)', marginRight:'12px', fontSize:'10px', letterSpacing:'2px'}}>UPTIME</span><span style={{color:'var(--text2)'}}>{Math.floor(tele.uptime / 60)}m {Math.floor(tele.uptime % 60)}s</span></div>
          </div>
        </div>
      </div>

      <div className="section-label">FLIGHT ANALYTICS</div>
      <div style={{height:'220px', marginTop:0}}>
        <TelemetryGraphs embedded />
      </div>
    </div>
  )
}
