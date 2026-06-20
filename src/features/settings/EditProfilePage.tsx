import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { EditProfilePane } from './EditProfilePane'
import styles from './EditProfilePage.module.css'

export function EditProfilePage() {
  const { showToast } = useToast()
  const [unsaved, setUnsaved] = useState(false)

  const markChanged = () => setUnsaved(true)

  return (
    <AppShell>
      <div className={styles.page}>
        <aside className={styles.nav}>
          <div className={styles.navInner}>
            <div className={styles.navSection}>Profile</div>
            <button className={`${styles.navItem} ${styles.navItemActive}`}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><circle cx="8" cy="6" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
              Identity &amp; photo
            </button>
            <button className={styles.navItem}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><path d="M4 4h8M8 4v8M5 11l3 2 3-2" /></svg>
              Pronouns &amp; name
            </button>
            <button className={styles.navItem}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><path d="M3 4h10M3 8h8M3 12h5" /></svg>
              Bio &amp; occupation
            </button>
            <button className={styles.navItem}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><polygon points="8,2 10.2,6 15,6.6 11.5,10 12.4,15 8,12.5 3.6,15 4.5,10 1,6.6 5.8,6" /></svg>
              Skills &amp; interests
            </button>
            <div className={styles.navSection}>Privacy</div>
            <button className={styles.navItem}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" /></svg>
              Field visibility
            </button>
            <div className={styles.navSection}>More</div>
            <Link to={routes.pronounsGuide} className={styles.navItem}>
                <svg className={styles.navIcon} viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.5" /><path d="M8 5v0M8 8v4" /></svg>
                Pronouns guide
              </Link>
          </div>
        </aside>

        <main className={styles.main}>
          <EditProfilePane onChange={markChanged} />
          <div style={{ height: '80px' }} />
        </main>
      </div>

      {unsaved && (
        <div className={styles.saveBar}>
          <span className={styles.unsavedLabel}>Unsaved changes</span>
          <div className={styles.saveActions}>
            <Button variant="ghost" onClick={() => { setUnsaved(false); showToast('Changes discarded.', 'info') }}>Discard</Button>
            <Button variant="primary" onClick={() => { setUnsaved(false); showToast('Profile saved.', 'success') }}>Save profile</Button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
