import { useState } from 'react'
import { Button } from '../../shared/components/ui'
import { TIERS } from './eventPage.data'
import styles from './EventPage.module.css'

export function EventRsvpCard() {
  const [selectedTier, setSelectedTier] = useState(1)
  const [reserved, setReserved] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  const emailValid = /^\S+@\S+\.\S+$/.test(email)
  const canReserve = fullName.trim().length > 0 && emailValid

  return (
    <div className={styles.ticketCard}>
      {reserved ? (
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#7cd7ad" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className={styles.successTitle}>
            You're <em>going.</em>
          </h3>
          <p className={styles.successText}>
            Reserved on the <strong>{TIERS[selectedTier].name}</strong> tier
            {TIERS[selectedTier].price !== '€0' && (
              <>
                {' · '}
                <strong>{TIERS[selectedTier].price}</strong>
              </>
            )}
          </p>
          <p className={styles.successText}>
            A confirmation is on its way to <strong>{email}</strong>.
          </p>
          <div className={styles.successMeta}>You can cancel up to 48 hours before the event.</div>
          <Button variant="ghost-dark" onClick={() => setReserved(false)}>
            Cancel my reservation
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.ticketHead}>
            <div className={styles.ticketHeadTitle}>Reserve your place</div>
            <div className={styles.ticketHeadSub}>Pay what you can. All tiers include everything.</div>
          </div>
          <div className={styles.spotsText}>
            <span>
              <strong>5 spots</strong> remaining
            </span>
            <span>21 of 26 filled</span>
          </div>
          <div className={styles.spotsBar}>
            <div className={styles.spotsFill} style={{ width: '81%' }} />
          </div>
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
          <div className={styles.form}>
            <input className={styles.input} type="text" placeholder="Your name *" required aria-required="true" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <input className={styles.input} type="email" placeholder="Your email *" required aria-required="true" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={styles.input} type="text" placeholder="Dietary requirements (optional)" />
            <div className={styles.requiredHint}>
              <span className={styles.req}>*</span> Name and email are required — we send your
              confirmation there.
            </div>
            <button
              className={styles.rsvpBtn}
              onClick={() => setReserved(true)}
              disabled={!canReserve}
              title={!canReserve ? 'Enter your name and a valid email to reserve' : undefined}
            >
              Reserve my place →
            </button>
          </div>
          <div className={styles.note}>
            You'll receive a confirmation email. You can cancel up to 48 hours before the event.
          </div>
        </>
      )}
    </div>
  )
}
