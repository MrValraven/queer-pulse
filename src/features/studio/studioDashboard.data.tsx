import type { ReactNode } from 'react'

export interface DashStat {
  lbl: string
  v: ReactNode
  trend: ReactNode
  payout?: boolean
}

export interface DashCurator {
  av: string
  tone: string
  what: ReactNode
  who: string
  when: string
}

export interface DashCity {
  nm: string
  pct: number
}

export const STATS: DashStat[] = [
  { lbl: 'Plays · this month', v: <>36,<em>400</em></>, trend: <><em className="up">+ 12,140</em> vs. last month · 4 of 11 tracks active</> },
  { lbl: 'Streaming earnings', v: <>€<em>1,820</em></>, trend: <><em className="up">+ €607</em> vs. last month · €0.05 / qualifying play</> },
  { lbl: 'Tips received', v: <>€<em>448</em></>, trend: <>87 tippers, 64 with notes · <em className="up">5 since you opened this page</em></> },
  { lbl: 'Next payout · 5 Jul', v: <>€<em>2,140</em></>, trend: <>→ SEPA · LU IBAN · settles morning of the 5th</>, payout: true },
]

export const BARS = [32, 42, 38, 55, 48, 62, 58, 68, 72, 65, 78, 60, 54, 96]

export const CURATORS: DashCurator[] = [
  { av: 'SM', tone: 'coral', what: <><em>Carta para a santa</em> placed at track 6 of the Wednesday set</>, who: 'Sara Marques · Vespertina vol. iv · "stay through the second verse"', when: 'today' },
  { av: 'SM', tone: 'coral', what: <><em>Mãe, três vezes</em> added to "Songs to play your mother"</>, who: 'Sara Marques · collection · rotated in for this week', when: 'Mon 8 Jun' },
  { av: 'DO', tone: 'jade', what: <><em>O nome</em> included in Trans composers vol. iv</>, who: 'D. Okoye · mix · liner-note paragraph about the lyric', when: 'Fri 5 Jun' },
  { av: 'JR', tone: 'coral', what: <><em>Bairro quente</em> picked for the Monday warm-up</>, who: 'João Ribeiro · single track placement · "for the kitchen, 8pm"', when: 'Mon 1 Jun' },
]

export const CITIES: DashCity[] = [
  { nm: 'Lisbon, PT', pct: 62 },
  { nm: 'São Paulo, BR', pct: 14 },
  { nm: 'Porto, PT', pct: 8 },
  { nm: 'Berlin, DE', pct: 5 },
  { nm: 'Mexico City, MX', pct: 4 },
  { nm: 'Paris, FR', pct: 3 },
  { nm: '35 other cities', pct: 4 },
]
