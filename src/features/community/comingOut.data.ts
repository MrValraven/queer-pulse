import type { IconType } from 'react-icons'
import { FiEyeOff, FiLock, FiSlash, FiFeather } from 'react-icons/fi'

export const PRIVACY: { icon: IconType; title: string; body: string }[] = [
  { icon: FiEyeOff, title: 'Invisible from your profile', body: 'Nothing you do here shows on your public profile or in any feed. Membership itself is hidden.' },
  { icon: FiLock, title: 'No public member list', body: 'You can\'t be browsed or searched here. People see only what\'s shared inside the space.' },
  { icon: FiSlash, title: 'Confidentiality first', body: 'Stricter moderation, no screenshots, no outside sharing. The first rule and the last.' },
  { icon: FiFeather, title: 'No pressure to be "out"', body: 'Join at any stage — including not-yet and not-sure. You can leave the moment you\'re ready.' },
]

export const STAGES = [
  { n: '01', title: 'Just for you, first', body: 'Some people only read. That\'s a full and valid way to be here — no one will ask you to post.' },
  { n: '02', title: 'Say it somewhere safe', body: 'Try the words out loud here before you say them for real. The weekly circle holds space for exactly that.' },
  { n: '03', title: 'Move through, and out', body: 'People graduate out of this space when they no longer need it. That\'s the whole point — not a goodbye.' },
]
