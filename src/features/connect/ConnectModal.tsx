import { useEffect, useState, type FormEvent } from 'react'
import { Avatar, Button } from '../../shared/components/ui'
import { useScrollLock } from '../../shared/hooks'
import { useConnections } from '../../app/providers/ConnectionsProvider'
import { defaultProfileSlug, memberProfiles } from '../members/data/memberProfiles'
import styles from './ConnectModal.module.css'

const REASONS = [
  'I\'d love to collaborate',
  'I\'d like some advice',
  'I saw your board post',
  'I think we should meet',
  'Something else entirely',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** How long the success panel lingers before closing itself. */
const AUTO_CLOSE_SECONDS = 6

type Phase = 'idle' | 'sending' | 'sent'

export function ConnectModal({ slug, onClose }: { slug?: string; onClose: () => void }) {
  const member = (slug && memberProfiles[slug]) || memberProfiles[defaultProfileSlug]!
  const { sendRequest } = useConnections()
  const [phase, setPhase] = useState<Phase>('idle')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(AUTO_CLOSE_SECONDS)
  useScrollLock()

  // Once the message lands, count down and close the modal on our own.
  useEffect(() => {
    if (phase !== 'sent') return
    setSecondsLeft(AUTO_CLOSE_SECONDS)
    const tick = window.setInterval(() => {
      setSecondsLeft((s) => (s > 1 ? s - 1 : 0))
    }, 1000)
    const done = window.setTimeout(onClose, AUTO_CLOSE_SECONDS * 1000)
    return () => {
      window.clearInterval(tick)
      window.clearTimeout(done)
    }
  }, [phase, onClose])

  const canSend =
    name.trim().length > 0 && EMAIL_RE.test(email.trim()) && message.trim().length > 0
  const sent = phase === 'sent'

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSend || phase !== 'idle') return
    setPhase('sending')
    // Reaching out to someone you're not yet connected to records a sent request
    // (the provider no-ops for existing connections, so messaging a friend is safe).
    if (slug) sendRequest(slug)
    // Simulate delivery, then reveal the animated success panel.
    window.setTimeout(() => setPhase('sent'), 1100)
  }

  return (
    <div
      className={styles.overlay}
      onClick={(event) => {
        if (event.target === event.currentTarget && phase !== 'sending') onClose()
      }}
    >
      <div className={`${styles.modal} ${sent ? styles.modalSent : ''}`}>
        {phase !== 'sending' && (
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        )}

        {sent ? (
          <div className={styles.sent}>
            <div className={styles.tyIcon}>
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  className={styles.tyCheck}
                  d="M5 12.5l4 4L19 7"
                  stroke="var(--jade)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2>
              Message <em>sent.</em>
            </h2>
            <p>
              Your message to {member.first} is on its way. If they'd like to continue the
              conversation, they'll write back directly to your email.
            </p>
            <Button size="lg" variant="ghost-dark" onClick={onClose}>
              Close
            </Button>
            <div className={styles.autoClose} aria-live="polite">
              <span className={styles.autoCloseTrack}>
                <span className={styles.autoCloseBar} />
              </span>
              <span className={styles.autoCloseText}>
                Closing automatically in {secondsLeft}s
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.toRow}>
              <Avatar
                initials={member.initials}
                tint={member.tint}
                size={56}
                src={member.photo}
                alt={`${member.first} ${member.last}`}
              />
              <div>
                <div className={styles.toName}>
                  {member.first} {member.last}
                </div>
                <div className={styles.toRole}>{member.role}</div>
              </div>
            </div>

            <h1 className={styles.title}>
              Say <em>hello.</em>
            </h1>
            <p className={styles.sub}>
              Your message goes directly. No notifications, no read receipts, no algorithm
              watching. Just a real message.
            </p>

            <div className={styles.field}>
              <label htmlFor="connect-name">
                Your name <span className={styles.req}>*</span>
              </label>
              <input
                id="connect-name"
                type="text"
                placeholder="How you'd like to be known"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={phase === 'sending'}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="connect-email">
                Your email <span className={styles.req}>*</span>
              </label>
              <input
                id="connect-email"
                type="email"
                placeholder="So they can write back"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={phase === 'sending'}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="connect-about">What's this about?</label>
              <select
                id="connect-about"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={phase === 'sending'}
              >
                <option value="">Pick a reason, or leave it open</option>
                {REASONS.map((reasonOption) => (
                  <option key={reasonOption}>{reasonOption}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="connect-msg">
                Your message <span className={styles.req}>*</span>
              </label>
              <textarea
                id="connect-msg"
                placeholder="Write naturally. There's no template."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={phase === 'sending'}
              />
            </div>

            <div className={styles.note}>
              Messages from people not yet in the network are held briefly and reviewed by the
              team before delivery. This keeps the room safe.
            </div>

            <div className={styles.foot}>
              <button
                type="button"
                className={styles.back}
                onClick={onClose}
                disabled={phase === 'sending'}
              >
                ← Cancel
              </button>
              <Button size="lg" type="submit" disabled={!canSend || phase === 'sending'}>
                {phase === 'sending' ? (
                  <span className={styles.sending}>
                    <span className={styles.spinner} aria-hidden /> Sending…
                  </span>
                ) : (
                  'Send →'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
