import { useState, type FormEvent } from 'react'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { DELETE_CONTENT, type DeleteOption } from './deleteAccount.data'
import styles from './DeleteAccountPage.module.css'

export function DeleteAccountSection() {
  const { showToast } = useToast()
  const [opt, setOpt] = useState<DeleteOption>('deactivate')
  const [password, setPassword] = useState('')
  const [phrase, setPhrase] = useState('')

  const content = DELETE_CONTENT[opt]
  const phraseMatch = content.phrase ? phrase === content.phrase : true
  const canSubmit = password.length >= 1 && phraseMatch

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (opt === 'deactivate') {
      showToast('Account deactivated. Sign in any time to reactivate.', 'success')
    } else {
      showToast("Account deletion scheduled. We've emailed you confirmation.", 'info')
    }
  }

  return (
    <>
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
              <div className={styles.whText}>{item.text}</div>
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
          <Button variant="ghost" to={routes.settings}>Cancel</Button>
        </div>
      </form>
    </>
  )
}
