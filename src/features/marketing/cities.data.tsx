import { type ReactNode } from 'react'

export interface BetaCity {
  name: string
  flag: string
  country: string
  desc: ReactNode
  lead: ReactNode
  btn: string
  toast: string
}

export const BETA: BetaCity[] = [
  {
    name: 'Madrid',
    flag: '🇪🇸',
    country: 'España',
    desc: (
      <>
        Two co-moderators in place. Talking to <b>FELGTBI+</b> about a parallel ILGA-style
        operational bridge. Earliest plausible opening: <b>Q2 2027</b>.
      </>
    ),
    lead: (
      <>
        Coordinated by <b>Mira Martín</b> &amp; <b>Diego Carmona</b>
      </>
    ),
    btn: 'Get notified when Madrid opens',
    toast: "You'll get an early-access invite when Madrid opens",
  },
  {
    name: 'Berlin',
    flag: '🇩🇪',
    country: 'Deutschland',
    desc: (
      <>
        Two members in Berlin asked us to come; we said "not unless you co-host the build." They
        agreed. <b>One year of co-design ahead.</b> Earliest opening: <b>Q1 2028</b>.
      </>
    ),
    lead: (
      <>
        Coordinated by <b>Anna Hofmann</b>
      </>
    ),
    btn: 'Track Berlin progress',
    toast: "Berlin is far out. We'll write when there's real news.",
  },
  {
    name: 'Coimbra',
    flag: '🇵🇹',
    country: 'Portugal',
    desc: (
      <>
        Lighter footprint — likely to function as a Porto satellite rather than a standalone city.{' '}
        <b>Six members</b> coordinating informally. Open in 2027 alongside Porto's first anniversary.
      </>
    ),
    lead: (
      <>
        Informal · loosely coordinated by <b>Sofia Castaño</b>
      </>
    ),
    btn: 'Follow updates',
    toast: 'Coimbra updates will come through the Porto bulletin',
  },
]

export interface WaitCity {
  name: string
  flag: string
  region: string
  votes: string
  pct: number
  voted?: boolean
}

export const WAITLIST: WaitCity[] = [
  { name: 'Barcelona', flag: '🇪🇸', region: 'España', votes: '284', pct: 72 },
  { name: 'Faro', flag: '🇵🇹', region: 'Algarve', votes: '112', pct: 38, voted: true },
  { name: 'Amsterdam', flag: '🇳🇱', region: 'Nederland', votes: '96', pct: 32 },
  { name: 'Marseille', flag: '🇫🇷', region: 'France', votes: '88', pct: 29 },
  { name: 'São Paulo', flag: '🇧🇷', region: 'Brasil', votes: '74', pct: 25 },
  { name: 'Athens', flag: '🇬🇷', region: 'Ελλάδα', votes: '52', pct: 17 },
]

export interface HowStep {
  n: string
  title: ReactNode
  body: ReactNode
}

export const HOW: HowStep[] = [
  {
    n: '01',
    title: (
      <>
        At least <em>one moderator</em> in-country
      </>
    ),
    body: (
      <>
        Not flying in. Living there. Knows the venues, the language, the queer subculture, the
        local laws. <b>One is the floor; two is what we aim for.</b> They are paid the same hourly
        as Lisbon moderators.
      </>
    ),
  },
  {
    n: '02',
    title: (
      <>
        An operational <em>partner organisation</em>
      </>
    ),
    body: (
      <>
        We do not open in a city without someone equivalent to ILGA we can bridge to.{' '}
        <em>Crisis chat must hand off to a real local resource</em>, not just our Lisbon team.
        Hate-crime reports must route locally. Without this, we don't go.
      </>
    ),
  },
  {
    n: '03',
    title: (
      <>
        Legal review · <em>local laws around queer expression</em>
      </>
    ),
    body: (
      <>
        What's protected, what isn't, what the realistic risk to members is. Done by a local
        lawyer, not Google. <b>This stage has caused us to pause four city openings.</b> We don't
        elaborate publicly.
      </>
    ),
  },
  {
    n: '04',
    title: (
      <>
        Eight to twelve <em>founding members</em>
      </>
    ),
    body: (
      <>
        Not invitees on a list — eight to twelve people who've met each other in person, are
        committed to vouching for the next round, and have agreed to a 12-month soft-launch where
        they co-host the first 30 events.{' '}
        <em>Without this the network is performance.</em>
      </>
    ),
  },
]
