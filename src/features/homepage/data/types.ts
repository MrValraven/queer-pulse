import type { AvatarTint } from '../../../shared/components/ui/Avatar'
import type { VisibilityMode } from '../../../shared/components/ui/VisibilityBadge'

export type MemberCategory =
  | 'design'
  | 'tech'
  | 'film'
  | 'music'
  | 'food'
  | 'craft'
  | 'care'

export interface Member {
  key: string
  name: string
  role: string
  hood: string
  category: MemberCategory
  tags: string[]
  verified: boolean
  visibility: VisibilityMode
  initials: string
  tint: AvatarTint
  /** Profile photo URL; falls back to initials when absent. */
  photo?: string
  vouchedBy: string
}

export interface Gathering {
  id: string
  day: string
  month: string
  type: string
  title: string
  hood: string
  detail: string
  spotsLabel: string
  spotsValue?: string
  ctaLabel: string
}

export interface PainPoint {
  question: string
  /** Heading text before the accented words. */
  headingPrefix: string
  /** Emphasised (coral italic) words, usually trailing. */
  accent: string
  /** Optional text after the accented words. */
  headingSuffix?: string
  body: string
  ctaLabel: string
  href: string
}

export interface StoryFeature {
  category: string
  title: string
  excerpt: string
  bylineInitials: string
  byline: string
  href: string
  tint: 'coral' | 'jade' | 'plum'
  image?: string
}

export interface StoryCard {
  category: string
  title: string
  bylineInitials: string
  byline: string
  href: string
  tint: 'coral' | 'jade' | 'plum'
  image?: string
}

export interface ChangeMaker {
  key: string
  cause: string
  name: string
  blurb: string
  tags: string[]
  tint: 'coral' | 'jade' | 'plum'
  image?: string
}

export type WellbeingTone = 'violet' | 'jade' | 'coral' | 'plum'

export interface WellbeingResource {
  href: string
  title: string
  description: string
  ctaLabel: string
  tone: WellbeingTone
  icon: WellbeingIcon
}

export type WellbeingIcon =
  | 'heart'
  | 'people'
  | 'phone'
  | 'shield'
  | 'briefcase'
  | 'info'

export type CommunityType =
  | 'social'
  | 'arts'
  | 'activism'
  | 'support'
  | 'sports'
  | 'professional'

export interface Community {
  href: string
  type: CommunityType
  typeLabel: string
  name: string
  description: string
  count: string
  joinLabel: string
  dashed?: boolean
  privateBadge?: boolean
  /** Stable slug for the community detail route (`/community/:slug`). */
  slug?: string
}

export interface GrantStat {
  value: string
  label: string
  /** Numeric part for the count-up animation, when applicable. */
  countTo?: number
  prefix?: string
  suffix?: string
}

export interface GrantItem {
  amount: string
  title: string
  description: string
  who: string
}

export type BoardKind = 'looking' | 'offering'
export type BoardCategory = 'design' | 'tech' | 'space' | 'care'

export interface BoardPost {
  href: string
  kind: BoardKind
  category: BoardCategory
  title: string
  posterInitials: string
  posterName: string
  posterMeta: string
  age: string
}

export interface Swap {
  href: string
  offering: string
  wanting: string
  posterInitials: string
  poster: string
}

export interface SkillItem {
  type: 'teaching' | 'learning'
  title: string
  by: string
}

export type LibraryType = 'recording' | 'guide' | 'notes'

export interface LibraryItem {
  href: string
  type: LibraryType
  typeLabel: string
  title: string
  meta: string[]
}

export interface Partner {
  href: string
  initials: string
  name: string
  location: string
  tone: 'jade' | 'coral' | 'plum'
}

export interface Platform {
  href: string
  badge: string
  name: string
  category: string
  tone: 'jade' | 'coral' | 'plum'
}

export type MapSpaceType = 'venue' | 'studio' | 'community' | 'org'

export interface MapSpace {
  type: MapSpaceType
  x: number
  y: number
  color: string
  label?: string
  title: string
}

export interface DigestPreviewItem {
  tag: string
  title: string
  meta: string
}
