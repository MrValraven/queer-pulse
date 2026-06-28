import { FiGrid, FiShield, FiUsers, FiGlobe, FiAward } from 'react-icons/fi'
import type { IconType } from 'react-icons'
import { routes } from '../../../app/routeMap'

export interface AdminNavItem {
  label: string
  to: string
  icon: IconType
  end?: boolean
  /** Optional pending count shown as a pill. */
  count?: number
  /** Pill tone: 'alert' (red) for urgent, 'warn' (amber) for waiting. */
  tone?: 'alert' | 'warn'
}

export const ADMIN_NAV: AdminNavItem[] = [
  { label: 'Overview', to: routes.admin, icon: FiGrid, end: true },
  { label: 'Moderation', to: routes.adminModeration, icon: FiShield, count: 23, tone: 'alert' },
  { label: 'Members', to: routes.adminMembers, icon: FiUsers, count: 11, tone: 'warn' },
  { label: 'Communities', to: routes.adminCommunities, icon: FiGlobe },
  { label: 'Governance', to: routes.adminGovernance, icon: FiAward },
]

export interface StewardedCommunity {
  initials: string
  name: string
  meta: string
  /** Avatar tint as inline rgba pair (bg alpha / text). */
  tintBg: string
  tintFg: string
}

/** Communities the signed-in admin moderates — shown in the role switcher. */
export const STEWARDED: StewardedCommunity[] = [
  {
    initials: 'TR',
    name: 'Trans & Friends',
    meta: 'Moderator · 1,204 members',
    tintBg: 'rgba(var(--jade-rgb),.22)',
    tintFg: 'var(--jade)',
  },
  {
    initials: 'QC',
    name: 'Queer Creatives',
    meta: 'Moderator · 842 members',
    tintBg: 'rgba(var(--violet-rgb),.22)',
    tintFg: 'var(--violet)',
  },
]

/** The signed-in admin (prototype identity). */
export const ADMIN_PROFILE = {
  initials: 'JS',
  name: 'Júlia Saraiva',
  role: 'Trust & Safety lead',
}
