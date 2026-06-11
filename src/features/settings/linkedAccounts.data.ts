export interface SignInMethod {
  id: string
  name: string
  detail: string
  linked: boolean
  alwaysOn?: boolean
  defaultDisabled?: boolean
  badgeText: string
  canUnlink?: boolean
  canLink?: boolean
  canManage?: boolean
}

export const SIGN_IN_METHODS: SignInMethod[] = [
  {
    id: 'google',
    name: 'Google',
    detail: 'Linked as tomas@example.com · last used 12 days ago',
    linked: true,
    badgeText: 'Linked',
    canUnlink: true,
  },
  {
    id: 'apple',
    name: 'Apple',
    detail: 'Not linked · sign in once and we\'ll link automatically',
    linked: false,
    badgeText: 'Not linked',
    canLink: true,
  },
  {
    id: 'magic',
    name: 'Magic link · email',
    detail: 'Sign in by clicking a link sent to tomas@example.com',
    linked: true,
    alwaysOn: true,
    defaultDisabled: true,
    badgeText: 'Always on',
  },
  {
    id: 'passkey',
    name: 'Passkey · device biometric',
    detail: 'Use FaceID / TouchID instead of a password · stored on this Mac',
    linked: true,
    badgeText: '2 devices',
    canManage: true,
  },
]

export interface ConnectedApp {
  id: string
  name: string
  detail: string
  badgeText: string
  canRevoke?: boolean
  canCopy?: boolean
}

export const CONNECTED_APPS: ConnectedApp[] = [
  {
    id: 'discord',
    name: 'Discord',
    detail: 'Linked for community chat sync · can read your member roles · can\'t post on your behalf',
    badgeText: 'Linked',
    canRevoke: true,
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    detail: 'Cross-post your public articles · posts only · no follower list access',
    badgeText: 'Linked',
    canRevoke: true,
  },
  {
    id: 'arena',
    name: 'Are.na',
    detail: 'Save QP articles to your channels · last sync 3 days ago',
    badgeText: 'Linked',
    canRevoke: true,
  },
  {
    id: 'calendar',
    name: 'Calendar (Google / Apple / Outlook)',
    detail: 'Add RSVP\'d gatherings to your calendar · subscription URL, no further access',
    badgeText: 'Subscribed',
    canCopy: true,
  },
]
