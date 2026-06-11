import { type ReactNode } from 'react'

export type Stream = 'dispatch' | 'long' | 'trans'

export interface Row {
  stream: Stream
  num: string
  numLabel: string
  title: ReactNode
  ed?: string
  dek: string
  date: string
  streamMeta: string
  opens: string
  rate: string
}

export interface Year {
  label: ReactNode
  meta: string
  rows: Row[]
}

export const YEARS: Year[] = [
  {
    label: <>2026 <em>· in flight</em></>,
    meta: '22 issues sent so far · open rate averaging 58%',
    rows: [
      { stream: 'dispatch', num: '52', numLabel: 'Dispatch', title: <>The summer slowdown <em>edition.</em></>, ed: 'Just sent', dek: 'Summer reading list, July gatherings calendar, and the new vetted-therapist additions.', date: '8 Jun 2026', streamMeta: 'Community · fortnightly', opens: '8.4k', rate: 'opens · 61%' },
      { stream: 'long', num: '18', numLabel: 'Long', title: <>Five things I learned <em>navigating Lisbon's trans health system.</em></>, dek: 'The full long-form sent direct from Sara Pinheiro — Issue 09 cover story, distributed as the monthly long-reads pick.', date: '6 Jun 2026', streamMeta: 'Long reads · monthly', opens: '2.1k', rate: 'opens · 72%' },
      { stream: 'dispatch', num: '51', numLabel: 'Dispatch', title: <>Pride month, and the <em>boring stuff that matters.</em></>, dek: 'March schedule, legal observer recruitment, an open call for 2026 grants. Plus a small piece on the Mercearia Rosa.', date: '25 May 2026', streamMeta: 'Community · fortnightly', opens: '8.3k', rate: 'opens · 59%' },
      { stream: 'trans', num: '08', numLabel: 'Trans Hub', title: <>The 2026 vetted-providers list — <em>refreshed.</em></>, dek: '47 names, all re-checked in 90 days. Includes new endocrinology and gynaecology entries. Anonymised case notes.', date: '20 May 2026', streamMeta: 'Trans Hub · monthly', opens: '1.6k', rate: 'opens · 74%' },
      { stream: 'dispatch', num: '50', numLabel: 'Dispatch', title: <>Fiftieth dispatch. A little <em>thank you.</em></>, dek: 'A two-year retrospective, plus the usual: gatherings, jobs, new members, what we\'re reading.', date: '11 May 2026', streamMeta: 'Community · fortnightly', opens: '8.4k', rate: 'opens · 68%' },
      { stream: 'long', num: '17', numLabel: 'Long', title: <>What the SNS gets right (and <em>where it still leaves you waiting</em>).</>, dek: 'Sara Pinheiro\'s six-month report from three regional clinics.', date: '8 May 2026', streamMeta: 'Long reads · monthly', opens: '2.0k', rate: 'opens · 69%' },
      { stream: 'dispatch', num: '49', numLabel: 'Dispatch', title: <>May Day. The queer history of <em>the trade union.</em></>, dek: 'A short reading list, this year\'s march logistics, and the Caregivers cohort opening soon.', date: '27 Apr 2026', streamMeta: 'Community · fortnightly', opens: '8.2k', rate: 'opens · 57%' },
    ],
  },
  {
    label: '2025',
    meta: '38 issues · biggest single open day was the launch of Issue 06',
    rows: [
      { stream: 'dispatch', num: '30', numLabel: 'Dispatch', title: <>The end-of-year issue.</>, dek: '2025 in numbers, the Year in Review (with its caveats), and what\'s planned for 2026.', date: '22 Dec 2025', streamMeta: 'Community', opens: '7.6k', rate: 'opens · 64%' },
      { stream: 'long', num: '12', numLabel: 'Long', title: <>The visa queue is <em>a kind of closet.</em></>, dek: 'Three queer migrants on what it means to wait for a residency permit.', date: '18 Dec 2025', streamMeta: 'Long reads', opens: '1.9k', rate: 'opens · 71%' },
      { stream: 'dispatch', num: '29', numLabel: 'Dispatch', title: <>Cold weather, <em>warm rooms.</em></>, dek: 'A list of the indoor gatherings, the chosen-family Christmas dinner, and the open clinic schedule.', date: '8 Dec 2025', streamMeta: 'Community', opens: '7.4k', rate: 'opens · 58%' },
      { stream: 'dispatch', num: '28', numLabel: 'Dispatch', title: <>Trans Day of Remembrance.</>, dek: 'The names we\'re holding, the gathering, and a quiet ask.', date: '20 Nov 2025', streamMeta: 'Community', opens: '7.3k', rate: 'opens · 73%' },
      { stream: 'trans', num: '04', numLabel: 'Trans Hub', title: <>Hormone supply shortages — <em>what to do.</em></>, dek: 'A practical guide, plus the pharmacist we trust.', date: '3 Nov 2025', streamMeta: 'Trans Hub', opens: '1.4k', rate: 'opens · 78%' },
    ],
  },
]

export const TABS: { id: Stream | 'all'; label: string; count: string }[] = [
  { id: 'all', label: 'All', count: '78' },
  { id: 'dispatch', label: 'Community dispatch', count: '52' },
  { id: 'long', label: 'Long reads · monthly', count: '18' },
  { id: 'trans', label: 'Trans Hub bulletin', count: '8' },
]

export const STREAM_CLASS: Record<Stream, string> = {
  dispatch: '',
  long: 'streamLong',
  trans: 'streamTrans',
}
