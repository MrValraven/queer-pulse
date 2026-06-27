import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { AuthLayout } from './AuthLayout'
import { routes } from '../../app/routeMap'
import styles from './auth.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function MagicLinkPage() {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const emailValid = EMAIL_RE.test(email.trim())
  const emailError = touched && email.trim().length > 0 && !emailValid

  function startCooldown() {
    let t = 30
    setCooldown(t)
    timerRef.current = setInterval(() => {
      t--
      setCooldown(t)
      if (t <= 0) {
        clearInterval(timerRef.current!)
        setCooldown(0)
      }
    }, 1000)
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current) }, [])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!emailValid) return
    setSent(true)
    startCooldown()
  }

  function handleResend() {
    showToast('Sent again — check spam too', 'info')
    startCooldown()
  }

  if (sent) {
    return (
      <AuthLayout>
        <div className={styles.screenIn} style={{ textAlign: 'center', paddingTop: 18 }}>
          <div className={styles.sentIc}>
            <svg viewBox="0 0 24 24" width={32} height={32} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5L20 7" />
            </svg>
          </div>
          <h1>
            Check your <em>email.</em>
          </h1>
          <p className={styles.sub} style={{ maxWidth: '30ch', margin: '0 auto 24px' }}>
            A sign-in link is on its way to <strong style={{ color: 'var(--ink)', fontWeight: 600 }}>{email}</strong>. Tap it on this device to come back signed in.
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--ink-40)', lineHeight: 1.6, marginBottom: 24 }}>
            Didn't get it? Look in spam, or{' '}
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              style={{
                background: 'none', border: 'none', cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                color: cooldown > 0 ? 'var(--ink-40)' : 'var(--plum)', fontWeight: 600,
                fontFamily: 'var(--sans)', fontSize: 13.5, padding: '4px 0',
              }}
            >
              {cooldown > 0 ? `resend in ${cooldown}s` : 'resend link'}
            </button>
          </p>
          <div className={styles.footer}>
            <Link to={routes.signIn} style={{ fontSize: 13.5, color: 'var(--ink-60)', fontWeight: 500 }}>
              ← Use a different method
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1>
        Sign in with a <em>link.</em>
      </h1>
      <p className={styles.sub}>We'll email you a one-tap link. No password, no app, no friction. Expires in 10 minutes.</p>

      <form onSubmit={handleSend}>
        <div className={styles.field}>
          <label htmlFor="ml-email">Email</label>
          <div className={styles.fieldWrap}>
            <input
              id="ml-email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
            />
          </div>
          {emailError && (
            <span style={{ fontSize: 12.5, color: 'var(--accent-ink)', fontWeight: 500 }}>
              Please enter a valid email address.
            </span>
          )}
        </div>

        <Button type="submit" className={styles.authBtn} disabled={!emailValid}>
          Send me a link →
        </Button>
      </form>

      <div className={styles.divider}>or</div>

      <div className={styles.footer}>
        <Link to={routes.signIn} className={styles.signinLink} style={{ color: 'var(--plum)', fontWeight: 600, fontSize: 13.5 }}>
          Sign in with password instead
        </Link>
        <Link to={routes.invite} style={{ fontSize: 13.5, color: 'var(--ink-60)', fontWeight: 500 }}>
          Not a member yet? Request an invite
        </Link>
      </div>
    </AuthLayout>
  )
}
