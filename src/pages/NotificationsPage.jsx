import NotificationPanel from '../components/NotificationPanel'

export default function NotificationsPage() {
  return (
    <div className="page standalone-page">
      <div className="page-header">
        <div>
          <div className="page-title"><span className="page-title__icon">🔔</span>Notifications</div>
          <div className="page-subtitle">SENDER & RECIPIENT MANAGEMENT</div>
        </div>
      </div>

      <div className="section-label">NOTIFICATION CENTER</div>
      <div className="card-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
        <div className="content-card">
          <div className="content-card__header">
            <div className="content-card__title">COMPOSE & SEND</div>
          </div>
          <div style={{height:'520px',overflow:'hidden'}}>
            <NotificationPanel />
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div className="content-card">
            <div className="content-card__header">
              <div className="content-card__title">NOTIFICATION TYPES</div>
            </div>
            <div className="content-card__body">
              {[
                { type:'DEPARTURE', color:'blue',   desc:'Sent when drone departs warehouse with package' },
                { type:'ARRIVAL',   color:'green',  desc:'Sent when package arrives at destination' },
                { type:'DELAY',     color:'amber',  desc:'Sent when mission is delayed or on hold' },
                { type:'CUSTOM',    color:'accent', desc:'Custom message to any recipient' },
              ].map(n => (
                <div key={n.type} style={{display:'flex',alignItems:'flex-start',gap:'10px',marginBottom:'12px'}}>
                  <span className={`mc-state mc-state--${n.color==='blue'?'info':n.color==='green'?'success':n.color==='amber'?'warn':'returning'}`} style={{flexShrink:0,marginTop:'2px'}}>{n.type}</span>
                  <span style={{fontSize:'12px',color:'var(--text2)',lineHeight:'1.5'}}>{n.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="content-card">
            <div className="content-card__header">
              <div className="content-card__title">CHANNELS</div>
            </div>
            <div className="content-card__body">
              {[
                { ch:'SMS',   icon:'✉', desc:'Text message to recipient phone number' },
                { ch:'EMAIL', icon:'@', desc:'Email to recipient email address' },
                { ch:'BOTH',  icon:'✉@',desc:'Send via both SMS and email simultaneously' },
              ].map(c => (
                <div key={c.ch} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'10px'}}>
                  <div style={{width:'32px',height:'32px',background:'var(--bg4)',border:'1px solid var(--border)',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--mono)',fontSize:'11px',color:'var(--blue)',flexShrink:0}}>{c.icon}</div>
                  <div>
                    <div style={{fontFamily:'var(--mono)',fontSize:'10px',color:'var(--text)',letterSpacing:'1px'}}>{c.ch}</div>
                    <div style={{fontSize:'11px',color:'var(--text3)'}}>{c.desc}</div>
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
