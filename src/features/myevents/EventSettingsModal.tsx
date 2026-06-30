import { useState } from 'react'
import { Button, SegmentedControl, Toggle } from '../../shared/components/ui'
import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'

const LEADS = ['1 hour', '1 day', '1 week']
const VIS: { v: string; label: string }[] = [
  { v: 'public', label: 'Everyone' },
  { v: 'connections', label: 'Connections' },
  { v: 'private', label: 'Just me' },
]
const VIS_LABELS = VIS.map((o) => o.label)
const labelForVis = (v: string) => VIS.find((o) => o.v === v)?.label ?? 'Everyone'
const visForLabel = (label: string) => VIS.find((o) => o.label === label)?.v ?? 'public'

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
          <SegmentedControl fullWidth options={LEADS} value={lead} onChange={setLead} />
        </div>
        <div className={sx('field')}>
          <label className={sx('field-label')}>By default, who sees what I'm attending</label>
          <SegmentedControl
            fullWidth
            options={VIS_LABELS}
            value={labelForVis(vis)}
            onChange={(label) => setVis(visForLabel(label))}
          />
        </div>
        <div className={sx('field')}>
          <label className={sx('field-label')}>How we reach you</label>
          <div className={sx('set-row')}>
            <div className={sx('set-info')}><div className={sx('set-t')}>Email</div><div className={sx('set-d')}>Reminders, changes, and invites by email.</div></div>
            <Toggle checked={email} onChange={setEmail} label="Email reminders" />
          </div>
          <div className={sx('set-row')}>
            <div className={sx('set-info')}><div className={sx('set-t')}>Push notifications</div><div className={sx('set-d')}>On your phone, for time-sensitive changes.</div></div>
            <Toggle checked={push} onChange={setPush} label="Push notifications" />
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
