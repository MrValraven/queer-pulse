import { useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import { DEFAULT_INTERESTS, INTEREST_OPTIONS } from './interestsEditor.data'
import styles from './InterestsEditorModal.module.css'

/**
 * Chip multi-select for a pending member to update the interests we match
 * their vouching against. Saving runs a short simulated submit then shows a
 * plum-panel confirmation. Data is mock — selections aren't persisted.
 */
export function InterestsEditorModal({ onClose }: { onClose: () => void }) {
  useScrollLock()
  const [selected, setSelected] = useState<string[]>(DEFAULT_INTERESTS)
  const [saved, setSaved] = useState(false)

  function toggle(interest: string) {
    setSelected((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    )
  }

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="interests-title">
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        {saved ? (
          <div className={styles.success}>
            <div className={styles.successIcon} aria-hidden>
              <FiCheck />
            </div>
            <h2 id="interests-title" className={styles.successTitle}>
              Interests <em>updated.</em>
            </h2>
            <p className={styles.successSub}>
              We've noted your {selected.length} interest{selected.length === 1 ? '' : 's'}. A
              vouching member with overlapping interests will pick up your request — keeping these
              current can speed up the match.
            </p>
            <div className={styles.successActions}>
              <Button variant="ghost-dark" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.eye}>Invite request · interests</div>
            <h2 id="interests-title" className={styles.title}>
              Update your <em>interests.</em>
            </h2>
            <p className={styles.desc}>
              We match your request to a vouching member with overlapping interests. Pick the ones
              that fit — the more honest, the better the match.
            </p>

            <div className={styles.chips}>
              {INTEREST_OPTIONS.map((interest) => {
                const on = selected.includes(interest)
                return (
                  <button
                    key={interest}
                    type="button"
                    className={`${styles.chip} ${on ? styles.chipOn : ''}`}
                    aria-pressed={on}
                    onClick={() => toggle(interest)}
                  >
                    {interest}
                  </button>
                )
              })}
            </div>

            <div className={styles.count}>
              {selected.length} selected{selected.length < 2 ? ' · pick at least 2' : ''}
            </div>

            <div className={styles.actions}>
              <Button variant="primary" disabled={selected.length < 2} onClick={() => setSaved(true)}>
                Save interests
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
