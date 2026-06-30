import { useState } from 'react'
import { FiCalendar, FiMessageCircle } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { TIERS } from './eventPage.data'
import {
  EVENT_CAPACITY,
  EVENT_ICS,
  EVENT_IS_FULL,
  downloadIcs,
} from './eventRsvp.data'
import styles from './EventPage.module.css'

export function EventRsvpCard() {
  const [selectedTier, setSelectedTier] = useState(1)
  const [reserved, setReserved] = useState(false)
  const [waitlistPos, setWaitlistPos] = useState<number | null>(null)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  const emailValid = /^\S+@\S+\.\S+$/.test(email)
  const canSubmit = fullName.trim().length > 0 && emailValid
  const isFull = EVENT_IS_FULL

  function joinWaitlist() {
    // Plausible position derived from the name length for this prototype.
    setWaitlistPos(2 + (fullName.trim().length % 5))
  }

  if (waitlistPos !== null) {
    return (
      <div className={styles.ticketCard}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--jade-soft)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6v6l4 2" />
              <circle cx={12} cy={12} r={10} />
            </svg>
          </div>
          <h3 className={styles.successTitle}>
            You're <em>#{waitlistPos}</em> on the waitlist.
          </h3>
          <p className={styles.successText}>
            This gathering is full, but we'll <strong>email {email}</strong> the
            moment a spot opens — usually within a day or two of someone cancelling.
          </p>
          <div className={styles.successMeta}>You can leave the waitlist at any time.</div>
          <Button variant="ghost-dark" onClick={() => setWaitlistPos(null)}>
            Leave the waitlist
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.ticketCard}>
      {reserved ? (
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--jade-soft)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className={styles.successTitle}>
            You're <em>going.</em>
          </h3>
          <p className={styles.successText}>
            Reserved on the <strong>{TIERS[selectedTier]!.name}</strong> tier
            {TIERS[selectedTier]!.price !== '€0' && (
              <>
                {' · '}
                <strong>{TIERS[selectedTier]!.price}</strong>
              </>
            )}
          </p>
          <p className={styles.successText}>
            A confirmation is on its way to <strong>{email}</strong>.
          </p>
          <div className={styles.successActions}>
            <Button variant="ghost-dark" onClick={() => downloadIcs(EVENT_ICS)}>
              <FiCalendar aria-hidden /> Add to calendar
            </Button>
            <Button variant="ghost-dark" to={routes.messages}>
              <FiMessageCircle aria-hidden /> Message host
            </Button>
          </div>
          <div className={styles.successMeta}>You can cancel up to 48 hours before the event.</div>
          <Button variant="ghost-dark" onClick={() => setReserved(false)}>
            Cancel my reservation
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.ticketHead}>
            <div className={styles.ticketHeadTitle}>
              {isFull ? 'This gathering is full' : 'Reserve your place'}
            </div>
            <div className={styles.ticketHeadSub}>
              {isFull
                ? "Join the waitlist — we'll email you if a spot opens."
                : 'Pay what you can. All tiers include everything.'}
            </div>
          </div>
          <div className={styles.spotsText}>
            {isFull ? (
              <span>
                <strong>0 spots</strong> remaining
              </span>
            ) : (
              <span>
                <strong>5 spots</strong> remaining
              </span>
            )}
            <span>{isFull ? `${EVENT_CAPACITY} of ${EVENT_CAPACITY} filled` : `21 of ${EVENT_CAPACITY} filled`}</span>
          </div>
          <div className={styles.spotsBar}>
            <div className={styles.spotsFill} style={{ width: isFull ? '100%' : '81%' }} />
          </div>
          {!isFull && (
            <div className={styles.tiers}>
              {TIERS.map((tier, index) => (
                <button key={tier.name} className={[styles.tier, selectedTier === index && styles.tierSelected].filter(Boolean).join(' ')} onClick={() => setSelectedTier(index)}>
                  <span className={styles.tierRadio} />
                  <span style={{ flex: 1 }}>
                    <span className={styles.tierName} style={{ display: 'block' }}>
                      {tier.name}
                    </span>
                    <span className={styles.tierDesc}>{tier.desc}</span>
                  </span>
                  <span className={styles.tierPrice}>{tier.price}</span>
                </button>
              ))}
            </div>
          )}
          <div className={styles.form}>
            <input className={styles.input} type="text" inputMode="text" autoComplete="name" autoCapitalize="words" placeholder="Your name *" required aria-required="true" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <input className={styles.input} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="Your email *" required aria-required="true" value={email} onChange={(e) => setEmail(e.target.value)} />
            {!isFull && (
              <input className={styles.input} type="text" inputMode="text" autoComplete="off" placeholder="Dietary requirements (optional)" />
            )}
            <div className={styles.requiredHint}>
              <span className={styles.req}>*</span> Name and email are required — we send your{' '}
              {isFull ? 'waitlist update' : 'confirmation'} there.
            </div>
            <button
              className={styles.rsvpBtn}
              onClick={() => (isFull ? joinWaitlist() : setReserved(true))}
              disabled={!canSubmit}
              title={!canSubmit ? 'Enter your name and a valid email to continue' : undefined}
            >
              {isFull ? 'Join the waitlist →' : 'Reserve my place →'}
            </button>
          </div>
          <div className={styles.note}>
            {isFull
              ? "We'll email you the moment a spot opens. Leaving the waitlist is one click."
              : "You'll receive a confirmation email. You can cancel up to 48 hours before the event."}
          </div>
        </>
      )}
    </div>
  )
}
