import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { linkToPath } from '../../app/routeMap'
import styles from './AccountSuspendedPage.module.css'

export function AccountSuspendedPage() {
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div className={styles.kicker}>Account paused · moderation action</div>
        <h1 className={styles.heading}>
          Your account is <em>suspended</em> for 7 days.
        </h1>
        <p className={styles.lead}>
          A moderator reviewed a report and decided your recent message in{' '}
          <b>#trans-mutual-aid</b> crossed §02·02 of the Code of Conduct (
          <em>repeated misgendering</em>). This is a <b>temporary suspension at rung 3</b> of the
          moderation ladder.
        </p>

        <div className={styles.detailList}>
          <div className={styles.detailRow}>
            <span>Action</span>
            <b>7-day suspension</b>
          </div>
          <div className={styles.detailRow}>
            <span>Started</span>
            <b>Mon 9 Jun · 14:08 WET</b>
          </div>
          <div className={styles.detailRow}>
            <span>Lifts automatically</span>
            <span className={styles.detailNum}>
              <em>Mon 16 Jun · 14:08</em>
            </span>
          </div>
          <div className={styles.detailRow}>
            <span>Reviewed by</span>
            <b>Sofia C. + one anon. mod</b>
          </div>
          <div className={styles.detailRow}>
            <span>Case ID</span>
            <b>QP-MOD-2026-1184</b>
          </div>
        </div>

        <div className={styles.whatStays}>
          <h4>What still works · during suspension</h4>
          <ul>
            <li>Reading public content &amp; the magazine</li>
            <li>Attending gatherings you'd already RSVP'd to</li>
            <li>Crisis chat · always available, no exceptions</li>
            <li>Filing an appeal · response within 5 working days</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Button to={linkToPath('QueerPulse Report.html')}>File an appeal</Button>
          <Button variant="ghost" to={linkToPath('QueerPulse Code of Conduct.html')}>
            Read the ladder
          </Button>
          <Button variant="ghost" to={linkToPath('QueerPulse Messages.html')}>
            Message the mod team
          </Button>
        </div>
        <p className={styles.foot}>
          11% of appeals are overturned. We publish the number annually.{' '}
          <Link to={linkToPath('QueerPulse Transparency Report.html')}>
            See 2025 moderation stats →
          </Link>
        </p>
      </div>
    </div>
  )
}
