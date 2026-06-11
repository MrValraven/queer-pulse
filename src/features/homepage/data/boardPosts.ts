import type { BoardPost } from './types'
import { routes } from '../../../app/routeMap'

export const boardFilters: {
  value: 'all' | 'looking' | 'offering' | 'design' | 'tech' | 'space' | 'care'
  label: string
}[] = [
  { value: 'all', label: 'All' },
  { value: 'looking', label: 'Asking' },
  { value: 'offering', label: 'Offering' },
  { value: 'design', label: 'Design' },
  { value: 'tech', label: 'Tech' },
  { value: 'space', label: 'Space' },
  { value: 'care', label: 'Care & support' },
]

export const boardPosts: BoardPost[] = [
  { href: `${routes.offer}#zine-collab`, kind: 'looking', category: 'design', title: 'A collaborator for a queer zine launching in September', posterInitials: 'IT', posterName: 'Inês Tavares', posterMeta: 'Designer · Príncipe Real', age: '3 days ago' },
  { href: `${routes.offer}#free-portraits`, kind: 'offering', category: 'care', title: 'Free portrait sessions for trans & nonbinary members', posterInitials: 'AQ', posterName: 'André Quintela', posterMeta: 'Photographer · Cais do Sodré', age: '2 days ago' },
  { href: `${routes.offer}#sublet-arroios`, kind: 'looking', category: 'space', title: 'A sublet in Arroios, June through August', posterInitials: 'CN', posterName: 'Carla Nogueira', posterMeta: 'Product · Arroios', age: '1 week ago' },
  { href: `${routes.offer}#mentoring-engineers`, kind: 'offering', category: 'tech', title: 'Monthly mentoring for junior engineers', posterInitials: 'RM', posterName: 'Rui Marçal', posterMeta: 'Engineer · Marvila', age: '4 days ago' },
  { href: `${routes.offer}#desks-graca`, kind: 'offering', category: 'space', title: 'Two desks to share in a bright Graça studio', posterInitials: 'BP', posterName: 'Beatriz Pinto', posterMeta: 'Ceramicist · Graça', age: '1 week ago' },
  { href: `${routes.offer}#composer-doc`, kind: 'looking', category: 'design', title: 'A composer for a short documentary, paid', posterInitials: 'SA', posterName: 'Sofia Andrade', posterMeta: 'Filmmaker · Alfama', age: '2 weeks ago' },
]
