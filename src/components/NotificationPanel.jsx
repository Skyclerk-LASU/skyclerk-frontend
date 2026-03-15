import { useState } from 'react'
import { useNotification, CHANNELS } from '../hooks/useNotification'

function Field({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="nf-field">
      <label className="nf-label">{label}</label>
      <input
        className="nf-input"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="nf-section">
      <div className="nf-section__title">{title}</div>
      {children}
    </div>
  )
}

export default function NotificationPanel() {
  const {
    sender, setSender,
    recipient, setRecipient,
    channel, setChannel,
    selectedPkg, setSelectedPkg,
    customBody, setCustomBody,
    delayReason, setDelayReason,
    sending, history, lastResult,
    sendDeparture, sendArrival, sendDelay, sendCustom,
    PACKAGES,
  } = useNotification()

  const [tab, setTab] = useState('compose')  // 'compose' | 'history'

  return (
    <div className="panel notif-panel">
      <div className="panel-header">
        <div className="panel-title">NOTIFICATIONS</div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button className={`nf-tab ${tab === 'compose' ? 'nf-tab--active' : ''}`} onClick={() => setTab('compose')}>COMPOSE</button>
          <button className={`nf-tab ${tab === 'history' ? 'nf-tab--active' : ''}`} onClick={() => setTab('history')}>
            LOG {history.length > 0 && <span className="nf-badge">{history.length}</span>}
          </button>
        </div>
      </div>

      {tab === 'compose' && (
        <div className="nf-body">

          {/* Package selector */}
          <Section title="PACKAGE">
            <div className="nf-pkg-row">
              {PACKAGES.map(p => (
                <button
                  key={p.id}
                  className={`nf-pkg-btn ${selectedPkg === p.id ? 'nf-pkg-btn--active' : ''}`}
                  onClick={() => setSelectedPkg(p.id)}
                >
                  <span className="nf-pkg-id">{p.id.replace('PKG-', '#')}</span>
                  <span className="nf-pkg-dest">{p.dest}</span>
                </button>
              ))}
            </div>
          </Section>

          {/* Channel */}
          <Section title="CHANNEL">
            <div className="nf-channel-row">
              {CHANNELS.map(c => (
                <button
                  key={c}
                  className={`nf-channel-btn ${channel === c ? 'nf-channel-btn--active' : ''}`}
                  onClick={() => setChannel(c)}
                >
                  {c === 'SMS' ? '✉ SMS' : c === 'EMAIL' ? '@ EMAIL' : '✉@ BOTH'}
                </button>
              ))}
            </div>
          </Section>

          {/* Sender */}
          <Section title="SENDER">
            <Field label="NAME"     value={sender.name}     onChange={v => setSender(s => ({ ...s, name: v }))}     placeholder="e.g. LASU Ops Center" />
            <Field label="LOCATION" value={sender.location}  onChange={v => setSender(s => ({ ...s, location: v }))}  placeholder="Warehouse location" />
          </Section>

          {/* Recipient */}
          <Section title="RECIPIENT">
            <Field label="NAME"  value={recipient.name}  onChange={v => setRecipient(r => ({ ...r, name: v }))}  placeholder="Recipient full name" />
            {channel !== 'EMAIL' && (
              <Field label="PHONE" value={recipient.phone} onChange={v => setRecipient(r => ({ ...r, phone: v }))} placeholder="+234 800 000 0000" type="tel" />
            )}
            {channel !== 'SMS' && (
              <Field label="EMAIL" value={recipient.email} onChange={v => setRecipient(r => ({ ...r, email: v }))} placeholder="recipient@email.com" type="email" />
            )}
          </Section>

          {/* Delay reason */}
          <Section title="DELAY REASON (OPTIONAL)">
            <div className="nf-field">
              <input
                className="nf-input"
                value={delayReason}
                onChange={e => setDelayReason(e.target.value)}
                placeholder="e.g. Weather hold, Battery low..."
              />
            </div>
          </Section>

          {/* Custom message */}
          <Section title="CUSTOM MESSAGE">
            <div className="nf-field">
              <textarea
                className="nf-input nf-textarea"
                value={customBody}
                onChange={e => setCustomBody(e.target.value)}
                placeholder="Type a custom message..."
                rows={3}
              />
            </div>
          </Section>

          {/* Status feedback */}
          {lastResult && (
            <div className={`nf-result ${lastResult.success ? 'nf-result--ok' : 'nf-result--err'}`}>
              {lastResult.success
                ? `✓ SENT — ${lastResult.messageId}`
                : `✗ FAILED — ${lastResult.error}`}
            </div>
          )}

          {/* Action buttons */}
          <div className="nf-actions">
            <button className="nf-send-btn nf-send-btn--depart"  onClick={sendDeparture} disabled={sending}>
              {sending ? '...' : '▶ DEPARTURE'}
            </button>
            <button className="nf-send-btn nf-send-btn--arrive"  onClick={sendArrival}   disabled={sending}>
              {sending ? '...' : '✓ ARRIVAL'}
            </button>
            <button className="nf-send-btn nf-send-btn--delay"   onClick={sendDelay}    disabled={sending}>
              {sending ? '...' : '⚠ DELAY'}
            </button>
            <button className="nf-send-btn nf-send-btn--custom"  onClick={sendCustom}   disabled={sending}>
              {sending ? '...' : '✎ CUSTOM'}
            </button>
          </div>

        </div>
      )}

      {tab === 'history' && (
        <div className="nf-body">
          {history.length === 0 && (
            <div className="nf-empty">No notifications sent yet</div>
          )}
          {history.map((h, i) => (
            <div key={i} className={`nf-hist-entry ${h.success ? '' : 'nf-hist-entry--err'}`}>
              <div className="nf-hist-row">
                <span className="nf-hist-time">{h.time}</span>
                <span className={`nf-hist-type nf-hist-type--${h.type.toLowerCase()}`}>{h.type}</span>
                <span className="nf-hist-pkg">{h.pkg}</span>
                <span className={`nf-hist-status ${h.success ? 'nf-hist-ok' : 'nf-hist-fail'}`}>
                  {h.success ? '✓' : '✗'}
                </span>
              </div>
              <div className="nf-hist-meta">
                <span>{h.recipient}</span>
                <span>{h.channel}</span>
                {h.messageId && <span className="nf-hist-id">{h.messageId}</span>}
                {h.error     && <span className="nf-hist-err">{h.error}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
