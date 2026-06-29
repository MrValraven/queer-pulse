import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'

const LEADS = ['1 hour', '1 day', '1 week']
const VIS: { v: string; label: string }[] = [
  { v: 'public', label: 'Everyone' },
  { v: 'connections', label: 'Connections' },
  { v: 'private', label: 'Just me' },
]

/** Event preferences: reminder lead, default visibility, channels, sync. */
export function EventSettingsModal() {
  const { closeSettings, saveSettings, prefs, toast } = useMyEvents()
  // Remounted on open (keyed in MyEventsBody), so prefs seed the initial state.
  const [lead, setLead] = useState(prefs.reminderLead)
  const [vis, setVis] = useState(prefs.visibility)
  const [email, setEmail] = useState(prefs.email)
  const [push, setPush] = useState(prefs.push)

  return (
    <>
      <div className={sx('modal-head')}>
        <div className={sx('modal-eyebrow')}>Preferences</div>
        <h2 className={sx('modal-title')}>How your events <em>reach you</em></h2>
      </div>
      <div className={sx('modal-body')}>
        <div className={sx('field')}>
          <label className={sx('field-label')}>Remind me before an event</label>
          <div className={sx('seg')}>
            {LEADS.map((l) => <button key={l} type="button" className={sx(`seg-btn${lead === l ? ' on' : ''}`)} onClick={() => setLead(l)}>{l}</button>)}
          </div>
        </div>
        <div className={sx('field')}>
          <label className={sx('field-label')}>By default, who sees what I'm attending</label>
          <div className={sx('seg')}>
            {VIS.map((o) => <button key={o.v} type="button" className={sx(`seg-btn${vis === o.v ? ' on' : ''}`)} onClick={() => setVis(o.v)}>{o.label}</button>)}
          </div>
        </div>
        <div className={sx('field')}>
          <label className={sx('field-label')}>How we reach you</label>
          <div className={sx('set-row')}>
            <div className={sx('set-info')}><div className={sx('set-t')}>Email</div><div className={sx('set-d')}>Reminders, changes, and invites by email.</div></div>
            <label className={sx('qtgl')}><input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} /><span className={sx('tk')} /><span className={sx('th')} /></label>
          </div>
          <div className={sx('set-row')}>
            <div className={sx('set-info')}><div className={sx('set-t')}>Push notifications</div><div className={sx('set-d')}>On your phone, for time-sensitive changes.</div></div>
            <label className={sx('qtgl')}><input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} /><span className={sx('tk')} /><span className={sx('th')} /></label>
          </div>
        </div>
        <div className={sx('field')}>
          <label className={sx('field-label')}>Sync &amp; tickets</label>
          <button type="button" className={sx('set-link-row')} onClick={() => toast('Connecting your calendar — two-way sync on', 'success')}>
            <span className={sx('slr-t')}>Connect your calendar<span>Two-way sync with Google or Apple</span></span><span className={sx('slr-arrow')}>→</span>
          </button>
          <button type="button" className={sx('set-link-row')} onClick={() => toast('Opening your tickets & receipts…')}>
            <span className={sx('slr-t')}>Tickets &amp; receipts<span>All your tickets and payment records</span></span><span className={sx('slr-arrow')}>→</span>
          </button>
        </div>
      </div>
      <div className={sx('modal-foot')}>
        <div className={sx('modal-privacy')}>QueerPulse never sells your data. Visibility is always your choice.</div>
        <Button variant="ghost" onClick={closeSettings}>Cancel</Button>
        <Button variant="jade" onClick={() => saveSettings({ reminderLead: lead, visibility: vis, email, push })}>Save</Button>
      </div>
    </>
  )
}
