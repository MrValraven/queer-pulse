import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AppShell } from '../../shared/components/layout'
import { Button, FadeIn, SkeletonLine } from '../../shared/components/ui'
import { useToast } from '../../shared/components/feedback/useToast'
import { useSimulatedLoad } from '../../shared/hooks'
import { routes } from '../../app/routeMap'
import { SIGN_IN_METHODS, CONNECTED_APPS } from './linkedAccounts.data'
import { LINK_PROVIDERS } from './integrations.data'
import { LinkProviderModal } from './LinkProviderModal'
import { IntegrationsModal } from './IntegrationsModal'
import styles from './LinkedAccountsPage.module.css'

/** Mirrors a connection .row so there's no layout shift when content loads. */
function ConnectionSkeleton() {
  return (
    <div className={styles.row}>
      <SkeletonLine width={48} height={48} style={{ borderRadius: 12 }} />
      <div className={styles.info}>
        <SkeletonLine width="50%" height={15} />
        <SkeletonLine width="78%" height={13} style={{ marginTop: 7 }} />
      </div>
      <div className={styles.state}>
        <SkeletonLine width={64} height={18} style={{ borderRadius: 5 }} />
        <SkeletonLine width={78} height={32} style={{ borderRadius: 999 }} />
      </div>
    </div>
  )
}

export function LinkedAccountsPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const loading = useSimulatedLoad()
  const [revokedIds, setRevokedIds] = useState<Set<string>>(new Set())
  const [linkedIds, setLinkedIds] = useState<Set<string>>(new Set())
  const [linkProviderId, setLinkProviderId] = useState<string | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)

  function handleUnlink(id: string) {
    if (window.confirm('Unlink/revoke this connection? You can re-link anytime.')) {
      setRevokedIds((prev) => new Set(prev).add(id))
      showToast('Connection revoked', 'success')
    }
  }

  function handleLinked(id: string) {
    setLinkedIds((prev) => new Set(prev).add(id))
  }

  function handleCopyCalendar() {
    navigator.clipboard?.writeText('https://queerpulse.app/cal/tomas.ics')
    showToast('Calendar URL copied', 'success')
  }

  const iconClass: Record<string, string> = {
    google: styles.iconGoogle,
    apple: styles.iconApple,
    magic: styles.iconMagic,
    passkey: styles.iconPasskey,
    discord: styles.iconDiscord,
    bluesky: styles.iconBluesky,
    arena: styles.iconArena,
    calendar: styles.iconCalendar,
  }

  return (
    <AppShell>
      <div className={styles.page}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Security</button>
        <div className={styles.eyebrow}>Security · Linked accounts</div>
        <h1 className={styles.heading}>Sign-in methods &amp; <em>connected apps.</em></h1>
        <p className={styles.lead}>Two separate lists. <b>Sign-in methods</b> are alternative ways to sign in to QueerPulse. <b>Connected apps</b> are third-party services you've given limited access to. <em>You can revoke either, any time.</em></p>

        <div className={styles.sectionH}>Sign-in methods</div>
        <div className={styles.list}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ConnectionSkeleton key={i} />)
            : SIGN_IN_METHODS.map((m, i) => {
            const revoked = revokedIds.has(m.id)
            const linked = linkedIds.has(m.id)
            return (
              <FadeIn key={m.id} delay={Math.min(i, 8) * 60} className={styles.row}>
                <div className={`${styles.icon} ${iconClass[m.id] ?? ''}`}>
                  <SignInIcon id={m.id} />
                </div>
                <div className={styles.info}>
                  <b className={styles.infoName}>{m.name}</b>
                  <span className={styles.infoDetail}>{m.detail}</span>
                </div>
                <div className={styles.state}>
                  <span className={`${styles.badge} ${m.linked || linked ? styles.badgeLinked : styles.badgeUnlinked}`}>{revoked ? 'Unlinked' : linked ? 'Linked' : m.badgeText}</span>
                  {m.canUnlink && !revoked && <Button variant="ghost" className={`${styles.rowBtn} ${styles.rowBtnUnlink}`} onClick={() => handleUnlink(m.id)}>Unlink</Button>}
                  {m.canLink && !linked && <Button variant="primary" className={`${styles.rowBtn} ${styles.rowBtnConnect}`} onClick={() => setLinkProviderId(m.id)}>Link</Button>}
                  {m.defaultDisabled && <Button variant="ghost" className={`${styles.rowBtn} ${styles.rowBtnDisabled}`} disabled>Default</Button>}
                  {m.canManage && <Button variant="ghost" className={styles.rowBtn} onClick={() => navigate(routes.sessions)}>Manage</Button>}
                </div>
              </FadeIn>
            )
          })}
        </div>

        <div className={styles.ssoNote}>
          <b>About SSO and privacy.</b> Linking Google or Apple means those services know you have a QueerPulse account, but not what you do here. <em>They never see your messages, posts, or community memberships.</em> If you're worried about a workplace Google linking to your queer life, use magic-link instead — it's our most private option.
        </div>

        <div className={styles.sectionH}>Connected apps · third-party access</div>
        <div className={styles.list}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ConnectionSkeleton key={i} />)
            : CONNECTED_APPS.map((app, i) => {
            const revoked = revokedIds.has(app.id)
            return (
              <FadeIn key={app.id} delay={Math.min(i, 8) * 60} className={styles.row}>
                <div className={`${styles.icon} ${iconClass[app.id] ?? ''}`}>
                  <AppIcon id={app.id} />
                </div>
                <div className={styles.info}>
                  <b className={styles.infoName}>{app.name}</b>
                  <span className={styles.infoDetail}>{app.detail}</span>
                </div>
                <div className={styles.state}>
                  <span className={`${styles.badge} ${styles.badgeLinked}`}>{revoked ? 'Revoked' : app.badgeText}</span>
                  {app.canRevoke && !revoked && <Button variant="ghost" className={`${styles.rowBtn} ${styles.rowBtnUnlink}`} onClick={() => handleUnlink(app.id)}>Revoke</Button>}
                  {app.canCopy && <Button variant="ghost" className={styles.rowBtn} onClick={handleCopyCalendar}>Copy URL</Button>}
                </div>
              </FadeIn>
            )
          })}
        </div>

        <div className={styles.sectionH}>Connect another</div>
        <div className={styles.list}>
          <div className={`${styles.row} ${styles.rowDashed}`}>
            <div className={`${styles.icon} ${styles.iconAdd}`}>+</div>
            <div className={styles.info}>
              <b className={styles.infoName}>Browse available integrations</b>
              <span className={styles.infoDetail}>Stripe (Sustainer billing), Mastodon, Spotify (Audio Rooms), iCal export, and 4 more</span>
            </div>
            <Button variant="primary" className={`${styles.rowBtn} ${styles.rowBtnConnect}`} onClick={() => setGalleryOpen(true)}>Browse</Button>
          </div>
        </div>

        <div className={`${styles.ssoNote} ${styles.ssoNoteAccent}`}>
          <b>Permissions are scoped narrowly.</b> No connected app can read your DMs, your draft posts, your billing, or your community memberships. If you ever want a full audit, request a <Link to={routes.dataExport} style={{ color: 'var(--plum)', fontWeight: 700, textDecoration: 'none' }}>data export</Link>.
        </div>
      </div>

      {linkProviderId && LINK_PROVIDERS[linkProviderId] && (
        <LinkProviderModal
          provider={LINK_PROVIDERS[linkProviderId]}
          onClose={() => setLinkProviderId(null)}
          onLinked={() => handleLinked(linkProviderId)}
        />
      )}
      {galleryOpen && <IntegrationsModal onClose={() => setGalleryOpen(false)} />}
    </AppShell>
  )
}

