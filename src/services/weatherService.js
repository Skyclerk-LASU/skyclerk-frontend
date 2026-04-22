const DEFAULT_LOCATION = {
  name: import.meta.env.VITE_WEATHER_LOCATION_NAME || 'LASU Epe Campus',
  latitude: Number(import.meta.env.VITE_WEATHER_LATITUDE || 6.553),
  longitude: Number(import.meta.env.VITE_WEATHER_LONGITUDE || 3.9806),
}

function getStatusFromMetrics({ windSpeed, precipitation, visibilityKm, temperature, weatherCode }) {
  const reasons = []

  if (windSpeed >= 28) reasons.push(`High wind at ${windSpeed.toFixed(1)} km/h`)
  else if (windSpeed >= 20) reasons.push(`Moderate wind at ${windSpeed.toFixed(1)} km/h`)

  if (precipitation >= 1.5) reasons.push(`Heavy precipitation at ${precipitation.toFixed(1)} mm`)
  else if (precipitation > 0.2) reasons.push(`Light precipitation at ${precipitation.toFixed(1)} mm`)

  if (visibilityKm < 2) reasons.push(`Poor visibility at ${visibilityKm.toFixed(1)} km`)
  else if (visibilityKm < 5) reasons.push(`Reduced visibility at ${visibilityKm.toFixed(1)} km`)

  if (temperature >= 40 || temperature <= 5) reasons.push(`Extreme temperature at ${temperature.toFixed(1)} C`)

  const thunderstormCodes = new Set([95, 96, 99])
  if (thunderstormCodes.has(weatherCode)) reasons.push('Thunderstorm conditions detected')

  if (
    thunderstormCodes.has(weatherCode) ||
    windSpeed >= 28 ||
    precipitation >= 1.5 ||
    visibilityKm < 2
  ) {
    return {
      status: 'unsafe',
      headline: 'Unsafe to fly',
      reasons,
    }
  }

  if (
    windSpeed >= 20 ||
    precipitation > 0.2 ||
    visibilityKm < 5 ||
    temperature >= 35 ||
    temperature <= 10
  ) {
    return {
      status: 'caution',
      headline: 'Fly with caution',
      reasons,
    }
  }

  return {
    status: 'safe',
    headline: 'Safe to fly',
    reasons: reasons.length ? reasons : ['Conditions are within the normal flight window'],
  }
}

export async function fetchWeatherSafety() {
  const { latitude, longitude, name } = DEFAULT_LOCATION
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,precipitation,wind_speed_10m,visibility,weather_code',
    timezone: 'auto',
  })

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`)
  }

  const data = await response.json()
  const current = data.current

  if (!current) {
    throw new Error('Weather data unavailable')
  }

  const visibilityKm = (current.visibility ?? 0) / 1000
  const advisory = getStatusFromMetrics({
    windSpeed: current.wind_speed_10m ?? 0,
    precipitation: current.precipitation ?? 0,
    visibilityKm,
    temperature: current.temperature_2m ?? 0,
    weatherCode: current.weather_code ?? -1,
  })

  return {
    locationName: name,
    updatedAt: current.time,
    metrics: {
      temperature: current.temperature_2m ?? 0,
      windSpeed: current.wind_speed_10m ?? 0,
      precipitation: current.precipitation ?? 0,
      visibilityKm,
      weatherCode: current.weather_code ?? -1,
    },
    ...advisory,
  }
}
