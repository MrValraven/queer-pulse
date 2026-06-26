import { type Tint } from './directoryPlaces'

export const CAT_LABEL: Record<string, string> = {
  food: 'Food & drink',
  design: 'Design & craft',
  health: 'Health & care',
  space: 'Spaces',
  culture: 'Culture',
  tech: 'Tech',
  grooming: 'Barbershop & salon',
  fitness: 'Gym & fitness',
}

export const MEMBERS_HERE: { initials: string; name: string; tint: Tint; when: string }[] = [
  { initials: 'RV', name: 'Rita V.', tint: 'jade', when: 'Yesterday' },
  { initials: 'AK', name: 'Anika K.', tint: 'coral', when: '2 days ago' },
  { initials: 'NA', name: 'Nuno A.', tint: 'plum', when: '3 days ago' },
  { initials: 'SC', name: 'Sofia C.', tint: 'coral', when: 'last week' },
]

export const STAR_SLOTS = [1, 2, 3, 4, 5]