function SignInIcon({ id }: { id: string }) {
  if (id === 'google') return <span>G</span>
  if (id === 'apple') return (
    <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
  if (id === 'magic') return (
    <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
      <path d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z" stroke="#fff" strokeWidth="1.6" fill="none" />
      <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  if (id === 'passkey') return (
    <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
      <path d="M19 11H5m14 0a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2m14 0V7a7 7 0 1 0-14 0v4" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  )
  return null
}

function AppIcon({ id }: { id: string }) {
  if (id === 'discord') return (
    <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
      <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
      <path d="M5 8c2.5-1.5 9.5-1.5 14 0M5 16c2.5 1.5 9.5 1.5 14 0" stroke="#fff" fill="none" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
  if (id === 'bluesky') return (
    <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
      <path d="M5 4l9.5 9.5L5 23h2.5l8.5-8.5L21 21h-3l-7-7-7 7H1.5L11 11.5 1.5 2H5z" />
    </svg>
  )
  if (id === 'arena') return (
    <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
      <rect x="3" y="4" width="18" height="16" rx="3" />
    </svg>
  )
  if (id === 'calendar') return (
    <svg viewBox="0 0 24 24" fill="#fff" width="22" height="22">
      <path d="M3 10h18M3 14h18M7 6v12M17 6v12" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  )
  return null
}
