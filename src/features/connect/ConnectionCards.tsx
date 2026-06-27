import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiFlag, FiMessageCircle, FiSlash, FiVolumeX } from 'react-icons/fi'
import { Button } from '../../shared/components/ui'
import { useConnect } from '../../app/providers/ConnectProvider'
import { useSocial } from '../../app/providers/SocialProvider'
import { useToast } from '../../shared/components/feedback/useToast'
import {
  PROFILE,
  type AllConnection,
  type IncomingRequest,
  type MetaInfo,
  type OutgoingRequest,
  type Person,
  type Tint,
  type VouchedConnection,
} from './connections.data'
import styles from './ConnectionsPage.module.css'

function avClass(tint: Tint) {
  if (tint === 'jade') return `${styles.av} ${styles.avJade}`
  if (tint === 'plum') return `${styles.av} ${styles.avPlum}`
  return styles.av
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="12" cy="19" r="2" />
  </svg>
)

/** Keyboard-accessible per-connection menu: Message / Mute / Block / Report. */
function ConnectionMoreMenu({ person }: { person: Person }) {
  const { openConnect } = useConnect()
  const { toggleMute, toggleBlock } = useSocial()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const id = slugify(person.name)
  const first = person.name.split(' ')[0]

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items: { label: string; icon: React.ReactNode; danger?: boolean; run: () => void }[] = [
    { label: 'Message', icon: <FiMessageCircle />, run: () => openConnect(id) },
    {
      label: `Mute ${first}`,
      icon: <FiVolumeX />,
      run: () => showToast(toggleMute(id) ? `Muted ${first}` : `Unmuted ${first}`, 'success'),
    },
    {
      label: `Block ${first}`,
      icon: <FiSlash />,
      danger: true,
      run: () => showToast(toggleBlock(id) ? `Blocked ${first}` : `Unblocked ${first}`, 'success'),
    },
    { label: 'Report', icon: <FiFlag />, danger: true, run: () => showToast(`Report sent for ${first}`, 'info') },
  ]

  return (
    <div className={styles.moreWrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.more}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More"
        onClick={() => setOpen((o) => !o)}
      >
        <MoreIcon />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              className={[styles.menuItem, item.danger && styles.menuDanger].filter(Boolean).join(' ')}
              onClick={() => {
                setOpen(false)
                item.run()
              }}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function CardHead({ person, more }: { person: Person; more?: boolean }) {
  return (
    <div className={styles.cardHead}>
      <Link to={PROFILE} className={avClass(person.tint)}>
        {person.initials}
      </Link>
      <div>
        <div className={styles.name}>
          <Link to={PROFILE}>{person.name}</Link>
        </div>
        <div className={styles.pron}>{person.pron}</div>
        <div className={styles.role}>{person.role}</div>
      </div>
      {more && <ConnectionMoreMenu person={person} />}
    </div>
  )
}

function ConnectionMeta({ m }: { m: MetaInfo }) {
  if (m.muted) return <span className={styles.metaMuted}>{m.muted}</span>
  return (
    <>
      {m.badge && <span className={styles.vouched}>{m.badge}</span>}
      {m.mutuals != null && (
        <span>
          <b>{m.mutuals}</b> mutuals{m.mutualsNote ? ` · ${m.mutualsNote}` : ''}
        </span>
      )}
      {m.connected && (
        <span>
          Connected <b>{m.connected}</b>
        </span>
      )}
      {m.sent && (
        <span>
          Sent <b>{m.sent}</b>
        </span>
      )}
    </>
  )
}

export function AllConnectionCard({ c }: { c: AllConnection }) {
  return (
    <div className={styles.card}>
      <CardHead person={c.person} more />
      <div className={styles.tags}>
        {c.tags.map((t) => (
          <span key={t} className={styles.tag}>
            {t}
          </span>
        ))}
      </div>
      <div className={styles.meta}>
        <ConnectionMeta m={c.meta} />
      </div>
      <div className={styles.actions}>
        {c.actions.map((a) => (
          <Button key={a.label} to={a.to} variant={a.variant}>
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

export function IncomingCard({
  c,
  onAccept,
  onDecline,
}: {
  c: IncomingRequest
  onAccept: (firstName: string) => void
  onDecline: () => void
}) {
  return (
    <div className={`${styles.card} ${styles.pending}`}>
      <CardHead person={c.person} />
      <div className={styles.meta}>
        <ConnectionMeta m={c.meta} />
      </div>
      {c.message && <p className={styles.reqMessage}>{c.message}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onDecline}>
          Decline
        </Button>
        <Button type="button" variant="primary" onClick={() => onAccept(c.person.name.split(' ')[0])}>
          Accept
        </Button>
      </div>
    </div>
  )
}

export function OutgoingCard({ c, onWithdraw }: { c: OutgoingRequest; onWithdraw: () => void }) {
  return (
    <div className={styles.card}>
      <CardHead person={c.person} />
      <div className={styles.meta}>
        <span className={styles.metaMuted}>
          Awaiting reply · sent <b>{c.meta.awaiting}</b>
        </span>
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="ghost" onClick={onWithdraw}>
          Withdraw
        </Button>
      </div>
    </div>
  )
}

export function VouchedCard({ c }: { c: VouchedConnection }) {
  return (
    <div className={styles.card}>
      <CardHead person={c.person} />
      <div className={styles.meta}>
        <span className={styles.vouched}>{c.note}</span>
      </div>
    </div>
  )
}
