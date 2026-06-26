import type { ReactNode } from 'react'
import { FiCheck } from 'react-icons/fi'
import { currentUser, fullName } from './data/members'

export type BadgeRarity = 'common' | 'rare' | 'legendary'
export type BadgeTint = 'jade' | 'accent' | 'plum'

export interface Badge {
  cat: string
  name: string
  when: string
  rarity: BadgeRarity
  tint: BadgeTint
  icon: ReactNode
}

export interface LevelInfo {
  level: number
  name: string
  xp: number
  xpMax: number
  percent: number
  xpToNext: number
  nextName: string
  member: string
  since: string
}

export interface LadderPill {
  num: number
  name: string
  state: 'done' | 'current' | 'locked'
}

export type PerkRowState = 'achieved' | 'current' | 'locked'

export interface PerkLadderRow {
  num: number
  name: string
  state: PerkRowState
  perks: string[]
  status: ReactNode
}

/** Total badges still to discover (more exist in the catalogue than are shown). */
export const discoverCount = 28

export const levelInfo: LevelInfo = {
  level: 4,
  name: 'Familiar',
  xp: 680,
  xpMax: 1000,
  percent: 68,
  xpToNext: 320,
  nextName: 'Trusted',
  member: fullName(currentUser),
  since: 'Jan 2025',
}

export const levelLadder: LadderPill[] = [
  { num: 1, name: 'Newcomer', state: 'done' },
  { num: 2, name: 'Explorer', state: 'done' },
  { num: 3, name: 'Regular', state: 'done' },
  { num: 4, name: 'Familiar', state: 'current' },
  { num: 5, name: 'Trusted', state: 'locked' },
  { num: 6, name: 'Anchor', state: 'locked' },
  { num: 7, name: 'Pillar', state: 'locked' },
]

const s = (tint: BadgeTint) => `var(--${tint})`

