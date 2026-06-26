import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../ui'
import { useAuth } from '../../../app/providers/authContext'
import { routes } from '../../../app/routeMap'
import { currentUser, fullName } from '../../../features/members/data/members'
import styles from './AccountMenu.module.css'

const ITEMS = [
  { label: 'Feed', to: '/feed' },
  { label: 'Messages', to: routes.messages },
  { label: 'My profile', to: routes.accountProfile },
  { label: 'Your connections', to: routes.connections },
  { label: 'Your applications', to: routes.applicationStatus },
  { label: 'Your Work', to: routes.work },
  { label: 'Settings', to: routes.settings },
]

/** Profile chip in the logged-in nav that opens a menu: profile, settings, sign out. */
export function AccountMenu({ name = fullName(currentUser), initials = currentUser.initials }: { name?: string; initials?: string }) {
  const { signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar initials={initials} tint="coral" size={28} />
        <span className={styles.name}>{name.split(' ')[0]}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <div className={styles.header}>
            <Avatar initials={initials} tint="coral" size={36} />
            <div>
              <div className={styles.headerName}>{name}</div>
              <div className={styles.headerMeta}>Profile &amp; account</div>
            </div>
          </div>
          {ITEMS.map((item) => (
            <Link key={item.to} to={item.to} role="menuitem" className={styles.item} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <div className={styles.divider} />
          <Link
            to="/"
            role="menuitem"
            className={`${styles.item} ${styles.signOut}`}
            onClick={() => {
              signOut()
              setOpen(false)
            }}
          >
            Sign out
          </Link>
        </div>
      )}
    </div>
  )
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={[styles.chevron, open && styles.chevronOpen].filter(Boolean).join(' ')}
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
