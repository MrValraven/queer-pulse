import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import { MODAL_TAGS, NEIGHBOURHOODS, type ListingType } from './flatmates.data'
import styles from './FlatmatesPage.module.css'

export function PostProfileModal({ onClose }: { onClose: () => void }) {
  useScrollLock()
  const [submitted, setSubmitted] = useState(false)
  const [modalType, setModalType] = useState<ListingType>('seeking')
  const [modalTags, setModalTags] = useState<Set<string>>(new Set())

  const toggleTag = (t: string) =>
    setModalTags((prev) => {
      const next = new Set(prev)
      if (next.has(t)) next.delete(t)
      else next.add(t)
      return next
    })

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={styles.modal}>
        <button type="button" className={styles.modalX} onClick={onClose}>
          ×
        </button>
        {submitted ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <svg viewBox="0 0 28 28" fill="none" stroke="var(--jade)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 14l6 6L23 8" />
              </svg>
            </div>
            <h2>
              You're on the <em>board.</em>
            </h2>
            <p>
              Your profile is live. Members will reach out directly — keep an eye on your QueerPulse
              messages.
            </p>
            <Button type="button" variant="ghost" onClick={onClose}>
              Back to profiles
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.modalTitle}>Post your profile</div>
            <p className={styles.modalSub}>
              Takes about two minutes. Your profile goes live straight away — members reach out
              directly, no matching algorithm.
            </p>
            <div className={styles.fields}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>What are you looking for?</label>
                <div className={styles.typeToggle}>
                  {(['seeking', 'offering'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={[styles.ttOpt, modalType === t && styles.ttOptOn].filter(Boolean).join(' ')}
                      onClick={() => setModalType(t)}
                    >
                      <div className={styles.ttTitle}>{t === 'seeking' ? 'Seeking a room' : 'Offering a room'}</div>
                      <div className={styles.ttDesc}>
                        {t === 'seeking'
                          ? "You're looking for a room in a flat or house"
                          : 'You have a room or flat share to offer'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Your name</label>
                  <input className={styles.input} type="text" placeholder="First name or nickname" />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Pronouns (optional)</label>
                  <input className={styles.input} type="text" placeholder="e.g. she/her, they/them" />
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Neighbourhood</label>
                  <select className={styles.select} defaultValue="">
                    <option value="">Preference / location</option>
                    {NEIGHBOURHOODS.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                    <option>Anywhere central</option>
                    <option>Flexible</option>
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Budget / month</label>
                  <input className={styles.input} type="text" placeholder="e.g. €700–900" />
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Available / move-in from</label>
                <select className={styles.select} defaultValue="">
                  <option value="">When?</option>
                  <option>Available now</option>
                  <option>July 2026</option>
                  <option>August 2026</option>
                  <option>September 2026</option>
                  <option>Flexible</option>
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>About you &amp; what you're looking for in a home</label>
                <textarea
                  className={styles.textarea}
                  rows={4}
                  placeholder="Tell people a bit about yourself — your rhythm, your work, what kind of home makes you feel good. No need to sell yourself; just be honest."
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Lifestyle tags</label>
                <div className={styles.lfGrid}>
                  {MODAL_TAGS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={[styles.lfOpt, modalTags.has(t) && styles.lfOptOn].filter(Boolean).join(' ')}
                      onClick={() => toggleTag(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Your email (not shown publicly)</label>
                <input className={styles.input} type="email" placeholder="So members can reach you via QueerPulse" />
              </div>
            </div>
            <div className={styles.modalActions}>
              <Button type="button" variant="primary" onClick={() => setSubmitted(true)}>
                Post profile →
              </Button>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
