import type { ChangeMaker } from './types'
import { MEMBERS, memberName, type MemberSlug } from '../../members/data/members'

/** Homepage teaser cards. Each change maker is a real community member, so the
 * name and portrait are pulled from the canonical member registry rather than a
 * stock photo. */
interface ChangeMakerSeed {
  key: string
  member: MemberSlug
  cause: string
  blurb: string
  tags: string[]
}

const SEEDS: ChangeMakerSeed[] = [
  {
    key: 'catarina',
    member: 'catarina-vaz',
    cause: 'Housing Rights · Mouraria',
    blurb:
      '"The neighbourhood that raised us should still have room for us." Organising queer residents facing displacement and working directly with the Câmara Municipal.',
    tags: ['Housing', 'Organising'],
  },
  {
    key: 'jonas',
    member: 'jonas',
    cause: 'Trans Healthcare',
    blurb:
      "Trained 40+ GPs in trans-affirming care and is pushing for systemic reform in Portugal's public health system — one policy at a time.",
    tags: ['Health', 'Policy'],
  },
  {
    key: 'luisa',
    member: 'luisa',
    cause: 'Arts & Culture',
    blurb:
      "Programming queer art into Lisbon's mainstream cultural venues — so we're not a sidebar but part of the main story of this city.",
    tags: ['Arts', 'Programming'],
  },
]

export const changemakers: ChangeMaker[] = SEEDS.map((s) => {
  const m = MEMBERS[s.member]!
  return {
    key: s.key,
    cause: s.cause,
    name: memberName(s.member),
    blurb: s.blurb,
    tags: s.tags,
    tint: m.tint as 'coral' | 'jade' | 'plum',
    image: m.photo,
  }
})
