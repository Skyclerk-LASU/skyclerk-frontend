import { useEffect, useRef } from 'react'
import { useMissionLog, FILTER_CATEGORIES } from '../hooks/useMissionLog'

const COLOR_CLASS = {
  ok:      'log-type--ok',
  info:    'log-type--info',
  warn:    'log-type--warn',
  err:     'log-type--err',
  cyan:    'log-type--cyan',
  neutral: 'log-type--neutral',
}

export default function MissionLog() {
  const {
    entries, totalCount,
    filter, setFilter,
    paused, setPaused,
    search, setSearch,
    clearLog, buffered,
  } = useMissionLog()

  const scrollRef  = useRef(null)
  const userScroll = useRef(false)

  // Auto-scroll unless user has scrolled up or log is paused
  useEffect(() => {
    if (!paused && !userScroll.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries, paused])

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    userScroll.current = scrollHeight - scrollTop - clientHeight > 40
  }

  return (
    <div className="panel log-panel">

      {/* Header */}
      <div className="panel-header" style={{ marginBottom: '6px' }}>
        <div className="panel-title">MISSION LOG</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="log-count">{totalCount} EVENTS</span>
          {buffered > 0 && (
            <button className="log-ctrl-btn log-ctrl-btn--resume" onClick={() => setPaused(false)}>
              ▶ {buffered} BUFFERED
            </button>
          )}
          <button
            className={`log-ctrl-btn ${paused ? 'log-ctrl-btn--paused' : ''}`}
            onClick={() => setPaused(!paused)}
          >
            {paused ? '▶ RESUME' : '‖ PAUSE'}
          </button>
          <button className="log-ctrl-btn" onClick={clearLog}>CLR</button>
        </div>
      </div>

      {/* Filter bar + search */}
      <div className="log-toolbar">
        <div className="log-filters">
          {FILTER_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`log-filter-btn ${filter === cat.id ? 'log-filter-btn--active' : ''}`}
              onClick={() => setFilter(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <input
          className="log-search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="SEARCH..."
        />
      </div>

      {/* Log entries */}
      <div
        className="log-entries"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {entries.length === 0 && (
          <div className="log-empty">— no events match filter —</div>
        )}
        {entries.map(entry => (
          <div key={entry.id} className="log-entry">
            <span className="log-time">{entry.time}</span>
            <span className={`log-type-badge ${COLOR_CLASS[entry.color] || 'log-type--neutral'}`}>
              {entry.label}
            </span>
            <span className="log-category">{entry.category}</span>
            <span className="log-msg">{entry.message}</span>
          </div>
        ))}
      </div>

    </div>
  )
}
