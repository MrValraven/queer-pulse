import type { IconType } from 'react-icons'
import { FiLock, FiEye, FiSlash, FiMessageCircle, FiBookOpen } from 'react-icons/fi'
import { MdAccessible } from 'react-icons/md'
import { MEMBERS, memberName } from '../members/data/members'

export const NAV = [
  { id: 'health', label: 'Community health' },
  { id: 'moderation', label: 'Moderation' },
  { id: 'council', label: 'Advisory council' },
  { id: 'principles', label: 'Principles' },
  { id: 'finances', label: 'Finances' },
  { id: 'decisions', label: 'Decision log' },
  { id: 'raise', label: 'Raise a concern' },
]

export const HEALTH = [
  { n: '247', l: 'Active members', trend: '↑ 38 this quarter', up: true },
  { n: '96%', l: 'Member retention rate', trend: 'Steady', up: false },
  { n: '12', l: 'Reports filed this quarter', trend: 'All resolved', up: false },
  { n: '3', l: 'Members removed', trend: 'Code of care violations', up: false },
  { n: '34', l: 'Gatherings hosted', trend: '↑ 8 vs Q1', up: true },
  { n: '1', l: 'Moderation appeal upheld', trend: 'of 2 filed', up: false },
]

export const STEPS = [
  { title: 'Report filed', text: 'Any member can report another member, a gathering, a board post, or any content. Reports are confidential — the reported person is not told who filed the report.' },
  { title: 'Review within 48 hours', text: 'The moderation team reviews the report within 48 hours. For urgent safety issues, same-day. The person who filed is updated at each stage.' },
  { title: 'Decision and communication', text: 'Possible outcomes: no action (with explanation), direct communication, warning, temporary suspension, permanent removal. The reported person is informed of the outcome but not the reporter.' },
  { title: 'Right to appeal', text: 'Any member can appeal a moderation decision within 14 days. Appeals are reviewed by the advisory council, not the original team. The outcome is final.' },
]

export const COUNCIL = [
  { i: MEMBERS.mariana.initials, name: memberName('mariana'), role: 'Psychologist · Chair', bg: 'rgba(74,140,111,.15)', color: 'var(--jade)' },
  { i: 'RB', name: 'Raquel Baptista', role: 'Lawyer · Legal advisor', bg: 'rgba(122,82,184,.12)', color: '#7A52B8' },
  { i: 'CV', name: 'Catarina Vaz', role: 'Housing activist', bg: 'rgba(45,27,61,.1)', color: 'var(--plum)' },
  { i: 'JF', name: 'Jonas Ferreira', role: 'Healthcare advocate', bg: 'rgba(74,140,111,.12)', color: 'var(--jade)' },
]

export const PRINCIPLES: { icon: IconType; title: string; text: string }[] = [
  { icon: FiLock, title: 'We will never sell member data', text: 'Member data is used only to run the platform. We never share, sell, or use it for advertising.' },
  { icon: FiEye, title: 'Visibility is always your choice', text: 'You control who can see your profile, posts, and activity. Defaults are conservative.' },
  { icon: FiSlash, title: 'No algorithms deciding who you see', text: 'No engagement algorithm. Members are not ranked. You see what you choose to see.' },
  { icon: FiMessageCircle, title: 'Community has a voice in decisions', text: 'Significant changes are discussed in the Forum before implementation; proposals go to the council.' },
  { icon: FiBookOpen, title: 'Transparency is non-negotiable', text: 'Quarterly health reports. Published moderation stats. Council meetings summarised publicly.' },
  { icon: MdAccessible, title: 'Access is not conditional on ability to pay', text: 'A sliding scale for all paid gatherings. No one is excluded for financial circumstances.' },
]

export const FIN_STATS = [
  { n: '€4,620', l: 'Total income this quarter', trend: '↑ €380 vs Q1', up: true },
  { n: '€4,150', l: 'Total expenditure', trend: 'Within budget', up: false },
  { n: '€470', l: 'Quarterly surplus', trend: 'Added to reserve', up: false },
  { n: '28', l: 'Members on free or reduced access', trend: 'No questions asked', up: false },
]

export interface FinLine {
  label: string
  amount: string
  note: string
  width: number
  items: { name: string; period: string; amount: string }[]
  total: { label: string; amount: string }
}

