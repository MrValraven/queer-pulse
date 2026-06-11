import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { MATRIX_ROWS } from './notificationPreferences.data'
import styles from './NotificationPreferencesPage.module.css'

export function NotificationPreferencesPage() {
  const { showToast } = useToast()
  const [quietEnabled, setQuietEnabled] = useState(true)
  const [matrix, setMatrix] = useState(MATRIX_ROWS.map((r) => ({ ...r })))

  function toggleMatrix(rowIdx: number, col: 'app' | 'email' | 'push') {
    setMatrix((prev) => prev.map((r, i) => i === rowIdx ? { ...r, [col]: !r[col] } : r))
  }

  return (
    <AppShell>
      <div className={styles.settingsPage}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarHead}>Account</div>
            <Link to={routes.editProfile} className={styles.navItem}>
                <svg className={styles.navIcon} viewBox="0 0 16 16"><circle cx="8" cy="6" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
                Edit profile
              </Link>
            <button className={`${styles.navItem} ${styles.navItemActive}`}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><path d="M8 2a6 6 0 0 1 6 6c0 3.3-6 8-6 8S2 11.3 2 8a6 6 0 0 1 6-6z" /><circle cx="8" cy="8" r="1.5" fill="currentColor" /></svg>
              Notifications
            </button>
            <button className={styles.navItem}>
              <svg className={styles.navIcon} viewBox="0 0 16 16"><rect x="2" y="11" width="12" height="3" rx="1" /><path d="M5 8h6M5 5h4" /></svg>
              Privacy
            </button>
            <div className={styles.sidebarHead}>Danger zone</div>
            <Link to={routes.deleteAccount} className={`${styles.navItem} ${styles.navItemDanger}`}>
                <svg className={styles.navIcon} viewBox="0 0 16 16"><polyline points="3,4 13,4" /><path d="M6 4V3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M5 4l.5 9h5l.5-9" /></svg>
                Deactivate account
              </Link>
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <h1 className={styles.paneTitle}>Notification <em>preferences</em></h1>
          <p className={styles.paneSub}>Control exactly what QueerPulse sends you, and when. We default to less — you can always turn more on.</p>

          {/* Email digest */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Email digest</div>
            <div className={styles.freqCard}>
              <div>
                <div className={styles.freqLabel}>Digest frequency</div>
                <div className={styles.freqSub}>A summary of activity since your last visit. Never promotional.</div>
              </div>
              <select className={styles.select} defaultValue="Weekly (Monday)">
                <option>Never</option>
                <option>Daily</option>
                <option>Weekly (Monday)</option>
                <option>Fortnightly</option>
              </select>
            </div>
            <div className={styles.freqCard}>
              <div>
                <div className={styles.freqLabel}>Digest includes</div>
                <div className={styles.freqSub}>Which sections appear in your digest email.</div>
              </div>
              <select className={styles.select} defaultValue="Forum highlights + Events">
                <option>Forum highlights + Events</option>
                <option>Everything</option>
                <option>Events only</option>
                <option>Forum only</option>
              </select>
            </div>
          </div>

          {/* Channel matrix */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>What triggers a notification</div>
            <div className={styles.channelMatrix}>
              <div className={styles.cmHeader}>
                <div className={styles.cmColHead}>Event</div>
                <div className={styles.cmColHead}>In-app</div>
                <div className={styles.cmColHead}>Email</div>
                <div className={styles.cmColHead}>Push</div>
              </div>
              {matrix.map((row, i) => (
                <div key={row.label} className={styles.cmRow}>
                  <div>
                    <div className={styles.cmRowLabel}>{row.label}</div>
                    <div className={styles.cmRowSub}>{row.sub}</div>
                  </div>
                  <div className={styles.cmCheck}><input type="checkbox" className={styles.cmCheckbox} checked={row.app} onChange={() => toggleMatrix(i, 'app')} /></div>
                  <div className={styles.cmCheck}><input type="checkbox" className={styles.cmCheckbox} checked={row.email} onChange={() => toggleMatrix(i, 'email')} /></div>
                  <div className={styles.cmCheck}><input type="checkbox" className={styles.cmCheckbox} checked={row.push} onChange={() => toggleMatrix(i, 'push')} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* Quiet hours */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Quiet hours</div>
            <div className={styles.toggleList}>
              <div className={styles.toggleRow}>
                <div className={styles.toggleLabel}>
                  <div className={styles.toggleTitle}>Enable quiet hours</div>
                  <div className={styles.toggleDesc}>No push notifications during these hours. Email and in-app unaffected.</div>
                </div>
                <label className={styles.toggleSw}>
                  <input type="checkbox" checked={quietEnabled} onChange={() => setQuietEnabled((v) => !v)} />
                  <span className={styles.toggleTrack} />
                  <span className={styles.toggleThumb} />
                </label>
              </div>
            </div>
            <div className={styles.quietRow} style={quietEnabled ? undefined : { opacity: 0.4, pointerEvents: 'none' }}>
              <div className={styles.timeField}>
                <span className={styles.timeLabel}>From</span>
                <input type="time" className={styles.timeInput} defaultValue="22:00" />
              </div>
              <div className={styles.timeField}>
                <span className={styles.timeLabel}>Until</span>
                <input type="time" className={styles.timeInput} defaultValue="08:00" />
              </div>
            </div>
          </div>

          {/* Always on */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Always on · cannot be disabled</div>
            <div className={styles.toggleList}>
              {[
                { title: 'Security alerts', desc: 'New sign-in from an unrecognised device or location.' },
                { title: 'Data export ready', desc: 'When your data archive is available to download.' },
                { title: 'Moderation decisions', desc: 'If a moderator acts on content you posted.' },
              ].map(({ title, desc }) => (
                <div key={title} className={`${styles.toggleRow} ${styles.toggleRowDisabled}`}>
                  <div className={styles.toggleLabel}>
                    <div className={styles.toggleTitle}>{title}</div>
                    <div className={styles.toggleDesc}>{desc}</div>
                  </div>
                  <label className={styles.toggleSw}>
                    <input type="checkbox" defaultChecked readOnly />
                    <span className={styles.toggleTrack} />
                    <span className={styles.toggleThumb} />
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.saveBar}>
            <p className={styles.saveBarNote}>Changes are saved automatically.</p>
            <Button variant="primary" onClick={() => showToast('Notification preferences saved.', 'success')}>Save preferences</Button>
          </div>
        </main>
      </div>
    </AppShell>
  )
}
