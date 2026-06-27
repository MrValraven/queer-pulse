import { useEffect, useState } from 'react'
import {
  FiAward,
  FiCheck,
  FiClock,
  FiDollarSign,
  FiGlobe,
  FiHeart,
  FiMapPin,
  FiSliders,
  FiX,
} from 'react-icons/fi'
import { Avatar, Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import type { Therapist } from './mentalHealth.data'
import styles from './TherapistProfileModal.module.css'

type Phase = 'idle' | 'sending' | 'sent'

export function TherapistProfileModal({
  therapist,
  onClose,
}: {
  therapist: Therapist
  onClose: () => void
}) {
  const [phase, setPhase] = useState<Phase>('idle')
  useScrollLock()

  // Close on Escape, the way the other self-contained modals do.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && phase !== 'sending') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, onClose])

  const firstName = therapist.name.replace(/^Dr\.\s*/, '').split(' ')[0]

  function handleSayHello() {
    if (phase !== 'idle') return
    setPhase('sending')
    window.setTimeout(() => setPhase('sent'), 1100)
  }

  const meta = [
    { icon: <FiMapPin />, label: therapist.location },
    { icon: <FiClock />, label: therapist.availability },
    { icon: <FiDollarSign />, label: therapist.rate },
    {
      icon: <FiSliders />,
      label: therapist.slidingScale ? 'Sliding scale available' : 'Fixed session rate',
    },
    { icon: <FiAward />, label: `${therapist.years} years in practice` },
    { icon: <FiGlobe />, label: therapist.langs.join(', ') },
  ]

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget && phase !== 'sending') onClose()
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`${therapist.name} — profile`}>
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
          <FiX />
        </button>

        <div className={styles.head}>
          <Avatar
            initials={therapist.initials}
            size={92}
            src={therapist.photo}
            alt={therapist.name}
            verified
            className={styles.headAv}
          />
          <div className={styles.headBody}>
            <div className={styles.nameRow}>
              <h2 className={styles.name}>{therapist.name}</h2>
              <span className={styles.pronouns}>{therapist.pronouns}</span>
            </div>
            <div className={styles.creds}>{therapist.creds}</div>
            <div className={styles.reg}>
              <FiCheck aria-hidden /> {therapist.registration}
            </div>
            <span
              className={`${styles.status} ${
                therapist.acceptingNew ? styles.statusOpen : styles.statusFull
              }`}
            >
              <span className={styles.statusDot} />
              {therapist.acceptingNew ? 'Accepting new clients' : 'Waitlist only right now'}
            </span>
          </div>
        </div>

        <div className={styles.tags}>
          {therapist.specs.map((s) => (
            <span key={s} className={styles.tag}>
              {s}
            </span>
          ))}
        </div>

        <div className={styles.metaGrid}>
          {meta.map((m) => (
            <div className={styles.metaItem} key={m.label}>
              <span className={styles.metaIcon}>{m.icon}</span>
              <span className={styles.metaLabel}>{m.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <h3 className={styles.h3}>About</h3>
          {therapist.bio.map((p, i) => (
            <p className={styles.body} key={i}>
              {p}
            </p>
          ))}
        </div>

        <div className={styles.cols}>
          <div className={styles.section}>
            <h3 className={styles.h3}>How I work</h3>
            <div className={styles.pills}>
              {therapist.approach.map((a) => (
                <span key={a} className={styles.pill}>
                  {a}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.section}>
            <h3 className={styles.h3}>Training &amp; qualifications</h3>
            <ul className={styles.list}>
              {therapist.training.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.firstSession}>
          <div className={styles.fsIcon}>
            <FiHeart aria-hidden />
          </div>
          <div>
            <div className={styles.fsLabel}>Your first session</div>
            <p className={styles.fsText}>{therapist.firstSession}</p>
          </div>
        </div>

        {phase === 'sent' ? (
          <div className={styles.sent}>
            <span className={styles.sentIcon}>
              <FiCheck aria-hidden />
            </span>
            <div>
              <div className={styles.sentTitle}>Message sent to {firstName}.</div>
              <p className={styles.sentText}>
                They'll reply directly to your email if it feels like a fit. No notifications, no
                pressure.
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.foot}>
            <div className={styles.footNote}>
              Messages go straight to {firstName} — held briefly and reviewed before delivery to
              keep the room safe.
            </div>
            <Button
              size="lg"
              variant="jade"
              onClick={handleSayHello}
              disabled={phase === 'sending'}
            >
              {phase === 'sending' ? (
                <span className={styles.sending}>
                  <span className={styles.spinner} aria-hidden /> Sending…
                </span>
              ) : (
                'Say hello →'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
