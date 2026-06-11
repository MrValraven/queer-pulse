import type { Partner } from './types'
import { routes } from '../../../app/routeMap'

export const partners: Partner[] = [
  { href: routes.partners, initials: 'IL', name: 'ILGA Portugal', location: 'Lisbon', tone: 'jade' },
  { href: routes.partners, initials: 'OD', name: 'Opus Diversus', location: 'Lisbon', tone: 'coral' },
  { href: routes.partners, initials: 'RA', name: 'Rede ex aequo', location: 'Nationwide', tone: 'plum' },
  { href: routes.partners, initials: 'PR', name: 'Panteras Rosa', location: 'Lisbon', tone: 'jade' },
  { href: routes.partners, initials: 'QN', name: 'Queer Nation Madrid', location: 'Madrid', tone: 'coral' },
  { href: routes.partners, initials: 'AC', name: 'African Queer Creatives', location: 'Global', tone: 'plum' },
]
