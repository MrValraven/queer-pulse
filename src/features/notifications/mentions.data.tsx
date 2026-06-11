import type { ReactNode } from 'react'

export const MENTION_TABS: { label: string; count: number }[] = [
  { label: 'All', count: 8 },
  { label: 'Unread', count: 3 },
  { label: 'In posts', count: 4 },
  { label: 'In articles', count: 2 },
  { label: 'In events', count: 2 },
]

export interface Mention {
  id: string
  initials: string
  tint: 'coral' | 'jade' | 'plum'
  name: string
  context: string
  when: string
  fresh?: boolean
  unread?: boolean
  content: ReactNode
  whereText: string
  /** Route to the source; omitted for private/no-link sources. */
  whereTo?: string
  actions: { label: string; primary?: boolean }[]
}

export const MENTION_DAYS: { day: string; items: Mention[] }[] = [
  {
    day: 'Today',
    items: [
      {
        id: 'm1',
        initials: 'AK',
        tint: 'coral',
        name: 'Anika Kovač',
        context: 'in a reply',
        when: '14m ago',
        fresh: true,
        unread: true,
        content: (
          <>
            "Thanks <mark>@tomás</mark> — Inês's mobile was the right answer. Got the slot.{' '}
            <em>Calling tomorrow morning to confirm.</em>"
          </>
        ),
        whereText: '"Anyone have recommendations for a queer-friendly GP in Lisbon?"',
        actions: [{ label: 'Reply', primary: true }, { label: 'Open thread' }, { label: 'Mark read' }],
      },
      {
        id: 'm2',
        initials: 'SP',
        tint: 'jade',
        name: 'Sara Pinheiro',
        context: 'in an article comment',
        when: '3h ago',
        fresh: true,
        unread: true,
        content: (
          <>
            "<mark>@tomás</mark>, your Issue 5 piece on the four-day week comes up here too —
            particularly the section about clinic schedules. Worth re-reading."
          </>
        ),
        whereText: '"Five things I learned navigating Lisbon\'s trans health system"',
        actions: [{ label: 'Reply', primary: true }, { label: 'Open article' }],
      },
      {
        id: 'm3',
        initials: 'MR',
        tint: 'plum',
        name: 'Marta Reis',
        context: 'in Open Studio invite',
        when: '6h ago',
        fresh: true,
        unread: true,
        content: (
          <>
            "<mark>@tomás</mark> — bringing the Issue 10 spreads for live edit on Thu 26 Jun. Hope you
            can make it. <em>Bring a red pen.</em>"
          </>
        ),
        whereText: 'Open Studio · 26 Jun · Atelier Pulso',
        actions: [{ label: 'RSVP', primary: true }, { label: 'Reply' }],
      },
    ],
  },
  {
    day: 'Yesterday',
    items: [
      {
        id: 'm4',
        initials: 'LG',
        tint: 'coral',
        name: 'Luísa Gomes',
        context: 'in a Creatives post',
        when: 'Yesterday',
        content: (
          <>
            "For anyone going to <mark>@tomás</mark>'s portfolio night on Wed — bring three pieces, not
            five, and at least one that you think is bad."
          </>
        ),
        whereText: 'Creatives community',
        actions: [{ label: 'Open post' }],
      },
      {
        id: 'm5',
        initials: 'FL',
        tint: 'jade',
        name: 'Filipa Lopes',
        context: 'in a thread',
        when: 'Yesterday',
        content: (
          <>
            "<mark>@tomás</mark> ran a great session at the riso night — recommend if you're new to the
            medium."
          </>
        ),
        whereText: '"What\'s a Lisbon workshop worth the money?"',
        actions: [],
      },
    ],
  },
  {
    day: 'This week',
    items: [
      {
        id: 'm6',
        initials: 'CV',
        tint: 'plum',
        name: 'Catarina Vaz',
        context: 'in an event invite',
        when: 'Mon',
        content: (
          <>
            "Inviting <mark>@tomás</mark>, <mark>@luísa</mark>, and <mark>@filipa</mark> to a small
            post-Pride dinner at my place. <em>Bring something to grill.</em>"
          </>
        ),
        whereText: 'a private invite · 6 people',
        actions: [],
      },
      {
        id: 'm7',
        initials: 'TC',
        tint: 'coral',
        name: 'Tó Cunha',
        context: 'in a reply',
        when: 'Sat',
        content: (
          <>
            "<mark>@tomás</mark> — your Issue 5 long-read is the piece that got me into riso. Full
            circle."
          </>
        ),
        whereText: 'Riso workshop · feedback thread',
        actions: [],
      },
      {
        id: 'm8',
        initials: 'RV',
        tint: 'jade',
        name: 'Rita Vasquez',
        context: 'in a Wellbeing reply',
        when: 'Fri',
        content: (
          <>
            "<mark>@tomás</mark> — could you message me about the post-march decompression event? Want
            to co-host."
          </>
        ),
        whereText: 'Wellbeing community',
        actions: [],
      },
    ],
  },
]
