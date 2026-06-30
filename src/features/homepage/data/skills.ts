import type { SkillItem } from './types'
import { MEMBERS, memberName } from '../../members/data/members'

/** "Name · Neighbourhood" credit, derived from the canonical registry. */
const by = (slug: string) => `${memberName(slug)} · ${MEMBERS[slug]!.hood}`

export const skills: SkillItem[] = [
  { type: 'teaching', title: 'Visual identity & branding', by: by('ines') },
  { type: 'teaching', title: 'Backend engineering mentoring', by: by('rui') },
  { type: 'learning', title: 'Fundraising for community projects', by: by('carla') },
  { type: 'teaching', title: 'Wheel-throwing basics', by: by('beatriz') },
  { type: 'teaching', title: 'Film photography — getting started', by: by('andre') },
  { type: 'learning', title: 'Music composition for film', by: by('sofia') },
]
