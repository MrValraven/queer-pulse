import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { COOKIE_CATEGORIES } from './cookies.data'
import styles from './CookiesPage.module.css'

export function CookiesPage() {
  const { showToast } = useToast()
  const [functional, setFunctional] = useState(true)
  const [analytics, setAnalytics] = useState(false)

  const toggleFor: Record<string, { value: boolean; set: (v: boolean) => void }> = {
    functional: { value: functional, set: setFunctional },
    analytics: { value: analytics, set: setAnalytics },
  }

  function save() {
    showToast('Cookie preferences saved.', 'success')
  }
  function acceptAll() {
    setFunctional(true)
    setAnalytics(true)
    showToast('Cookie preferences saved.', 'success')
  }
  function essentialOnly() {
    setFunctional(false)
    setAnalytics(false)
    showToast('Cookie preferences saved.', 'success')
  }

  return (
    <PageShell>
      <header className={styles.hero}>
        <div className={styles.eyebrow}>Cookie preferences</div>
        <h1 className={styles.h1}>
          You choose what we <em>remember.</em>
        </h1>
        <p className={styles.sub}>
          We use a small number of cookies to make the platform work. Some are essential — the site
          won't function without them. Others are optional, and we'll only use them if you say yes.
        </p>
      </header>

      <main className={styles.body}>
        <div className={styles.layout}>
          <div className={styles.group}>
            {COOKIE_CATEGORIES.map((cat) => {
              const t = toggleFor[cat.id]
              return (
                <div key={cat.id} className={styles.card}>
                  <div className={styles.cardHead}>
                    <div>
                      <div className={styles.cardTitle}>{cat.title}</div>
                      {cat.required && <div className={styles.cardReq}>Always on</div>}
                    </div>
                    <label className={styles.toggle}>
                      <input
                        type="checkbox"
                        checked={cat.required ? true : t?.value ?? false}
                        disabled={cat.required}
                        onChange={(e) => t?.set(e.target.checked)}
                      />
                      <span className={styles.toggleTrack} />
                      <span className={styles.toggleThumb} />
                    </label>
                  </div>
                  <p className={styles.cardBody}>{cat.body}</p>
                  <div className={styles.rowHead}>
                    <span className={styles.colLabel}>Name</span>
                    <span className={styles.colLabel}>Expires</span>
                    <span className={styles.colLabel}>Provider</span>
                  </div>
                  <div className={styles.list}>
                    {cat.cookies.map((c) => (
                      <div key={c.name} className={styles.row}>
                        <span className={styles.ckName}>{c.name}</span>
                        <span className={styles.ckExp}>{c.expires}</span>
                        <span className={styles.ckType}>{c.provider}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className={styles.noAds}>
              <div className={styles.noAdsTitle}>No advertising cookies. Ever.</div>
              <p>
                We do not use advertising networks, retargeting pixels, or social media tracking
                cookies. We do not sell your data. We never have and never will. There is no version
                of QueerPulse with ads.
              </p>
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.summary}>
              <h3>
                Your <em>current settings</em>
              </h3>
              <div className={styles.sumRow}>
                <span className={styles.sumName}>Essential</span>
                <span className={`${styles.sumVal} ${styles.sumReq}`}>Always on</span>
              </div>
              <div className={styles.sumRow}>
                <span className={styles.sumName}>Functional</span>
                <span className={`${styles.sumVal} ${functional ? styles.sumOn : styles.sumOff}`}>
                  {functional ? 'On' : 'Off'}
                </span>
              </div>
              <div className={styles.sumRow}>
                <span className={styles.sumName}>Analytics</span>
                <span className={`${styles.sumVal} ${analytics ? styles.sumOn : styles.sumOff}`}>
                  {analytics ? 'On' : 'Off'}
                </span>
              </div>
              <div className={styles.actions}>
                <Button variant="primary" onClick={save}>
                  Save my preferences
                </Button>
                <Button variant="ghost" onClick={acceptAll}>
                  Accept all
                </Button>
                <Button variant="ghost" onClick={essentialOnly}>
                  Essential only
                </Button>
              </div>
            </div>
            <div className={styles.info}>
              These settings are saved in your browser and on your account if you're signed in. You
              can change them at any time from your <Link to={routes.settings}>account settings</Link>{' '}
              or by returning to this page. See our <Link to={routes.privacy}>privacy policy</Link>{' '}
              for more detail.
            </div>
          </aside>
        </div>
      </main>

      <section className={styles.outro}>
        <h2>
          Your privacy. <em>Our commitment.</em>
        </h2>
        <p className={styles.outroSub}>
          We don't track you. We don't profile you. We don't sell anything about you.
        </p>
        <Button variant="ghost-dark" size="lg" to={routes.privacy}>
          Read our privacy policy
        </Button>
      </section>
    </PageShell>
  )
}
