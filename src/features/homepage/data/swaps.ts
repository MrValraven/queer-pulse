import type { Swap } from './types'
import { routes } from '../../../app/routeMap'

export const swaps: Swap[] = [
  {
    href: `${routes.barter}#taxes-website`,
    offering: 'Tax filing & financial admin',
    wanting: 'Website redesign & Webflow build',
    posterInitials: 'ML',
    poster: 'Mariana L. · Estrela · 2 days ago',
  },
  {
    href: `${routes.barter}#legal-branding`,
    offering: 'Legal review & contract drafting',
    wanting: 'Brand identity for a new practice',
    posterInitials: 'DV',
    poster: 'Diogo V. · Bairro Alto · 5 days ago',
  },
  {
    href: `${routes.barter}#copy-code`,
    offering: 'Copywriting & editorial strategy',
    wanting: 'Frontend development (React)',
    posterInitials: 'CN',
    poster: 'Carla N. · Arroios · 1 week ago',
  },
]