export const INCOME: FinLine[] = [
  {
    label: 'Member contributions',
    amount: '€1,840',
    note: 'Sliding scale €5–€25/month. 99 of 247 members contribute. No one is required to. No one is chased.',
    width: 80,
    items: [
      { name: 'Pay-what-you-can tier (€5–€9/mo)', period: '28 members', amount: '€504' },
      { name: 'Standard tier (€10–€14/mo)', period: '38 members', amount: '€836' },
      { name: 'Supporter tier (€15–€25/mo)', period: '33 members', amount: '€500' },
    ],
    total: { label: '99 contributing members', amount: '€1,840' },
  },
  {
    label: 'Gathering ticket sales',
    amount: '€2,180',
    note: 'Net figure. QueerPulse takes 0% of ticket revenue — 100% goes to hosts. This line covers only events we organise ourselves.',
    width: 94,
    items: [
      { name: 'Newcomer welcome dinner (April)', period: '26 tickets · €8', amount: '€208' },
      { name: 'Community skills fair (April)', period: '45 tickets · €12', amount: '€540' },
      { name: 'Queer cinema nights × 2 (May–June)', period: '38 tickets · €10', amount: '€380' },
      { name: 'Mental health workshops × 2', period: '24 tickets · €6', amount: '€144' },
      { name: 'Summer community dinner (June)', period: '47 tickets · €18', amount: '€846' },
      { name: 'Miscellaneous', period: '—', amount: '€62' },
    ],
    total: { label: '6 platform-run events', amount: '€2,180' },
  },
  {
    label: 'Partner support',
    amount: '€600',
    note: 'Restricted grants from two organisations. Disclosed in full below. Neither has any influence over platform decisions.',
    width: 26,
    items: [
      { name: 'Fundação Calouste Gulbenkian', period: 'Mental Health Fund', amount: '€400' },
      { name: 'ILGA Portugal', period: 'Community events', amount: '€200' },
    ],
    total: { label: '2 partners · restricted use only', amount: '€600' },
  },
]

