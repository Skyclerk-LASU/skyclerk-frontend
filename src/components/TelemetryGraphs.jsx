import { useEffect, useRef, useState } from 'react'
import { useTelemetryHistory } from '../hooks/useTelemetryHistory'

// Chart.js loaded via CDN in index.html as window.Chart
let Chart = null
function getChart() {
  if (Chart) return Chart
  if (typeof window !== 'undefined' && window.Chart) { Chart = window.Chart; return Chart }
  return null
}

const CHART_CONFIGS = [
  {
    key:      'battery',
    label:    'BATTERY',
    unit:     '%',
    color:    '#00ff6a',
    warnColor:'#ffb800',
    dangerColor: '#ff3d3d',
    min:      0,
    max:      100,
    warnLine: 30,
    dangerLine: 15,
    fill:     true,
  },
  {
    key:      'altitude',
    label:    'ALTITUDE',
    unit:     'M',
    color:    '#00e5ff',
    min:      0,
    max:      250,
    fill:     true,
  },
  {
    key:      'speed',
    label:    'SPEED',
    unit:     'M/S',
    color:    '#00aaff',
    min:      0,
    max:      30,
    fill:     false,
  },
  {
    key:      'signal',
    label:    'SIGNAL',
    unit:     '%',
    color:    '#7ab880',
    warnColor:'#ffb800',
    min:      0,
    max:      100,
    warnLine: 40,
    fill:     true,
  },
  {
    key:      'temp',
    label:    'TEMP',
    unit:     '°C',
    color:    '#ffb800',
    dangerColor: '#ff3d3d',
    min:      20,
    max:      80,
    dangerLine: 60,
    fill:     false,
  },
]

function buildChartOptions(cfg) {
  const C = getChart()
  if (!C) return {}

  const annotations = {}
  if (cfg.warnLine) {
    annotations.warnLine = {
      type: 'line', yMin: cfg.warnLine, yMax: cfg.warnLine,
      borderColor: 'rgba(255,184,0,0.4)', borderWidth: 1, borderDash: [4, 4],
    }
  }
  if (cfg.dangerLine) {
    annotations.dangerLine = {
      type: 'line', yMin: cfg.dangerLine, yMax: cfg.dangerLine,
      borderColor: 'rgba(255,61,61,0.4)', borderWidth: 1, borderDash: [4, 4],
    }
  }

  return {
    responsive:          true,
    maintainAspectRatio: false,
    animation:           { duration: 300 },
    interaction:         { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0d1a0f',
        borderColor:     '#234428',
        borderWidth:     1,
        titleColor:      '#4a7a55',
        bodyColor:       '#c8e6c9',
        titleFont:       { family: "'Share Tech Mono', monospace", size: 10 },
        bodyFont:        { family: "'Share Tech Mono', monospace", size: 11 },
        padding:         6,
        callbacks: {
          label: ctx => ` ${ctx.parsed.y} ${cfg.unit}`,
        },
      },
      annotation: Object.keys(annotations).length > 0
        ? { annotations }
        : undefined,
    },
    scales: {
      x: {
        grid:   { color: 'rgba(26,51,32,0.5)', lineWidth: 1 },
        border: { color: '#1a3320' },
        ticks: {
          color:     '#4a7a55',
          font:      { family: "'Share Tech Mono', monospace", size: 9 },
          maxTicksLimit: 6,
          maxRotation: 0,
        },
      },
      y: {
        min:  cfg.min,
        max:  cfg.max,
        grid: { color: 'rgba(26,51,32,0.5)', lineWidth: 1 },
        border: { color: '#1a3320' },
        ticks: {
          color:     '#4a7a55',
          font:      { family: "'Share Tech Mono', monospace", size: 9 },
          maxTicksLimit: 4,
          callback:  v => `${v}`,
        },
      },
    },
  }
}

