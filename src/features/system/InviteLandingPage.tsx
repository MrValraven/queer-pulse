import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { routes } from '../../app/routeMap'
import styles from './InviteLandingPage.module.css'

const INVITER_NAME = 'Rita Fonseca'
const INVITER_INITIALS = 'RF'
const INVITE_CODE = 'QP-7F3K-2026'
const EXPIRY_DATE = '12 June 2026'
const INVITER_MESSAGE =
  '"I\'ve been part of this community for two years now. It\'s the one platform I\'m genuinely glad exists. I think you\'d belong here."'

export function InviteLandingPage() {
  const [joined, setJoined] = useState(false)
  const [consent, setConsent] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setJoined(true)
  }

  if (joined) {
    return (
      <div className={styles.root}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>
            <svg width={28} height={28} viewBox="0 0 28 28" fill="none" aria-hidden>
              <polyline
                points="4,14 10,20 24,7"
                stroke="var(--jade)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className={styles.successHeading}>
            Welcome to <em>QueerPulse.</em>
          </h2>
          <p className={styles.successLead}>
            Your account is ready. Take a minute to set up your profile before jumping in.
          </p>
          <div className={styles.successActions}>
            <Button to={routes.editProfile} size="lg" className={styles.submitBtn}>
              Set up my profile
            </Button>
            <Button variant="ghost" to="/" className={styles.submitBtn}>
              Go to homepage
            </Button>
          </div>
        </div>
        <div className={styles.pageFooter}>
          <p>
            Not expecting this?{' '}
            <Link to={routes.privacy}>Privacy policy</Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandDot} aria-hidden />
            Queer<em>Pulse</em>
          </Link>
          <div className={styles.inviterRow}>
            <div className={styles.inviterAvatar} aria-hidden>
              {INVITER_INITIALS}
            </div>
            <div>
              <div className={styles.inviterName}>{INVITER_NAME}</div>
              <div className={styles.inviterNote}>Member since February 2023 · invited you</div>
            </div>
          </div>
          <h1 className={styles.heading}>
            You've been <em>invited.</em>
          </h1>
          <p className={styles.headerNote}>
            This link was created for you personally. It expires in 7 days and can only be used
            once.
          </p>
        </div>

        {/* Personal message */}
        <div className={styles.message}>
          <div className={styles.messageLabel}>A note from Rita</div>
          <div className={styles.messageText}>{INVITER_MESSAGE}</div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.whatList}>
            <div className={styles.whatItem}>
              <div className={styles.whatDot} aria-hidden />
              <div className={styles.whatText}>
                <strong>Private by design.</strong> Invite-only. 247 members. Not trying to grow
                for growth's sake.
              </div>
            </div>
            <div className={styles.whatItem}>
              <div className={styles.whatDot} aria-hidden />
              <div className={styles.whatText}>
                <strong>No ads. No algorithm.</strong> A platform that works for you, not for
                advertisers.
              </div>
            </div>
            <div className={styles.whatItem}>
              <div className={styles.whatDot} aria-hidden />
              <div className={styles.whatText}>
                <strong>Real community.</strong> Forum, events, a monthly magazine, and a mental
                health fund.
              </div>
            </div>
          </div>

          <div className={styles.tokenBadge}>
            <div>
              <div className={styles.tokenLabel}>Your invite code</div>
              <div className={styles.tokenCode}>{INVITE_CODE}</div>
            </div>
            <div className={styles.tokenExpiry}>7 days left</div>
          </div>

          <div className={styles.expiryRow}>
            <svg viewBox="0 0 14 14" aria-hidden>
              <circle cx="7" cy="7" r="5.5" />
              <polyline points="7,4 7,7 9,9" />
            </svg>
            <span>
              Invite expires <span>{EXPIRY_DATE}</span>
            </span>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              className={styles.input}
              type="text"
              placeholder="Your name"
              required
              autoComplete="name"
            />
            <input
              className={styles.input}
              type="email"
              placeholder="Email address"
              required
              autoComplete="email"
            />
            <input
              className={styles.input}
              type="password"
              placeholder="Choose a password"
              required
              autoComplete="new-password"
              minLength={8}
            />
            <div className={styles.consentRow}>
              <input
                type="checkbox"
                className={styles.checkbox}
                id="consentCheck"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
              />
              <label htmlFor="consentCheck" className={styles.consentText}>
                I've read the{' '}
                <Link to={routes.terms}>terms of use</Link> and{' '}
                <Link to={routes.privacy}>privacy policy</Link> and I'm
                happy to join.
              </label>
            </div>
            <Button type="submit" size="lg" className={styles.submitBtn}>
              Create my account
            </Button>
          </form>

          <p className={styles.alreadyMember}>
            Already have an account?{' '}
            <Link to={routes.signIn}>Sign in</Link>
          </p>
        </div>
      </div>

      <div className={styles.pageFooter}>
        <p>
          Not expecting this?{' '}
          <Link to={routes.privacy}>Privacy policy</Link>
        </p>
      </div>
    </div>
  )
}
