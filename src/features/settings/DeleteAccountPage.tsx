import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { linkToPath } from '../../app/routeMap'
import styles from './DeleteAccountPage.module.css'

type Option = 'deactivate' | 'delete'

interface WhatItem { col: string; text: string }

const CONTENT: Record<Option, { wh: WhatItem[]; phrase: string | null; btnLabel: string; isDanger: boolean }> = {
  deactivate: {
    wh: [
      { col: 'rgba(45,27,61,.3)', text: 'Your <strong>profile is hidden</strong> immediately — no other member can find or view it.' },
      { col: 'var(--jade)', text: 'Your <strong>data is fully preserved</strong>: messages, posts, history remain intact.' },
      { col: 'var(--jade)', text: '<strong>Reactivate instantly</strong> by signing back in with your email and password.' },
      { col: 'rgba(45,27,61,.3)', text: 'Your <strong>name is removed</strong> from member lists and search results.' },
      { col: 'rgba(45,27,61,.3)', text: 'Event RSVPs and forum contributions are <strong>attributed to [deactivated member]</strong>.' },
    ],
    phrase: null,
    btnLabel: 'Deactivate my account',
    isDanger: false,
  },
  delete: {
    wh: [
      { col: '#C85A40', text: '<strong>All your data is queued for deletion</strong> and permanently erased within 30 days.' },
      { col: '#C85A40', text: 'Messages you sent <strong>are deleted from all conversations</strong> — recipients lose them too.' },
      { col: '#C85A40', text: 'Your forum posts are <strong>permanently removed</strong> — not anonymised, deleted.' },
      { col: 'rgba(45,27,61,.3)', text: 'Your email address is <strong>added to a suppression list</strong> so we don\'t accidentally re-create your account.' },
      { col: 'rgba(45,27,61,.3)', text: 'You can request a <strong>data archive before deleting</strong> — do that first.' },
    ],
    phrase: 'delete my account',
    btnLabel: 'Permanently delete my account',
    isDanger: true,
  },
}

export function DeleteAccountPage() {
  const { showToast } = useToast()
  const [opt, setOpt] = useState<Option>('deactivate')
  const [password, setPassword] = useState('')
  const [phrase, setPhrase] = useState('')

  const content = CONTENT[opt]
  const phraseMatch = content.phrase ? phrase === content.phrase : true
  const canSubmit = password.length >= 1 && phraseMatch

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (opt === 'deactivate') {
      showToast('Account deactivated. Sign in any time to reactivate.', 'success')
    } else {
      showToast('Account deletion scheduled. We\'ve emailed you confirmation.', 'info')
    }
  }

  return (
    <AppShell>
      <div className={styles.settingsPage}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <div className={styles.sidebarHead}>Account</div>
            <Link to={linkToPath('QueerPulse Edit Profile.html')} className={styles.navItem}>
                <svg className={styles.navIcon} viewBox="0 0 16 16"><circle cx="8" cy="6" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
                Edit profile
              </Link>
            <Link to={linkToPath('QueerPulse Notification Preferences.html')} className={styles.navItem}>
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
          <h1 className={styles.pageTitle}>Leaving <em>QueerPulse?</em></h1>
          <p className={styles.pageSub}>We're sorry to see you go. Before you decide, choose the option that fits your situation.</p>

          <div className={styles.optionGrid}>
            <div
              className={[styles.optCard, opt === 'deactivate' && styles.optCardSelected].filter(Boolean).join(' ')}
              onClick={() => setOpt('deactivate')}
            >
              <div className={styles.optRadio}><div className={styles.optRadioInner} /></div>
              <div className={`${styles.optIcon} ${styles.optIconDefault}`}>
                <svg className={styles.optIconSvg} viewBox="0 0 20 20" stroke="var(--plum)"><circle cx="10" cy="10" r="8" /><line x1="7" y1="10" x2="13" y2="10" /></svg>
              </div>
              <div className={styles.optTitle}>Deactivate</div>
              <div className={styles.optDesc}>Your profile becomes invisible. Your data is preserved. You can reactivate any time by signing back in.</div>
              <div className={`${styles.optTag} ${styles.optTagRev}`}>Reversible</div>
            </div>
            <div
              className={[styles.optCard, styles.optCardDanger, opt === 'delete' && styles.optCardSelected].filter(Boolean).join(' ')}
              onClick={() => setOpt('delete')}
            >
              <div className={styles.optRadio}><div className={styles.optRadioInner} /></div>
              <div className={`${styles.optIcon} ${styles.optIconDanger}`}>
                <svg className={styles.optIconSvg} viewBox="0 0 20 20" stroke="#C85A40"><polyline points="4,5 16,5" /><path d="M7 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M6 5l.6 11h6.8l.6-11" /></svg>
              </div>
              <div className={`${styles.optTitle} ${styles.optTitleDanger}`}>Delete account</div>
              <div className={styles.optDesc}>Permanently erases your account and all associated data within 30 days. This cannot be undone.</div>
              <div className={`${styles.optTag} ${styles.optTagPerm}`}>Permanent</div>
            </div>
          </div>

          {opt === 'deactivate' && (
            <div className={styles.pauseStrip}>
              <svg className={styles.pauseStripIcon} viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /><polyline points="10,5 10,10 13,13" /></svg>
              <p className={styles.pauseStripText}>
                Not sure? Consider <strong>pausing notifications</strong> for a month instead —{' '}
                <button className={styles.pauseStripLink} onClick={() => showToast('All email notifications paused for 30 days.', 'success')}>
                  turn off all emails and digests
                </button>. You stay a member without the noise.
              </p>
            </div>
          )}

          <div className={styles.whatHappens}>
            <div className={styles.whTitle}>What happens when you {opt}</div>
            <div className={styles.whList}>
              {content.wh.map((item, i) => (
                <div key={i} className={styles.whRow}>
                  <div className={styles.whDot} style={{ background: item.col }} />
                  <div className={styles.whText} dangerouslySetInnerHTML={{ __html: item.text }} />
                </div>
              ))}
            </div>
          </div>

          <form className={styles.confirmForm} onSubmit={handleSubmit}>
            <div>
              <div className={styles.cfLabel}>Confirm with your password</div>
              <input className={styles.cfInput} type="password" placeholder="Your current password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            {content.phrase && (
              <div>
                <div className={styles.cfLabel}>Type <strong className={styles.confirmPhrase}>"{content.phrase}"</strong> to confirm</div>
                <input className={`${styles.cfInput} ${styles.cfInputDanger}`} type="text" placeholder="" value={phrase} onChange={(e) => setPhrase(e.target.value)} />
                <div className={styles.cfHint}>This action is permanent and cannot be reversed.</div>
              </div>
            )}
            <div className={styles.formActions}>
              {content.isDanger ? (
                <button type="submit" className={styles.btnDanger} disabled={!canSubmit}>{content.btnLabel}</button>
              ) : (
                <Button type="submit" variant="primary" disabled={!canSubmit}>{content.btnLabel}</Button>
              )}
              <Button variant="ghost" to={linkToPath('QueerPulse Settings.html')}>Cancel</Button>
            </div>
          </form>
        </main>
      </div>
    </AppShell>
  )
}
