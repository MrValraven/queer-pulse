import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import { useToast } from '../../shared/components/feedback/useToast'
import { currentUser } from '../members/data/members'
import styles from './InvitePage.module.css'

const SENDER_NAME = `${currentUser.first} ${currentUser.last}`

export function InvitePage() {
  const { showToast } = useToast()
  const [first, setFirst] = useState('')
  const [know, setKnow] = useState('')
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)

  const inviteeName = first.trim() || 'Rosa'

  if (sent) {
    return (
      <AppShell>
        <div className={styles.page}>
          <div className={styles.inner}>
            <div className={`${styles.card} ${styles.sent} ${styles.screenIn}`}>
              <div className={styles.sentIcon}>
                <svg width={26} height={26} viewBox="0 0 26 26" fill="none" aria-hidden>
                  <path d="M2 13l21-10-8 10 8 10-21-10Z" fill="rgba(74,140,111,.8)" />
                </svg>
              </div>
              <div className={styles.sentHead}>
                Invitation sent to <em>{inviteeName}</em>
              </div>
              <div className={styles.sentSub}>
                We've sent {inviteeName} an email. They have 7 days to accept. You'll be notified
                when they join.
              </div>
              <div className={styles.summaryCard}>
                <div className={styles.srRow}>
                  <span className={styles.srLabel}>Invited</span>
                  <span className={styles.srVal}>{inviteeName} Lima</span>
                </div>
                <div className={styles.srRow}>
                  <span className={styles.srLabel}>Sent</span>
                  <span className={styles.srVal}>Today, 10:42</span>
                </div>
                <div className={styles.srRow}>
                  <span className={styles.srLabel}>Expires</span>
                  <span className={styles.srVal}>13 June 2026</span>
                </div>
              </div>
              <div className={styles.actions}>
                <Button variant="ghost" to={routes.accountProfile}>
                  Back to my profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <div className={styles.inner}>
          <Link to={routes.accountProfile} className={styles.backLink}>
            ← Back to profile
          </Link>
          <div className={styles.eyebrow}>Invite someone</div>
          <div className={styles.title}>
            Bring someone <em>in</em>
          </div>
          <div className={styles.sub}>
            QueerPulse grows through trust, not advertising. Use your invite for someone you'd
            genuinely vouch for.
          </div>
          <div className={styles.quotaRow}>
            <div className={styles.quotaChip}>1 invite remaining this month</div>
            <div className={styles.resetNote}>Resets 1 July 2026</div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              setSent(true)
            }}
          >
            <div className={styles.card}>
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label>First name</label>
                  <input type="text" placeholder="Rosa" value={first} onChange={(e) => setFirst(e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label>Last name</label>
                  <input type="text" placeholder="Lima" />
                </div>
              </div>
              <div className={styles.field}>
                <label>Their email</label>
                <input type="email" placeholder="rosa@email.com" />
              </div>
              <div className={styles.field}>
                <label>How you know them</label>
                <textarea
                  maxLength={300}
                  placeholder="How do you know this person, and why do they belong here?"
                  value={know}
                  onChange={(e) => setKnow(e.target.value)}
                />
                <div className={styles.charCount}>{know.length}/300</div>
                <div className={styles.helper}>
                  This becomes part of your vouch — shown to the moderation team, not the invitee.
                </div>
              </div>
              <div className={styles.field}>
                <label>
                  Personal note <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>(optional)</span>
                </label>
                <textarea
                  maxLength={200}
                  placeholder="A message they'll see in their invite email."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <div className={styles.charCount}>{note.length}/200</div>
              </div>
            </div>

            <div className={styles.epLabel}>What they'll receive</div>
            <div className={styles.emailPreview}>
              <div className={styles.epContent}>
                <div className={styles.epBrand}>
                  Queer<em>Pulse</em>
                </div>
                <div className={styles.epSubject}>{SENDER_NAME} has invited you to QueerPulse</div>
                <div className={styles.epNote}>
                  “{note.trim() || "Hi! I think you'd love this community — it's exactly the kind of space we've talked about."}”
                </div>
                <div className={styles.epBtn}>Accept your invitation →</div>
                <div className={styles.epExpire}>Invite expires in 7 days</div>
              </div>
            </div>

            <div className={styles.actions}>
              <Button type="submit">Send invitation</Button>
              <Button type="button" variant="ghost" onClick={() => showToast('Draft saved', 'info')}>
                Save as draft
              </Button>
            </div>
            <div className={styles.formNote}>
              Invites expire after 7 days. If they don't accept, the quota is not returned.
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  )
}
