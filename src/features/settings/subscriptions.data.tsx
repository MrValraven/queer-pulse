import { type ReactNode } from 'react'

export interface Newsletter {
  id: string
  icon: ReactNode
  name: ReactNode
  freq: string
  meta: string
  defaultOn: boolean
  iconVariant: 'coral' | 'jade' | 'plum'
}

export interface JobAlert {
  id: string
  ic: string
  title: string
  desc: ReactNode
  criteria: { label: ReactNode }[]
  status: string
  matches: string
  lastSent: string
}

const EmailIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)
const BookIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M12 22s-8-4-8-12V4l8-2 8 2v6c0 8-8 12-8 12z" />
  </svg>
)

export const NEWSLETTERS: Newsletter[] = [
  {
    id: 'nl1',
    icon: <EmailIcon />,
    name: <>Community <em>dispatch</em></>,
    freq: 'Fortnightly · what\'s happening, who\'s hosting, what we\'re reading',
    meta: 'Subscribed · last edition opened 2 days ago · sent to tomas@example.com',
    defaultOn: true,
    iconVariant: 'coral',
  },
  {
    id: 'nl2',
    icon: <BookIcon />,
    name: <>Long reads · <em>monthly</em></>,
    freq: 'Once a month · one major piece from the magazine, delivered in full',
    meta: 'Subscribed · 72% open rate · 18 editions sent',
    defaultOn: true,
    iconVariant: 'jade',
  },
  {
    id: 'nl3',
    icon: <ShieldIcon />,
    name: <>Trans Hub <em>bulletin</em></>,
    freq: 'Monthly · provider updates, hormone supply notices, anonymised case notes',
    meta: 'Not subscribed · 74% open rate among 1.4k subscribers',
    defaultOn: false,
    iconVariant: 'plum',
  },
]

export const JOB_ALERTS: JobAlert[] = [
  {
    id: 'alert-d',
    ic: 'D',
    title: 'Designer roles · Lisbon & remote-PT',
    desc: <>Matching jobs sent <em>once a week</em> on Mondays · digest format</>,
    criteria: [
      { label: <>Title: <b>Designer · senior · mid · junior</b></> },
      { label: <>Location: <b>Lisbon</b> or <b>Remote (PT)</b></> },
      { label: <>Min salary: <b>€32k</b></> },
      { label: <>Verified queer-led <b>only</b></> },
    ],
    status: 'Live · weekly digest',
    matches: '4 new',
    lastSent: 'Mon 2 Jun · 09:00',
  },
  {
    id: 'alert-e',
    ic: 'E',
    title: 'Editorial & communications · part-time',
    desc: <>For the side gig · <em>instant</em> notifications</>,
    criteria: [
      { label: <>Title: <b>Editor · writer · communications</b></> },
      { label: <>Hours: <b>≤ 20h/week</b></> },
      { label: <>Location: <b>Anywhere</b></> },
    ],
    status: 'Live · instant alerts',
    matches: '1 new',
    lastSent: 'Fri 6 Jun · 14:08',
  },
]

export const PRONOUN_OPTIONS = [
  'he/him', 'she/her', 'they/them', 'he/they', 'she/they', 'any', 'ask me', 'none / name only', 'elu/delu · PT',
]

export const PRONOUN_VISIBILITY = [
  { id: 'p1', label: 'On my profile', desc: 'Always visible · QueerPulse standard', defaultOn: true, disabled: true },
  { id: 'p2', label: 'Next to my name in posts & comments', desc: 'Compact form · "Tomás · he/him"', defaultOn: true, disabled: false },
  { id: 'p3', label: 'On my RSVP tickets & gathering badges', desc: 'Visible to host & other RSVPed members', defaultOn: true, disabled: false },
  { id: 'p4', label: 'On the public version of my profile', desc: 'Off by default · for members not signed in', defaultOn: false, disabled: false },
  { id: 'p5', label: 'In auto-translation', desc: 'We use them when our text-walker translates PT↔EN', defaultOn: true, disabled: false },
]
