import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Avatar, Button } from '../../shared/components/ui'
import { defaultProfileSlug, memberProfiles } from '../members/data/memberProfiles'
import styles from './ConnectPage.module.css'

const REASONS = [
  'I\'d love to collaborate',
  'I\'d like some advice',
  'I saw your board post',
  'I think we should meet',
  'Something else entirely',
]

export function ConnectPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const member = (slug && memberProfiles[slug]) || memberProfiles[defaultProfileSlug]
  const [sent, setSent] = useState(false)

  return (
    <PageShell>
      <div className={styles.page}>
        <div className={styles.card}>
          {sent ? (
            <div className={styles.sent}>
              <div className={styles.tyIcon}>
                <svg width={26} height={26} viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M5 12.5l4 4L19 7" stroke="#4A8C6F" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2>
                Message <em>sent.</em>
              </h2>
              <p>
                Your message to {member.first} is on its way. If they'd like to continue the
                conversation, they'll write back directly to your email.
              </p>
              <Button size="lg" variant="ghost" to="/members">
                Back to members
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault()
                setSent(true)
              }}
            >
              <div className={styles.toRow}>
                <Avatar initials={member.initials} tint={member.tint} size={56} />
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
                <label htmlFor="connect-name">Your name</label>
                <input id="connect-name" type="text" placeholder="How you'd like to be known" />
              </div>
              <div className={styles.field}>
                <label htmlFor="connect-email">Your email</label>
                <input id="connect-email" type="email" placeholder="So they can write back" />
              </div>
              <div className={styles.field}>
                <label htmlFor="connect-about">What's this about?</label>
                <select id="connect-about" defaultValue="">
                  <option value="">Pick a reason, or leave it open</option>
                  {REASONS.map((reason) => (
                    <option key={reason}>{reason}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label htmlFor="connect-msg">Your message</label>
                <textarea id="connect-msg" placeholder="Write naturally. There's no template." />
              </div>

              <div className={styles.note}>
                Messages from people not yet in the network are held briefly and reviewed by the
                team before delivery. This keeps the room safe.
              </div>

              <div className={styles.foot}>
                <button type="button" className={styles.back} onClick={() => navigate(-1)}>
                  ← Back
                </button>
                <Button size="lg" type="submit">
                  Send →
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageShell>
  )
}
