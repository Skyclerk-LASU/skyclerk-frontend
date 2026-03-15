import SensorControlPanel from '../components/SensorControlPanel'

const SENSOR_DOCS = [
  { id:'LIDAR',    label:'LiDAR',     desc:'Light Detection and Ranging — measures altitude and terrain distance', status:'OK' },
  { id:'BARO',     label:'Barometer', desc:'Atmospheric pressure sensor for altitude verification',                status:'OK' },
  { id:'IMU',      label:'IMU',       desc:'Inertial Measurement Unit — gyroscope and accelerometer',              status:'OK' },
  { id:'GPS',      label:'GPS',       desc:'Global Positioning System — 8 satellites locked',                     status:'WEAK' },
  { id:'CAMERA',   label:'Camera',    desc:'4K/30fps imaging system for visual confirmation',                     status:'OK' },
  { id:'OBSTACLE', label:'Obstacle',  desc:'Forward-facing obstacle detection radar',                             status:'OK' },
  { id:'TEMP',     label:'Thermal',   desc:'Motor and battery temperature monitoring',                            status:'OK' },
  { id:'PAYLOAD',  label:'Payload',   desc:'Load cell for package weight and balance verification',               status:'OK' },
]

export default function SensorsPage() {
  const ok   = SENSOR_DOCS.filter(s => s.status === 'OK').length
  const warn = SENSOR_DOCS.filter(s => s.status === 'WEAK').length

  return (
    <div className="page standalone-page">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="page-title__icon">🔬</span>Sensors</div>
          <div className="page-subtitle">DRONE SENSOR MANAGEMENT</div>
        </div>
        <div style={{display:'flex',gap:'6px'}}>
          <div className="badge active">{ok} NOMINAL</div>
          {warn > 0 && <div className="badge warn">{warn} DEGRADED</div>}
        </div>
      </div>

      <div className="section-label">SENSOR REGISTRY</div>
      <div className="card-grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))'}}>
        {SENSOR_DOCS.map(s => (
          <div key={s.id} className="content-card">
            <div className="content-card__header">
              <div className="content-card__title">{s.label}</div>
              <span className={`mc-state mc-state--${s.status==='OK'?'success':'warn'}`}>{s.status}</span>
            </div>
            <div className="content-card__body">
              <p style={{fontSize:'12px',color:'var(--text2)',lineHeight:'1.5'}}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="section-label">SENSOR COMMAND TERMINAL</div>
      <div className="content-card">
        <div style={{height:'420px',overflow:'hidden'}}>
          <SensorControlPanel />
        </div>
      </div>
    </div>
  )
}
