export interface Guide {
  title: string
  desc: string
  cat: string
  catLabel: string
  meta: string
  to: string
}

export const CATEGORIES = [
  { id: 'all', label: 'All guides' },
  { id: 'housing', label: 'Housing' },
  { id: 'health', label: 'Health' },
  { id: 'legal', label: 'Legal' },
  { id: 'finance', label: 'Finance' },
  { id: 'trans', label: 'Trans life' },
] as const

export const GUIDES: Guide[] = [
  { cat: 'legal', catLabel: 'Legal', title: 'Workplace discrimination — the full guide', desc: 'What Portugal\'s Labour Code protects, how to document incidents, and a template complaint letter for the ACT.', meta: 'Guide · 12 min · PT / EN', to: '/legal' },
  { cat: 'legal', catLabel: 'Legal', title: 'Rental discrimination & your rights', desc: 'A landlord refusing you on grounds of identity is acting illegally. How to gather evidence and where to report it.', meta: 'Guide · 9 min · PT / EN', to: '/legal' },
  { cat: 'legal', catLabel: 'Legal', title: 'Legal name & gender marker change', desc: 'Step-by-step through Portugal\'s self-determination process — documents, timelines, and what changed in 2018.', meta: 'Guide · 15 min · PT / EN', to: '/trans-hub' },
  { cat: 'housing', catLabel: 'Housing', title: 'Finding queer-friendly housing in Lisbon', desc: 'Neighbourhoods, red flags in listings, and how the QueerPulse housing board vets landlords.', meta: 'Guide · 11 min', to: '/housing' },
  { cat: 'housing', catLabel: 'Housing', title: 'Flatmate agreements that protect you', desc: 'A plain-language template for shared tenancies — chosen-family arrangements included.', meta: 'Template · 6 min', to: '/flatmates' },
  { cat: 'health', catLabel: 'Health', title: 'Navigating the SNS as a queer patient', desc: 'Registering, finding affirming GPs, and what to do if a provider refuses or mistreats you.', meta: 'Guide · 10 min', to: '/wellbeing' },
  { cat: 'health', catLabel: 'Health', title: 'PrEP access in Portugal', desc: 'Eligibility, the clinics most welcoming in Lisbon, and how to get it at no cost through the SNS.', meta: 'Guide · 8 min', to: '/sexual-health' },
  { cat: 'health', catLabel: 'Health', title: 'Harm reduction, without judgement', desc: 'Practical safety for chemsex, substances, and recovery — written by and for the community.', meta: 'Guide · 9 min', to: '/harm-reduction' },
  { cat: 'trans', catLabel: 'Trans life', title: 'Starting hormone therapy on the SNS', desc: 'Referral pathways, waiting lists, and a guide to the consultations — plus what private costs to expect.', meta: 'Guide · 14 min', to: '/trans-healthcare' },
  { cat: 'trans', catLabel: 'Trans life', title: 'Updating documents after transition', desc: 'Bank, employer, GP, landlord — the order to do things in, with letter templates for each.', meta: 'Checklist · 7 min', to: '/trans-hub' },
  { cat: 'finance', catLabel: 'Finance', title: 'Micro-grants & solidarity funds', desc: 'What QueerPulse funds, how to apply, and how the community sliding scale works.', meta: 'Guide · 6 min', to: '/micro-grants' },
  { cat: 'finance', catLabel: 'Finance', title: 'Money for freelancers & artists', desc: 'Invoicing basics in Portugal, recibos verdes, and the funds open to queer creatives.', meta: 'Guide · 10 min', to: '/grants' },
]

export const POPULAR = ['Legal name change', 'PrEP access', 'Workplace rights', 'Finding housing', 'Starting HRT']
