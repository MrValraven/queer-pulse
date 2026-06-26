import { type ReactNode } from 'react'
import type { IconType } from 'react-icons'
import { FiShield, FiMessageCircle, FiAlertTriangle } from 'react-icons/fi'
import { routes } from '../../app/routeMap'

export const GATHERING = routes.gathering
export const MANIFESTO = routes.manifesto
export const SAFETY = routes.safety
export const HATE_CRIME = routes.hateCrime
export const ARTICLE = routes.article

export const CHIPS = [
  'All · 38',
  'Free / pay-what-you-can',
  'Quiet / sensory-friendly',
  'Trans-led',
  'First-week',
  'March weekend',
  'Last-week reflective',
]

export interface Ev {
  d: string
  m: string
  day: string
  kind: string
  title: ReactNode
  host: ReactNode
  free: string
  count: string
  headline?: boolean
}

export const EVENTS: Ev[] = [
  { d: '02', m: 'Jun', day: 'Mon', kind: 'Opening · all welcome', title: <>June kickoff · <em>open back room</em></>, host: <>Hosted by <b>Catarina Vaz</b> · Café Beirão · 19:00</>, free: 'Free entry', count: '32 going' },
  { d: '06', m: 'Jun', day: 'Fri', kind: 'Reading · quiet', title: <>Stone Butch Blues — <em>book club night #4</em></>, host: <>Hosted by <b>Sofia Castaño</b> · Mercearia Rosa back room · 19:30</>, free: 'Free', count: '4 spots left' },
  { d: '10', m: 'Jun', day: 'Tue', kind: 'Healthcare · trans-led', title: <>Open clinic night · <em>extended June edition</em></>, host: <>Hosted by <b>Anika Kovač · Trans Hub</b> · Café Beirão · 19:00</>, free: 'Pay what you can', count: 'Waitlist · 5 spots' },
  { d: '14', m: 'Jun', day: 'Sat', kind: 'Workshop · sign-making', title: <>Banners &amp; placards · <em>march prep</em></>, host: <>Hosted by <b>André Bento</b> · Atelier Pulso · 11:00–17:00</>, free: 'Materials free', count: 'Drop-in' },
  { d: '17', m: 'Jun', day: 'Tue', kind: 'Legal · ILGA partner', title: <>Know-your-rights crash course <em>for the march</em></>, host: <>Hosted by <b>Catarina &amp; ILGA Portugal</b> · ILGA office · 18:30</>, free: 'Free', count: '14 going · open' },
  { d: '21', m: 'Jun', day: 'Sat', kind: 'The headliner', title: <>Marcha do Orgulho · <em>QueerPulse block</em></>, host: <>Meeting <b>15:30</b> · Marquês de Pombal · west steps</>, free: 'Free · the whole city', count: '184 marching', headline: true },
  { d: '21', m: 'Jun', day: 'Sat', kind: 'After · quiet · 21+', title: <>Post-march decompression · <em>just sitting</em></>, host: <>Hosted by <b>Rita Vasquez</b> · Café Beirão · 21:30–01:00</>, free: 'Free', count: '52 going' },
  { d: '24', m: 'Jun', day: 'Tue', kind: 'For parents', title: <>Mothers &amp; fathers night · <em>chosen and biological</em></>, host: <>Hosted by <b>Queer Parent Network</b> · Trans Hub office · 18:00</>, free: 'Free', count: '22 going' },
  { d: '28', m: 'Jun', day: 'Sat', kind: 'Closing · reflective', title: <>Last day of June · <em>open mic &amp; goodbye-to-pride</em></>, host: <>Hosted by <b>Marta &amp; Tomás</b> · Café Beirão · 19:00–23:00</>, free: 'Free · all welcome', count: 'RSVPs open' },
]

export const MARCH_META: [string, string][] = [
  ['Date', 'Sat 21 June 2026 · 16:00 start'],
  ['Meeting point', 'Marquês de Pombal · west steps'],
  ['QP block', '~15:30 · look for the coral flag'],
  ['Legal observers', '40 trained · stationed every 200m'],
  ['Quick-exit cars', '3 · driven by Sandra, Rui, Catarina'],
]

export interface SafetyCard {
  icon: IconType
  h: ReactNode
  p: string
  href: string
}

export const SAFETY_CARDS: SafetyCard[] = [
  { icon: FiShield, h: <>Safety <em>brief</em> for the march</>, p: "Pocket card. Where the observers are. What to do if. Print it, screenshot it, carry it.", href: SAFETY },
  { icon: FiMessageCircle, h: <>Crisis chat · <em>extended hours</em></>, p: 'Staffed 24/7 for June. Trained peer responders reply in <90s. Anonymous if you need it.', href: SAFETY },
  { icon: FiAlertTriangle, h: <>Hate-crime <em>reporting bridge</em></>, p: "One form. Goes to ILGA's casework lead within 24h with your consent. We've routed 300+ cases.", href: HATE_CRIME },
]

export interface ReadItem {
  kicker: string
  title: ReactNode
  d: string
  href: string
}

export const READING: ReadItem[] = [
  { kicker: 'Cover · Issue 09', title: <>Five things I learned <em>navigating Lisbon's trans health system.</em></>, d: '14 min read · Sara Pinheiro. The piece we\'d keep in print if we could only keep one.', href: ARTICLE },
  { kicker: 'Document', title: <>The QueerPulse <em>Manifesto.</em></>, d: '~ 6 min read · revised November 2025. Why this thing exists. Worth re-reading once a year.', href: MANIFESTO },
  { kicker: 'Long read · Issue 02', title: <>The longest night of <em>Lisboa Pride.</em></>, d: '26 min read · Catarina Vaz. Behind the scenes with last year\'s legal observer team.', href: ARTICLE },
  { kicker: 'Essay · Issue 07', title: <>What we owe <em>each other.</em></>, d: "15 min read · Marta Reis. The inaugural essay, still the operating system.", href: ARTICLE },
]
