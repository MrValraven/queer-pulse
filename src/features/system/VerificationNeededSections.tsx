import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheck, FiMail, FiRefreshCw } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import {
  CODE_LENGTH,
  DEMO_2FA_CODE,
  REAUTH_EMAIL,
  RESEND_COOLDOWN,
} from './verificationNeeded.data'
import styles from './VerificationNeededPage.module.css'

function Spinner() {
  return <span className={styles.spinner} aria-hidden />
}

/* ── Password ─────────────────────────────────────────────── */
export function PasswordMethod({
  busy,
  onVerify,
}: {
  busy: boolean
  onVerify: () => void
}) {
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password || busy) return
    onVerify()
  }

  return (
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
          disabled={busy}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" className={styles.confirmBtn} disabled={!password || busy}>
        {busy ? (
          <>
            <Spinner /> Verifying…
          </>
        ) : (
          <>Confirm and continue →</>
        )}
      </Button>
      <p className={styles.resetLine}>
        Forgot your password? <Link to={routes.passwordReset}>Reset →</Link>
      </p>
    </form>
  )
}

/* ── 2FA code ─────────────────────────────────────────────── */
export function CodeMethod({
  busy,
  onVerify,
}: {
  busy: boolean
  onVerify: () => void
}) {
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [error, setError] = useState(false)
  const refs = useRef<(HTMLInputElement | null)[]>([])

  function check(code: string) {
    if (code === DEMO_2FA_CODE) {
      setError(false)
      onVerify()
    } else {
      setError(true)
      setDigits(Array(CODE_LENGTH).fill(''))
      refs.current[0]?.focus()
    }
  }

  function set(next: string[]) {
    setDigits(next)
    if (next.every(Boolean)) check(next.join(''))
  }

  function handleInput(i: number, val: string) {
    const ch = val.replace(/\D/g, '').slice(0, 1)
    const next = [...digits]
    next[i] = ch
    setError(false)
    if (ch && i < CODE_LENGTH - 1) refs.current[i + 1]?.focus()
    set(next)
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < CODE_LENGTH - 1) refs.current[i + 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!text) return
    e.preventDefault()
    const next = Array(CODE_LENGTH).fill('')
    for (let j = 0; j < text.length; j++) next[j] = text[j]
    refs.current[Math.min(text.length, CODE_LENGTH - 1)]?.focus()
    set(next)
  }

  return (
    <div className={styles.codeBlock}>
      <p className={styles.codeLabel}>Enter the 6-digit code from your authenticator app</p>
      <div
        className={[styles.codeRow, error && styles.codeRowError].filter(Boolean).join(' ')}
        onPaste={handlePaste}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            disabled={busy}
            value={d}
            autoFocus={i === 0}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
      <p className={[styles.codeHint, error && styles.codeHintError].filter(Boolean).join(' ')}>
        {busy ? (
          <>
            <Spinner /> Verifying…
          </>
        ) : error ? (
          'That code didn’t match — try again.'
        ) : (
          <>Demo · use {DEMO_2FA_CODE}</>
        )}
      </p>
    </div>
  )
}

/* ── Magic link ───────────────────────────────────────────── */
export function MagicLinkMethod({
  busy,
  onVerify,
}: {
  busy: boolean
  onVerify: () => void
}) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  function startCooldown() {
    let t = RESEND_COOLDOWN
    setCooldown(t)
    const iv = setInterval(() => {
      t--
      setCooldown(t)
      if (t <= 0) clearInterval(iv)
    }, 1000)
  }

  function send() {
    if (sending) return
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      startCooldown()
    }, 1000)
  }

  if (!sent) {
    return (
      <div className={styles.magicIntro}>
        <p className={styles.magicCopy}>
          We’ll email a one-time confirmation link to <b>{REAUTH_EMAIL}</b>. Open it on this
          device to confirm it’s you.
        </p>
        <Button className={styles.confirmBtn} onClick={send} disabled={sending}>
          {sending ? (
            <>
              <Spinner /> Sending link…
            </>
          ) : (
            <>Email me a confirmation link</>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.sentBox}>
      <div className={styles.sentIc}>
        <FiMail aria-hidden />
      </div>
      <p className={styles.sentTitle}>Link on its way</p>
      <p className={styles.magicCopy}>
        Tap the link we sent to <b>{REAUTH_EMAIL}</b>, then come back here.
      </p>
      <Button className={styles.confirmBtn} onClick={onVerify} disabled={busy}>
        {busy ? (
          <>
            <Spinner /> Verifying…
          </>
        ) : (
          <>
            I’ve opened the link <FiArrowRight aria-hidden />
          </>
        )}
      </Button>
      <button
        type="button"
        className={styles.resendBtn}
        onClick={send}
        disabled={cooldown > 0 || sending}
      >
        <FiRefreshCw aria-hidden />
        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend link'}
      </button>
    </div>
  )
}

/* ── Success ──────────────────────────────────────────────── */
export function SuccessPanel({ onContinue }: { onContinue: () => void }) {
  return (
    <div className={styles.success}>
      <div className={styles.successIc}>
        <FiCheck aria-hidden />
      </div>
      <h2 className={styles.successTitle}>
        It’s you — <em>verified.</em>
      </h2>
      <p className={styles.successSub}>
        Re-authentication confirmed. Taking you on to cancel your membership…
      </p>
      <Button variant="ghost-dark" className={styles.successBtn} onClick={onContinue}>
        Continue now <FiArrowRight aria-hidden />
      </Button>
    </div>
  )
}

/* ── Expired ──────────────────────────────────────────────── */
export function ExpiredPanel({ onRestart }: { onRestart: () => void }) {
  return (
    <div className={styles.expired}>
      <div className={styles.expiredIc}>
        <svg viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </div>
      <h2 className={styles.expiredTitle}>
        This check <em>timed out.</em>
      </h2>
      <p className={styles.expiredSub}>
        For your security, re-authentication only stays open for a few minutes. Start again to
        continue.
      </p>
      <Button variant="primary" onClick={onRestart}>
        Start over
      </Button>
    </div>
  )
}
