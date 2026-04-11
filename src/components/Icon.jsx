// Skyclerk Icon System — Minimalist Line Icons
// Usage: <Icon name="drone" size={20} />

const ICONS = {
    // Navigation
    dashboard: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </g>
    ),
    telemetry: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polyline points="2,15 7,9 11,13 15,6 19,10 22,7"/>
        <line x1="2" y1="20" x2="22" y2="20" strokeOpacity="0.3"/>
      </g>
    ),
    mission: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </g>
    ),
    sensor: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <circle cx="12" cy="12" r="2.5"/>
        <path d="M8.5 8.5a5 5 0 0 0 0 7"/>
        <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
        <path d="M5.5 5.5a9 9 0 0 0 0 13"/>
        <path d="M18.5 5.5a9 9 0 0 1 0 13"/>
      </g>
    ),
    notify: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </g>
    ),
    control: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <circle cx="12" cy="12" r="3"/>
        <line x1="12" y1="2" x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="4.22" y1="4.22" x2="7.05" y2="7.05"/>
        <line x1="16.95" y1="16.95" x2="19.78" y2="19.78"/>
        <line x1="2" y1="12" x2="6" y2="12"/>
        <line x1="18" y1="12" x2="22" y2="12"/>
        <line x1="4.22" y1="19.78" x2="7.05" y2="16.95"/>
        <line x1="16.95" y1="7.05" x2="19.78" y2="4.22"/>
      </g>
    ),
    logs: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="8" y1="13" x2="16" y2="13"/>
        <line x1="8" y1="17" x2="12" y2="17"/>
      </g>
    ),
    map: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21"/>
        <line x1="9" y1="3" x2="9" y2="18"/>
        <line x1="15" y1="6" x2="15" y2="21"/>
      </g>
    ),
  
    // Telemetry metrics
    altitude: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <line x1="12" y1="20" x2="12" y2="4"/>
        <polyline points="8,8 12,4 16,8" strokeLinejoin="round"/>
        <line x1="8" y1="20" x2="16" y2="20"/>
      </g>
    ),
    speed: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <circle cx="12" cy="14" r="7"/>
        <line x1="12" y1="14" x2="9" y2="10"/>
        <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none"/>
        <line x1="5" y1="7" x2="7" y2="9"/>
      </g>
    ),
    battery: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <rect x="2" y="7" width="18" height="10" rx="2"/>
        <line x1="22" y1="11" x2="22" y2="13" strokeWidth="2"/>
        <rect x="4" y="9" width="9" height="6" rx="1" fill="currentColor" stroke="none" opacity="0.5"/>
      </g>
    ),
    signal: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <path d="M2 9a13 13 0 0 1 20 0"/>
        <path d="M5.5 12.5a9 9 0 0 1 13 0"/>
        <path d="M9 16a5 5 0 0 1 6 0"/>
        <circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/>
      </g>
    ),
    temp: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
      </g>
    ),
    payload: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </g>
    ),
    heading: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <circle cx="12" cy="12" r="9"/>
        <polygon points="12,5 14,11 12,10 10,11" fill="currentColor" stroke="none"/>
        <polygon points="12,19 14,13 12,14 10,13" fill="currentColor" stroke="none" opacity="0.3"/>
      </g>
    ),
  
    // Actions
    start: (
      <g fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <polygon points="10,8 18,12 10,16" fill="currentColor" opacity="0.8"/>
      </g>
    ),
    stop: (
      <g fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.8"/>
      </g>
    ),
    rtb: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polyline points="9,14 4,9 9,4"/>
        <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
      </g>
    ),
    delivered: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polyline points="20,6 9,17 4,12"/>
      </g>
    ),
    emergency: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
      </g>
    ),
    reset: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polyline points="1,4 1,10 7,10"/>
        <path d="M3.51 15a9 9 0 1 0 .49-3.96"/>
      </g>
    ),
    send: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22,2 15,22 11,13 2,9"/>
      </g>
    ),
    capture: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </g>
    ),
    scan: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <path d="M3 9V5a2 2 0 0 1 2-2h4"/>
        <path d="M3 15v4a2 2 0 0 0 2 2h4"/>
        <path d="M21 9V5a2 2 0 0 0-2-2h-4"/>
        <path d="M21 15v4a2 2 0 0 1-2 2h-4"/>
        <line x1="7" y1="12" x2="17" y2="12" strokeDasharray="2 2"/>
      </g>
    ),
    calibrate: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <circle cx="12" cy="12" r="9"/>
        <circle cx="12" cy="12" r="3"/>
        <line x1="12" y1="3" x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="21"/>
        <line x1="3" y1="12" x2="6" y2="12"/>
        <line x1="18" y1="12" x2="21" y2="12"/>
      </g>
    ),
  
    // Status
    online: (
      <g fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.6"/>
      </g>
    ),
    offline: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <circle cx="12" cy="12" r="9"/>
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
      </g>
    ),
    warning: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <circle cx="12" cy="17" r="0.5" fill="currentColor"/>
      </g>
    ),
    info: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <circle cx="12" cy="12" r="9"/>
        <line x1="12" y1="8" x2="12" y2="8" strokeWidth="2"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
      </g>
    ),
  
    // UI
    chevronDown: (
      <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    chevronUp: (
      <polyline points="18,15 12,9 6,15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    chevronRight: (
      <polyline points="9,18 15,12 9,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    ),
    menu: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </g>
    ),
    close: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </g>
    ),
    zoomIn: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="14"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </g>
    ),
    zoomOut: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </g>
    ),
    follow: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
        <path d="M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
      </g>
    ),
    fitRoute: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
        <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
        <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
        <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
      </g>
    ),
    legend: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <line x1="3" y1="6" x2="8" y2="6"/>
        <line x1="3" y1="12" x2="8" y2="12"/>
        <line x1="3" y1="18" x2="8" y2="18"/>
        <line x1="12" y1="6" x2="21" y2="6"/>
        <line x1="12" y1="12" x2="21" y2="12"/>
        <line x1="12" y1="18" x2="21" y2="18"/>
      </g>
    ),
    drone: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <circle cx="12" cy="12" r="2.5"/>
        <line x1="12" y1="9.5" x2="12" y2="5"/>
        <line x1="12" y1="14.5" x2="12" y2="19"/>
        <line x1="9.5" y1="12" x2="5" y2="12"/>
        <line x1="14.5" y1="12" x2="19" y2="12"/>
        <circle cx="12" cy="4" r="1.5"/>
        <circle cx="12" cy="20" r="1.5"/>
        <circle cx="4" cy="12" r="1.5"/>
        <circle cx="20" cy="12" r="1.5"/>
      </g>
    ),
    analytics: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
        <line x1="2" y1="20" x2="22" y2="20" strokeOpacity="0.4"/>
      </g>
    ),
    pause: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" opacity="0.7"/>
        <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" opacity="0.7"/>
      </g>
    ),
    play: (
      <polygon points="5,3 19,12 5,21" fill="currentColor" opacity="0.8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    ),
    trash: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polyline points="3,6 5,6 21,6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
      </g>
    ),
    search: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </g>
    ),
    filter: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
      </g>
    ),
    sms: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </g>
    ),
    email: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </g>
    ),
    warehouse: (
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </g>
    ),
  }
  
  export default function Icon({ name, size = 16, color = 'currentColor', className = '', style = {} }) {
    const paths = ICONS[name]
    if (!paths) {
      // Fallback — simple circle if icon not found
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display:'inline-block', verticalAlign:'middle', flexShrink:0, ...style }}>
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
        </svg>
      )
    }
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        color={color}
        className={className}
        style={{ display:'inline-block', verticalAlign:'middle', flexShrink:0, ...style }}
      >
        {paths}
      </svg>
    )
  }
  