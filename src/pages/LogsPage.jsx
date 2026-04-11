import MissionLog from '../components/MissionLog'
import Icon from '../components/Icon'

export default function LogsPage() {
  return (
    <div className="page standalone-page">

      <div className="page-header">
        <div>
          <div className="page-title">
            <Icon name="logs" size={22} style={{color:'var(--blue)'}}/>
            Mission Log
          </div>
          <div className="page-subtitle">OPERATIONAL EVENT HISTORY</div>
        </div>
      </div>

      <div className="section-label">Event Console</div>
      <div className="content-card" style={{height:'calc(100vh - 230px)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <MissionLog fullHeight />
      </div>

    </div>
  )
}
