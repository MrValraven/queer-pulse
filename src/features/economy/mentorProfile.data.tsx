import type { ReactNode } from 'react'
import { memberName } from '../members/data/members'

export const MENTOR = {
  eyebrow: 'Mentor · long-form & reporting · 4 mentees',
  firstName: 'Catarina',
  lastName: 'Vaz',
  role: 'she/her · long-form writer · Trans Hub coordinator · QueerPulse co-treasurer',
  quote: (
    <>
      "I mentor people who want to write 5,000-word pieces about <em>specific things</em>. I am not
      the person if you want to write about feelings in general."
    </>
  ),
  portrait: 'Portrait · Catarina Vaz',
}

export const MENTOR_PILLS: { label: string; accept?: boolean }[] = [
  { label: 'Open · 1 of 4 spots', accept: true },
  { label: 'PT · EN' },
  { label: '9-month structured' },
  { label: 'Monthly + on-demand' },
  { label: 'Long-form reporting' },
]

export const HOW_PARAS: ReactNode[] = [
  <>
    Nine-month commitment. <b>Monthly 90-minute sessions</b> with structured agendas, plus on-demand
    text on Signal for anything urgent. We work on <em>one piece at a time</em> — usually a
    3,000–6,000 word long-form piece you're building over the year, with side conversations about
    craft.
  </>,
  <>
    I take four mentees per cohort. <b>I am picky on intake</b> — I prefer mentees who are already
    writing, even badly, over mentees who say they want to start. I will tell you no kindly. I will
    tell you yes specifically.
  </>,
]

export const FIT_ITEMS: { label: string; text: string }[] = [
  { label: "You'd benefit if you…", text: 'Have one specific reported piece you want to write over a year' },
  { label: 'And ideally…', text: 'Are mid-career, switching from a related field (journalism, design, academic)' },
  { label: 'And maybe…', text: 'Have been told your drafts are "almost there" and want to learn what\'s missing' },
  { label: 'Not the right call if…', text: "You want career coaching across multiple fields. I'm narrow on purpose." },
]

export const PROCESS_STEPS: { num: string; title: string; desc: ReactNode }[] = [
  { num: '01', title: 'Apply with a 500-word pitch', desc: 'Not your CV. Just what you\'d write if I said yes. Two weeks for me to read all of them.' },
  { num: '02', title: '30-min phone call · both ways', desc: 'You ask me anything. I ask you a few things. We both decide.' },
  { num: '03', title: 'Month 1 · planning, structure, sources', desc: 'We map the whole piece. By month-end you have an outline and three confirmed sources.' },
  { num: '04', title: 'Months 2–6 · drafting, reporting, rewriting', desc: 'One draft per month. Monthly call. Signal for unblocking. You\'ll write 2× more than ends up published.' },
  {
    num: '05',
    title: 'Months 7–8 · editing & pitching',
    desc: (
      <>
        The piece gets sharp. We pitch it together to 2–3 outlets.{' '}
        <em>QueerPulse is one option, not the only one.</em>
      </>
    ),
  },
  { num: '06', title: "Month 9 · publication & what's next", desc: 'Piece comes out. We debrief. You leave with a network, not just a published piece.' },
]

export const MENTEES: { initials: string; name: string; tint: 'jade' | 'coral' | 'plum' }[] = [
  { initials: 'SP', name: `${memberName('sara-pinheiro')} · '23 cohort`, tint: 'jade' },
  { initials: 'JF', name: `${memberName('jonas')} · '24 cohort`, tint: 'jade' },
  { initials: 'AK', name: `${memberName('anika')} · '25 cohort`, tint: 'coral' },
  { initials: 'TM', name: `${memberName('tomas-mendes')} · '25 cohort`, tint: 'plum' },
]

export const BOOK_ROWS: { label: string; value: ReactNode; jade?: boolean; accent?: boolean }[] = [
  { label: 'Cohort size', value: '4 mentees · 1 spot left' },
  { label: 'Duration', value: '9 months · Sep — May' },
  { label: 'Time', value: '~ 3 hours/month + Signal' },
  { label: 'Format', value: 'Video · Café Beirão sometimes' },
  { label: 'Standard fee', value: '€20/month' },
  { label: 'Solidarity rate', value: '€0 · no questions', jade: true },
  { label: 'Apps close', value: '14 Jun · 5 days', accent: true },
]

export const MORE_FROM: string[] = [
  '→ Her writing in the magazine',
  '→ Hosts The Back Room podcast',
  '→ Co-treasurer · transparency report',
]
