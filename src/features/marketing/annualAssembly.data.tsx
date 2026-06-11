import { type ReactNode } from 'react'

export type AssemblyVote = 'yes' | 'no' | 'abstain' | null

export interface AgendaItem {
  h: string
  m: string
  title: ReactNode
  sub: string
  tag: string
  tagClass: string
}

export interface Resolution {
  num: ReactNode
  title: ReactNode
  threshold: string
  desc: ReactNode
  yesLabel: string
  bar: { y: number; n: number; a: number }
  tally: { yes: string; no: string; abstain: string; extra?: ReactNode }
  defaultVote?: AssemblyVote
}

export interface HistoryItem {
  y: string
  title: string
  sub: string
}

export const AGENDA: AgendaItem[] = [
  { h: '10', m: ':00', title: <>Welcome &amp; ground rules</>, sub: 'Marta opens · what\'s binding, what\'s discussion, what\'s tradition. Coffee.', tag: 'Open', tagClass: 'tagReport' },
  { h: '10', m: ':30', title: <>2025 review · Catarina &amp; André</>, sub: 'Co-treasurers walk the transparency report. Q&A.', tag: 'Report', tagClass: 'tagReport' },
  { h: '11', m: ':30', title: <>Resolutions 1–4 · <em>budget &amp; reserves</em></>, sub: '2027 budget, reserve target, micro-grant cap, ILGA payment renewal.', tag: 'Vote', tagClass: 'tagVote' },
  { h: '13', m: ':00', title: <>Lunch · Sandra\'s catering</>, sub: 'Pastéis, salada, sopa. Vegan available. Conversations happen here.', tag: 'Break', tagClass: 'tagBreak' },
  { h: '14', m: ':30', title: <>Resolutions 5–7 · <em>code &amp; manifesto</em></>, sub: 'v2.2 amendments to the Code of Conduct, new clause in §06, manifesto stanza 4 wording.', tag: 'Vote', tagClass: 'tagVote' },
  { h: '16', m: ':00', title: <>Open floor · expansion to Porto</>, sub: 'Discussion, no vote. Porto launches in August; this is a check-in.', tag: 'Discuss', tagClass: 'tagDiscuss' },
  { h: '17', m: ':30', title: <>Day 1 close · drinks &amp; dinner across the road</>, sub: 'Optional. We hold the table at Café Beirão until 22:00.', tag: 'Open', tagClass: 'tagReport' },
  { h: '10', m: ':00', title: <>Day 2 · Resolutions 8–11 · <em>circles &amp; partners</em></>, sub: 'Standing-circle terms, ILGA renewal scope, new partner with Clínica do Largo.', tag: 'Vote', tagClass: 'tagVote' },
  { h: '12', m: ':30', title: <>Member proposals · open floor</>, sub: 'Anyone with a 2-page proposal can pitch · 5 min each, no vote · proposals that gain traction join the next agenda.', tag: 'Discuss', tagClass: 'tagDiscuss' },
  { h: '14', m: ':00', title: <>Tallying, ratification &amp; close</>, sub: 'We read out the results, sign the resolutions, and close the assembly.', tag: 'Close', tagClass: 'tagReport' },
]

export const RESOLUTIONS: Resolution[] = [
  {
    num: <>R<em>·01</em> · Approve 2027 budget</>,
    title: null,
    threshold: 'SIMPLE MAJORITY',
    desc: <>Approve the proposed 2027 budget of <b>€312k</b> in total spend, including a <em>22% allocation to community staff</em> and €40k for Porto launch costs. Full breakdown in the appendix.</>,
    yesLabel: 'Yes · approve',
    bar: { y: 78, n: 12, a: 10 },
    tally: { yes: '243 · 78%', no: '37 · 12%', abstain: '32 · 10%', extra: <span style={{ marginLeft: 'auto', color: 'var(--ink-40)' }}>312 of 1,847 voted</span> },
    defaultVote: 'yes',
  },
  {
    num: <>R<em>·02</em> · Raise the micro-grant cap to <em>€300</em></>,
    title: null,
    threshold: 'SIMPLE MAJORITY',
    desc: <>Increase the per-grant cap from €200 to €300, with the additional headroom funded by the 2025 surplus. Median grant in 2025 was €128; this raises the ceiling for one-off larger needs.</>,
    yesLabel: 'Yes · approve',
    bar: { y: 84, n: 6, a: 10 },
    tally: { yes: '258 · 84%', no: '19 · 6%', abstain: '32 · 10%' },
  },
  {
    num: <>R<em>·05</em> · Code of Conduct v2.2 · <em>off-platform clause</em></>,
    title: null,
    threshold: 'SUPERMAJORITY · 60%',
    desc: <>Adopt the proposed §06 clarification on off-platform conduct. The amendment narrows "material harm" to specific documented harm to QP members, and adds an explicit "criticism of QueerPulse" carve-out. <em>Open comment period closed 1 Nov.</em></>,
    yesLabel: 'Yes · adopt',
    bar: { y: 62, n: 21, a: 17 },
    tally: { yes: '192 · 62%', no: '67 · 21%', abstain: '53 · 17%', extra: <span style={{ marginLeft: 'auto', color: 'var(--jade)', fontWeight: 700 }}>Threshold met · would pass</span> },
  },
]

export const HISTORY: HistoryItem[] = [
  { y: '5', title: 'Eleven resolutions · nine passed', sub: 'Notable: §06 off-platform first added · Porto green-lit · solidarity rate codified' },
  { y: '4', title: 'Eight resolutions · seven passed', sub: 'First assembly to ratify the Code of Conduct. Sustainer pricing set at €96.' },
  { y: '3', title: 'Founding assembly · five resolutions', sub: 'The constitution was ratified. ILGA partnership signed off.' },
]