function getLineColor(cfg, latestValue) {
  if (cfg.dangerColor && latestValue !== undefined) {
    if (cfg.key === 'battery' || cfg.key === 'signal') {
      if (latestValue <= (cfg.dangerLine || 15)) return cfg.dangerColor
      if (latestValue <= (cfg.warnLine   || 30)) return cfg.warnColor || cfg.color
    } else {
      if (latestValue >= (cfg.dangerLine || 999)) return cfg.dangerColor
    }
  }
  if (cfg.warnColor && latestValue !== undefined) {
    if (cfg.key === 'signal' && latestValue <= cfg.warnLine) return cfg.warnColor
  }
  return cfg.color
}

function MiniChart({ cfg, series }) {
  const canvasRef = useRef(null)
  const chartRef  = useRef(null)
  const [ready, setReady] = useState(false)

  // Init chart once Chart.js is available
  useEffect(() => {
    const tryInit = () => {
      const C = getChart()
      if (!C || !canvasRef.current || chartRef.current) return

      const ctx = canvasRef.current.getContext('2d')
      const color = cfg.color

      chartRef.current = new C(ctx, {
        type: 'line',
        data: {
          labels:   [],
          datasets: [{
            data:            [],
            borderColor:     color,
            borderWidth:     1.5,
            pointRadius:     0,
            pointHoverRadius: 3,
            tension:         0.3,
            fill:            cfg.fill,
            backgroundColor: cfg.fill
              ? `${color}18`
              : 'transparent',
          }],
        },
        options: buildChartOptions(cfg),
      })
      setReady(true)
    }

    if (window.Chart) { tryInit() } else {
      const iv = setInterval(() => { if (window.Chart) { clearInterval(iv); tryInit() } }, 100)
      return () => clearInterval(iv)
    }
  }, [])

  // Update chart data
  useEffect(() => {
    const chart = chartRef.current
    if (!chart || !series?.labels?.length) return

    const values  = series[cfg.key] || []
    const latest  = values[values.length - 1]
    const color   = getLineColor(cfg, latest)

    chart.data.labels                          = [...series.labels]
    chart.data.datasets[0].data               = [...values]
    chart.data.datasets[0].borderColor        = color
    chart.data.datasets[0].backgroundColor    = cfg.fill ? `${color}18` : 'transparent'
    chart.update('none')
  }, [series])

  const values = series[cfg.key] || []
  const latest = values[values.length - 1]
  const prev   = values[values.length - 2]
  const trend  = latest > prev ? '▲' : latest < prev ? '▼' : '—'
  const color  = getLineColor(cfg, latest)

  return (
    <div className="tg-card">
      <div className="tg-card__header">
        <span className="tg-card__label">{cfg.label}</span>
        <span className="tg-card__val" style={{ color }}>
          {latest ?? '—'}<span className="tg-card__unit">{cfg.unit}</span>
        </span>
        <span className="tg-card__trend" style={{ color }}>
          {trend}
        </span>
      </div>
      <div className="tg-card__chart">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}

export default function TelemetryGraphs() {
  const { series } = useTelemetryHistory()
  const [activeView, setActiveView] = useState('all')  // 'all' | key

  const visibleCharts = activeView === 'all'
    ? CHART_CONFIGS
    : CHART_CONFIGS.filter(c => c.key === activeView)

  return (
    <div className="panel graphs-panel">
      <div className="panel-header">
        <div className="panel-title">FLIGHT ANALYTICS</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={`tg-tab ${activeView === 'all' ? 'tg-tab--active' : ''}`}
            onClick={() => setActiveView('all')}
          >ALL</button>
          {CHART_CONFIGS.map(c => (
            <button
              key={c.key}
              className={`tg-tab ${activeView === c.key ? 'tg-tab--active' : ''}`}
              onClick={() => setActiveView(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tg-inner">
        <div className={`tg-grid tg-grid--${activeView === 'all' ? 'all' : 'single'}`}>
          {visibleCharts.map(cfg => (
            <MiniChart key={cfg.key} cfg={cfg} series={series} />
          ))}
        </div>
      </div>
    </div>
  )
}
