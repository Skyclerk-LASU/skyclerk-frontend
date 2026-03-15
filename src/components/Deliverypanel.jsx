const deliveries = [
    { id: 'PKG-041', dest: 'MECH', eta: '00:08:32', status: 'EN ROUTE', type: 'del-active' },
    { id: 'PKG-042', dest: 'CPE',  eta: '00:22:10', status: 'QUEUED',   type: 'del-queued' },
    { id: 'PKG-043', dest: 'ECE',  eta: '00:35:44', status: 'QUEUED',   type: 'del-queued' },
    { id: 'PKG-044', dest: 'ASE',  eta: '00:48:20', status: 'QUEUED',   type: 'del-queued' },
  ]
  
  export default function DeliveryPanel() {
    return (
      <div className="panel delivery-panel">
        <div className="panel-header">
          <div className="panel-title">DELIVERIES</div>
          <div className="badge active">3 ACTIVE</div>
        </div>
        {deliveries.map((d) => (
          <div className="delivery-item" key={d.id}>
            <span className="del-id">{d.id}</span>
            <div className="del-info">
              <div className="del-dest">{d.dest}</div>
              <div className="del-eta">ETA {d.eta}</div>
            </div>
            <span className={d.type}>{d.status}</span>
          </div>
        ))}
      </div>
    )
  }
  