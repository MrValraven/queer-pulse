import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { IconType } from 'react-icons'
import {
  FiShield,
  FiTool,
  FiUser,
  FiUserPlus,
  FiFileText,
  FiBriefcase,
  FiBookmark,
  FiRss,
  FiCalendar,
  FiMessageSquare,
  FiUsers,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
} from 'react-icons/fi'
import { Avatar } from '../ui'
import { useAuth } from '../../../app/providers/authContext'
import { routes, modPanel } from '../../../app/routeMap'
import { useAdminRole, DEMO_MOD_SLUG } from '../../../features/admin/adminRole'
import { currentUser, fullName } from '../../../features/members/data/members'
import styles from './AccountMenu.module.css'

type AccountItem = { label: string; to: string; icon: IconType }

/**
 * The canonical account links, grouped by type. Each inner array is a cluster;
 * flattened in order they fill the desktop two-column grid row by row, so each
 * pair of consecutive items reads as a category (people, talking & belonging,
 * career, activity, your stuff / system). The mobile drawer in Navbar flattens
 * them via ACCOUNT_ITEMS, ignoring the icon. Labels are bare nouns (no
 * "My"/"Your" mix) — the menu is already scoped to "you" by the avatar header.
 */
export const ACCOUNT_GROUPS: AccountItem[][] = [
  // You / people
  [
    { label: 'Profile', to: routes.accountProfile, icon: FiUser },
    { label: 'Connections', to: routes.connections, icon: FiUserPlus },
  ],
  // Talking & belonging
  [
    { label: 'Messages', to: routes.messages, icon: FiMessageSquare },
    { label: 'Communities', to: routes.communitiesHome, icon: FiUsers },
  ],
  // Career
  [
    { label: 'Applications', to: routes.applicationStatus, icon: FiFileText },
    { label: 'Work', to: routes.work, icon: FiBriefcase },
  ],
  // Activity
  [
    { label: 'Events', to: routes.myEvents, icon: FiCalendar },
    { label: 'Feed', to: '/feed', icon: FiRss },
  ],
  // Your stuff / system
  [
    { label: 'Saved', to: routes.collections, icon: FiBookmark },
    { label: 'Settings', to: routes.settings, icon: FiSettings },
    { label: 'Help', to: routes.help, icon: FiHelpCircle },
  ],
]

/** Flattened links for the mobile drawer and the desktop icon grid. */
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
            <div className={styles.headerText}>
              <div className={styles.headerName}>{name}</div>
              <div className={styles.headerMeta}>Profile &amp; account</div>
            </div>
          </div>

          <div className={styles.scroll}>
            <div className={styles.grid}>
              {ACCOUNT_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.to} to={item.to} role="menuitem" className={styles.item} onClick={() => setOpen(false)}>
                    <Icon aria-hidden className={styles.itemIcon} />
                    <span className={styles.itemLabel}>{item.label}</span>
                  </Link>
                )
              })}
              {role === 'staff' && (
                <Link to={routes.admin} role="menuitem" className={styles.item} onClick={() => setOpen(false)}>
                  <FiShield aria-hidden className={styles.itemIcon} />
                  <span className={styles.itemLabel}>Admin</span>
                </Link>
              )}
              {role === 'mod' && (
                <Link to={modPanel(DEMO_MOD_SLUG)} role="menuitem" className={styles.item} onClick={() => setOpen(false)}>
                  <FiTool aria-hidden className={styles.itemIcon} />
                  <span className={styles.itemLabel}>Mod tools</span>
                </Link>
              )}
            </div>
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
          </div>

          <div className={styles.footer}>
            <Link
              to="/"
              role="menuitem"
              className={`${styles.item} ${styles.signOut}`}
              onClick={() => {
                signOut()
                setOpen(false)
              }}
            >
              <FiLogOut aria-hidden className={styles.itemIcon} />
              <span className={styles.itemLabel}>Sign out</span>
            </Link>
          </div>
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
