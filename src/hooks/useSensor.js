import { emitEvent } from '../services/missionEventBus'
import { useState, useCallback, useEffect } from 'react'
import { executeCommand, SENSOR_REGISTRY, QUICK_COMMANDS } from '../services/sensorService'

export function useSensor() {
  const [sensors,     setSensors]     = useState(SENSOR_REGISTRY)
  const [terminal,    setTerminal]    = useState([
    { id: 0, type: 'sys',  text: 'SKYCLECK SENSOR TERMINAL v1.0' },
    { id: 1, type: 'sys',  text: 'All sensors online. Type a command or use quick actions.' },
    { id: 2, type: 'info', text: 'Available: CAPTURE, OBS_SCAN, TEMP, PAYLOAD, GPS_RECAL, LIDAR, BARO, IMU_CAL, DIAG_ALL' },
  ])
  const [cmdInput,    setCmdInput]    = useState('')
  const [running,     setRunning]     = useState(null)   // commandId currently running
  const [cmdHistory,  setCmdHistory]  = useState([])
  const [histIdx,     setHistIdx]     = useState(-1)
  const idRef = useState(100)[0]
  let nextId  = idRef

  const addLine = useCallback((type, text) => {
    setTerminal(prev => [...prev, { id: Date.now() + Math.random(), type, text }].slice(-80))
  }, [])

  // Update sensor registry value after a command
  const updateSensor = useCallback((commandId, data) => {
    setSensors(prev => prev.map(s => {
      if (commandId === 'GPS_RECAL'      && s.id === 'GPS')     return { ...s, value: data.satellites ? `${data.satellites} sats` : s.value, status: 'OK', statusType: 'ok' }
      if (commandId === 'TEMP_CHECK'     && s.id === 'TEMP')    return { ...s, value: data.motor || s.value }
      if (commandId === 'PAYLOAD_VERIFY' && s.id === 'PAYLOAD') return { ...s, value: data.weight || s.value, status: data.secure ? 'OK' : 'WARN', statusType: data.secure ? 'ok' : 'warn' }
      if (commandId === 'OBSTACLE_SCAN'  && s.id === 'OBSTACLE')return { ...s, value: data.distance || s.value, status: data.clear ? 'CLEAR' : 'WARN', statusType: data.clear ? 'ok' : 'warn' }
      if (commandId === 'LIDAR_SCAN'     && s.id === 'LIDAR')   return { ...s, value: data.altitude || s.value }
      if (commandId === 'BARO_CHECK'     && s.id === 'BARO')    return { ...s, value: data.pressure || s.value }
      if (commandId === 'IMU_CALIBRATE'  && s.id === 'IMU')     return { ...s, value: data.drift || s.value, status: data.status || s.status, statusType: data.status === 'CALIBRATED' ? 'ok' : 'warn' }
      if (commandId === 'CAMERA_CAPTURE' && s.id === 'CAMERA')  return { ...s, status: 'OK', statusType: 'ok' }
      return s
    }))
  }, [])

  const runCommand = useCallback(async (commandId) => {
    if (running) return
    const cmd = QUICK_COMMANDS.find(c => c.id === commandId)
    const label = cmd?.label || commandId

    setRunning(commandId)
    addLine('cmd', `> ${label}`)
    addLine('run', `Executing ${label}...`)

    try {
      const result = await executeCommand(commandId)
      addLine(result.level || 'ok', result.output)
      if (result.data) updateSensor(commandId, result.data)
      const evType = result.level === 'warn' ? 'SENSOR_WARN' : result.level === 'err' ? 'SENSOR_ERR' : 'SENSOR_OK'
      emitEvent(evType, `${label}: ${result.output}`)
    } catch (e) {
      addLine('err', `ERROR — ${e.message}`)
      emitEvent('SENSOR_ERR', `${label} failed — ${e.message}`)
    } finally {
      setRunning(null)
    }
  }, [running, addLine, updateSensor])

  // Parse typed command input
  const parseInput = useCallback((raw) => {
    const clean = raw.trim().toUpperCase()
    const map = {
      'CAPTURE':   'CAMERA_CAPTURE',
      'CAM':       'CAMERA_CAPTURE',
      'OBS':       'OBSTACLE_SCAN',
      'OBS_SCAN':  'OBSTACLE_SCAN',
      'OBSTACLE':  'OBSTACLE_SCAN',
      'TEMP':      'TEMP_CHECK',
      'TEMPERATURE':'TEMP_CHECK',
      'PAYLOAD':   'PAYLOAD_VERIFY',
      'PAY':       'PAYLOAD_VERIFY',
      'GPS':       'GPS_RECAL',
      'GPS_RECAL': 'GPS_RECAL',
      'LIDAR':     'LIDAR_SCAN',
      'BARO':      'BARO_CHECK',
      'BAROMETER': 'BARO_CHECK',
      'IMU':       'IMU_CALIBRATE',
      'IMU_CAL':   'IMU_CALIBRATE',
      'DIAG':      'FULL_DIAGNOSTIC',
      'DIAG_ALL':  'FULL_DIAGNOSTIC',
      'DIAGNOSTIC':'FULL_DIAGNOSTIC',
      'HELP':      '__HELP__',
      'CLEAR':     '__CLEAR__',
    }
    return map[clean] || null
  }, [])

  const submitCommand = useCallback(() => {
    const raw = cmdInput.trim()
    if (!raw) return

    setCmdHistory(h => [raw, ...h].slice(0, 20))
    setHistIdx(-1)
    setCmdInput('')

    const resolved = parseInput(raw)
    if (resolved === '__HELP__') {
      addLine('sys',  'Commands: CAPTURE, OBS_SCAN, TEMP, PAYLOAD, GPS_RECAL,')
      addLine('sys',  '          LIDAR, BARO, IMU_CAL, DIAG_ALL, CLEAR, HELP')
      return
    }
    if (resolved === '__CLEAR__') {
      setTerminal([{ id: Date.now(), type: 'sys', text: 'Terminal cleared.' }])
      return
    }
    if (!resolved) {
      addLine('err', `Unknown command: "${raw}" — type HELP for list`)
      return
    }
    runCommand(resolved)
  }, [cmdInput, parseInput, runCommand, addLine])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') { submitCommand(); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.min(i + 1, cmdHistory.length - 1)
        setCmdInput(cmdHistory[next] || '')
        return next
      })
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.max(i - 1, -1)
        setCmdInput(next === -1 ? '' : cmdHistory[next] || '')
        return next
      })
    }
  }, [submitCommand, cmdHistory])

  return {
    sensors, terminal, cmdInput, setCmdInput,
    running, runCommand, submitCommand, handleKeyDown,
  }
}
