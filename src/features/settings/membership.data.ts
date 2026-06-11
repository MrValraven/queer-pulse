export type TierKey = 'hardship' | 'solidarity' | 'sustaining'

export interface Tier {
  key: TierKey
  name: string
  /** Short price hint shown under the tier name. */
  sub: string
  /** Paragraph shown in the description box when the tier is selected. */
  desc: string
  /** Selectable monthly amounts (euros, or 'other'); null for hardship. */
  amounts: string[] | null
  /** Amount pre-selected when the tier is picked. */
  defaultAmt?: string
}

export const TIERS: Tier[] = [
  {
    key: 'hardship',
    name: 'Hardship waiver',
    sub: '€0 / month',
    desc: 'Community supported — fully funded by Sustaining members. No questions asked, no expiry, no means testing.',
    amounts: null,
  },
  {
    key: 'solidarity',
    name: 'Solidarity',
    sub: '€5 – €20 / mo',
    desc: 'The most common choice. Pay what genuinely sustains you — anything between €5 and €20.',
    amounts: ['5', '10', '15', 'other'],
    defaultAmt: '10',
  },
  {
    key: 'sustaining',
    name: 'Sustaining',
    sub: '€30+ / mo',
    desc: "Your contribution funds access for members who can't afford it. Any amount above €30 goes directly into the solidarity pool.",
    amounts: ['20', '30', '50', 'other'],
    defaultAmt: '20',
  },
]

export const CURRENT_PLAN = {
  tier: 'Sustaining member',
  amount: '€20',
  cadence: '/ month',
  since: 'Member since March 2024',
}

export const BILLING_ROWS: { label: string; value: string; ok?: boolean }[] = [
  { label: 'Last payment', value: '€20 · 5 May 2026 ✓', ok: true },
  { label: 'Next billing date', value: '5 June 2026' },
  { label: 'Billing cycle', value: 'Monthly' },
  { label: 'Amount', value: '€20.00' },
]

export const PAYMENT_METHOD = {
  brand: 'VISA',
  number: '•••• •••• •••• 4242',
  expiry: 'Expires 09 / 28',
}

export const INVOICES = ['May 2026', 'April 2026', 'March 2026'].map((period) => ({
  period,
  amount: '€20.00',
}))

export const ACCESS_ITEMS: { label: string; note: string }[] = [
  { label: 'Magazine & editorial', note: 'All issues + archive' },
  { label: 'Community forum', note: 'Post, reply, vote' },
  { label: 'Direct messages', note: 'Unlimited conversations' },
  { label: 'Reading groups', note: '8 groups currently running' },
  { label: 'Gathering tickets', note: 'Member pricing on all paid events' },
  { label: 'Job board & skill listings', note: 'Post and apply' },
  { label: 'Resource library', note: 'Housing, health, legal, finance' },
  { label: 'Mental health access programme', note: 'Subsidised therapy referrals' },
  { label: 'Micro-grant applications', note: 'Quarterly — up to €200' },
  { label: 'Member directory & discovery', note: 'Find and connect with 247 members' },
]

export const CONTRIBUTION = {
  total: '€60',
  label: 'contributed to date',
  since: 'Since March 2024 · 3 months',
  impacts: [
    'Approximately 6 hours of the mental health access programme',
    '3 micro-grants for members in financial need',
    'Platform access for ~2 members on hardship waivers',
  ],
}

export const STATUS = {
  tier: 'Sustaining tier',
  renewal: 'Next renewal: 5 June 2026',
}
