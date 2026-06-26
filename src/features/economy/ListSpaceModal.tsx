import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { ModalShell, Sending, SuccessPanel, useSubmitFlow } from './ModalKit'
import styles from './ApplicationModals.module.css'

const SPACE_TYPES = ['Sublet', 'Room share', 'Short-term', 'Studio / whole flat']

export function ListSpaceModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [area, setArea] = useState('')
  const [rent, setRent] = useState('')
  const [type, setType] = useState('')
  const { sending, done, submit } = useSubmitFlow()
  const valid = title.trim().length > 3 && area.trim().length > 1 && !!rent && !!type

  return (
    <ModalShell onClose={onClose} success={done}>
      {done ? (
        <SuccessPanel title="Listing" em="submitted." onClose={onClose} closeLabel="Done">
          Thanks for sharing <strong>{title}</strong>. A moderator checks every listing before it
          goes live — usually within a day — so the board stays trustworthy for everyone looking for
          a safe place to land.
        </SuccessPanel>
      ) : (
        <>
          <div className={styles.eyebrow}>Housing board</div>
          <h2 className={styles.title}>
            List your <em>space.</em>
          </h2>
          <p className={styles.sub}>
            Open your place to a verified member of the community. A few details now — you can add
            photos once it's approved.
          </p>

          <div className={styles.field}>
            <label htmlFor="ls-title">Listing title *</label>
            <input
              id="ls-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunny room in a queer flatshare"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ls-area">Neighbourhood / area *</label>
            <input
              id="ls-area"
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Arroios, Lisbon"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ls-rent">Monthly rent (€) *</label>
            <input
              id="ls-rent"
              type="number"
              min={0}
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              placeholder="e.g. 650"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="ls-type">Type of space *</label>
            <select id="ls-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Choose one…</option>
              {SPACE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <p className={styles.note}>
            Listings are reviewed before they appear. Never ask for a deposit before someone has
            viewed the place in person.
          </p>

          <div className={`${styles.foot} ${styles.footEnd}`}>
            <button type="button" className={styles.back} onClick={onClose}>
              Cancel
            </button>
            <Button variant="primary" size="lg" disabled={!valid || sending} onClick={() => valid && submit()}>
              {sending ? <Sending label="Submitting…" /> : 'Submit listing'}
            </Button>
          </div>
        </>
      )}
    </ModalShell>
  )
}
