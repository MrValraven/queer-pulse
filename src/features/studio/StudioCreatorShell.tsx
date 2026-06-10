import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import s from './creator.module.css'

const NAV = [
  { label: 'Dashboard', to: '/studio/dashboard' },
  { label: 'New release', to: '/studio/upload' },
  { label: 'Payouts', to: '/studio/payouts' },
]

/** Dark creator back-office frame: sticky topbar + sub-nav. */
export function StudioCreatorShell({ children }: { children: ReactNode }) {
  return (
    <div className={s.root}>
      <div className={s.topbar}>
        <Link to="/studio" className={s.brand}>
          <span className={s.pulseDot} aria-hidden />
          Queer<em>Pulse</em>
        </Link>
        <span className={s.product}>Creator</span>
        <nav className={s.subnav}>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => [s.navItem, isActive && s.navItemActive].filter(Boolean).join(' ')}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className={s.topRight}>
          <Link to="/studio/artist" className={s.back}>
            View public page →
          </Link>
          <div className={s.avatar}>MS</div>
        </div>
      </div>
      {children}
    </div>
  )
}
