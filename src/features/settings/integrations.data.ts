export interface Integration {
  id: string
  name: string
  /** Single-letter glyph used in the tinted logo tile. */
  glyph: string
  desc: string
  /** Scope lines shown in the provider-auth modal. */
  scopes: string[]
}

/** Sign-in providers that can be linked via the simulated OAuth modal. */
export const LINK_PROVIDERS: Record<string, Integration> = {
  apple: {
    id: 'apple',
    name: 'Apple',
    glyph: '',
    desc: 'Use Sign in with Apple as an alternative way into QueerPulse.',
    scopes: [
      'Confirm your Apple ID email (or a private relay address)',
      'Tell Apple you have a QueerPulse account — nothing about what you do here',
      'Never see your messages, posts, or community memberships',
    ],
  },
}

/** Available integrations shown in the "Browse" gallery modal. */
export const AVAILABLE_INTEGRATIONS: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    glyph: 'S',
    desc: 'Sustainer billing and payouts for paid gatherings you host.',
    scopes: [],
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    glyph: 'M',
    desc: 'Cross-post your public articles to your fediverse account. Posts only.',
    scopes: [],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    glyph: 'S',
    desc: 'Power Audio Rooms with shared listening. No library access.',
    scopes: [],
  },
  {
    id: 'ical',
    name: 'iCal export',
    glyph: 'C',
    desc: 'Subscribe to your RSVP’d gatherings from any calendar app.',
    scopes: [],
  },
  {
    id: 'notion',
    name: 'Notion',
    glyph: 'N',
    desc: 'Save articles and resources straight to a Notion database.',
    scopes: [],
  },
  {
    id: 'readwise',
    name: 'Readwise',
    glyph: 'R',
    desc: 'Send your highlights from long-read editions to Readwise.',
    scopes: [],
  },
  {
    id: 'matrix',
    name: 'Matrix',
    glyph: 'X',
    desc: 'Bridge community chat to an encrypted Matrix room.',
    scopes: [],
  },
  {
    id: 'pinboard',
    name: 'Pinboard',
    glyph: 'P',
    desc: 'Bookmark resources and articles to your Pinboard account.',
    scopes: [],
  },
]
