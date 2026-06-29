import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { sx } from './myEvents.styles'
import { useMyEvents } from './MyEventsContext'

const REASONS = [
  'Hate speech or harassment',
  'Unsafe or threatening behaviour',
  'Spam, scam, or misleading',
  'This event shouldn’t be here',
  'Something else',
]

/** Report-an-event flow — pick a reason, add context, send to the safety team. */
export function ReportEventModal() {
  const { report, byId, submitReport, closeReport } = useMyEvents()
  const [reason, setReason] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const ev = report.evId ? byId(report.evId) : undefined

  return (
    <>
      <div className={sx('modal-head')}>
        <div className={sx('modal-eyebrow')}>Report</div>
        <h2 className={sx('modal-title')}>What’s <em>wrong?</em></h2>
        <p className={sx('modal-evname')}>{ev?.title}</p>
      </div>
      <div className={sx('modal-body')}>
        <div className={sx('field')}>
          <label className={sx('field-label')} id="report-reason-label">Why are you reporting this?</label>
          <div className={sx('report-reasons')} role="radiogroup" aria-labelledby="report-reason-label">
            {REASONS.map((r, i) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={reason === i}
                className={sx(`report-reason${reason === i ? ' on' : ''}`)}
                onClick={() => setReason(i)}
              >
                <span className={sx('report-radio')} aria-hidden="true" />
                <span>{r}</span>
              </button>
            ))}
          </div>
        </div>
        <div className={sx('field')}>
          <label className={sx('field-label')} htmlFor="report-note">Anything we should know? <span className={sx('field-opt')}>(optional)</span></label>
          <textarea
            id="report-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Share what happened in your own words — only the safety team sees this."
          />
        </div>
      </div>
      <div className={sx('modal-foot')}>
        <div className={sx('modal-privacy')}>Reports are confidential. The host is never told who reported them.</div>
        <Button variant="ghost" onClick={closeReport}>Cancel</Button>
        <Button variant="primary" disabled={reason === null} onClick={submitReport}>Send report</Button>
      </div>
    </>
  )
}
