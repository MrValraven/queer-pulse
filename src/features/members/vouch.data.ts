export const CANDIDATE = {
  initials: 'JF',
  name: 'Jonas Ferreira',
  tint: 'jade' as const,
  context: 'Asked you to vouch · applied 3 days ago',
  bio: 'Sound designer, recently moved from Porto. You met at the Mouraria supper club in May.',
}

import type { IconType } from 'react-icons'
import { FiEye, FiShield, FiUsers } from 'react-icons/fi'

export const MEANS: { icon: IconType; title: string; body: string }[] = [
  { icon: FiUsers, title: 'You know them, really', body: 'A vouch says you\'ve met this person and you trust them in community spaces. It carries weight here.' },
  { icon: FiShield, title: 'It keeps the space safe', body: 'QueerPulse is invite-and-vouch for a reason. Members vouching for members is how we stay small and trusted.' },
  { icon: FiEye, title: 'It\'s seen by the council', body: 'Your note goes to the membership council alongside their application — not posted publicly.' },
]
