import type { GrantItem, GrantStat } from './types'

export const grantStats: GrantStat[] = [
  { value: '€3,240', label: 'contributed this year', countTo: 3240, prefix: '€' },
  { value: '28', label: 'grants awarded since launch', countTo: 28 },
  { value: '€115', label: 'average grant amount', countTo: 115, prefix: '€' },
]

export const grantItems: GrantItem[] = [
  {
    amount: '€150',
    title: 'Queer zine printing costs',
    description:
      'Funded the print run for a community zine distributed free at gatherings.',
    who: 'Inês T. · 3 weeks ago',
  },
  {
    amount: '€80',
    title: 'Studio venue for a free workshop',
    description:
      'Covered the space hire for a ceramics workshop open to all members.',
    who: 'Beatriz P. · 1 month ago',
  },
  {
    amount: '€200',
    title: 'Emergency relocation support',
    description:
      'Helped a member cover moving costs after a housing situation became unsafe.',
    who: 'Anonymous · 6 weeks ago',
  },
]