export const EXPENSE: FinLine[] = [
  {
    label: 'Platform & tools',
    amount: '€520',
    note: 'Hosting, email infrastructure, storage, and development tools. No proprietary stack — we use open-source where possible.',
    width: 26,
    items: [
      { name: 'Domain registration (queerpulse.pt + .com)', period: '€3/mo', amount: '€9' },
      { name: 'Web server (Hetzner CX41)', period: '€20/mo', amount: '€60' },
      { name: 'Database hosting (managed PostgreSQL)', period: '€28/mo', amount: '€84' },
      { name: 'Email sending (Postmark)', period: '€24/mo', amount: '€72' },
      { name: 'File & media storage (Backblaze B2)', period: '€9/mo', amount: '€27' },
      { name: 'Video calls (Jitsi, self-hosted)', period: '€12/mo', amount: '€36' },
      { name: 'Security & monitoring (Sentry + uptime)', period: '€22/mo', amount: '€66' },
      { name: 'Development tools (GitHub Pro, CI)', period: '€15/mo', amount: '€45' },
      { name: 'Design & collaboration tools', period: '€14/mo', amount: '€42' },
      { name: 'Backup & disaster recovery', period: '€13/mo', amount: '€39' },
      { name: 'Miscellaneous', period: '—', amount: '€40' },
    ],
    total: { label: '11 line items', amount: '€520' },
  },
  {
    label: 'Community events',
    amount: '€1,240',
    note: 'Venue hire, equipment, and materials for platform-organised gatherings. Newcomer events, mental health sessions, and community dinners.',
    width: 60,
    items: [
      { name: 'Newcomer dinner — venue (Casa do Alentejo)', period: 'April', amount: '€180' },
      { name: 'Newcomer dinner — food & catering', period: 'April', amount: '€220' },
      { name: 'Trans healthcare session — equipment', period: 'May · venue donated', amount: '€40' },
      { name: 'Skills fair — venue hire (LX Factory)', period: 'April', amount: '€280' },
      { name: 'Skills fair — materials & printing', period: 'April', amount: '€60' },
      { name: 'Queer cinema nights × 2 (Cinema Ideal)', period: 'May–June', amount: '€180' },
      { name: 'Mental health peer support rooms × 4', period: 'Quarterly', amount: '€80' },
      { name: 'Archive Night room hire × 3', period: 'Quarterly', amount: '€60' },
      { name: 'Miscellaneous supplies', period: '—', amount: '€140' },
    ],
    total: { label: '9 line items · 7 events subsidised', amount: '€1,240' },
  },
  {
    label: 'Mental health fund',
    amount: '€740',
    note: 'Subsidised therapy sessions for members who need them. Funded in part by the Gulbenkian grant. 11 sessions this quarter.',
    width: 36,
    items: [
      { name: 'Individual therapy subsidies (8 members)', period: 'avg €46/session', amount: '€368' },
      { name: 'Group therapy facilitation × 3 sessions', period: '€90/session', amount: '€270' },
      { name: 'Crisis support disbursements (2 members)', period: '€51 each', amount: '€102' },
    ],
    total: { label: '11 sessions · 10 members supported', amount: '€740' },
  },
  {
    label: 'Micro-grants',
    amount: '€800',
    note: 'Direct financial support to members for community projects, emergency needs, and creative work. 6 grants this quarter.',
    width: 38,
    items: [
      { name: 'Grant #1 — Housing emergency support', period: '—', amount: '€200' },
      { name: 'Grant #2 — Creative project (documentary)', period: '—', amount: '€150' },
      { name: 'Grant #3 — Trans healthcare travel costs', period: '—', amount: '€120' },
      { name: 'Grant #4 — Community event materials', period: '—', amount: '€80' },
      { name: 'Grant #5 — Skills training course fee', period: '—', amount: '€150' },
      { name: 'Grant #6 — Emergency relocation support', period: '—', amount: '€100' },
    ],
    total: { label: '6 grants awarded this quarter', amount: '€800' },
  },
  {
    label: 'Magazine production',
    amount: '€380',
    note: 'Contributor honoraria, editorial costs, and design. Contributors are paid — no unpaid labour policy.',
    width: 18,
    items: [
      { name: 'Contributor honoraria (9 pieces)', period: 'avg €28/piece', amount: '€252' },
      { name: 'Photography & illustration (2 pieces)', period: '—', amount: '€64' },
      { name: 'Editorial coordination', period: '—', amount: '€40' },
      { name: 'Design & layout', period: '—', amount: '€24' },
    ],
    total: { label: 'Issue 18 · June 2026', amount: '€380' },
  },
  {
    label: 'Moderator honoraria',
    amount: '€470',
    note: 'Small quarterly payments to our three volunteer moderators. Moderation is difficult work and should not be entirely unpaid.',
    width: 22,
    items: [
      { name: 'Mariana — lead moderator', period: 'Q2 2026', amount: '€200' },
      { name: 'Rui — moderator', period: 'Q2 2026', amount: '€150' },
      { name: 'Ana — moderator (part-time)', period: 'Q2 2026', amount: '€120' },
    ],
    total: { label: '3 moderators', amount: '€470' },
  },
]

export const EVENTS: [string, string][] = [
  ['Hosts keep 100% of ticket sales.', 'QueerPulse charges no platform fee. Sell 20 tickets at €8, you receive €160.'],
  ['Sliding scale is mandatory.', 'Every paid gathering must offer a reduced rate. Members request it privately, no explanation asked.'],
  ['QueerPulse subsidises specific event types.', 'Newcomer, mental health, and education events can apply for a venue subsidy. We covered 7 this quarter.'],
  ['No paid promotion.', 'Events are never ranked by payment. Only recency and community engagement affect visibility.'],
  ['This quarter:', '34 gatherings hosted. ~€8,400 in ticket revenue — all of which went directly to hosts.'],
]

export const DECISIONS: [string, string][] = [
  ['May 2026 — Sliding scale introduced for gatherings.', 'Following a forum discussion by Catarina Vaz, the council agreed to implement a sliding scale for all paid gatherings. 23 members participated.'],
  ['April 2026 — Forum launched.', 'Following member requests for a place to discuss longer-form topics. Categories and guidelines co-designed with 12 members over three weeks.'],
  ['March 2026 — Visibility defaults made more conservative.', 'New members now default to "network only" instead of "open", and can open up when comfortable.'],
  ['February 2026 — Language toggle added.', 'PT/EN toggle added to all pages following requests from Portuguese-speaking members.'],
]
