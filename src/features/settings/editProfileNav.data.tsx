import type { ReactNode } from 'react'

export interface ProfileNavItem {
  /** DOM id of the section this item scrolls to. */
  id: string
  label: string
  group: string
  icon: ReactNode
}

/**
 * Left-sidebar items for the profile editor. Each `id` matches the `id` on a
 * section rendered by EditProfileSections, so clicking scrolls there and the
 * active state follows scroll position.
 */
export const PROFILE_NAV: ProfileNavItem[] = [
  {
    id: 'identity',
    label: 'Identity & photo',
    group: 'Profile',
    icon: <svg viewBox="0 0 16 16"><circle cx="8" cy="6" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>,
  },
  {
    id: 'pronouns',
    label: 'Pronouns & name',
    group: 'Profile',
    icon: <svg viewBox="0 0 16 16"><path d="M4 4h8M8 4v8M5 11l3 2 3-2" /></svg>,
  },
  {
    id: 'bio',
    label: 'Bio & occupation',
    group: 'Profile',
    icon: <svg viewBox="0 0 16 16"><path d="M3 4h10M3 8h8M3 12h5" /></svg>,
  },
  {
    id: 'skills',
    label: 'Skills & interests',
    group: 'Profile',
    icon: <svg viewBox="0 0 16 16"><polygon points="8,2 10.2,6 15,6.6 11.5,10 12.4,15 8,12.5 3.6,15 4.5,10 1,6.6 5.8,6" /></svg>,
  },
  {
    id: 'visibility',
    label: 'Field visibility',
    group: 'Privacy',
    icon: <svg viewBox="0 0 16 16"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" /></svg>,
  },
]

/** Human-readable label for each section id, used in the save confirmation. */
export const SECTION_LABELS: Record<string, string> = Object.fromEntries(
  PROFILE_NAV.map((n) => [n.id, n.label]),
)
