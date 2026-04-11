import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import skyclerkLogo from '../assets/skyclerk-logo.jpg'
import ConnectionStatus from './ConnectionStatus'
import Icon from './Icon'

const NAV_LINKS = [
  { path: '/',              icon: 'dashboard', label: 'DASHBOARD'  },
  { path: '/telemetry',     icon: 'telemetry', label: 'TELEMETRY'  },
  { path: '/missions',      icon: 'mission',   label: 'MISSIONS'   },
  { path: '/sensors',       icon: 'sensor',    label: 'SENSORS'    },
  { path: '/notifications', icon: 'notify',    label: 'NOTIFY'     },
  { path: '/logs',          icon: 'logs',      label: 'LOGS'       },
]

export default function TopBar() {
  const [time, setTime]     = useState('')
  const [menuOpen, setMenu] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime([now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(v => String(v).padStart(2,'0')).join(':'))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <nav className="topbar">
        <div className="topbar-left">
          <img
            src={skyclerkLogo} alt="Skyclerk"
            className="logo-img"
            onClick={() => navigate('/')}
            style={{ cursor:'pointer' }}
          />
          <div className="logo" onClick={() => navigate('/')} style={{ cursor:'pointer' }}>
            <span className="logo-name">SKYCLERK</span>
            <span className="logo-sub">SECURE CAMPUS DELIVERY</span>
          </div>

          <div className="topbar-divider" />

          <nav className="topbar-nav">
            {NAV_LINKS.map(link => (
              <button
                key={link.path}
                className={`topbar-nav-link ${location.pathname === link.path ? 'topbar-nav-link--active' : ''}`}
                onClick={() => navigate(link.path)}
              >
                <Icon name={link.icon} size={14} />
                {link.label}
              </button>
            ))}
          </nav>

          <div className="status-group">
            <div className="status-pill online">
              <div className="dot green" />DRONE-01
            </div>
            <div className="status-pill warning">
              <div className="dot amber" />GPS
            </div>
            <ConnectionStatus />
          </div>
        </div>

        <div className="topbar-right">
          <div className="time">{time}</div>
          <div className="badge active">ACTIVE</div>
          <button
            onClick={() => setMenu(o => !o)}
            className="mobile-menu-btn"
            style={{ background:'transparent', border:'1px solid var(--border2)', color:'var(--text2)', padding:'6px 8px', borderRadius:'6px', cursor:'pointer', display:'none' }}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={16} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div style={{ position:'fixed', top:'58px', left:0, right:0, background:'var(--bg2)', borderBottom:'1px solid var(--border2)', zIndex:150, padding:'10px', display:'flex', flexDirection:'column', gap:'4px', boxShadow:'0 8px 32px rgba(0,0,0,0.5)' }}>
          {NAV_LINKS.map(link => (
            <button
              key={link.path}
              onClick={() => { navigate(link.path); setMenu(false) }}
              style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', background: location.pathname === link.path ? 'var(--blue5)' : 'transparent', border:'1px solid', borderColor: location.pathname === link.path ? 'var(--border2)' : 'transparent', borderRadius:'8px', color: location.pathname === link.path ? 'var(--blue)' : 'var(--text2)', fontFamily:'var(--mono)', fontSize:'11px', letterSpacing:'1px', cursor:'pointer', textAlign:'left', transition:'var(--transition)' }}
            >
              <Icon name={link.icon} size={16} />
              {link.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
