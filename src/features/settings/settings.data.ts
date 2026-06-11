export type PaneId = 'notifications' | 'language' | 'data' | 'visibility' | 'profile' | 'account'

export const NAV: { group: string; items: { id: PaneId; icon: string; label: string }[] }[] = [
  {
    group: 'Preferences',
    items: [
      { id: 'notifications', icon: '🔔', label: 'Notifications' },
      { id: 'language', icon: '💬', label: 'Language & terminology' },
    ],
  },
  {
    group: 'Privacy & data',
    items: [
      { id: 'data', icon: '🔒', label: 'Data & privacy' },
      { id: 'visibility', icon: '👁', label: 'Visibility' },
    ],
  },
  {
    group: 'Account',
    items: [
      { id: 'profile', icon: '✏️', label: 'Profile' },
      { id: 'account', icon: '⚙️', label: 'Account' },
    ],
  },
]

export const TERMS = [
  { name: 'Queer', def: "An umbrella term for sexual and gender identities that aren't heterosexual or cisgender. Reclaimed from a slur; usage varies — some older members may prefer not to use it." },
  { name: 'Cisgender', def: 'Describes someone whose gender identity matches the sex they were assigned at birth. Not a value judgement — simply a neutral descriptor.' },
  { name: 'Non-binary', def: 'A gender identity that sits outside the man/woman binary. Some non-binary people use they/them; always ask rather than assume.' },
  { name: 'Two-spirit', def: 'A term used by some Indigenous North American cultures for a person embodying both masculine and feminine spirits. Not interchangeable with Western LGBTQ+ terms.' },
]
