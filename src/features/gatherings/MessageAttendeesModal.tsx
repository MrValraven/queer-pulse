import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { Button, FormField } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import { GatheringSuccessPanel } from './GatheringSuccessPanel'
import styles from './GatheringModals.module.css'

export function MessageAttendeesModal({
  attendeeCount,
  onClose,
}: {
  attendeeCount: number
  onClose: () => void
}) {
  useScrollLock()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [done, setDone] = useState(false)

  const canSend = subject.trim().length > 0 && body.trim().length >= 5

  const send = () => {
    if (!canSend) return
    setDone(true)
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {done ? (
        <GatheringSuccessPanel
          title={
            <>
              Message <em>sent.</em>
            </>
          }
          sub={
            <>
              "{subject}" went out to all <b>{attendeeCount} confirmed attendees</b>. They'll get it
              by email and in their QueerPulse notifications.
            </>
          }
          meta={`Sent just now · ${attendeeCount} recipients`}
          onClose={onClose}
        />
      ) : (
        <div className={styles.modal}>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <FiX />
          </button>
          <div className={styles.eye}>Message attendees</div>
          <div className={styles.title}>Write to your guests</div>
          <p className={styles.sub}>
            This reaches everyone who's confirmed for this gathering. Keep it short — a venue note, a
            schedule change, or a warm hello.
          </p>

          <div className={styles.fields}>
            <FormField label="Subject" required>
              <input
                type="text"
                placeholder="e.g. One small change to the start time"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </FormField>
            <FormField label="Message" required>
              <textarea
                placeholder="Write an update for your guests…"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </FormField>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" onClick={send} disabled={!canSend}>
              Send to {attendeeCount} attendees
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
