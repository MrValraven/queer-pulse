import type { Member } from './types'

export const members: Member[] = [
  { key: 'ines', name: 'Inês Tavares', role: 'Graphic Designer', hood: 'Príncipe Real', category: 'design', tags: ['Branding', 'Editorial', 'Type'], verified: true, visibility: 'open', initials: 'IT', tint: 'coral', vouchedBy: 'Sofia, Rui & Beatriz' },
  { key: 'rui', name: 'Rui Marçal', role: 'Software Engineer', hood: 'Marvila', category: 'tech', tags: ['Backend', 'Rust', 'Infra'], verified: true, visibility: 'network', initials: 'RM', tint: 'plum', vouchedBy: 'Inês & Diogo' },
  { key: 'sofia', name: 'Sofia Andrade', role: 'Documentary Filmmaker', hood: 'Alfama', category: 'film', tags: ['Directing', 'Editing', 'Sound'], verified: true, visibility: 'open', initials: 'SA', tint: 'jade', vouchedBy: 'Inês & Mariana' },
  { key: 'tomas', name: 'Tomás Beto', role: 'Chef · Supper Club Host', hood: 'Mouraria', category: 'food', tags: ['Fermentation', 'Menus'], verified: false, visibility: 'network', initials: 'TB', tint: 'coral', vouchedBy: 'Sofia & Beatriz' },
  { key: 'mariana', name: 'Mariana Loução', role: 'Clinical Psychologist', hood: 'Estrela', category: 'care', tags: ['LGBTQ+ care', 'Therapy'], verified: true, visibility: 'private', initials: 'ML', tint: 'plum', vouchedBy: 'Sofia' },
  { key: 'andre', name: 'André Quintela', role: 'Portrait Photographer', hood: 'Cais do Sodré', category: 'film', tags: ['Portrait', 'Analog'], verified: false, visibility: 'open', initials: 'AQ', tint: 'jade', vouchedBy: 'Inês' },
  { key: 'carla', name: 'Carla Nogueira', role: 'Product Manager', hood: 'Arroios', category: 'tech', tags: ['Fintech', 'Strategy'], verified: true, visibility: 'network', initials: 'CN', tint: 'coral', vouchedBy: 'Rui & Inês' },
  { key: 'beatriz', name: 'Beatriz Pinto', role: 'Ceramicist', hood: 'Graça', category: 'craft', tags: ['Studio', 'Glazing'], verified: false, visibility: 'open', initials: 'BP', tint: 'plum', vouchedBy: 'Tomás & Inês' },
  { key: 'diogo', name: 'Diogo Vasques', role: 'Music Producer', hood: 'Bairro Alto', category: 'music', tags: ['Mixing', 'Live sets'], verified: true, visibility: 'network', initials: 'DV', tint: 'jade', vouchedBy: 'Rui & Sofia' },
]

export const memberFilters: { value: 'all' | Member['category']; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'design', label: 'Design' },
  { value: 'tech', label: 'Tech' },
  { value: 'film', label: 'Film & Photo' },
  { value: 'music', label: 'Music' },
  { value: 'food', label: 'Food' },
  { value: 'craft', label: 'Craft' },
  { value: 'care', label: 'Care' },
]

/** Visibility helper copy used on member cards. */
export const visibilitySay: Record<Member['visibility'], string> = {
  open: 'Open to new people',
  network: 'Reachable via network',
  private: 'Keeping it quiet',
}
