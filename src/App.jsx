import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TopBar from './components/TopBar'
import DashboardPage     from './pages/DashboardPage'
import TelemetryPage     from './pages/TelemetryPage'
import MissionsPage      from './pages/MissionsPage'
import SensorsPage       from './pages/SensorsPage'
import NotificationsPage from './pages/NotificationsPage'
import LogsPage          from './pages/LogsPage'
import skyclerkLogo from './assets/skyclerk-logo.jpg'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <img src={skyclerkLogo} alt="Skyclerk" className="loading-logo" />
      <div className="loading-text">SKYCLERK INITIALISING</div>
      <div className="loading-bar"><div className="loading-bar__fill" /></div>
      <div className="loading-text" style={{fontSize:'9px',opacity:0.5}}>SECURE CAMPUS DELIVERY DRONE</div>
    </div>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(t)
  }, [])

  if (loading) return <LoadingScreen />

  return (
    <BrowserRouter>
      <div className="dash">
        <TopBar />
        <Routes>
          <Route path="/"              element={<DashboardPage />} />
          <Route path="/telemetry"     element={<TelemetryPage />} />
          <Route path="/missions"      element={<MissionsPage />} />
          <Route path="/sensors"       element={<SensorsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/logs"          element={<LogsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
