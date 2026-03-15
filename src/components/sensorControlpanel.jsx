import { useEffect, useRef } from 'react'
import { useSensor } from '../hooks/useSensor'
import { QUICK_COMMANDS } from '../services/sensorService'

const LINE_COLORS = {
  sys:  'sc-line--sys',
  info: 'sc-line--info',
  cmd:  'sc-line--cmd',
  run:  'sc-line--run',
  ok:   'sc-line--ok',
  warn: 'sc-line--warn',
  err:  'sc-line--err',
}

const BTN_COLORS = {
  cyan:  'sc-qbtn--cyan',
  amber: 'sc-qbtn--amber',
  green: 'sc-qbtn--green',
  blue:  'sc-qbtn--blue',
  warn:  'sc-qbtn--warn',
}

export default function SensorControlPanel() {
  const {
    sensors, terminal, cmdInput, setCmdInput,
    running, runCommand, submitCommand, handleKeyDown,
  } = useSensor()

  const termRef  = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll terminal to bottom on new output
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight
    }
  }, [terminal])

  const activeCount  = sensors.filter(s => s.statusType === 'ok').length
  const warningCount = sensors.filter(s => s.statusType === 'warn').length

  return (
    <div className="panel sensor-panel" style={{ display: 'flex', flexDirection: 'column', gap: '0', overflow: 'hidden' }}>

      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">SENSOR CONTROL</div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <div className="badge active">{activeCount} OK</div>
          {warningCount > 0 && <div className="badge warn">{warningCount} WARN</div>}
        </div>
      </div>

      {/* Sensor status grid */}
      <div className="sc-status-grid">
        {sensors.map(s => (
          <div
            key={s.id}
            className={`sc-sensor-tile sc-sensor-tile--${s.statusType} ${running ? 'sc-sensor-tile--dim' : ''}`}
          >
            <div className="sc-sensor-tile__name">{s.label}</div>
            <div className="sc-sensor-tile__val">{s.value}</div>
            <div className={`sc-sensor-tile__dot sc-dot--${s.statusType}`} />
          </div>
        ))}
      </div>

      {/* Quick action buttons */}
      <div className="sc-section-label">QUICK COMMANDS</div>
      <div className="sc-quick-grid">
        {QUICK_COMMANDS.map(cmd => (
          <button
            key={cmd.id}
            className={`sc-qbtn ${BTN_COLORS[cmd.color] || ''} ${running === cmd.id ? 'sc-qbtn--running' : ''}`}
            onClick={() => runCommand(cmd.id)}
            disabled={!!running}
            title={cmd.desc}
          >
            <span className="sc-qbtn__icon">{cmd.icon}</span>
            <span className="sc-qbtn__label">{running === cmd.id ? '...' : cmd.label}</span>
          </button>
        ))}
      </div>

      {/* Terminal output */}
      <div className="sc-section-label">TERMINAL</div>
      <div
        className="sc-terminal"
        ref={termRef}
        onClick={() => inputRef.current?.focus()}
      >
        {terminal.map(line => (
          <div key={line.id} className={`sc-line ${LINE_COLORS[line.type] || ''}`}>
            {line.type === 'cmd' ? line.text : `  ${line.text}`}
          </div>
        ))}
        {running && (
          <div className="sc-line sc-line--run sc-blink">  ▌ executing...</div>
        )}
      </div>

      {/* Command input */}
      <div className="sc-input-row">
        <span className="sc-prompt">{'>'}</span>
        <input
          ref={inputRef}
          className="sc-input"
          value={cmdInput}
          onChange={e => setCmdInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type command or HELP..."
          disabled={!!running}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          className="sc-send-btn"
          onClick={submitCommand}
          disabled={!!running || !cmdInput.trim()}
        >
          ↵
        </button>
      </div>

    </div>
  )
}
