// ─────────────────────────────────────────────
// Skycleck Sensor Command Service
// Placeholder — swap executeCommand for real drone API
// ─────────────────────────────────────────────

const SENSOR_RESPONSES = {
    CAMERA_CAPTURE: () => ({
      output: `IMG_${Date.now()}.jpg captured — 3840×2160px, 4.2MB`,
      data:   { resolution: '4K', size: `${(3.8 + Math.random()).toFixed(1)}MB`, lat: 6.5869, lng: 3.9765 },
    }),
    OBSTACLE_SCAN: () => {
      const dist = (8 + Math.random() * 40).toFixed(1)
      const clear = parseFloat(dist) > 15
      return {
        output: clear ? `Scan complete — CLEAR. Nearest object at ${dist}m` : `WARNING — Object detected at ${dist}m`,
        data:   { distance: `${dist}m`, clear, bearing: `${Math.round(Math.random() * 360)}°` },
        level:  clear ? 'ok' : 'warn',
      }
    },
    TEMP_CHECK: () => {
      const motor = (38 + Math.random() * 20).toFixed(1)
      const batt  = (32 + Math.random() * 15).toFixed(1)
      const amb   = (28 + Math.random() * 8).toFixed(1)
      const warn  = parseFloat(motor) > 52 || parseFloat(batt) > 44
      return {
        output: `Motor: ${motor}°C  Battery: ${batt}°C  Ambient: ${amb}°C`,
        data:   { motor: `${motor}°C`, battery: `${batt}°C`, ambient: `${amb}°C` },
        level:  warn ? 'warn' : 'ok',
      }
    },
    PAYLOAD_VERIFY: () => {
      const weight = (0.8 + Math.random() * 2.8).toFixed(2)
      const secure = Math.random() > 0.15
      return {
        output: secure ? `Payload secured — ${weight}kg, balance nominal` : `WARNING — Payload imbalance detected, ${weight}kg`,
        data:   { weight: `${weight}kg`, secure, balance: secure ? 'NOMINAL' : 'OFFSET' },
        level:  secure ? 'ok' : 'warn',
      }
    },
    GPS_RECAL: () => {
      const sats  = Math.floor(8 + Math.random() * 6)
      const acc   = (1.2 + Math.random() * 3).toFixed(1)
      const level = sats >= 10 ? 'ok' : sats >= 7 ? 'warn' : 'err'
      return {
        output: `GPS recalibrated — ${sats} satellites, ±${acc}m accuracy`,
        data:   { satellites: sats, accuracy: `±${acc}m`, hdop: (1 + Math.random()).toFixed(2) },
        level,
      }
    },
    LIDAR_SCAN: () => {
      const alt = (15 + Math.random() * 200).toFixed(1)
      return {
        output: `LiDAR scan complete — ground at ${alt}m, terrain: FLAT`,
        data:   { altitude: `${alt}m`, terrain: 'FLAT', points: `${Math.floor(1200 + Math.random() * 800)}pts` },
        level:  'ok',
      }
    },
    BARO_CHECK: () => {
      const hpa = (1008 + Math.random() * 12).toFixed(1)
      return {
        output: `Barometer nominal — ${hpa} hPa, altitude drift ±${(Math.random() * 1.5).toFixed(2)}m`,
        data:   { pressure: `${hpa} hPa`, drift: `±${(Math.random() * 1.5).toFixed(2)}m` },
        level:  'ok',
      }
    },
    IMU_CALIBRATE: () => {
      const drift = (Math.random() * 0.05).toFixed(3)
      const ok    = parseFloat(drift) < 0.03
      return {
        output: ok ? `IMU calibrated — gyro drift ±${drift}°, accel nominal` : `IMU drift elevated — ±${drift}°, recalibration advised`,
        data:   { drift: `±${drift}°`, accel: 'NOMINAL', status: ok ? 'CALIBRATED' : 'DEGRADED' },
        level:  ok ? 'ok' : 'warn',
      }
    },
    FULL_DIAGNOSTIC: async () => {
      await new Promise(r => setTimeout(r, 600))
      const issues = Math.floor(Math.random() * 3)
      return {
        output: issues === 0
          ? 'Full diagnostic complete — all 8 sensors nominal'
          : `Diagnostic complete — ${issues} sensor(s) require attention`,
        data: { sensors: 8, nominal: 8 - issues, warnings: issues },
        level: issues === 0 ? 'ok' : 'warn',
      }
    },
  }
  
  export const QUICK_COMMANDS = [
    { id: 'CAMERA_CAPTURE', label: 'CAPTURE',   icon: '◉', color: 'cyan',  desc: 'Capture image' },
    { id: 'OBSTACLE_SCAN',  label: 'OBS SCAN',  icon: '⊕', color: 'amber', desc: 'Obstacle detection' },
    { id: 'TEMP_CHECK',     label: 'TEMP',      icon: '◈', color: 'amber', desc: 'Temperature check' },
    { id: 'PAYLOAD_VERIFY', label: 'PAYLOAD',   icon: '◧', color: 'green', desc: 'Payload verify' },
    { id: 'GPS_RECAL',      label: 'GPS RECAL', icon: '⊛', color: 'blue',  desc: 'GPS recalibration' },
    { id: 'LIDAR_SCAN',     label: 'LIDAR',     icon: '◎', color: 'green', desc: 'LiDAR altitude scan' },
    { id: 'BARO_CHECK',     label: 'BARO',      icon: '◬', color: 'cyan',  desc: 'Barometer check' },
    { id: 'IMU_CALIBRATE',  label: 'IMU CAL',   icon: '⊞', color: 'blue',  desc: 'IMU calibration' },
    { id: 'FULL_DIAGNOSTIC',label: 'DIAG ALL',  icon: '◈', color: 'warn',  desc: 'Full system scan' },
  ]
  
  export const SENSOR_REGISTRY = [
    { id: 'LIDAR',    label: 'LIDAR',      value: '12.4 m',    status: 'OK',   statusType: 'ok'   },
    { id: 'BARO',     label: 'BAROMETER',  value: '1013 hPa',  status: 'OK',   statusType: 'ok'   },
    { id: 'IMU',      label: 'IMU',        value: '±0.02°',    status: 'OK',   statusType: 'ok'   },
    { id: 'GPS',      label: 'GPS',        value: '8 sats',    status: 'WEAK', statusType: 'warn' },
    { id: 'CAMERA',   label: 'CAMERA',     value: '4K/30fps',  status: 'OK',   statusType: 'ok'   },
    { id: 'OBSTACLE', label: 'OBSTACLE',   value: 'CLEAR',     status: 'OK',   statusType: 'ok'   },
    { id: 'TEMP',     label: 'THERMAL',    value: '38°C',      status: 'OK',   statusType: 'ok'   },
    { id: 'PAYLOAD',  label: 'PAYLOAD',    value: '1.20 kg',   status: 'OK',   statusType: 'ok'   },
  ]
  
  export async function executeCommand(commandId) {
    // ── PLACEHOLDER ──
    // Replace simulation with real drone API call e.g:
    // const res = await fetch(`https://api.skycleck.local/v1/sensors/${commandId}`, {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${DRONE_API_KEY}` },
    // })
    // return res.json()
  
    const handler = SENSOR_RESPONSES[commandId]
    if (!handler) throw new Error(`Unknown command: ${commandId}`)
  
    // Simulate network latency
    await new Promise(r => setTimeout(r, 400 + Math.random() * 800))
  
    // 5% random failure
    if (Math.random() < 0.05) throw new Error('Sensor timeout — retry')
  
    const result = await handler()
    return { success: true, commandId, ...result, timestamp: new Date().toISOString() }
  }
  