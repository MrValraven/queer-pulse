import { type ReactNode } from 'react'

export interface CallTag {
  label: string
  cls: string
}

export interface TrackOption {
  pre: string
  em?: string
  sub: string
  tint: 'coral' | 'jade' | 'plum'
}

export interface Call {
  id: string
  av: string
  tone?: 'jade'
  name: string
  seat: string
  tags: CallTag[]
  titlePre: string
  titleEm: string
  titlePost?: string
  brief: ReactNode
  amt: string
  amtLabel: string
  meta: string[]
  tracks?: TrackOption[]
  placeholder?: string
}

export const FILTERS = ['All open', 'Commissions', 'Grants', 'Residencies', 'Closing soon']

export const CALLS: Call[] = [
  {
    id: 'c1', av: 'SM', name: 'Sara Marques', seat: 'Council · seat 1',
    tags: [{ label: 'Commission', cls: 'tagCommission' }, { label: 'Closes in 4 days', cls: 'tagUrgent' }],
    titlePre: 'A song for the ', titleEm: 'Marsha P. Johnson', titlePost: ' night',
    brief: <>We're scoring the June 28th broadcast — a 90-minute live room marking the anniversary. We want <em>one original track</em>, 3–6 minutes, that holds the room between speakers. Yours to keep and re-release.</>,
    amt: '800', amtLabel: 'flat · paid on accept', meta: ['Deadline 14 Jun', '1 track', '4 of 12 slots filled'],
    tracks: [{ pre: 'Carta para a ', em: 'santa', sub: '2026 · 4:18', tint: 'coral' }, { pre: 'A ', em: 'Beja', sub: '2025 · 3:51', tint: 'plum' }, { pre: 'Devoção ', em: '(demo)', sub: 'unreleased · 5:02', tint: 'jade' }],
    placeholder: 'A sentence on why this one (optional). The council reads the work first.',
  },
  {
    id: 'c2', av: 'DO', tone: 'jade', name: 'D. Okoye', seat: 'Council · seat 4',
    tags: [{ label: 'Grant', cls: 'tagGrantCall' }],
    titlePre: 'Spring grant — ', titleEm: 'trans composers', titlePost: ' strand',
    brief: <>Unrestricted €1,200 grants for trans and non-binary composers working in any form — score, ambient, choral, club. No deliverable required; we fund the <em>practice</em>, not a product. Twelve grants this round.</>,
    amt: '1,200', amtLabel: 'unrestricted', meta: ['Deadline 30 Jun', '1 release as evidence', '12 grants'],
    tracks: [{ pre: 'Cidade dos ', em: 'santos', sub: 'Album · 11 tracks', tint: 'coral' }, { pre: 'Devoção', sub: 'EP · 9 tracks', tint: 'plum' }],
    placeholder: 'What would the grant let you make? (optional)',
  },
  {
    id: 'c3', av: 'YR', name: 'Yara Reis', seat: 'Council · seat 3',
    tags: [{ label: 'Residency', cls: 'tagResidency' }],
    titlePre: 'Casa do Comum — ', titleEm: 'August', titlePost: ' residency',
    brief: <>Two weeks in the Lisbon venue with keys, a PA, and a recording rig. End with one live broadcast from the room. Travel and a €600 stipend covered. We're looking for someone who'll <em>use the space loudly</em>.</>,
    amt: '600', amtLabel: '+ space & travel', meta: ['Deadline 20 Jul', '1 track + note', '1 residency'],
    tracks: [{ pre: 'Carta para a ', em: 'santa', sub: '2026 · 4:18', tint: 'coral' }, { pre: 'A ', em: 'Beja', sub: '2025 · 3:51', tint: 'plum' }],
    placeholder: 'How would you use the two weeks? (optional)',
  },
]
