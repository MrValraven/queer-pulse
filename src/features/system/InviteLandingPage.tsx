import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../shared/components/ui'
import { usePrefersReducedMotion } from '../../shared/hooks'
import { getMember } from '../members/data/members'
import { routes } from '../../app/routeMap'
import styles from './InviteLandingPage.module.css'

const INVITER = getMember('ines')!
const INVITER_NAME = `${INVITER.first} ${INVITER.last}`
const INVITER_FIRST = INVITER.first
const INVITE_CODE = 'QP-7F3K-2026'
const EXPIRY_DATE = '12 June 2026'
const INVITER_MESSAGE =
  '"I\'ve been part of this community for two years now. It\'s the one platform I\'m genuinely glad exists. I think you\'d belong here."'

const LOADER_STEPS = [
  'Verifying your invite code…',
  `Unsealing ${INVITER_FIRST}'s invitation…`,
  'Preparing your welcome…',
]

function InviterAvatar({ className }: { className: string }) {
  return (
    <div className={className} aria-hidden>
      {INVITER.photo ? (
        <img className={styles.avatarPhoto} src={INVITER.photo} alt="" />
      ) : (
        INVITER.initials
      )}
    </div>
  )
}

type Phase = 'sealed' | 'opening' | 'invite'

export function InviteLandingPage() {
  const prefersReduced = usePrefersReducedMotion()
  const [phase, setPhase] = useState<Phase>('sealed')
  const [step, setStep] = useState(0)
  const [joined, setJoined] = useState(false)

  function openInvitation() {
    if (prefersReduced) {
      setPhase('invite')
      return
    }
    setPhase('opening')
  }

  useEffect(() => {
    if (phase !== 'opening') return
    const stepMs = 800
    const stepTimers = LOADER_STEPS.map((_, i) =>
      window.setTimeout(() => setStep(i), i * stepMs),
    )
    const done = window.setTimeout(() => setPhase('invite'), LOADER_STEPS.length * stepMs + 350)
    return () => {
      stepTimers.forEach(clearTimeout)
      clearTimeout(done)
    }
  }, [phase])

  function createAccount() {
    setJoined(true)
  }

  if (phase === 'sealed') {
    return (
      <div className={styles.root}>
        <div className={styles.sealed}>
          <div className={`${styles.seal} ${styles.sealStatic}`} aria-hidden>
            <svg className={styles.sealRingStatic} viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="44" />
            </svg>
            <InviterAvatar className={styles.sealAvatar} />
          </div>
          <div className={styles.loaderBrand}>
            Queer<em>Pulse</em>
          </div>
          <div className={styles.sealedEyebrow}>A personal invitation awaits</div>
          <h1 className={styles.loaderTitle}>
            <em>{INVITER_NAME}</em> invited you.
          </h1>
          <p className={styles.sealedSub}>
            Invite-only · 247 members. This link was created for you and can only be opened once.
          </p>
          <Button size="lg" onClick={openInvitation} className={styles.sealedBtn}>
            Open invitation
          </Button>
        </div>
      </div>
    )
  }

  if (phase === 'opening') {
    return (
      <div className={styles.root}>
        <div className={styles.loader}>
          <div className={styles.seal} aria-hidden>
            <svg className={styles.sealRing} viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="44" />
            </svg>
            <InviterAvatar className={styles.sealAvatar} />
          </div>
          <div className={styles.loaderBrand}>
            Queer<em>Pulse</em>
          </div>
          <h1 className={styles.loaderTitle}>
            An invitation from <em>{INVITER_NAME.split(' ')[0]}.</em>
          </h1>
          <p className={styles.loaderStatus} role="status" aria-live="polite">
            {LOADER_STEPS[step]}
          </p>
          <div className={styles.loaderBar}>
            <div className={styles.loaderBarFill} />
          </div>
        </div>
      </div>
    )
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
            <InviterAvatar className={styles.inviterAvatar} />
            <div>
              <div className={styles.inviterName}>{INVITER_NAME}</div>
              <div className={styles.inviterNote}>Member since {INVITER.since} · invited you</div>
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
          <div className={styles.messageLabel}>A note from {INVITER_FIRST}</div>
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

          <button type="button" className={styles.google} onClick={createAccount}>
            <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden>
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className={styles.consentNote}>
            By continuing you agree to our{' '}
            <Link to={routes.terms}>terms of use</Link> and{' '}
            <Link to={routes.privacy}>privacy policy</Link>.
          </p>

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
