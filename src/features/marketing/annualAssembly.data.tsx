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

/** Extra resolutions revealed by "Show 8 more resolutions →". */
export const MORE_RESOLUTIONS: Resolution[] = [
  {
    num: <>R<em>·03</em> · Set 2027 <em>reserve target</em></>,
    title: null,
    threshold: 'SIMPLE MAJORITY',
    desc: <>Hold a six-month operating reserve (≈<b>€156k</b>) ring-fenced from programme spend, reviewed each quarter by the co-treasurers.</>,
    yesLabel: 'Yes · approve',
    bar: { y: 81, n: 9, a: 10 },
    tally: { yes: '253 · 81%', no: '28 · 9%', abstain: '31 · 10%' },
  },
  {
    num: <>R<em>·04</em> · Renew the <em>ILGA Portugal</em> partnership</>,
    title: null,
    threshold: 'SIMPLE MAJORITY',
    desc: <>Renew the legal-aid and helpline-handoff agreement with ILGA Portugal for a further two years at the current €18k/year.</>,
    yesLabel: 'Yes · renew',
    bar: { y: 90, n: 3, a: 7 },
    tally: { yes: '281 · 90%', no: '9 · 3%', abstain: '22 · 7%' },
  },
  {
    num: <>R<em>·06</em> · New §06 clause · <em>data minimisation</em></>,
    title: null,
    threshold: 'SUPERMAJORITY · 60%',
    desc: <>Add an explicit data-minimisation commitment to the Code of Conduct: no retention of message content beyond 30 days unless flagged.</>,
    yesLabel: 'Yes · adopt',
    bar: { y: 71, n: 14, a: 15 },
    tally: { yes: '221 · 71%', no: '44 · 14%', abstain: '47 · 15%' },
  },
  {
    num: <>R<em>·07</em> · Manifesto · <em>stanza 4 wording</em></>,
    title: null,
    threshold: 'SUPERMAJORITY · 60%',
    desc: <>Adopt the revised wording of manifesto stanza 4, replacing "grow" with "deepen" to reaffirm the no-scale commitment.</>,
    yesLabel: 'Yes · adopt',
    bar: { y: 88, n: 5, a: 7 },
    tally: { yes: '274 · 88%', no: '16 · 5%', abstain: '22 · 7%' },
  },
  {
    num: <>R<em>·08</em> · Standing-circle <em>terms</em></>,
    title: null,
    threshold: 'SIMPLE MAJORITY',
    desc: <>Set standing-circle terms at 12 months with a one-term renewal cap, to keep rotation healthy.</>,
    yesLabel: 'Yes · approve',
    bar: { y: 76, n: 13, a: 11 },
    tally: { yes: '237 · 76%', no: '41 · 13%', abstain: '34 · 11%' },
  },
  {
    num: <>R<em>·09</em> · New partner · <em>Clínica do Largo</em></>,
    title: null,
    threshold: 'SIMPLE MAJORITY',
    desc: <>Approve a referral partnership with Clínica do Largo for trans-affirming primary care at member rates.</>,
    yesLabel: 'Yes · approve',
    bar: { y: 85, n: 6, a: 9 },
    tally: { yes: '265 · 85%', no: '19 · 6%', abstain: '28 · 9%' },
  },
  {
    num: <>R<em>·10</em> · Porto launch · <em>budget release</em></>,
    title: null,
    threshold: 'SIMPLE MAJORITY',
    desc: <>Release the €40k Porto launch budget on the August timeline, contingent on a local host circle of at least five members.</>,
    yesLabel: 'Yes · release',
    bar: { y: 79, n: 11, a: 10 },
    tally: { yes: '247 · 79%', no: '34 · 11%', abstain: '31 · 10%' },
  },
  {
    num: <>R<em>·11</em> · Solidarity rate · <em>keep free tier</em></>,
    title: null,
    threshold: 'SUPERMAJORITY · 60%',
    desc: <>Reaffirm the free solidarity tier as permanent and non-revocable, funded by Sustainer memberships.</>,
    yesLabel: 'Yes · reaffirm',
    bar: { y: 94, n: 2, a: 4 },
    tally: { yes: '293 · 94%', no: '6 · 2%', abstain: '13 · 4%', extra: <span style={{ marginLeft: 'auto', color: 'var(--jade)', fontWeight: 700 }}>Threshold met · would pass</span> },
  },
]

export const HISTORY: HistoryItem[] = [
  { y: '5', title: 'Eleven resolutions · nine passed', sub: 'Notable: §06 off-platform first added · Porto green-lit · solidarity rate codified' },
  { y: '4', title: 'Eight resolutions · seven passed', sub: 'First assembly to ratify the Code of Conduct. Sustainer pricing set at €96.' },
  { y: '3', title: 'Founding assembly · five resolutions', sub: 'The constitution was ratified. ILGA partnership signed off.' },
]
