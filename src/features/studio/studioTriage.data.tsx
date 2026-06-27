import type { ReactNode } from 'react'

export interface TriageKpi {
  v: ReactNode
  l: string
  jade?: boolean
}

export interface TriageTab {
  label: string
  ct: string
  warn?: boolean
}

export interface Sub {
  tint: 'coral' | 'jade' | 'plum'
  titlePre: string
  titleEm?: string
  who: ReactNode
  badges: { label: string; cls?: string }[]
  day: string
  of?: boolean
  note: string
  meta: ReactNode[]
  image?: string
}

export const KPIS: TriageKpi[] = [
  { v: <><em>47</em></>, l: 'new this week' },
  { v: <><em>9</em></>, l: 'you claimed' },
  { v: <><em>9.4</em>d</>, l: 'median reply', jade: true },
  { v: <><em>3</em></>, l: 'at deadline' },
]

export const TABS: TriageTab[] = [
  { label: 'New', ct: '47' },
  { label: 'Yours', ct: '9' },
  { label: 'At deadline', ct: '3', warn: true },
  { label: 'Shortlisted', ct: '14' },
  { label: 'Answered', ct: '128' },
]

export const SUBS: Sub[] = [
  { tint: 'coral', titlePre: 'The piano ', titleEm: 'I waited for', who: <>Renato V. · Porto · <em>first submission</em></>, badges: [{ label: 'First submission', cls: 'first' }, { label: '1 track' }, { label: 'Lead sheet attached' }, { label: 'PT lyrics' }, { label: 'Claimed · you', cls: 'claimed' }], day: 'Day 9', of: true, note: "i'm a 56-year-old former dock worker. i bought a piano at 49 and i'm writing the songs i should have written at 24. this is the first one i'd be proud to send out. four minutes and forty seconds. piano and one voice, plain.", meta: [<>Submitted <em>Sat 31 May</em></>, 'FLAC · 24/48 · 38.4 MB', '−14.1 LUFS · ready', 'Lyric translation requested · EN'], image: 'https://images.unsplash.com/photo-1642444525640-d3eb287ed389?q=80&w=400&auto=format&fit=crop' },
  { tint: 'plum', titlePre: 'Coro de ', titleEm: 'Porto', who: 'Eight voices · Porto · cover artists from the choir collective', badges: [{ label: 'First submission', cls: 'first' }, { label: '4 tracks · EP' }, { label: 'SATB scores' }, { label: 'Mirandês + PT' }], day: 'Day 7', of: true, note: "we're the porto cousin of coro de outubro. four songs of our own, all in mirandês, with PT side-by-side. recorded in casa do povo de miranda do douro, one mic, two takes each.", meta: [<>Submitted <em>Mon 2 Jun</em></>, 'FLAC · 24/96 · 412 MB', '−15.2 LUFS · ready', 'Translations attached: PT, EN'], image: 'https://images.unsplash.com/photo-1732719674511-e94d37e7d1c5?q=80&w=800&auto=format&fit=crop' },
  { tint: 'jade', titlePre: 'Tomboy · ', titleEm: 'Outubro', who: 'DJ from São Paulo · second submission', badges: [{ label: 'Mix · 38m' }, { label: 'Sapatão-sci-fi' }, { label: 'Cue sheet attached' }, { label: 'BR house' }], day: 'Day 4', of: true, note: 'sapatão-sci-fi mix, 38 minutes, all heard from below the dancefloor. last submission got a thoughtful pass — this one starts differently.', meta: [<>Submitted <em>Wed 5 Jun</em></>, 'FLAC · 24/44.1 · 1.8 GB', 'Cleared 18 source artists', 'Cue sheet: 18 tracks'], image: 'https://images.unsplash.com/photo-1736882178500-f99bbe22d77d?q=80&w=800&auto=format&fit=crop' },
  { tint: 'coral', titlePre: 'Ainda', who: <>Helena P. · Aveiro · <em>first single, also our translator</em></>, badges: [{ label: 'First submission', cls: 'first' }, { label: '1 track' }, { label: 'PT' }], day: 'Day 11', of: true, note: "two minutes and forty-six seconds. a piano and a small fire. you know me as the translator on Mariana's record; i'd like to try the other side, this once.", meta: [<>Submitted <em>Thu 30 May</em></>, 'WAV · 24/48 · 23.4 MB', '−13.8 LUFS · ready', 'Note from Mariana: vouches'], image: 'https://images.unsplash.com/photo-1740508905511-bccff9d04f7d?q=80&w=800&auto=format&fit=crop' },
]

export const FILE: [string, ReactNode][] = [
  ['Format', <>FLAC · 24 bit / 48 kHz</>],
  ['Loudness', <><em>−14.1 LUFS</em> · within bounds</>],
  ['Duration', <>4:40</>],
  ['Lyrics', <>PT · EN translation requested</>],
  ['Splits', <>100% Renato V. · no collabs</>],
]

export const WF = [40, 65, 55, 80, 60, 50, 72, 58, 46, 88, 62, 54, 80, 42, 68, 75, 48, 60, 84, 50, 62, 38, 72, 55, 48, 62, 38, 55]
