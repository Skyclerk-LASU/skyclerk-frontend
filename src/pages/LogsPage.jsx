import MissionLog from '../components/MissionLog'

export default function LogsPage() {
  return (
    <div className="page standalone-page">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="page-title__icon">📋</span>Mission Log</div>
          <div className="page-subtitle">OPERATIONAL EVENT HISTORY</div>
        </div>
      </div>

      <div className="section-label">EVENT CONSOLE</div>
      <div className="content-card" style={{height:'calc(100vh - 220px)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <MissionLog fullHeight />
      </div>
    </div>
  )
}
