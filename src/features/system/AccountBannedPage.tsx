import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import styles from './AccountBannedPage.module.css'

export function AccountBannedPage() {
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
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>

        <div className={styles.kicker}>Account removed · final action</div>
        <h1 className={styles.heading}>
          Your account has been <em>closed.</em>
        </h1>
        <p className={styles.lead}>
          After a full moderation review and one round of appeal, your account has been permanently
          removed from QueerPulse. <em>This was not done lightly.</em>
        </p>
        <p className={styles.lead}>
          Your active Sustainer membership has been <b>refunded pro-rated</b> to the card on file.
        </p>

        <div className={styles.violation}>
          <h4>Reason · referenced from your case file</h4>
          <p>
            <b>§02·06</b> — Weaponising platform access against members. The pattern of behaviour
            was documented across <b>8 separate incidents</b> over four months and reviewed by two
            independent moderators.
          </p>
        </div>

        <div className={styles.whatNow}>
          <div className={styles.whatRow}>
            <div className={styles.whatNum}>1</div>
            <div className={styles.whatText}>
              <b>You can appeal this decision once</b>
              <span>
                Open within 14 days of removal. Reviewed by the Assembly's standing appeals panel —
                different humans than your case moderators. Response within 21 days.
              </span>
            </div>
          </div>
          <div className={styles.whatRow}>
            <div className={styles.whatNum}>2</div>
            <div className={styles.whatText}>
              <b>Your data is removed from the platform within 30 days</b>
              <span>
                Per our{' '}
                <Link to={routes.privacy}>privacy policy</Link>. Posts you
                authored are anonymised, not deleted, unless you specifically request deletion below.
              </span>
            </div>
          </div>
          <div className={styles.whatRow}>
            <div className={styles.whatNum}>3</div>
            <div className={styles.whatText}>
              <b>Public records of this action are not kept</b>
              <span>
                The case file exists internally for 36 months. Your connections were notified you
                left, without reason. No member will know you were removed unless you tell them.
              </span>
            </div>
          </div>
          <div className={styles.whatRow}>
            <div className={styles.whatNum}>4</div>
            <div className={styles.whatText}>
              <b>Crisis support remains available</b>
              <span>
                <Link to={routes.crisisChat}>Crisis chat</Link> and the{' '}
                <Link to={routes.wellbeing}>resource library</Link> are open
                to everyone, member or not.
              </span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <Button to={routes.report}>File the appeal</Button>
          <Button variant="ghost" to={routes.dataExport}>
            Request full data erasure
          </Button>
        </div>
        <p className={styles.foot}>
          If you believe this was the result of coordinated false reports, please include the names
          you suspect in the appeal — we investigate this carefully.{' '}
          <Link to={routes.codeOfConduct}>
            Re-read the Code of Conduct →
          </Link>
        </p>
      </div>
    </div>
  )
}
