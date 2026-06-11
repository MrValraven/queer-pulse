import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import styles from './InviteExpiredPage.module.css'

export function InviteExpiredPage() {
  return (
    <div className={styles.root}>
      <div className={`${styles.orb} ${styles.orbA}`} />
      <div className={`${styles.orb} ${styles.orbB}`} />
      <Link to="/" className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        Queer<em>Pulse</em>
      </Link>

      <div className={styles.card}>
        <div className={styles.stamp}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
            <path d="m18 6-2 2" />
          </svg>
        </div>

        <div className={styles.eyebrow}>Invite expired</div>
        <h1 className={styles.heading}>
          This link has <em>timed out.</em>
        </h1>
        <p className={styles.lead}>
          Invites stay live for 14 days. Yours was sent a while ago, so the slot we held for you
          has rotated back into the pool.
        </p>

        <div className={styles.inviteDetails}>
          <div className={styles.inviteRow}>
            <span className={styles.inviteRowLabel}>Invited as</span>
            <b>tomas@example.com</b>
          </div>
          <div className={styles.inviteRow}>
            <span className={styles.inviteRowLabel}>Sent</span>
            <span>23 May 2026</span>
          </div>
          <div className={styles.inviteRow}>
            <span className={styles.inviteRowLabel}>Expired</span>
            <span className={styles.expiredDate}>6 Jun 2026</span>
          </div>
          <div className={`${styles.inviteRow} ${styles.inviteRowVouched}`}>
            <span className={styles.inviteRowLabel}>Vouched by</span>
            <span>
              <span className={styles.inviteAvatar}>CV</span>
              <b>Catarina Vaz</b>
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button to={routes.contact}>
            Ask Catarina to re-send →
          </Button>
          <Button variant="ghost" to={routes.invite}>
            Request a fresh invite
          </Button>
        </div>

        <div className={styles.foot}>
          <div>
            Already a member?{' '}
            <Link to={routes.signIn}>Sign in</Link>
          </div>
          <div>
            Need help?{' '}
            <Link to={routes.help}>Ask the team</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
