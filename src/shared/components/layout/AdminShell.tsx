import { type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { FiGrid, FiFlag, FiUsers, FiHome, FiBell, FiShield, FiTool, type IconType } from 'react-icons/fi'
import { useAdminRole } from '../../../features/admin/adminRole'
import { routes } from '../../../app/routeMap'
import styles from './AdminShell.module.css'

export const ADMIN_NAV: { label: string; to: string; icon: IconType }[] = [
  { label: 'Dashboard', to: routes.admin, icon: FiGrid },
  { label: 'Moderation', to: routes.adminModeration, icon: FiFlag },
  { label: 'Members', to: routes.adminMembers, icon: FiUsers },
  { label: 'Communities', to: routes.adminCommunities, icon: FiHome },
]

interface Crumb {
  label: string
  to?: string
}

export function AdminShell({
  children,
  title,
  breadcrumb = [],
}: {
  children: ReactNode
  title: ReactNode
  breadcrumb?: Crumb[]
}) {
  const { role } = useAdminRole()
  const isMod = role === 'mod'

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link to={routes.admin} className={styles.brand}>
          Queer<em>Pulse</em>
        </Link>
        {ADMIN_NAV.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === routes.admin}
            className={({ isActive }) =>
              [styles.navItem, isActive && styles.navItemActive].filter(Boolean).join(' ')
            }
          >
            <Icon aria-hidden />
            <span>{label}</span>
          </NavLink>
        ))}
        <div className={styles.spacer} />
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <nav className={styles.crumbs} aria-label="Breadcrumb">
            {breadcrumb.map((c) => (
              <span key={c.to ?? c.label} className={styles.crumbItem}>
                {c.to ? (
                  <Link to={c.to} className={styles.crumbLink}>
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
                <span aria-hidden>/</span>
              </span>
            ))}
          </nav>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.topbarSpacer} />
          <span className={[styles.badge, isMod ? styles.badgeMod : styles.badgeStaff].join(' ')}>
            {isMod ? <FiTool aria-hidden /> : <FiShield aria-hidden />}
            {isMod ? 'Mod' : 'Staff'}
          </span>
          <span className={styles.bell}>
            <FiBell aria-hidden />
            <span className={styles.bellDot} />
          </span>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  )
}
