import type { ReactNode } from 'react'

export const PUBLIC_MEMBER = {
  handle: '@tomas-mendes',
  firstName: 'Tomás',
  lastName: 'Mendes',
  initials: 'TM',
  pronouns: 'he/him',
  tagline: 'Designer, writer, and the back-room bartender at Café Beirão one night a month.',
  bio: (
    <>
      I write occasionally for QueerPulse Magazine and host monthly portfolio nights at Café Beirão.{' '}
      <em>Mostly here to host other people's events.</em> If we've met at a gathering, you can find
      me on Bluesky too.
    </>
  ),
  location: 'Alfama',
  memberSince: 'Jun 2024',
  vouchedBy: '4 members',
  ctaNote: "Tomás's full profile, posts, and direct-message access open up once you're a member.",
}

export const PUBLIC_STATS: { value: string; em?: boolean; label: string }[] = [
  { value: '4', em: true, label: 'Articles published' },
  { value: '12', label: 'Events hosted' },
  { value: '2', em: true, label: 'Years on QueerPulse' },
  { value: '1.4k', label: 'Members reached' },
]

export const HERE_FOR: { label: string; primary?: boolean }[] = [
  { label: 'Hosting events', primary: true },
  { label: 'Editorial writing' },
  { label: 'Design critique' },
  { label: 'Portfolio nights' },
  { label: 'Quiet hangouts' },
  { label: 'Mentoring (junior designers)' },
  { label: 'Magazine pitches' },
]

export interface PublicCard {
  kicker: string
  title: ReactNode
  meta: string
}

export const PUBLIC_WRITING: PublicCard[] = [
  {
    kicker: 'Profile · Issue 09',
    title: (
      <>
        The pharmacist who fills <em>every prescription.</em>
      </>
    ),
    meta: '6 min read · published 6 Jun 2026',
  },
  {
    kicker: 'Long read · Issue 05',
    title: <>Six months on a four-day week.</>,
    meta: '24 min read · Jun 2025',
  },
  {
    kicker: 'Essay · Issue 03',
    title: (
      <>
        On hosting badly, <em>then better.</em>
      </>
    ),
    meta: '8 min read · Dec 2024',
  },
  {
    kicker: 'Service · Issue 01',
    title: <>A guide to riso printing in Lisbon.</>,
    meta: '11 min read · Jun 2024',
  },
]

export const PUBLIC_HOSTING: PublicCard[] = [
  {
    kicker: 'Recurring · 1st Wednesday',
    title: (
      <>
        Portfolio night — <em>creatives only.</em>
      </>
    ),
    meta: 'Café Beirão · 18:00 · open to 12 people',
  },
  {
    kicker: '28 Jun 2026',
    title: (
      <>
        Riso open-house · <em>workshop &amp; tour</em>
      </>
    ),
    meta: 'Atelier Pulso · 11:00 · 8 spots',
  },
]
