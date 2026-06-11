import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { AuthLayout } from './AuthLayout'
import { routes } from '../../app/routeMap'
import styles from './auth.module.css'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function PasswordResetPage() {
  const { showToast } = useToast()
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [sent, setSent] = useState(false)
  const [resendLabel, setResendLabel] = useState('Resend link')

  const emailValid = EMAIL_RE.test(email.trim())
  const emailError = touched && email.trim().length > 0 && !emailValid

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!emailValid) return
    setSent(true)
  }

  function handleResend() {
    setResendLabel('Sending…')
    setTimeout(() => {
      showToast('Reset link sent again', 'success')
      let secs = 30
      setResendLabel(`Resend in ${secs}s`)
      const iv = setInterval(() => {
        secs--
        if (secs <= 0) {
          clearInterval(iv)
          setResendLabel('Resend link')
        } else {
          setResendLabel(`Resend in ${secs}s`)
        }
      }, 1000)
    }, 900)
  }

  if (sent) {
    return (
      <AuthLayout>
        <div style={{ textAlign: 'center' }}>
          <div className={styles.successIcon}>
            <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="#4A8C6F" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <rect x={2} y={4} width={20} height={16} rx={2} />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h1>
            Check your <em>inbox.</em>
          </h1>
          <p className={styles.sub} style={{ maxWidth: '32ch', margin: '0 auto 24px' }}>
            We've sent a reset link to <strong style={{ color: 'var(--plum)', fontWeight: 600, wordBreak: 'break-all' }}>{email}</strong>. It may take a minute — check your spam folder if it doesn't arrive.
          </p>
          <Button variant="ghost" className={styles.authBtn} onClick={handleResend}>
            {resendLabel}
          </Button>
          <div className={styles.footer} style={{ marginTop: 16 }}>
            <Link to={routes.signIn}>← Back to sign in</Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1>
        Reset your <em>password.</em>
      </h1>
      <p className={styles.sub}>Enter your email and we'll send you a link to set a new one.</p>

      <form onSubmit={handleSend}>
        <div className={styles.field} style={{ marginBottom: 26 }}>
          <label htmlFor="pr-email">Email</label>
          <div className={styles.fieldWrap}>
            <input
              id="pr-email"
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
          Send reset link →
        </Button>
      </form>

      <div className={styles.footer}>
        <Link to={routes.signIn}>← Back to sign in</Link>
      </div>
    </AuthLayout>
  )
}
