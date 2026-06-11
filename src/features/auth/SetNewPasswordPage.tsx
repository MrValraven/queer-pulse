import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { AuthLayout } from './AuthLayout'
import { routes } from '../../app/routeMap'
import styles from './auth.module.css'
import pageStyles from './SetNewPasswordPage.module.css'

const LEVELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
const COLORS = ['', pageStyles.weak, pageStyles.fair, pageStyles.good, pageStyles.strong]

function strengthScore(v: string): number {
  let score = 0
  if (v.length >= 10) score++
  if (v.length >= 14) score++
  if (/[0-9]/.test(v) || /[^a-zA-Z0-9]/.test(v)) score++
  if (v.length >= 18) score++
  return Math.min(score, 4)
}

export function SetNewPasswordPage() {
  const navigate = useNavigate()
  const [pw1, setPw1] = useState('')
  const [pw2, setPw2] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)
  const [done, setDone] = useState(false)

  const score = pw1.length > 0 ? strengthScore(pw1) : 0
  const strengthLabel = pw1.length > 0 ? (score > 0 ? LEVELS[score] : 'Too short') : 'Enter a password'
  const matchesOk = pw2.length > 0 && pw1 === pw2
  const matchesFail = pw2.length > 0 && pw1 !== pw2
  const canSubmit = pw1.length >= 10 && matchesOk

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setDone(true)
  }

  if (done) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center' }}>
          <div className={pageStyles.doneIcon}>
            <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
              <path d="M6 14.5L11.5 20L22 9" stroke="var(--jade)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className={pageStyles.doneHead}>Password updated</div>
          <div className={pageStyles.doneSub}>You're good to go. Sign in with your new password.</div>
          <Button className={styles.authBtn} onClick={() => navigate(routes.signIn)}>
            Sign in
          </Button>
          <p className={pageStyles.doneNote}>All other sessions were signed out.</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1>
        Choose a <em>new</em> password
      </h1>
      <p className={styles.sub}>Must be at least 10 characters. We recommend using a passphrase.</p>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="snp-pw1">New password</label>
          <div className={styles.fieldWrap}>
            <input
              id="snp-pw1"
              type={show1 ? 'text' : 'password'}
              placeholder="Enter new password"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
              style={{ paddingRight: 48 }}
            />
            <button type="button" className={styles.pwToggle} onClick={() => setShow1((s) => !s)} aria-label={show1 ? 'Hide' : 'Show'}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx={12} cy={12} r={3} />
              </svg>
            </button>
          </div>
          <div className={pageStyles.strengthWrap}>
            <div className={pageStyles.strengthBar}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={[pageStyles.strengthSeg, i <= score ? COLORS[score] : ''].filter(Boolean).join(' ')} />
              ))}
            </div>
            <div className={pageStyles.strengthLabel} style={{ color: score >= 3 ? 'var(--jade)' : score === 2 ? '#E8B44A' : score === 1 ? 'var(--accent-ink)' : 'var(--ink-40)' }}>
              {strengthLabel}
            </div>
          </div>
        </div>

        <div className={styles.field} style={{ marginBottom: 26 }}>
          <label htmlFor="snp-pw2">Confirm password</label>
          <div className={styles.fieldWrap}>
            <input
              id="snp-pw2"
              type={show2 ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              style={{ paddingRight: 48 }}
              className={matchesOk ? pageStyles.validInput : matchesFail ? pageStyles.invalidInput : ''}
            />
            <button type="button" className={styles.pwToggle} onClick={() => setShow2((s) => !s)} aria-label={show2 ? 'Hide' : 'Show'}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx={12} cy={12} r={3} />
              </svg>
            </button>
          </div>
          {matchesOk && (
            <span className={pageStyles.confirmHintMatch}>
              <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
                <path d="M2 6.5l3.5 3.5 6-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Passwords match
            </span>
          )}
          {matchesFail && (
            <span className={pageStyles.confirmHintNoMatch}>
              <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
                <path d="M2 2l9 9M11 2l-9 9" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
              </svg>
              Passwords don't match
            </span>
          )}
        </div>

        <Button type="submit" className={styles.authBtn} disabled={!canSubmit}>
          Set new password
        </Button>
      </form>

      <p className={pageStyles.authNote}>After saving, all other sessions will be signed out for security.</p>
    </AuthLayout>
  )
}