export const earnedBadges: Badge[] = [
  {
    cat: 'Attendance',
    name: 'First Gathering',
    when: 'Pride Brunch · Jun 2025',
    rarity: 'common',
    tint: 'jade',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect x="4" y="5" width="20" height="18" rx="2" stroke={s('jade')} strokeWidth="1.8" />
        <path d="M4 10h20M9 3v4M19 3v4" stroke={s('jade')} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9 16l3 3 7-6" stroke={s('jade')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    cat: 'Attendance',
    name: "Three's Company",
    when: '3 gatherings attended',
    rarity: 'common',
    tint: 'jade',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="10" cy="14" r="4.5" stroke={s('jade')} strokeWidth="1.8" />
        <circle cx="18" cy="10" r="4.5" stroke={s('jade')} strokeWidth="1.8" />
        <circle cx="18" cy="18" r="4.5" stroke={s('jade')} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    cat: 'Attendance',
    name: 'Regular',
    when: '5 gatherings in one year',
    rarity: 'rare',
    tint: 'accent',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M14 6a8 8 0 1 1-5.66 13.66" stroke={s('accent')} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 14l-3-3-3 3" stroke={s('accent')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    cat: 'Community',
    name: 'Connector',
    when: '10 connections made',
    rarity: 'common',
    tint: 'jade',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="9" cy="14" r="3.5" stroke={s('jade')} strokeWidth="1.8" />
        <circle cx="19" cy="14" r="3.5" stroke={s('jade')} strokeWidth="1.8" />
        <path d="M12.5 14h3" stroke={s('jade')} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5.5 20c0-2 1.6-3.5 3.5-3.5M15 20c0-2 1.6-3.5 3.5-3.5M9 10.5c0-2 1.6-3.5 3.5-3.5" stroke={s('jade')} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    cat: 'Community',
    name: 'Vouch',
    when: 'Vouched for a new member',
    rarity: 'rare',
    tint: 'accent',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M8 14c1.5-1.5 3.5-2 5.5-1.5l3-3a2.1 2.1 0 0 1 3 3l-1 1a2.1 2.1 0 0 1 0 3l-1 1a2.1 2.1 0 0 1-3 0l-.5-.5" stroke={s('accent')} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 14c-1.5 1.5-3.5 2-5.5 1.5l-3 3a2.1 2.1 0 0 1-3-3l1-1a2.1 2.1 0 0 1 0-3l1-1" stroke={s('accent')} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    cat: 'Community',
    name: 'Thread Starter',
    when: 'Started a community thread',
    rarity: 'common',
    tint: 'jade',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M5 7h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" stroke={s('jade')} strokeWidth="1.8" />
        <path d="M9 22h10M14 19v3" stroke={s('jade')} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="20" cy="6" r="3.5" fill={s('accent')} />
        <path d="M19 6l.8.8L21.5 5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    cat: 'Platform',
    name: 'Founding Member',
    when: 'Joined in the first 500',
    rarity: 'legendary',
    tint: 'plum',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M14 4C8.48 4 4 8.48 4 14s4.48 10 10 10 10-4.48 10-10" stroke={s('plum')} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 4v10l5-3" stroke={s('plum')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="21" cy="7" r="3" fill={s('accent')} />
      </svg>
    ),
  },
  {
    cat: 'Platform',
    name: 'Sustainer',
    when: 'Supporting member · 6 months',
    rarity: 'rare',
    tint: 'accent',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M14 5c0 0-7 4-7 10a7 7 0 0 0 14 0c0-6-7-10-7-10Z" stroke={s('accent')} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M14 12v5M11.5 14.5l2.5-2.5 2.5 2.5" stroke={s('accent')} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    cat: 'Platform',
    name: 'Event Host',
    when: 'Hosted a QueerPulse gathering',
    rarity: 'legendary',
    tint: 'plum',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M14 5l1.5 4.5H20l-3.7 2.7 1.4 4.3L14 13.8l-3.7 2.7 1.4-4.3L8 9.5h4.5L14 5Z" stroke={s('plum')} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M7 22h14" stroke={s('plum')} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 19v3" stroke={s('plum')} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

export const lockedBadges: Badge[] = [
  {
    cat: 'Attendance',
    name: 'Decade',
    when: 'Attend 10 gatherings',
    rarity: 'rare',
    tint: 'jade',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="14" cy="14" r="8" stroke={s('jade')} strokeWidth="1.8" />
        <path d="M10 14l3 3 6-5" stroke={s('jade')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    cat: 'Community',
    name: 'Trusted Voice',
    when: 'Have your vouch accepted 3 times',
    rarity: 'rare',
    tint: 'accent',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M14 4l2.5 7.5H24l-6.3 4.5 2.4 7.5L14 19l-6.1 4.5 2.4-7.5L4 11.5h7.5L14 4Z" stroke={s('accent')} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    cat: 'Community',
    name: 'Networker',
    when: 'Connect with 50 members',
    rarity: 'rare',
    tint: 'plum',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="14" cy="10" r="5" stroke={s('plum')} strokeWidth="1.8" />
        <path d="M5 24c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke={s('plum')} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="21" cy="10" r="3" stroke={s('plum')} strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    cat: 'Hosting',
    name: 'Serial Host',
    when: 'Host 3 approved gatherings',
    rarity: 'legendary',
    tint: 'jade',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M14 4c0 0 2 3 2 6a2 2 0 0 1-4 0c0-3 2-6 2-6Z" stroke={s('jade')} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M6 20c1-4 4-7 8-7s7 3 8 7" stroke={s('jade')} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="14" cy="21" r="2.5" stroke={s('jade')} strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    cat: 'Platform',
    name: '???',
    when: 'Legendary · Secret badge',
    rarity: 'legendary',
    tint: 'plum',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <rect x="5" y="8" width="18" height="14" rx="2" stroke={s('plum')} strokeWidth="1.8" />
        <path d="M9 8V6a5 5 0 0 1 10 0v2" stroke={s('plum')} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 14v3" stroke={s('plum')} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    cat: 'Platform',
    name: '2-Year Member',
    when: 'Active for 2 full years',
    rarity: 'rare',
    tint: 'accent',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M14 5c-5 5-8 8-8 12a8 8 0 0 0 16 0c0-4-3-7-8-12Z" stroke={s('accent')} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    cat: 'Community',
    name: 'Contributor',
    when: 'Submit a member story',
    rarity: 'common',
    tint: 'jade',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M4 20c3-6 6-8 10-8s7 2 10 8" stroke={s('jade')} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14 4v8" stroke={s('jade')} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10 8l4-4 4 4" stroke={s('jade')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    cat: 'Platform',
    name: '???',
    when: 'Legendary · Secret badge',
    rarity: 'legendary',
    tint: 'plum',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <circle cx="14" cy="14" r="9" stroke={s('plum')} strokeWidth="1.8" />
        <path d="M14 9v5l3.5 3.5" stroke={s('plum')} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    cat: 'Community',
    name: 'Bridge Builder',
    when: 'Connect members across cities',
    rarity: 'rare',
    tint: 'accent',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
        <path d="M7 14h14M14 7v14" stroke={s('accent')} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="14" cy="14" r="9" stroke={s('accent')} strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
    ),
  },
]

export const perksLadder: PerkLadderRow[] = [
  {
    num: 1,
    name: 'Newcomer',
    state: 'achieved',
    status: (
      <>
        <FiCheck /> Done
      </>
    ),
    perks: [
      'Browse the member directory',
      'Join gatherings & RSVP',
      'Access the resource library',
    ],
  },
  {
    num: 2,
    name: 'Explorer',
    state: 'achieved',
    status: (
      <>
        <FiCheck /> Done
      </>
    ),
    perks: [
      'Message other members directly',
      'Save articles & resources',
      'Join communities',
    ],
  },
  {
    num: 3,
    name: 'Regular',
    state: 'achieved',
    status: (
      <>
        <FiCheck /> Done
      </>
    ),
    perks: [
      'Vouch for new members on the waitlist',
      'Apply to host a gathering',
    ],
  },
  {
    num: 4,
    name: 'Familiar',
    state: 'current',
    status: 'Current',
    perks: [
      '48-hour early RSVP access to new gatherings',
      'Access to the Trusted Lounge community',
    ],
  },
  {
    num: 5,
    name: 'Trusted',
    state: 'locked',
    status: '320 XP away',
    perks: [
      'Host gatherings without approval review',
      'Monthly invite quota increases to 3',
    ],
  },
  {
    num: 6,
    name: 'Anchor',
    state: 'locked',
    status: 'Locked',
    perks: [
      'Permanent founding discount on future paid features',
      '"Anchor" legendary badge unlocked',
    ],
  },
  {
    num: 7,
    name: 'Pillar',
    state: 'locked',
    status: 'Locked',
    perks: [
      'Advisory board eligibility',
      'Lifetime "Pillar" status — permanent badge',
    ],
  },
]
