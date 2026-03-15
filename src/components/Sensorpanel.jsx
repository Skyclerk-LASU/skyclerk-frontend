const sensors = [
    { name: 'LIDAR',    value: '12.4 m',   status: 'OK',   type: 's-ok' },
    { name: 'BAROMETER', value: '1013 hPa', status: 'OK',  type: 's-ok' },
    { name: 'IMU',      value: '±0.02°',   status: 'OK',   type: 's-ok' },
    { name: 'GPS',      value: '8 sats',   status: 'WEAK', type: 's-warn' },
    { name: 'CAMERA',   value: '4K/30fps', status: 'OK',   type: 's-ok' },
    { name: 'OBSTACLE', value: 'CLEAR',    status: 'OK',   type: 's-ok' },
  ]
  
  export default function SensorPanel() {
    return (
      <div className="panel sensor-panel">
        <div className="panel-header">
          <div className="panel-title">SENSORS</div>
        </div>
        {sensors.map((s) => (
          <div className="sensor-row" key={s.name}>
            <span className="sensor-name">{s.name}</span>
            <span className="sensor-val">{s.value}</span>
            <span className={`sensor-status ${s.type}`}>{s.status}</span>
          </div>
        ))}
      </div>
    )
  }
  