import type { IconType } from 'react-icons'
import { FiDollarSign, FiGlobe, FiTarget } from 'react-icons/fi'

export const FORMATS = [
  { id: 'essay', label: 'Personal essay' },
  { id: 'reportage', label: 'Reportage' },
  { id: 'interview', label: 'Interview' },
  { id: 'poetry', label: 'Poetry' },
  { id: 'photo', label: 'Photo story' },
]

export const LOOKING_FOR: { icon: IconType; title: string; body: string }[] = [
  { icon: FiTarget, title: 'The specific over the general', body: 'One supper club, one street, one afternoon. We trust the small story to carry the big one.' },
  { icon: FiGlobe, title: 'Lisbon and beyond', body: 'Rooted here, but we publish diaspora and visitor voices too. Place matters; borders less so.' },
  { icon: FiDollarSign, title: 'We pay, always', body: 'Every published piece is paid fairly — rates shared upfront, no "exposure" ever.' },
]

export const STEPS = [
  'A reply within two weeks — yes, no, or let\'s talk.',
  'If it\'s a yes, an editor is assigned and you agree a rate and deadline.',
  'You keep the copyright. We license it, we don\'t own it.',
]
