import type { DigestPreviewItem } from './types'
import { MEMBERS, memberName } from '../../members/data/members'

export const digestPreview: DigestPreviewItem[] = [
  {
    tag: 'Members',
    title: '3 new members in design & tech this week',
    meta: `${MEMBERS.ines.first}, ${MEMBERS.rui.first}, and one more to discover →`,
  },
  {
    tag: 'Upcoming',
    title: 'Founders Breakfast · Jul 2 · Marvila',
    meta: '14 going · 6 seats left',
  },
  {
    tag: 'Open swap',
    title: 'Tax filing ↔ website redesign',
    meta: `${MEMBERS.mariana.first} ${MEMBERS.mariana.last[0]}. · posted 2 days ago`,
  },
  {
    tag: 'Essay',
    title: '"On belonging in a city that\'s changing"',
    meta: `${memberName('sofia')} · 6 min read`,
  },
]
