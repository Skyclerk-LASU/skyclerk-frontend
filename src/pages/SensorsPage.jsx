import SensorControlPanel from '../components/SensorControlPanel'
import Icon from '../components/Icon'

const SENSOR_DOCS = [
  { id:'LIDAR',    label:'LiDAR',      icon:'altitude', desc:'Light Detection and Ranging — measures altitude and terrain distance',  status:'OK'   },
  { id:'BARO',     label:'Barometer',  icon:'temp',     desc:'Atmospheric pressure sensor for altitude verification',                  status:'OK'   },
  { id:'IMU',      label:'IMU',        icon:'calibrate',desc:'Inertial Measurement Unit — gyroscope and accelerometer',                status:'OK'   },
  { id:'GPS',      label:'GPS',        icon:'mission',  desc:'Global Positioning System — 8 satellites locked',                       status:'WEAK' },
  { id:'CAMERA',   label:'Camera',     icon:'capture',  desc:'4K/30fps imaging system for visual confirmation',                       status:'OK'   },
  { id:'OBSTACLE', label:'Obstacle',   icon:'scan',     desc:'Forward-facing obstacle detection radar',                               status:'OK'   },
  { id:'TEMP',     label:'Thermal',    icon:'temp',     desc:'Motor and battery temperature monitoring',                              status:'OK'   },
  { id:'PAYLOAD',  label:'Payload',    icon:'payload',  desc:'Load cell for package weight and balance verification',                 status:'OK'   },
]

export default function SensorsPage() {
  const ok   = SENSOR_DOCS.filter(s => s.status === 'OK').length
  const warn = SENSOR_DOCS.filter(s => s.status !== 'OK').length

  return (
    <div className="page standalone-page">

      <div className="page-header">
        <div>
          <div className="page-title">
            <Icon name="sensor" size={22} style={{color:'var(--blue)'}}/>
            Sensors
          </div>
          <div className="page-subtitle">DRONE SENSOR MANAGEMENT</div>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <div className="badge active"><Icon name="online" size={10}/> {ok} Nominal</div>
          {warn > 0 && <div className="badge warn"><Icon name="warning" size={10}/> {warn} Degraded</div>}
        </div>
      </div>

      <div className="section-label">Sensor Registry</div>
      <div className="card-grid">
        {SENSOR_DOCS.map(s => (
          <div key={s.id} className="content-card">
            <div className="content-card__header">
              <div className="content-card__title">
                <Icon name={s.icon} size={14} style={{marginRight:'2px'}}/>
                {s.label}
              </div>
              <span className={`mc-state mc-state--${s.status==='OK'?'success':'warn'}`}>
                {s.status === 'OK'
                  ? <><Icon name="online" size={10}/> OK</>
                  : <><Icon name="warning" size={10}/> WEAK</>
                }
              </span>
            </div>
            <div className="content-card__body">
              <p style={{fontSize:'13px',color:'var(--text2)',lineHeight:'1.6'}}>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="section-label">Command Terminal</div>
      <div className="content-card">
        <div style={{height:'440px',overflow:'hidden'}}>
          <SensorControlPanel />
        </div>
      </div>

    </div>
  )
}
