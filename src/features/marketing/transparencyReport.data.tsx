import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { routes } from '../../app/routeMap'

export const TABS: [string, string][] = [
  ['money', 'Money'],
  ['people', 'People'],
  ['moderation', 'Moderation'],
  ['requests', 'Gov requests'],
  ['mistakes', 'Mistakes'],
  ['governance', 'How decisions get made'],
]

export const SOURCES = [
  { amt: <><em>€186k</em></>, name: 'Sustainer memberships', detail: '1,938 members · 67% of total · paid 4-year retention' },
  { amt: <>€<em>52</em>k</>, name: 'One-off donations', detail: '1,247 contributions · avg €42 · 18% of total' },
  { amt: <>€<em>40</em>k</>, name: 'Programme grants', detail: '3 grants · Fundação Calouste Gulbenkian, Câmara Municipal de Lisboa, Open Society · 14%' },
]

export const ALLOC = [
  { color: 'var(--accent)', w: 42, label: 'Programmes & community grants', detail: 'Micro-grants (€38k), open clinic nights, gatherings subsidies, magazine production, the print issues', amt: '€112,300', pct: '42%' },
  { color: 'var(--jade)', w: 22, label: 'Community staff & moderation', detail: 'Two part-time moderators, one community manager, crisis chat paid operators', amt: '€58,830', pct: '22%' },
  { color: 'var(--plum)', w: 18, label: 'Infrastructure', detail: 'Servers, security audits, the part-time engineer, email, payment processing', amt: '€48,140', pct: '18%' },
  { color: 'rgba(45,27,61,.5)', w: 10, label: 'Partner & legal operations', detail: 'ILGA legal-consult programme (€45/consult), policy work, the auditor', amt: '€26,750', pct: '10%' },
  { color: 'rgba(45,27,61,.30)', w: 5, label: 'Reserves', detail: 'Building a 4-month operational runway · target is 6 months by 2027', amt: '€13,370', pct: '5%' },
  { color: 'rgba(45,27,61,.18)', w: 3, label: 'Admin & the boring bits', detail: 'Accounting software, the legal entity, postage, the office at Largo dos Anjos', amt: '€8,030', pct: '3%' },
]

export interface Bignum {
  lbl: string
  b: ReactNode
  p: ReactNode
  delta?: string
  down?: boolean
}

export const PEOPLE1: Bignum[] = [
  { lbl: 'Active members', b: <>1,<em>847</em></>, p: 'Signed in within last 60 days', delta: '+18% YoY' },
  { lbl: 'Vouched members', b: <><em>94</em>%</>, p: 'The other 6% are press & legacy founders', delta: '+2 pts' },
  { lbl: 'Gatherings held', b: <><em>284</em></>, p: 'Average 23/month · 78% sold out', delta: '+62 events' },
  { lbl: 'Micro-grants given', b: <><em>147</em></>, p: 'Average €128 · 100% disbursed within 14 days', delta: '+34 grants' },
]
export const PEOPLE2: Bignum[] = [
  { lbl: 'Members in Lisbon', b: <>1,<em>612</em></>, p: '87% — most are within 5 km of Anjos' },
  { lbl: 'Members elsewhere in PT', b: <>147</>, p: 'Porto (84), Coimbra (24), Faro (11), other (28)' },
  { lbl: 'Trans / non-binary members', b: <><em>22</em>%</>, p: 'Self-reported, opt-in. Above Lisbon baseline.' },
  { lbl: 'On solidarity pricing', b: <>18%</>, p: '336 members · zero questions asked', delta: '+4 pts' },
]

