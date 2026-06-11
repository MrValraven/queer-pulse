import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { Button } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { routes } from '../../app/routeMap'
import { ACTIVE_SESSIONS, TRUSTED_DEVICES, type Session, type TrustedDevice } from './sessions.data'
import styles from './SessionsPage.module.css'

function DesktopIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}
function MobileIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  )
}

function SessionCard({ session, onSignOut }: { session: Session; onSignOut: (id: string) => void }) {
  const isCurrent = session.variant === 'current'
  const isSuspect = session.variant === 'suspect'
  const isTrusted = session.variant === 'trusted'
  const cardCls = [
    styles.card,
    isCurrent && styles.cardCurrent,
    isSuspect && styles.cardSuspect,
  ].filter(Boolean).join(' ')
  const icCls = [
    styles.ic,
    session.deviceType === 'mobile' && styles.icMobile,
    isSuspect && styles.icSuspect,
  ].filter(Boolean).join(' ')

  return (
    <div className={cardCls}>
      <div className={icCls}>
        {session.deviceType === 'mobile' ? <MobileIcon /> : <DesktopIcon />}
      </div>
      <div className={styles.details}>
        <div className={styles.metaRow}>
          <span className={styles.name}>{session.device}</span>
          {isCurrent && <span className={`${styles.badge} ${styles.badgeThis}`}>This session</span>}
          {isSuspect && <span className={`${styles.badge} ${styles.badgeSuspect}`}>Review</span>}
          {isTrusted && <span className={`${styles.badge} ${styles.badgeTrusted}`}>Trusted</span>}
        </div>
        <div className={`${styles.row} ${isSuspect ? styles.rowSuspect : ''}`}>
          <span dangerouslySetInnerHTML={{ __html: session.loc.replace(/\b(Lisbon|Madrid|Atelier Pulso office, Largo do Carmo|home network|MEO mobile|unfamiliar network|home)\b/g, '<b>$1</b>') }} />
          <span className={styles.sep}>·</span>
          <span>Signed in <b>{session.signedIn}</b></span>
        </div>
        <div className={styles.row}>
          <span>Last activity <b>{session.lastActivity}</b></span>
          {session.extra && <><span className={styles.sep}>·</span><span>{session.extra}</span></>}
        </div>
      </div>
      {isCurrent
        ? <button className={`${styles.action} ${styles.actionCurrent}`}>Current</button>
        : <button className={`${styles.action} ${isSuspect ? styles.actionSuspect : ''}`} onClick={() => onSignOut(session.id)}>Sign out</button>
      }
    </div>
  )
}

function TrustedDeviceCard({ device, onUntrust }: { device: TrustedDevice; onUntrust: (id: string) => void }) {
  return (
    <div className={styles.card}>
      <div className={device.deviceType === 'mobile' ? `${styles.ic} ${styles.icMobile}` : styles.ic}>
        {device.deviceType === 'mobile' ? <MobileIcon /> : <DesktopIcon />}
      </div>
      <div className={styles.details}>
        <div className={styles.metaRow}>
          <span className={styles.name}>{device.device}</span>
          <span className={`${styles.badge} ${styles.badgeTrusted}`}>Trusted</span>
        </div>
        <div className={styles.row}>
          <span>Trusted since <b>{device.since}</b></span>
          {device.extra && <><span className={styles.sep}>·</span><span>{device.extra}</span></>}
        </div>
      </div>
      <button className={styles.action} onClick={() => onUntrust(device.id)}>Untrust</button>
    </div>
  )
}

export function SessionsPage() {
  const { showToast } = useToast()
  const [signedOut, setSignedOut] = useState<Set<string>>(new Set())
  const [untrusted, setUntrusted] = useState<Set<string>>(new Set())

  function handleSignOut(id: string) {
    setSignedOut((prev) => new Set(prev).add(id))
    showToast('Session ended', 'success')
  }
  function handleUntrust(id: string) {
    setUntrusted((prev) => new Set(prev).add(id))
    showToast('Device removed from trusted list', 'info')
  }
  function handleSignOutAll() {
    const ids = ACTIVE_SESSIONS.filter((s) => s.variant !== 'current').map((s) => s.id)
    setSignedOut(new Set(ids))
    showToast('All other sessions signed out', 'success')
  }

  const activeSessions = ACTIVE_SESSIONS.filter((s) => !signedOut.has(s.id))
  const trustedDevices = TRUSTED_DEVICES.filter((d) => !untrusted.has(d.id))

  return (
    <AppShell>
      <div className={styles.page}>
        <Link to={routes.security} className={styles.back}>← Security</Link>

        <div className={styles.eyebrow}>Security · Active sessions</div>
        <h1 className={styles.h1}>Where you're <em>signed in</em> right now.</h1>
        <p className={styles.lead}>
          Every device with an active session. If something here looks unfamiliar, sign it out — and read{' '}
          <Link to={routes.accountLocked}>what to do next</Link>.
        </p>

        <div className={styles.bulkRow}>
          <p>You're signed in on <b>5 devices</b>. <b>1 is on a network we haven't seen before</b> — review it.</p>
          <Button variant="primary" onClick={handleSignOutAll}>Sign out all other sessions</Button>
        </div>

        <div className={styles.sectionH}>Active now</div>
        <div className={styles.list}>
          {activeSessions.map((s) => (
            <SessionCard key={s.id} session={s} onSignOut={handleSignOut} />
          ))}
        </div>

        <div className={styles.sectionH}>Trusted devices · skip 2FA</div>
        <div className={styles.list}>
          {trustedDevices.map((d) => (
            <TrustedDeviceCard key={d.id} device={d} onUntrust={handleUntrust} />
          ))}
        </div>

        <div className={styles.footNote}>
          <b>Something looks wrong?</b> If you didn't sign in from Madrid, sign that session out, then{' '}
          <Link to={routes.passwordReset}>reset your password</Link> and{' '}
          <Link to={routes.twoFactorSetup}>re-issue your backup codes</Link>. We'll send an email to the address on file with the full incident report.
        </div>
      </div>
    </AppShell>
  )
}
