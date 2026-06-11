export const CONTENT_NOTES = [
  { k: 'Grief', detail: 'Throughout', tc: '—' },
  { k: 'Dementia', detail: 'Act two · care', tc: '42:18 – 51:04' },
  { k: 'A slur, once', detail: 'Reclaimed · in context', tc: '28:11' },
]

export const FACTS: [string, string][] = [
  ['Director', 'Maria Vasconcelos'],
  ['Runtime', '92 min'],
  ['Year', 'Portugal · 2025'],
  ['Captions', 'EN · PT · LGP'],
]

export interface LobbyMessage {
  name: string
  badge: string
  when: string
  body: string
}

export const LOBBY: LobbyMessage[] = [
  {
    name: 'Sara M.',
    badge: 'curator',
    when: 'now',
    body: 'The bean-shelling shot at 1:07 is the whole film. Watch her hands.',
  },
  {
    name: 'André Q.',
    badge: '',
    when: '2m',
    body: 'Watching this for the third time and Dona Ilda still gets me every time.',
  },
  {
    name: 'Kai L.',
    badge: '',
    when: '5m',
    body: 'The window between the two apartments — such a quiet image of community.',
  },
]

export const TABS = ['Film info', 'Lobby', 'Live Q&A'] as const
export type WatchTab = (typeof TABS)[number]
