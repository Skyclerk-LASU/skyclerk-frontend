import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useDroneMovement, WAREHOUSE, DESTINATIONS } from '../hooks/useDroneMovement'
import { useMission } from '../hooks/useMission'

function haversine(a, b) {
  const R  = 6371000
  const φ1 = a.lat * Math.PI / 180
  const φ2 = b.lat * Math.PI / 180
  const dφ = (b.lat - a.lat) * Math.PI / 180
  const dλ = (b.lng - a.lng) * Math.PI / 180
  const x  = Math.sin(dφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(dλ/2)**2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x)))
}

function fmtDist(m) {
  return m >= 1000 ? `${(m/1000).toFixed(1)} km` : `${m} m`
}

function createDroneIcon(heading) {
  return L.divIcon({
    className: '',
    html: `<div class="drone-icon" style="transform:rotate(${heading}deg)">
             <div class="drone-icon__body"></div>
             <div class="drone-icon__ring"></div>
             <div class="drone-icon__ring drone-icon__ring--2"></div>
           </div>`,
    iconSize: [30,30], iconAnchor: [15,15],
  })
}

function createWarehouseIcon() {
  return L.divIcon({
    className: '',
    html: `<div class="map-marker map-marker--warehouse">
             <span class="map-marker__icon">▣</span>
             <span class="map-marker__label">WH</span>
           </div>`,
    iconSize: [44,44], iconAnchor: [22,22],
  })
}

function createDestIcon(label, state) {
  const cls  = state === 'active'    ? 'map-marker--dest-active'
             : state === 'delivered' ? 'map-marker--dest-done'
             : state === 'returning' ? 'map-marker--dest-returning'
             : ''
  const icon = state === 'delivered' ? '✓'
             : state === 'active'    ? '▶'
             : '◆'
  return L.divIcon({
    className: '',
    html: `<div class="map-marker map-marker--dest ${cls}">
             <span class="map-marker__icon">${icon}</span>
             <span class="map-marker__label">${label}</span>
           </div>`,
    iconSize: [44,44], iconAnchor: [22,22],
  })
}

function createDistLabel(text) {
  return L.divIcon({
    className: '',
    html: `<div class="map-dist-label">${text}</div>`,
    iconSize: [60,16], iconAnchor: [30,8],
  })
}

const FULL_ROUTE = [WAREHOUSE, ...DESTINATIONS]

