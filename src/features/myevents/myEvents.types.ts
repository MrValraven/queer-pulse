/** Domain types for the My Events dashboard (all mock/static). */

export type EventCat =
  | 'going'
  | 'hosting'
  | 'waitlisted'
  | 'past'
  | 'saved'
  | 'invite'
  | 'sent'

/** Avatar tints used by the stacked attendee avatars. */
export type Tint = 'coral' | 'jade' | 'plum'
export type AvatarSpec = [initials: string, tint: Tint]

export interface EventSeries {
  label: string
  more?: string
  dates?: string
}

export interface DayOf {
  run?: [time: string, label: string][]
  bring?: string[]
  weather?: string
  meet?: string
  door?: string
}

export interface MyEvent {
  id: string
  cat: EventCat
  /** Slug of the gathering detail page this event links to (see gatherings/data.ts). */
  slug?: string
  title: string
  date: string // YYYY-MM-DD
  start: string
  end?: string
  venue: string
  community?: string
  going: number
  /** state flags */
  reminder?: boolean
  maybe?: boolean
  cancelled?: boolean
  review?: boolean
  blocked?: boolean
  online?: boolean
  tz?: string
  ticket?: boolean
  sliding?: boolean
  paid?: string
  /** hosting */
  waitlist?: number
  cohost?: boolean
  cohosts?: AvatarSpec[]
  cohostName?: string
  /** waitlist */
  position?: number
  ahead?: number
  /** social */
  friends?: number
  who?: AvatarSpec[]
  whoText?: string
  /** access + notes */
  access?: string[]
  contentNote?: string
  changed?: string
  series?: EventSeries
  dayof?: DayOf
  /** saved / invite */
  spotsLeft?: number
  soldOut?: boolean
  from?: string
  deadline?: string
  invitee?: string
  /** past */
  photos?: boolean
  taggedPhotos?: number
  connect?: boolean
  receipt?: boolean
  noShow?: boolean
}

export interface Recommendation {
  id: string
  title: string
  date: string
  venue: string
  reason: string
}

export interface Notif {
  id: string
  lead?: string
  bold: string
  tail?: string
  time: string
  evId: string
  unread: boolean
}

export type Pill = 'upcoming' | 'going' | 'hosting' | 'waitlisted' | 'past' | 'saved'
export type CalView = 'month' | 'week' | 'year'
export type SortBy = 'date' | 'community' | 'status'
export type Density = 'comfortable' | 'compact'
export type MobileView = 'list' | 'cal'

export interface Prefs {
  reminderLead: string
  visibility: string
  email: boolean
  push: boolean
}

export type FilterKey = 'inperson' | 'online' | 'free' | 'paid' | 'month'
