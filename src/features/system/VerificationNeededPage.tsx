import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { AuthLayout } from '../auth/AuthLayout'
import { linkToPath } from '../../app/routeMap'
import styles from './VerificationNeededPage.module.css'

type Method = 'password' | '2fa' | 'magic'

export function VerificationNeededPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [method, setMethod] = useState<Method>('password')
  const [password, setPassword] = useState('')

  function pickMethod(m: Method) {
    setMethod(m)
    if (m !== 'password') {
      showToast(`Switched to ${m === '2fa' ? '2FA code' : 'magic link'}`, 'info')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    showToast('Verified · continuing', 'success')
    setTimeout(() => navigate(linkToPath('QueerPulse Cancel Membership.html')), 800)
  }

  const TABS: { label: string; value: Method }[] = [
    { label: 'Password', value: 'password' },
    { label: '2FA code', value: '2fa' },
    { label: 'Magic link', value: 'magic' },
  ]

  return (
    <AuthLayout>
      <div className={styles.icon}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </div>

      <h1>
        Quick check · <em>is this still you?</em>
      </h1>
      <p className={styles.lead}>
        For your next step we need to confirm it's still you on this device.{' '}
        <b>This is one of three actions</b> we re-auth for: changing your password,
        cancelling membership, or removing your account.
      </p>

      <div className={styles.actionCard}>
        <div className={styles.actionIc}>
          <svg viewBox="0 0 24 24" aria-hidden>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <span>
          You're about to <b>cancel your Sustainer membership</b>
        </span>
      </div>

      <div className={styles.methods}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={[styles.methodTab, method === tab.value && styles.methodTabActive]
              .filter(Boolean)
              .join(' ')}
            onClick={() => pickMethod(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="vn-pw">Your password</label>
          <input
            id="vn-pw"
            type="password"
            placeholder="••••••••••"
            autoComplete="current-password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" className={styles.confirmBtn}>
          Confirm and continue →
        </Button>
      </form>

      <p className={styles.foot}>
        Forgot your password?{' '}
        <Link to={linkToPath('QueerPulse Password Reset.html')}>Reset →</Link> · this
        re-auth expires in <b>5 minutes</b>.
      </p>
    </AuthLayout>
  )
}
