import { Link } from 'react-router-dom'
import { ACTIVITY_FEED } from './adminDashboard.data'
import styles from './AdminDashboardPage.module.css'

export function AdminDashboardFeed() {
  return (
    <aside className={styles.feed}>
      <div className={styles.feedHead}>Live activity</div>
      <ul className={styles.feedList}>
        {ACTIVITY_FEED.map(({ id, icon: Icon, text, meta, to }) => (
          <li key={id}>
            <Link to={to} className={styles.feedItem}>
              <span className={styles.feedIcon}><Icon aria-hidden /></span>
              <span className={styles.feedText}>{text}</span>
              <span className={styles.feedMeta}>{meta}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
