import NotificationPanel from '../components/NotificationPanel'
import Icon from '../components/Icon'

const NOTIF_TYPES = [
  { type:'DEPARTURE', color:'info',      icon:'send',     desc:'Sent when drone departs warehouse with package' },
  { type:'ARRIVAL',   color:'success',   icon:'delivered',desc:'Sent when package arrives at destination' },
  { type:'DELAY',     color:'warn',      icon:'warning',  desc:'Sent when mission is delayed or on hold' },
  { type:'CUSTOM',    color:'returning', icon:'sms',      desc:'Custom message to any recipient' },
]

const CHANNELS = [
  { ch:'SMS',   icon:'sms',   desc:'Text message to recipient phone number' },
  { ch:'EMAIL', icon:'email', desc:'Email to recipient email address' },
  { ch:'BOTH',  icon:'send',  desc:'Send via both SMS and email simultaneously' },
]

export default function NotificationsPage() {
  return (
    <div className="page standalone-page">

      <div className="page-header">
        <div>
          <div className="page-title">
            <Icon name="notify" size={22} style={{color:'var(--blue)'}}/>
            Notifications
          </div>
          <div className="page-subtitle">SENDER & RECIPIENT MANAGEMENT</div>
        </div>
      </div>

      <div className="card-grid" style={{gridTemplateColumns:'1fr 1fr',marginTop:'20px'}}>

        <div className="content-card">
          <div className="content-card__header">
            <div className="content-card__title">
              <Icon name="send" size={13}/>Compose & Send
            </div>
          </div>
          <div style={{height:'540px',overflow:'hidden'}}>
            <NotificationPanel />
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>

          <div className="content-card">
            <div className="content-card__header">
              <div className="content-card__title">
                <Icon name="info" size={13}/>Notification Types
              </div>
            </div>
            <div className="content-card__body" style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              {NOTIF_TYPES.map(n => (
                <div key={n.type} style={{display:'flex',alignItems:'flex-start',gap:'12px'}}>
                  <div style={{width:'32px',height:'32px',background:'var(--bg4)',border:'1px solid var(--border)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon name={n.icon} size={14} />
                  </div>
                  <div>
                    <span className={`mc-state mc-state--${n.color}`} style={{marginBottom:'4px',display:'inline-block'}}>{n.type}</span>
                    <p style={{fontSize:'12px',color:'var(--text2)',lineHeight:'1.5',marginTop:'3px'}}>{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="content-card">
            <div className="content-card__header">
              <div className="content-card__title">
                <Icon name="signal" size={13}/>Channels
              </div>
            </div>
            <div className="content-card__body" style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              {CHANNELS.map(c => (
                <div key={c.ch} style={{display:'flex',alignItems:'center',gap:'12px'}}>
                  <div style={{width:'36px',height:'36px',background:'var(--bg4)',border:'1px solid var(--border)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon name={c.icon} size={15} style={{color:'var(--blue)'}}/>
                  </div>
                  <div>
                    <div style={{fontFamily:'var(--mono)',fontSize:'11px',color:'var(--text)',letterSpacing:'1px',marginBottom:'2px'}}>{c.ch}</div>
                    <div style={{fontSize:'12px',color:'var(--text3)'}}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
