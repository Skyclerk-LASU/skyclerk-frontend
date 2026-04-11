import DeliveryControlPanel from '../components/DeliveryControlPanel'
import { useMission } from '../hooks/useMission'
import Icon from '../components/Icon'

const STATE_META = {
  IDLE:      { color:'neutral',   icon:'drone'     },
  PREPARING: { color:'info',      icon:'drone'     },
  DEPARTED:  { color:'info',      icon:'drone'     },
  EN_ROUTE:  { color:'active',    icon:'drone'     },
  ARRIVING:  { color:'warn',      icon:'warning'   },
  DELIVERED: { color:'success',   icon:'delivered' },
  RETURNING: { color:'returning', icon:'rtb'       },
  EMERGENCY: { color:'danger',    icon:'emergency' },
}

export default function MissionsPage() {
  const { packages } = useMission()
  const delivered = packages.filter(p => p.state === 'DELIVERED').length
  const active    = packages.filter(p => !['IDLE','DELIVERED','EMERGENCY'].includes(p.state)).length
  const idle      = packages.filter(p => p.state === 'IDLE').length

  return (
    <div className="page standalone-page">

      <div className="page-header">
        <div>
          <div className="page-title">
            <Icon name="mission" size={22} style={{color:'var(--blue)'}}/>
            Missions
          </div>
          <div className="page-subtitle">DELIVERY MISSION CONTROL</div>
        </div>
      </div>

      <div className="section-label">Summary</div>
      <div className="stat-row">
        {[
          { label:'TOTAL',     val:packages.length, color:'blue',  icon:'payload'   },
          { label:'ACTIVE',    val:active,           color:'cyan',  icon:'drone'     },
          { label:'DELIVERED', val:delivered,        color:'green', icon:'delivered' },
          { label:'IDLE',      val:idle,             color:'',      icon:'analytics' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.color ? `stat-card--${s.color}` : ''}`}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}>
              <div className="stat-card__label">{s.label}</div>
              <Icon name={s.icon} size={16} style={{opacity:0.4}}/>
            </div>
            <div className="stat-card__value">{s.val}</div>
          </div>
        ))}
      </div>

      <div className="section-label">Package Status</div>
      <div className="content-card">
        <div className="content-card__body" style={{padding:0}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>DESTINATION</th>
                <th>STATE</th>
                <th>PROGRESS</th>
                <th>ETA</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(p => {
                const meta = STATE_META[p.state] || STATE_META.IDLE
                return (
                  <tr key={p.id}>
                    <td style={{color:'var(--blue)',fontWeight:500}}>{p.id}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                        <Icon name="warehouse" size={13} style={{color:'var(--text3)'}}/>
                        {p.dest}
                      </div>
                    </td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                        <Icon name={meta.icon} size={12} />
                        <span className={`mc-state mc-state--${meta.color}`}>{p.state.replace('_',' ')}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                        <div className="tele-bar" style={{width:'80px',marginTop:0}}>
                          <div className="tele-bar-fill tele-bar-fill--normal" style={{width:`${p.progress}%`}}/>
                        </div>
                        <span style={{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--text3)'}}>{Math.round(p.progress)}%</span>
                      </div>
                    </td>
                    <td style={{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--text3)'}}>{p.eta !== '00:00:00' ? p.eta : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="section-label">Mission Control</div>
      <div className="content-card">
        <div style={{maxHeight:'420px',overflow:'hidden'}}>
          <DeliveryControlPanel />
        </div>
      </div>

    </div>
  )
}
