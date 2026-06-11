import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { linkToPath } from '../../app/routeMap'
import styles from './PendingReviewPage.module.css'

export function PendingReviewPage() {
  const { showToast } = useToast()

  return (
    <div className={styles.root}>
      <div className={`${styles.orb} ${styles.orbA}`} />
      <div className={`${styles.orb} ${styles.orbB}`} />
      <Link to="/" className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        Queer<em>Pulse</em>
      </Link>

      <div className={styles.card}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
        </div>

        <div className={styles.kicker}>Invite request · in queue</div>
        <h1 className={styles.heading}>
          You're <em>184th</em> in line.
        </h1>
        <p className={styles.lead}>
          We open membership in cohorts. Your request to <b>tomas@example.com</b> is in the queue
          and a vouching member will review it within <b>~ 3 weeks</b>.
        </p>

        <div className={styles.posCard}>
          <div className={styles.posRow}>
            <div className={styles.posNum}>
              <em>184</em>
            </div>
            <div className={styles.posInfo}>
              <b>Your position</b>
              <p>
                Out of 1,247 in queue · we admit <b>about 60 / month</b> · ETA for you:{' '}
                <b>late Jun / early Jul 2026</b>
              </p>
            </div>
          </div>
        </div>

        <div className={styles.timeline}>
          <div className={styles.tlStep}>
            <div className={`${styles.dot} ${styles.dotDone}`} />
            <div>
              <b>Request received · 4 Jun 2026</b>
              <span>You signed up · we logged your interest</span>
            </div>
          </div>
          <div className={styles.tlStep}>
            <div className={`${styles.dot} ${styles.dotActive}`} />
            <div>
              <b>Awaiting vouching member</b>
              <span>A current member is matching your interests · this takes 2–3 weeks</span>
            </div>
          </div>
          <div className={`${styles.tlStep} ${styles.tlStepPending}`}>
            <div className={`${styles.dot} ${styles.dotPending}`} />
            <div>
              <b>Brief check-in call · 15 min</b>
              <span>Light, friendly · just so we know who you are</span>
            </div>
          </div>
          <div className={`${styles.tlStep} ${styles.tlStepPending}`}>
            <div className={`${styles.dot} ${styles.dotPending}`} />
            <div>
              <b>Invitation sent · activates within 14 days</b>
              <span>You'll get an email with a single-use link</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button to={linkToPath('QueerPulse Magazine.html')}>Read the magazine →</Button>
          <Button variant="ghost" to={linkToPath('QueerPulse Vouch.html')}>
            Ask a member to vouch
          </Button>
          <Button
            variant="ghost"
            onClick={() => showToast('Update sent — we have your changes', 'success')}
          >
            Update my interests
          </Button>
        </div>
        <p className={styles.foot}>
          Already know a member who can vouch?{' '}
          <Link to={linkToPath('QueerPulse Vouch.html')}>Send them a one-click vouch link</Link> —
          bumps you ahead in the queue.
          <br />
          Want to withdraw?{' '}
          <Link to={linkToPath('QueerPulse Contact.html')}>Write to the team</Link>.
        </p>
      </div>
    </div>
  )
}
