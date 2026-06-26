import { useState, useEffect, useRef } from 'react'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import styles from './ServerErrorPage.module.css'

function Countdown() {
  const endRef = useRef<number | null>(null)
  const [display, setDisplay] = useState('23:44')

  useEffect(() => {
    // Compute the deadline once the timer starts — Date.now() is impure, so keep
    // it out of render.
    endRef.current = Date.now() + 23 * 60_000 + 44_000
    const id = setInterval(() => {
      const diff = Math.max(0, (endRef.current ?? 0) - Date.now())
      const m = Math.floor(diff / 60_000)
      const s = Math.floor((diff % 60_000) / 1000)
      setDisplay(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
      if (diff === 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={styles.countdown}>
      <div className={styles.cdLabel}>Estimated back online in</div>
      <div className={styles.cdNum}>{display}</div>
    </div>
  )
}

type Mode = 'error' | 'maintenance'

export function ServerErrorPage() {
  const [mode, setMode] = useState<Mode>('error')
  const isMaint = mode === 'maintenance'

  return (
    <div className={styles.root}>
      <div className={styles.modeTabs} aria-label="Demo mode">
        {(['error', 'maintenance'] as Mode[]).map((m) => (
          <button
            key={m}
            className={[styles.modeTab, mode === m && styles.modeTabActive].filter(Boolean).join(' ')}
            onClick={() => setMode(m)}
          >
            {m === 'error' ? '500 Error' : 'Maintenance'}
          </button>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.brand}>
            <span className={styles.dot} aria-hidden />
            Queer<em>Pulse</em>
          </div>
          <div className={styles.codeBg} aria-hidden>{isMaint ? '—' : '500'}</div>
          <h1 className={styles.heading}>
            {isMaint ? (
              <>Planned maintenance.<br /><em>Back soon.</em></>
            ) : (
              <>Something went<br /><em>wrong on our end.</em></>
            )}
          </h1>
          <p className={styles.headingSub}>
            {isMaint
              ? "We're upgrading the platform. Shouldn't be long. We appreciate your patience."
              : "This is our fault, not yours. We've been automatically notified and we're looking at it."}
          </p>
        </div>

        <div className={styles.cardBody}>
          {isMaint && (
            <div className={styles.maintBadge}>
              <span>Scheduled maintenance</span>
            </div>
          )}

          <div className={styles.statusStrip}>
            <span
              className={styles.statusDot}
              style={isMaint ? { background: 'var(--jade)', animation: 'none', boxShadow: 'none' } : undefined}
            />
            <span className={styles.statusText}>
              {isMaint ? (
                <><strong>Planned downtime.</strong> Follow{' '}
                  <a href="https://status.queerpulse.pt">status.queerpulse.pt</a> for updates.</>
              ) : (
                <><strong>Our team has been alerted.</strong> Check{' '}
                  <a href={routes.status}>status.queerpulse.pt</a> for live updates.</>
              )}
            </span>
          </div>

          {isMaint && <Countdown />}

          <div className={styles.actions}>
            <Button onClick={() => window.location.reload()} className={styles.actionBtn}>
              Try again
            </Button>
            <Button variant="ghost" to="/" className={styles.actionBtn}>
              Go to homepage
            </Button>
            <Button variant="ghost" to={routes.status} className={styles.actionBtn}>
              Check platform status
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p>If this keeps happening, <a href="mailto:help@queerpulse.pt">contact us</a>.</p>
      </div>
    </div>
  )
}
