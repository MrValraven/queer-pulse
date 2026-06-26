export interface OutAtWorkOption {
  value: string
  label: string
  desc: string
}

/** The out-at-work spectrum — a choice, never a binary toggle. */
export const OUT_AT_WORK: OutAtWorkOption[] = [
  {
    value: 'out',
    label: 'Fully out',
    desc: 'Your queerness is visible to anyone who views your work profile.',
  },
  {
    value: 'verified',
    label: 'Out to verified employers only',
    desc: 'Only community-verified-safe employers see it. Everyone else sees a neutral profile.',
  },
  {
    value: 'private',
    label: 'Private',
    desc: 'Your queerness is never surfaced to employers. You decide who you tell, and when.',
  },
]

export interface TransSupportOption {
  id: string
  label: string
  desc: string
}

/** Optional, sensitive supports — framed as care, surfaced only if wanted. */
export const TRANS_SUPPORT: TransSupportOption[] = [
  {
    id: 'chosen-name',
    label: 'Chosen-name-only applications',
    desc: 'Applications use your name in use — never a legal name.',
  },
  {
    id: 'hide-legal',
    label: 'Don’t show my legal name to employers',
    desc: 'Kept private and used only where legally required.',
  },
  {
    id: 'transition-friendly',
    label: 'Prefer transition-friendly employers',
    desc: 'Prioritise employers verified for trans-inclusive policies.',
  },
]

export interface VisRow {
  field: string
  employers: string
  community: string
}

/** What employers see vs what the community sees, at a glance. */
export const VIS_MATRIX: VisRow[] = [
  { field: 'Name in use', employers: 'Visible', community: 'Visible' },
  { field: 'Legal name', employers: 'Hidden', community: 'Hidden' },
  { field: 'Pronouns', employers: 'Your choice', community: 'Visible' },
  { field: 'Queer identity', employers: 'Per setting above', community: 'Visible' },
  { field: 'Skills & focus', employers: 'Visible', community: 'Visible' },
]

export const WORK_SKILLS = [
  'Branding',
  'Backend engineering',
  'Fundraising',
  'Photography',
  'Copywriting',
  'Product',
]

export const FOCUS_AREAS = [
  'Career direction',
  'Coming out professionally',
  'Creative practice',
  'Starting a business',
  'Navigating a difficult workplace',
  'Mental health at work',
]
