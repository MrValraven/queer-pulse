import { Link } from 'react-router-dom'
import { FiInfo } from 'react-icons/fi'
import { ACTIVITY_FEED } from './adminDashboard.data'
import { routes } from '../../app/routeMap'
import styles from './AdminDashboardPage.module.css'

export function AdminDashboardFeed() {
  return (
    <div className={styles.feedRail}>
      <div className={styles.feedCard}>
        <div className={styles.feedHead}>
          <span className={styles.feedTitle}>Live activity</span>
          <span className={styles.live}>
            <span className={styles.liveDot} aria-hidden />
            Live
          </span>
        </div>
        <div className={styles.feed}>
          {ACTIVITY_FEED.map(({ id, tone, icon: Icon, lead, body, em, bodyAfter, time, to }) => (
            <Link key={id} to={to} className={styles.fItem}>
              <span className={[styles.fIco, styles[`fIco_${tone}`]].join(' ')}>
                <Icon aria-hidden />
              </span>
              <span className={styles.fTx}>
                <b>{lead}</b> {body} {em && <em>{em}</em>}
                {bodyAfter ? ` ${bodyAfter}` : ''}
                <span className={styles.fTime}>{time}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.transpCard}>
        <FiInfo className={styles.transpIco} aria-hidden />
        <span>
          Every action here is <b>logged and shown</b> to the member it affects. No silent
          removals, ever.{' '}
          <Link to={routes.adminGovernance} className={styles.transpLink}>
            See the audit log →
          </Link>
        </span>
      </div>
    </div>
  )
}
