import { useEffect, useRef, useState } from 'react'
import { FiCheck } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useProfile } from '../../app/providers/ProfileProvider'
import { useEscapeToCancel } from './profileEditControls'
import styles from './ProfileEdit.module.css'

/**
 * Sticky bottom bar for the self-profile edit flow. While editing it offers
 * Discard / Save profile; just after a save it shows the plum confirmation
 * banner with a jade check (the design-system success pattern).
 */
export function ProfileEditBar() {
  const { isEditing, justSaved, save, cancelEditing } = useProfile()
  useEscapeToCancel(cancelEditing, isEditing)

  // Keep the saved banner mounted for one beat after `justSaved` clears so it can
  // animate out instead of popping out of place.
  const [closing, setClosing] = useState(false)
  const wasSaved = useRef(false)
  useEffect(() => {
    if (wasSaved.current && !justSaved) {
      setClosing(true)
      const t = setTimeout(() => setClosing(false), 320)
      wasSaved.current = justSaved
      return () => clearTimeout(t)
    }
    wasSaved.current = justSaved
  }, [justSaved])

  if (isEditing) {
    return (
      <div className={styles.saveBar}>
        <span className={styles.unsavedLabel}>
          <span className={styles.unsavedDot} aria-hidden />
          You’re editing your profile — unsaved changes
        </span>
        <div className={styles.saveActions}>
          <Button variant="ghost" onClick={cancelEditing}>
            Discard
          </Button>
          <Button variant="primary" onClick={save}>
            Save profile
          </Button>
        </div>
      </div>
    )
  }

  if (justSaved || closing) {
    return (
      <div
        className={`${styles.savedBar} ${closing ? styles.savedBarLeaving : ''}`}
        role="status"
      >
        <span className={styles.savedIcon}>
          <FiCheck />
        </span>
        <span className={styles.savedText}>
          Saved. <strong>Your profile is live.</strong>
        </span>
      </div>
    )
  }

  return null
}
