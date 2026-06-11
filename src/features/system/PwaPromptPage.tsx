import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { linkToPath } from '../../app/routeMap'
import styles from './PwaPromptPage.module.css'

const FEATURES = [
  { label: 'Quick exit', detail: '· lives in the nav · one tap closes the app' },
  { label: 'Push notifications', detail: '· RSVPs, replies, mentions · granular & quiet' },
  { label: 'Works offline', detail: '· cached map, crisis chat, your QR ticket' },
  { label: '~ 6 MB on your phone', detail: '· no storage bloat · no background scanning' },
]

type Platform = 'ios' | 'android' | 'desktop'

const INSTRUCTIONS: Record<Platform, { title: string; steps: React.ReactNode[] }> = {
  ios: {
    title: 'iPhone · Safari · 3 taps',
    steps: [
      <>Tap the <b>Share</b> icon at the bottom of Safari</>,
      <>Scroll &amp; tap <b>Add to Home Screen</b> <em>· near the bottom</em></>,
      <>Tap <b>Add</b> in the top-right. Done.</>,
    ],
  },
  android: {
    title: 'Android · Chrome & Firefox · 2 taps',
    steps: [
      <>Tap the <b>three-dot menu</b> top-right</>,
      <>Choose <b>Install app</b> or <b>Add to home screen</b></>,
      <>Confirm · QueerPulse will appear with your other apps. <em>Works the same.</em></>,
    ],
  },
  desktop: {
    title: 'Desktop · Chrome & Edge',
    steps: [
      <>Look for the <b>install icon</b> in the address bar (right side)</>,
      <>Click it, then <b>Install</b> in the popup</>,
      <>Opens in its own window · pin to taskbar / Dock</>,
    ],
  },
}

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export function PwaPromptPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [platform, setPlatform] = useState<Platform>('ios')

  const { title, steps } = INSTRUCTIONS[platform]

  function install() {
    showToast('Look for the install prompt · usually top-right', 'info')
  }

  function snooze() {
    showToast("Won't ask again for 30 days", 'info')
    setTimeout(() => navigate(-1), 900)
  }

  return (
    <div className={styles.root}>
      <div className={`${styles.orb} ${styles.orbA}`} />
      <div className={`${styles.orb} ${styles.orbB}`} />

      <Link to="/" className={styles.brand}>
        <span className={styles.pulseDot} aria-hidden />
        Queer<em>Pulse</em>
      </Link>

      <div className={styles.card}>
        <div className={styles.ic}>
          <div className={styles.icInner}>
            <span className={styles.icDot} />
            Queer<em>Pulse</em>
          </div>
        </div>

        <div className={styles.kicker}>Add to home screen · no app store needed</div>
        <h1 className={styles.h1}>Keep <em>QueerPulse</em> a tap away.</h1>
        <p className={styles.lead}>
          Install the web app on your phone in 30 seconds.{' '}
          <em>Same as a regular app</em> — but no app-store account, no tracking, no review.
          Just a shortcut that opens crisis chat, your ticket, and the safe-spaces map in one tap.
        </p>

        <div className={styles.featureList}>
          {FEATURES.map((f) => (
            <div key={f.label} className={styles.featureRow}>
              <div className={styles.featureIc}><CheckIcon /></div>
              <div><b>{f.label}</b><span>{f.detail}</span></div>
            </div>
          ))}
        </div>

        <div className={styles.tabs}>
          {(['ios', 'android', 'desktop'] as Platform[]).map((p) => (
            <button
              key={p}
              className={[styles.tab, platform === p && styles.tabActive].filter(Boolean).join(' ')}
              onClick={() => setPlatform(p)}
            >
              {p === 'ios' ? 'iPhone' : p === 'android' ? 'Android' : 'Desktop'}
            </button>
          ))}
        </div>

        <div className={styles.howto}>
          <h4 className={styles.howtoTitle}>{title}</h4>
          {steps.map((step, i) => (
            <div key={i} className={styles.step}>
              <span className={styles.stepN}>{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <Button onClick={install} className={styles.installBtn}>Install now</Button>
          <button className={styles.laterBtn} onClick={snooze}>Maybe later</button>
        </div>
        <p className={styles.actionsFoot}>
          Snoozing this stops us asking on this device for <b>30 days</b>. You can also install
          any time from{' '}
          <Link to={linkToPath('QueerPulse Get the App.html')} className={styles.appLink}>
            Get the app
          </Link>.
        </p>
      </div>
    </div>
  )
}
