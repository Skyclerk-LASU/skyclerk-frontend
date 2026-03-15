import DeliveryControlPanel from '../components/DeliveryControlPanel'
import { useMission } from '../hooks/useMission'

const STATE_COLORS = { IDLE:'neutral', PREPARING:'info', DEPARTED:'info', EN_ROUTE:'active', ARRIVING:'warn', DELIVERED:'success', RETURNING:'returning', EMERGENCY:'danger' }

export default function MissionsPage() {
  const { packages } = useMission()
  const delivered = packages.filter(p => p.state === 'DELIVERED').length
  const active    = packages.filter(p => !['IDLE','DELIVERED','EMERGENCY'].includes(p.state)).length
  const idle      = packages.filter(p => p.state === 'IDLE').length

  return (
    <div className="page standalone-page">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="page-title__icon">📦</span>Missions</div>
          <div className="page-subtitle">DELIVERY MISSION CONTROL</div>
        </div>
      </div>

      <div className="section-label">MISSION SUMMARY</div>
      <div className="stat-row">
        <div className="stat-card stat-card--blue">
          <div className="stat-card__label">TOTAL PACKAGES</div>
          <div className="stat-card__value">{packages.length}</div>
        </div>
        <div className="stat-card stat-card--cyan">
          <div className="stat-card__label">ACTIVE</div>
          <div className="stat-card__value">{active}</div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-card__label">DELIVERED</div>
          <div className="stat-card__value">{delivered}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">IDLE</div>
          <div className="stat-card__value">{idle}</div>
        </div>
      </div>

      <div className="section-label">PACKAGE STATUS</div>
      <div className="content-card">
        <div className="content-card__body" style={{padding:0}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>PACKAGE ID</th>
                <th>DESTINATION</th>
                <th>STATE</th>
                <th>PROGRESS</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(p => (
                <tr key={p.id}>
                  <td style={{color:'var(--blue)'}}>{p.id}</td>
                  <td style={{fontWeight:500}}>{p.dest}</td>
                  <td><span className={`mc-state mc-state--${STATE_COLORS[p.state]||'neutral'}`}>{p.state.replace('_',' ')}</span></td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <div className="tele-bar" style={{width:'80px',marginTop:0}}>
                        <div className="tele-bar-fill tele-bar-fill--normal" style={{width:`${p.progress}%`}} />
                      </div>
                      <span style={{fontSize:'10px',color:'var(--text3)'}}>{Math.round(p.progress)}%</span>
                    </div>
                  </td>
                  <td style={{color:'var(--text3)'}}>{p.eta !== '00:00:00' ? p.eta : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-label">MISSION CONTROL</div>
      <div className="content-card">
        <div style={{maxHeight:'400px',overflow:'hidden'}}>
          <DeliveryControlPanel />
        </div>
      </div>
    </div>
  )
}
