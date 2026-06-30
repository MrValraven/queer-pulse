import { useState } from 'react'
import { FiX } from 'react-icons/fi'
import { Button, FormField } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import { GatheringSuccessPanel } from './GatheringSuccessPanel'
import styles from './GatheringModals.module.css'

export interface GatheringDetailsDraft {
  title: string
  date: string
  location: string
  description: string
}

export function EditDetailsModal({
  initial,
  onClose,
  onSave,
}: {
  initial: GatheringDetailsDraft
  onClose: () => void
  onSave: (draft: GatheringDetailsDraft) => void
}) {
  useScrollLock()
  const [draft, setDraft] = useState<GatheringDetailsDraft>(initial)
  const [done, setDone] = useState(false)

  const set = (k: keyof GatheringDetailsDraft, v: string) => setDraft((d) => ({ ...d, [k]: v }))
  const canSave = draft.title.trim().length > 0 && draft.date.trim().length > 0 && draft.location.trim().length > 0

  const save = () => {
    if (!canSave) return
    onSave(draft)
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
              Details <em>updated.</em>
            </>
          }
          sub={
            <>
              Your changes to <b>{draft.title}</b> are live on the listing. Anyone who's RSVP'd will
              see the update next time they open the gathering.
            </>
          }
          meta="Saved just now · 14 attendees notified"
          onClose={onClose}
        />
      ) : (
        <div className={styles.modal}>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <FiX />
          </button>
          <div className={styles.eye}>Edit details</div>
          <div className={styles.title}>Update your gathering</div>
          <p className={styles.sub}>
            Changes go live on the public listing. Attendees are notified of date or venue changes.
          </p>

          <div className={styles.fields}>
            <FormField label="Title" required>
              <input type="text" value={draft.title} onChange={(e) => set('title', e.target.value)} />
            </FormField>
            <FormField label="Date & time" required>
              <input type="text" value={draft.date} onChange={(e) => set('date', e.target.value)} />
            </FormField>
            <FormField label="Location" required>
              <input type="text" value={draft.location} onChange={(e) => set('location', e.target.value)} />
            </FormField>
            <FormField label="Description">
              <textarea value={draft.description} onChange={(e) => set('description', e.target.value)} />
            </FormField>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" onClick={save} disabled={!canSave}>
              Save changes
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
