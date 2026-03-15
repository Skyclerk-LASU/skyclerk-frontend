import DroneMap from '../components/DroneMap'
import Sidebar from '../components/Sidebar'
import TelemetryGraphs from '../components/TelemetryGraphs'
import MissionLog from '../components/MissionLog'

export default function DashboardPage() {
  return (
    <div className="page">
      <div className="dash-body">
        <DroneMap />
        <Sidebar />
        <TelemetryGraphs />
        <MissionLog />
      </div>
    </div>
  )
}
