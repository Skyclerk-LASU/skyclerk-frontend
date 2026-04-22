import Icon from './Icon'
import { useWeatherSafety } from '../hooks/useWeatherSafety'

function formatUpdatedAt(value) {
  if (!value) return '--'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '--'
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function WeatherSafetyNotice() {
  const { loading, error, advisory, refresh } = useWeatherSafety()

  const statusClass = advisory ? `weather-card--${advisory.status}` : ''

  return (
    <div className={`weather-card ${statusClass}`}>
      <div className="weather-card__header">
        <div>
          <div className="weather-card__eyebrow">Flight Weather Advisory</div>
          <div className="weather-card__title">
            <Icon name={advisory?.status === 'unsafe' ? 'warning' : advisory?.status === 'caution' ? 'info' : 'online'} size={15} />
            {advisory?.headline || 'Checking conditions'}
          </div>
        </div>
        <button className="weather-card__refresh" onClick={() => refresh()} disabled={loading}>
          {loading ? '...' : 'Refresh'}
        </button>
      </div>

      <div className="weather-card__meta">
        <span>{advisory?.locationName || 'Weather source'}</span>
        <span>Updated {formatUpdatedAt(advisory?.updatedAt)}</span>
      </div>

      {error && (
        <div className="weather-card__message weather-card__message--error">
          {error}
        </div>
      )}

      {!error && advisory && (
        <>
          <div className="weather-card__metrics">
            <div className="weather-card__metric">
              <span className="weather-card__metric-label">Wind</span>
              <strong>{advisory.metrics.windSpeed.toFixed(1)} km/h</strong>
            </div>
            <div className="weather-card__metric">
              <span className="weather-card__metric-label">Rain</span>
              <strong>{advisory.metrics.precipitation.toFixed(1)} mm</strong>
            </div>
            <div className="weather-card__metric">
              <span className="weather-card__metric-label">Visibility</span>
              <strong>{advisory.metrics.visibilityKm.toFixed(1)} km</strong>
            </div>
            <div className="weather-card__metric">
              <span className="weather-card__metric-label">Temp</span>
              <strong>{advisory.metrics.temperature.toFixed(1)} C</strong>
            </div>
          </div>

          <div className="weather-card__message">
            {advisory.reasons[0]}
          </div>
        </>
      )}
    </div>
  )
}
