import type { Person } from './communityDetails'
import type { AccessTier, CommunityRole } from './membership.types'

/** A named reaction; `key` maps to a react-icon in the ReactionBar. */
export type ReactionKey = 'heart' | 'celebrate' | 'support' | 'fire'

export interface Reaction {
  key: ReactionKey
  count: number
  /** Whether the current user has reacted (drives the active pill state). */
  reacted?: boolean
}

export interface PostReply {
  author: Person
  text: string
  time: string
}

/** A lightweight Pulse post — the "for now" unit (vs. heavier Discussion threads). */
export interface Post {
  id: string
  author: Person
  body: string
  image?: string
  kind: 'post' | 'announcement'
  pinned?: boolean
  reactions: Reaction[]
  replies: PostReply[]
  time: string
  communitySlug: string
}

/** A non-post moment interleaved into the Pulse feed (joins, new gatherings…). */
export interface PulseMoment {
  id: string
  kind: 'joined' | 'event' | 'pinned' | 'resource'
  text: string
  time: string
}

export interface CommunityResource {
  title: string
  href: string
  kind: 'link' | 'doc' | 'guide'
  /** Optional one-line description. */
  note?: string
}

export interface CommunityEvent {
  id: string
  dd: string
  mm: string
  title: string
  meta: string
  spots?: string
  past?: boolean
  recapHref?: string
}

/** A community member with their role + light directory metadata. */
export interface RosterMember extends Person {
  /** Community standing — overrides Person's free-text job title. */
  role: CommunityRole
  /** The member's job/role title (carried over from the Person registry). */
  title?: string
  pronouns?: string
  hood?: string
  verified?: boolean
}

export interface CommunityStats {
  members: number
  activeThisWeek: number
  postsThisWeek: number
}

/** A pending request to join a gated (request/invite/private) community. */
export interface ModRequest {
  id: string
  person: Person
  note?: string
  time: string
}

/** A flagged post awaiting a mod decision. */
export interface ModReport {
  id: string
  postExcerpt: string
  author: Person
  reason: string
  reporter: Person
  time: string
}

/** The enriched, "living" data layered on top of the base Community + CommunityDetail. */
export interface LivingCommunity {
  slug: string
  accessTier: AccessTier
  rules: string[]
  resources: CommunityResource[]
  events: CommunityEvent[]
  roster: RosterMember[]
  pinned: Post[]
  pulse: Post[]
  moments: PulseMoment[]
  stats: CommunityStats
  /** Pending join requests for mods to triage (gated communities). */
  joinRequests?: ModRequest[]
  /** Flagged posts awaiting a mod decision. */
  reports?: ModReport[]
}