export default function DroneMap() {
  const mapRef         = useRef(null)
  const leafletMap     = useRef(null)
  const droneMarker    = useRef(null)
  const routeLines     = useRef([])
  const completedLines = useRef([])
  const pathLine       = useRef(null)
  const destMarkers    = useRef([])
  const distLabels     = useRef([])
  const [follow,     setFollow]     = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [ready,      setReady]      = useState(false)

  const drone   = useDroneMovement(700)
  const mission = useMission()

  function getDestState(destLabel) {
    const pkg = mission.packages.find(p => p.dest === destLabel)
    if (!pkg) return 'idle'
    if (pkg.state === 'DELIVERED') return 'delivered'
    if (pkg.state === 'RETURNING') return 'returning'
    if (['EN_ROUTE','ARRIVING','PREPARING','DEPARTED'].includes(pkg.state)) return 'active'
    return 'idle'
  }

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return

    const map = L.map(mapRef.current, {
      center: [WAREHOUSE.lat, WAREHOUSE.lng],
      zoom: 16, zoomControl: false, attributionControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
    L.control.attribution({ position: 'bottomright', prefix: false }).addAttribution('© OSM').addTo(map)

    for (let i = 0; i < FULL_ROUTE.length - 1; i++) {
      const from = FULL_ROUTE[i]
      const to   = FULL_ROUTE[i+1]
      routeLines.current.push(
        L.polyline([[from.lat,from.lng],[to.lat,to.lng]], { color:'#334155', weight:2, dashArray:'5 7', opacity:0.8 }).addTo(map)
      )
      completedLines.current.push(
        L.polyline([], { color:'#3b82f6', weight:2.5, opacity:0.8 }).addTo(map)
      )
      const mid = [(from.lat+to.lat)/2, (from.lng+to.lng)/2]
      distLabels.current.push(
        L.marker(mid, { icon: createDistLabel(fmtDist(haversine(from,to))), zIndexOffset:10 }).addTo(map)
      )
    }

    pathLine.current = L.polyline([], { color:'#06b6d4', weight:2, opacity:0.35 }).addTo(map)

    L.marker([WAREHOUSE.lat,WAREHOUSE.lng], { icon:createWarehouseIcon(), zIndexOffset:200 })
      .addTo(map)
      .bindTooltip('WAREHOUSE — origin', { className:'map-tooltip', direction:'right' })

    destMarkers.current = DESTINATIONS.map(d =>
      L.marker([d.lat,d.lng], { icon:createDestIcon(d.label,'idle'), zIndexOffset:100 })
        .addTo(map)
        .bindTooltip(`${d.label} — ${fmtDist(haversine(WAREHOUSE,d))} from WH`, { className:'map-tooltip' })
    )

    droneMarker.current = L.marker([WAREHOUSE.lat,WAREHOUSE.lng], { icon:createDroneIcon(0), zIndexOffset:1000 }).addTo(map)

    leafletMap.current = map
    setReady(true)

    return () => {
      map.remove()
      leafletMap.current  = null
      droneMarker.current = null
      pathLine.current    = null
      routeLines.current     = []
      completedLines.current = []
      destMarkers.current    = []
      distLabels.current     = []
    }
  }, [])

  useEffect(() => {
    if (!ready || !leafletMap.current) return
    const { position, heading, pathHistory, destIndex } = drone
    const latlng = [position.lat, position.lng]

    droneMarker.current?.setLatLng(latlng)
    droneMarker.current?.setIcon(createDroneIcon(heading))
    pathLine.current?.setLatLngs(pathHistory.map(p => [p.lat,p.lng]))

    completedLines.current.forEach((line, i) => {
      if (i < destIndex) {
        line.setLatLngs([[FULL_ROUTE[i].lat,FULL_ROUTE[i].lng],[FULL_ROUTE[i+1].lat,FULL_ROUTE[i+1].lng]])
      } else if (i === destIndex) {
        line.setLatLngs([[FULL_ROUTE[i].lat,FULL_ROUTE[i].lng], latlng])
      } else {
        line.setLatLngs([])
      }
    })

    destMarkers.current.forEach((marker, i) => {
      const state = getDestState(DESTINATIONS[i].label)
      marker.setIcon(createDestIcon(DESTINATIONS[i].label, i === destIndex ? 'active' : state))
    })

    if (follow) leafletMap.current.panTo(latlng, { animate:true, duration:0.5 })
  }, [drone, follow, ready, mission.packages])

  const fitRoute = () => {
    if (!leafletMap.current) return
    leafletMap.current.fitBounds(L.latLngBounds(FULL_ROUTE.map(p => [p.lat,p.lng])), { padding:[30,30] })
    setFollow(false)
  }

  return (
    <div className="panel map-panel">
      <div className="panel-header">
        <div className="panel-title">DRONE MAP</div>
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <span className="tele-coords__val" style={{ fontSize:'10px' }}>
            {drone.position.lat.toFixed(4)}°N {drone.position.lng.toFixed(4)}°E
          </span>
          <div className={`badge ${drone.status === 'ARRIVING' ? 'warn' : 'active'}`}>
            {drone.status}
          </div>
        </div>
      </div>

      <div ref={mapRef} className="map-leaflet" />

      <div className="map-progress">
        <div className="map-progress__label">
          <span className="tele-coords__label">TO: {drone.destination?.label}</span>
          <span className="tele-coords__val">{drone.progress}%</span>
        </div>
        <div className="tele-bar" style={{ marginTop:'4px' }}>
          <div className={`tele-bar-fill tele-bar-fill--${drone.progress >= 90 ? 'warn' : 'normal'}`}
            style={{ width:`${drone.progress}%` }} />
        </div>
      </div>

      {showLegend && (
        <div className="map-legend">
          <div className="map-legend__row"><div className="map-legend__line map-legend__line--planned"/><span>Planned</span></div>
          <div className="map-legend__row"><div className="map-legend__line map-legend__line--completed"/><span>Completed</span></div>
          <div className="map-legend__row"><div className="map-legend__line map-legend__line--trail"/><span>Trail</span></div>
          <div className="map-legend__row"><div className="map-legend__dot map-legend__dot--wh"/><span>Warehouse</span></div>
          <div className="map-legend__row"><div className="map-legend__dot map-legend__dot--dest"/><span>Destination</span></div>
        </div>
      )}

      <div className="map-controls">
        <button className="map-ctrl-btn" onClick={() => leafletMap.current?.zoomIn()} title="Zoom in"><Icon name="zoomIn" size={14}/></button>
        <button className="map-ctrl-btn" onClick={() => leafletMap.current?.zoomOut()} title="Zoom out"><Icon name="zoomOut" size={14}/></button>
        <button className={`map-ctrl-btn ${follow ? 'map-ctrl-btn--active' : ''}`} onClick={() => setFollow(f => !f)} title="Follow drone"><Icon name="follow" size={14}/></button>
        <button className="map-ctrl-btn" onClick={fitRoute} title="Fit full route"><Icon name="fitRoute" size={14}/></button>
        <button className={`map-ctrl-btn ${showLegend ? 'map-ctrl-btn--active' : ''}`} onClick={() => setShowLegend(s => !s)} title="Toggle legend"><Icon name="legend" size={14}/></button>
      </div>
    </div>
  )
}
