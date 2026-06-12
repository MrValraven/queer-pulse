import type { ChangeMaker } from './types'
import { memberName } from '../../members/data/members'

export const changemakers: ChangeMaker[] = [
  {
    key: 'catarina',
    cause: 'Housing Rights · Mouraria',
    name: memberName('catarina-vaz'),
    blurb:
      '"The neighbourhood that raised us should still have room for us." Organising queer residents facing displacement and working directly with the Câmara Municipal.',
    tags: ['Housing', 'Organising'],
    tint: 'coral',
  },
  {
    key: 'jonas',
    cause: 'Trans Healthcare',
    name: memberName('jonas'),
    blurb:
      "Trained 40+ GPs in trans-affirming care and is pushing for systemic reform in Portugal's public health system — one policy at a time.",
    tags: ['Health', 'Policy'],
    tint: 'jade',
  },
  {
    key: 'luisa',
    cause: 'Arts & Culture',
    name: memberName('luisa'),
    blurb:
      "Programming queer art into Lisbon's mainstream cultural venues — so we're not a sidebar but part of the main story of this city.",
    tags: ['Arts', 'Programming'],
    tint: 'plum',
  },
]