export const MOD_STATS: Bignum[] = [
  { lbl: 'Reports filed', b: <><em>312</em></>, p: 'By members · 0.17 per active member' },
  { lbl: 'Actions taken', b: <><em>184</em></>, p: '59% of reports led to action' },
  { lbl: 'Median response time', b: <><em>4.2</em>h</>, p: 'Target was 6 hours · we made it', delta: '−1.8h' },
  { lbl: 'Appeals overturned', b: <><em>11</em>%</>, p: 'Out of 27 appeals · we got it wrong 3 times', delta: '+2 pts', down: true },
]
export const MOD_ROWS = [
  { reason: 'Harassment / personal attack', count: <>5<em>4</em></>, delta: '+18%', up: true, pct: '29%' },
  { reason: 'Outing / privacy violation', count: <>3<em>1</em></>, delta: '−4%', pct: '17%' },
  { reason: 'Spam / promotional', count: <>28</>, delta: '+12%', up: true, pct: '15%' },
  { reason: 'Vouch abuse / fraudulent invite', count: <>2<em>2</em></>, delta: '+8%', up: true, pct: '12%' },
  { reason: 'Sexual content where not consented', count: <>19</>, delta: '−22%', pct: '10%' },
  { reason: 'Bigotry (transphobia, racism)', count: <>14</>, delta: '−9%', pct: '8%' },
  { reason: 'Off-platform conduct flagged', count: <>9</>, delta: '+50%', up: true, pct: '5%' },
  { reason: 'Other', count: <>7</>, delta: '−', pct: '4%' },
]

export const REQUESTS = [
  { h: <>Court orders for member data <em>· complied with valid scope</em></>, d: <>Two orders received from <b>Tribunal Judicial da Comarca de Lisboa</b>, both narrowly scoped to specific investigations of hate-crime suspects (not our members). We provided only metadata legally required; member privacy preserved where possible.</>, r: <><em>2</em></>, rl: 'Court orders · complied' },
  { h: <>Informal requests <em>· declined</em></>, d: <>Four informal asks from various ministries and one foreign police liaison. None had a valid Portuguese court order. <b>We declined all four</b> and informed members affected (where legal to do so).</>, r: <><em>4</em></>, rl: 'Declined' },
  { h: <>Subpoenas from civil parties</>, d: <>One subpoena in a civil discrimination case where a member chose to be a witness, with their explicit consent. We provided records limited to what they themselves requested be shared.</>, r: <><em>1</em></>, rl: 'Member-authorised' },
]

export const MISTAKES = [
  { meta: 'February · moderation', h: <>We deleted a post we shouldn't have <em>(twice).</em></>, text: <>Two posts from the same member criticising our partnership with ILGA on the 2024 self-determination amendments were removed by a new moderator who interpreted them as "personal attacks". <b>They weren't — they were disagreement.</b> Both were reinstated within 36 hours after the appeal.</>, fix: <><b>Changed since:</b> we now require a 2-mod sign-off before any post critical of the organisation can be removed, and we added "disagreement is not harassment" to the moderator training module.</> },
  { meta: 'May · vouching', h: <>Our invite ratio got too generous, briefly.</>, text: <>For about 6 weeks in May–June, members could invite 4 people instead of the usual 2 (a misconfiguration after a release). The vouching system handled it fine in 97% of cases, but <b>three vouched-in members did not turn out to be who they said they were</b> — two were marketing scrapers, one was a journalist using a fake identity.</>, fix: <><b>Changed since:</b> invite-cap is now hard-coded in two places. The three accounts were removed. We've added a quarterly "did the invite system get loosened?" check.</> },
  { meta: 'November · finance', h: <>We undercharged some Sustainer renewals.</>, text: <>A pricing update in November rolled out 12 hours late, meaning <b>around 48 members were charged the old rate</b> (€84) when they renewed during that window. We <em>did not</em> charge them the difference. The loss was about €580 and we ate it.</>, fix: <><b>Changed since:</b> pricing updates now ship at 03:00 WET behind a feature flag with rollback. We also wrote to all 48 members and offered them a free year extension. 32 declined; 16 took it.</> },
]

export const GOV_STATS: Bignum[] = [
  { lbl: 'Annual Assembly', b: <><em>1</em></>, p: 'Held 14 November in Anjos · 312 of 1,847 members attended in person or online' },
  { lbl: 'Resolutions voted', b: <><em>11</em></>, p: '9 passed, 2 sent back for redrafting · quorum was 184 votes' },
  { lbl: 'Public minutes', b: <>100<em>%</em></>, p: <>All meetings minuted, posted within 7 days · <Link to={routes.governance}>browse →</Link></> },
  { lbl: 'Rotating circle members', b: <><em>23</em></>, p: 'Across 4 circles · grants, moderation, finance, hosting · 12-month max term' },
]
