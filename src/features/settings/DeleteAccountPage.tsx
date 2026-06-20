import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { routes } from '../../app/routeMap'
import { DeleteAccountSection } from './DeleteAccountSection'
import styles from './DeleteAccountPage.module.css'

export function DeleteAccountPage() {
  return (
    <AppShell>
      <div className={styles.settingsPage}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarHead}>Account</div>
            <Link to={routes.editProfile} className={styles.navItem}>
                <svg className={styles.navIcon} viewBox="0 0 16 16"><circle cx="8" cy="6" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
                Edit profile
              </Link>
            <Link to={routes.notificationPreferences} className={styles.navItem}>
                <svg className={styles.navIcon} viewBox="0 0 16 16"><path d="M8 2a6 6 0 0 1 6 6c0 3.3-6 8-6 8S2 11.3 2 8a6 6 0 0 1 6-6z" /><circle cx="8" cy="8" r="1.5" fill="currentColor" /></svg>
                Notifications
              </Link>
            <button className={styles.navItem}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><rect x="2" y="11" width="12" height="3" rx="1" /><path d="M5 8h6M5 5h4" /></svg>
              Privacy
            </button>
            <div className={styles.sidebarHead}>Danger zone</div>
            <button className={`${styles.navItem} ${styles.navItemActive}`}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><polyline points="3,4 13,4" /><path d="M6 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M5 4l.5 9h5l.5-9" /></svg>
              Deactivate account
            </button>
          </div>
        </aside>

        <main className={styles.main}>
          <DeleteAccountSection />
        </main>
      </div>
    </AppShell>
  )
}
