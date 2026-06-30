import { useState } from 'react'
import { Button, SegmentedControl, Toggle } from '../../shared/components/ui'
import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'

const VIS = ['Everyone', 'Connections', 'Just me']
const VIS_DEFAULT = 'Connections'

/** "Anything we should know?" RSVP details editor. */
export function RsvpDetailsModal() {
  const { details, closeDetails, byId, toast } = useMyEvents()
  const [guest, setGuest] = useState(false)
  const [vis, setVis] = useState(VIS_DEFAULT)
  const [quiet, setQuiet] = useState(false)
  const ev = details.evId ? byId(details.evId) : undefined

  const save = () => { closeDetails(); toast('Saved — only the host can see this', 'success') }

  return (
    <>
      <div className={sx('modal-head')}>
        <div className={sx('modal-eyebrow')}>Your RSVP</div>
        <h2 className={sx('modal-title')}>Anything we should <em>know?</em></h2>
        <p className={sx('modal-evname')}>{ev?.title}</p>
      </div>
      <div className={sx('modal-body')}>
        <div className={sx('field')}>
          <label className={sx('field-label')}>Who's coming</label>
          <button type="button" className={sx('guest-row')} onClick={() => setGuest((g) => !g)}>
            <span className={sx(`guest-cb${guest ? ' on' : ''}`)} aria-hidden="true"><svg viewBox="0 0 14 14" aria-hidden><path d="M2.5 7.5 6 11l5.5-7" /></svg></span>
            <span className={sx('guest-txt')}>Bringing a +1<span>Add a name so the host can welcome them too</span></span>
          </button>
          <div className={`${sx('collapse')} ${guest ? sx('show') : ''}`}>
            <div className={sx('guest-name-field')}><input type="text" placeholder="Your guest's name (optional)" /></div>
          </div>
        </div>

        {ev?.sliding && (
          <div className={sx('field')}>
            <label className={sx('field-label')} htmlFor="rsvp-contribution">Your contribution</label>
            <div className={sx('field-hint')}>This one's pay-what-you-can — choose what works for you, no questions asked.</div>
            <select id="rsvp-contribution" defaultValue="10">
              <option value="0">€0 — I need this to be free right now</option>
              <option value="5">€5 — supported rate</option>
              <option value="10">€10 — standard</option>
              <option value="15">€15 — pay it forward</option>
            </select>
          </div>
        )}

        <div className={sx('field')}>
          <label className={sx('field-label')} htmlFor="rsvp-access">Access needs</label>
          <textarea id="rsvp-access" placeholder="Step-free route, a quiet spot, BSL, anything that helps you be there comfortably…" />
        </div>
        <div className={sx('field')}>
          <label className={sx('field-label')} htmlFor="rsvp-dietary">Dietary needs</label>
          <textarea id="rsvp-dietary" placeholder="Allergies, vegan, halal, kosher — for events where food is shared…" />
        </div>
        <div className={sx('field')}>
          <label className={sx('field-label')}>Who can see you're going?</label>
          <SegmentedControl fullWidth options={VIS} value={vis} onChange={setVis} />
        </div>
        <div className={sx('field')}>
          <div className={sx('set-row flush')}>
            <div className={sx('set-info')}><div className={sx('set-t')}>Attend quietly</div><div className={sx('set-d')}>Come along without your name showing on the guest list.</div></div>
            <Toggle checked={quiet} onChange={setQuiet} label="Attend quietly" />
          </div>
        </div>
      </div>
      <div className={sx('modal-foot')}>
        <div className={sx('modal-privacy')}>Only the host sees your access &amp; dietary notes. You can change all of this any time.</div>
        <Button variant="ghost" onClick={closeDetails}>Cancel</Button>
        <Button variant="jade" onClick={save}>Save</Button>
      </div>
    </>
  )
}
