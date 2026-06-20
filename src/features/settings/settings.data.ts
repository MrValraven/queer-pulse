import type { IconType } from 'react-icons'
import { FiAlertTriangle, FiBell, FiDroplet, FiEdit2, FiEye, FiHeart, FiLock, FiMessageCircle, FiPlayCircle, FiSettings, FiSliders } from 'react-icons/fi'

export type PaneId =
  | 'notifications'
  | 'language'
  | 'data'
  | 'visibility'
  | 'profile'
  | 'profile-theme'
  | 'accessibility'
  | 'interests'
  | 'account'
  | 'simulations'
  | 'delete'

export type NavItem = { id: PaneId; icon: IconType; label: string; danger?: boolean }

export const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: 'Preferences',
    items: [
      { id: 'notifications', icon: FiBell, label: 'Notifications' },
      { id: 'language', icon: FiMessageCircle, label: 'Language & terminology' },
    ],
  },
  {
    group: 'Privacy & data',
    items: [
      { id: 'data', icon: FiLock, label: 'Data & privacy' },
      { id: 'visibility', icon: FiEye, label: 'Visibility' },
    ],
  },
  {
    group: 'Account',
    items: [
      { id: 'profile', icon: FiEdit2, label: 'Profile' },
      { id: 'account', icon: FiSettings, label: 'Account' },
    ],
  },
  {
    group: 'Personalisation',
    items: [
      { id: 'profile-theme', icon: FiDroplet, label: 'Profile theme' },
      { id: 'accessibility', icon: FiSliders, label: 'Accessibility' },
      { id: 'interests', icon: FiHeart, label: 'Interests' },
    ],
  },
  {
    group: 'Prototype',
    items: [
      { id: 'simulations', icon: FiPlayCircle, label: 'Simulations' },
    ],
  },
  {
    group: 'Danger zone',
    items: [
      { id: 'delete', icon: FiAlertTriangle, label: 'Delete account', danger: true },
    ],
  },
]

export const TERMS = [
  { name: 'Queer', def: "An umbrella term for sexual and gender identities that aren't heterosexual or cisgender. Reclaimed from a slur; usage varies — some older members may prefer not to use it." },
  { name: 'Cisgender', def: 'Describes someone whose gender identity matches the sex they were assigned at birth. Not a value judgement — simply a neutral descriptor.' },
  { name: 'Non-binary', def: 'A gender identity that sits outside the man/woman binary. Some non-binary people use they/them; always ask rather than assume.' },
  { name: 'Two-spirit', def: 'A term used by some Indigenous North American cultures for a person embodying both masculine and feminine spirits. Not interchangeable with Western LGBTQ+ terms.' },
]
