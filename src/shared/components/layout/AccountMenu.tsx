import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiShield, FiTool } from 'react-icons/fi'
import { Avatar } from '../ui'
import { useAuth } from '../../../app/providers/authContext'
import { routes, modPanel } from '../../../app/routeMap'
import { useAdminRole, DEMO_MOD_SLUG } from '../../../features/admin/adminRole'
import { currentUser, fullName } from '../../../features/members/data/members'
import styles from './AccountMenu.module.css'

/**
 * The canonical account links, grouped into clusters: identity, activity, and
 * system. The desktop AccountMenu renders the groups with dividers between
 * them; the mobile drawer in Navbar flattens them via ACCOUNT_ITEMS. Labels
 * are bare nouns (no "My"/"Your" mix) — the menu is already scoped to "you"
 * by the avatar header.
 */
export const ACCOUNT_GROUPS = [
  [
    { label: 'Profile', to: routes.accountProfile },
    { label: 'Connections', to: routes.connections },
    { label: 'Applications', to: routes.applicationStatus },
    { label: 'Work', to: routes.work },
    { label: 'Saved', to: routes.collections },
  ],
  [
    { label: 'Feed', to: '/feed' },
    { label: 'Messages', to: routes.messages },
    { label: 'Communities', to: routes.communitiesHome },
  ],
  [
    { label: 'Settings', to: routes.settings },
    { label: 'Help', to: routes.help },
  ],
]

/** Flattened links for the mobile drawer, which has no group dividers. */
export const ACCOUNT_ITEMS = ACCOUNT_GROUPS.flat()

/** Profile chip in the logged-in nav that opens a menu: profile, settings, sign out. */
export function AccountMenu({ name = fullName(currentUser), initials = currentUser.initials }: { name?: string; initials?: string }) {
  const { signOut } = useAuth()
  const { role, setRole } = useAdminRole()
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
          {ACCOUNT_GROUPS.map((group, i) => (
            <div key={i}>
              {i > 0 && <div className={styles.divider} />}
              {group.map((item) => (
                <Link key={item.to} to={item.to} role="menuitem" className={styles.item} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
          {role === 'staff' && (
            <>
              <div className={styles.divider} />
              <Link to={routes.admin} role="menuitem" className={styles.item} onClick={() => setOpen(false)}>
                <FiShield aria-hidden className={styles.itemIcon} /> Admin dashboard
              </Link>
            </>
          )}
          {role === 'mod' && (
            <>
              <div className={styles.divider} />
              <Link to={modPanel(DEMO_MOD_SLUG)} role="menuitem" className={styles.item} onClick={() => setOpen(false)}>
                <FiTool aria-hidden className={styles.itemIcon} /> Mod tools
              </Link>
            </>
          )}
          <div className={styles.divider} />
          <div className={styles.roleLabel}>Acting as</div>
          <div className={styles.roleSwitch} role="group" aria-label="Simulated team role">
            {(['staff', 'mod', 'member'] as const).map((r) => (
              <button
                key={r}
                type="button"
                className={[styles.roleBtn, role === r && styles.roleBtnActive].filter(Boolean).join(' ')}
                onClick={() => setRole(r)}
              >
                {r === 'staff' ? 'Staff' : r === 'mod' ? 'Mod' : 'Member'}
              </button>
            ))}
          </div>
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
