import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { linkToPath } from '../../app/routeMap'
import { NEWSLETTERS, JOB_ALERTS, PRONOUN_OPTIONS, PRONOUN_VISIBILITY } from './subscriptions.data'
import styles from './SubscriptionsPage.module.css'

const iconVariantClass: Record<'coral' | 'jade' | 'plum', string> = {
  coral: '',
  jade: styles.nlIcJade,
  plum: styles.nlIcPlum,
}

export function SubscriptionsPage() {
  const { showToast } = useToast()
  const [nlOn, setNlOn] = useState<Record<string, boolean>>(
    Object.fromEntries(NEWSLETTERS.map((n) => [n.id, n.defaultOn]))
  )
  const [removedAlerts, setRemovedAlerts] = useState<Set<string>>(new Set())
  const [selectedPronouns, setSelectedPronouns] = useState<Set<string>>(new Set(['he/him']))
  const [pronVis, setPronVis] = useState<Record<string, boolean>>(
    Object.fromEntries(PRONOUN_VISIBILITY.map((p) => [p.id, p.defaultOn]))
  )

  function removeAlert(id: string) {
    setRemovedAlerts((prev) => new Set(prev).add(id))
    showToast('Alert removed', 'info')
  }

  function togglePronoun(p: string) {
    setSelectedPronouns((prev) => {
      const next = new Set(prev)
      next.has(p) ? next.delete(p) : next.add(p)
      return next
    })
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <Link to={linkToPath('QueerPulse Settings.html')} className={styles.back}>← Settings</Link>
        <div className={styles.eyebrow}>Settings · subscriptions, alerts &amp; pronouns</div>
        <h1 className={styles.h1}>What we send · <em>how you appear.</em></h1>
        <p className={styles.lead}>Three small, surgical controls. <em>Each opt-in is real</em> — turning off a newsletter means we never send it, not "less of it". Pronouns are the same: visible exactly where you choose, never inferred.</p>

        <div className={styles.sectionH}>Newsletter streams · 3 available</div>
        {NEWSLETTERS.map((nl) => (
          <div key={nl.id} className={`${styles.nlCard} ${nlOn[nl.id] ? styles.nlCardSub : ''}`}>
            <div className={`${styles.nlIc} ${iconVariantClass[nl.iconVariant]}`}>{nl.icon}</div>
            <div className={styles.nlInfo}>
              <b>{nl.name}</b>
              <span>{nl.freq}</span>
              <div className={styles.nlMeta}>{nl.meta}</div>
            </div>
            <label className={styles.toggleSw}>
              <input type="checkbox" checked={nlOn[nl.id]} onChange={(e) => setNlOn((prev) => ({ ...prev, [nl.id]: e.target.checked }))} />
              <div className={styles.toggleTrack} />
              <div className={styles.toggleThumb} />
            </label>
          </div>
        ))}

        <div className={styles.sectionH}>Saved searches &amp; job alerts</div>
        {JOB_ALERTS.filter((a) => !removedAlerts.has(a.id)).map((alert) => (
          <div key={alert.id} className={styles.alertCard}>
            <div className={styles.alertHead}>
              <div className={styles.alertIc}>{alert.ic}</div>
              <div className={styles.alertInfo}>
                <b>{alert.title}</b>
                <span>{alert.desc}</span>
              </div>
              <div className={styles.alertActions}>
                <button className={styles.alertAction} onClick={() => showToast('Opened in editor', 'info')}>Edit</button>
                <button className={`${styles.alertAction} ${styles.alertActionDanger}`} onClick={() => removeAlert(alert.id)}>Delete</button>
              </div>
            </div>
            <div className={styles.alertCriteria}>
              {alert.criteria.map((c, i) => <span key={i} className={styles.critChip}>{c.label}</span>)}
            </div>
            <div className={styles.alertRow}><span>Status</span><span className={styles.live}>{alert.status}</span></div>
            <div className={styles.alertRow}><span>Matches in last week</span><b>{alert.matches}</b></div>
            <div className={styles.alertRow}><span>Last sent</span><b>{alert.lastSent}</b></div>
          </div>
        ))}
        <button className={styles.addCard} onClick={() => showToast('New saved search · opening builder', 'info')}>+ Create a new alert</button>

        <div className={styles.sectionH}>Pronouns · how you appear across QueerPulse</div>
        <div className={styles.pronCard}>
          <div className={styles.pronCurrent}>Currently using <b>he<em>/</em>him</b> on your profile · shown next to your name in all member-facing surfaces</div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--plum)', marginBottom: 10 }}>Pick one or more</h4>
          <div className={styles.pronGrid}>
            {PRONOUN_OPTIONS.map((p) => (
              <div key={p} className={`${styles.pronChip} ${selectedPronouns.has(p) ? styles.pronChipSelected : ''}`} onClick={() => togglePronoun(p)}>
                {p.includes('/') ? <>{p.split('/')[0]}<em>/</em>{p.split('/')[1]}</> : p}
              </div>
            ))}
          </div>
          <div className={styles.pronCustom}>
            <input className={styles.pronInput} type="text" placeholder="Or write your own · e.g. xe/xem · zie/hir" />
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--ink-40)', marginTop: 10, lineHeight: 1.55 }}>Use commas to add multiple, separated by season or context if you'd like. <em>e.g. he/him (formal), they/them (close friends)</em>.</p>
        </div>

        <div className={styles.pronCard}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--plum)', marginBottom: 14 }}>Where they show</h4>
          {PRONOUN_VISIBILITY.map((pv) => (
            <div key={pv.id} className={styles.pronVisRow}>
              <div className="lbl"><b>{pv.label}</b><span>{pv.desc}</span></div>
              <label className={styles.toggleSw}>
                <input type="checkbox" checked={pronVis[pv.id]} disabled={pv.disabled} onChange={(e) => setPronVis((prev) => ({ ...prev, [pv.id]: e.target.checked }))} />
                <div className={styles.toggleTrack} style={pv.disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined} />
                <div className={styles.toggleThumb} />
              </label>
            </div>
          ))}
        </div>

        <div className={styles.saveRow}>
          <span className={styles.saveInfo}>Last saved <b>14 May 2026</b> · all changes saved automatically</span>
          <Button variant="primary" onClick={() => showToast('Settings saved', 'success')}>Save changes</Button>
        </div>

        <div className={styles.pitchNote}>
          <b>Want to write for the podcast or magazine?</b> Pitches are read by the editorial team, not auto-filtered.{' '}
          <Link to={linkToPath('QueerPulse Submit Story.html')}>Pitch a story →</Link>
          {' · '}
          <Link to={linkToPath('QueerPulse Contact.html')}>Pitch yourself for The Back Room →</Link>
        </div>
      </div>
    </AppShell>
  )
}
