import { type ReactNode } from 'react'

export type Region = 'pt' | 'eu' | 'int'
export type Tint = 'coral' | 'jade' | 'plum'

export interface Stat {
  value: ReactNode
  label: string
}
export interface Collab {
  kicker: string
  title: string
  dek: string
  footLeft: string
  footRight: string
}
export interface TimelineItem {
  date: string
  title: ReactNode
  body: string
  tint?: Tint
}
export interface Prose {
  heading: string
  body: ReactNode
}
export interface InfoRow {
  label: string
  value: string
  accent?: 'jade' | 'coral'
}
export interface Contact {
  phone?: string
  phoneNote?: string
  email?: string
  website?: string
  address?: string
}

export interface Partner {
  /* card */
  slug: string
  av: string
  logo: string
  bg: string
  color: string
  region: Region
  regionLabel: string
  name: string
  city: string
  desc: string
  tags: string[]
  /* detail */
  eyebrow: string
  tagline: string
  tier: string
  since: string
  about: ReactNode[]
  stats: Stat[]
  aboutMore: Prose[]
  jointWork: Collab[]
  timeline: TimelineItem[]
  how: Prose[]
  funding: ReactNode
  atGlance: InfoRow[]
  contact: Contact
}
