export interface PaceGroup {
  name: string
  pace: string
  who: string
}

export interface BringItem {
  title: string
  note: string
}

export const PACE_GROUPS: PaceGroup[] = [
  {
    name: 'Slow & Social',
    pace: '7:00–8:00 min/km · run-walk welcome',
    who: 'First-timers, anyone coming back from a break, and anyone who wants to actually talk the whole way round. The slowest runner sets the pace and nobody is ever left behind.',
  },
  {
    name: 'Middle Ground',
    pace: '5:30–6:30 min/km · steady',
    who: 'You can run 5k without stopping and want company at a comfortable, sustainable pace. The biggest group, and the easiest to slot into.',
  },
  {
    name: 'Fast & Focused',
    pace: '4:30–5:15 min/km · training',
    who: 'Building toward a race or chasing a PB. Still social at the coffee after — just quicker on the road. We regroup at every turn so the group never splits for good.',
  },
]

export const BRING: BringItem[] = [
  { title: 'Trainers you can already run in', note: "Whatever you own is fine for your first time — don't buy anything special. If the cobbles start hurting your ankles, ask the group; we have strong opinions about Lisbon-proof shoes." },
  { title: 'Layers you can lose', note: 'Mornings start cool and warm up fast. Something you can tie round your waist beats a single heavy top.' },
  { title: 'Water for after', note: "We finish near coffee, so you don't need to carry much — a small bottle is plenty for the loop." },
  { title: 'Nothing to prove', note: "You don't need a running history, a certain body, or a goal. Showing up is the whole entry requirement. Come for the coffee and walk the loop if that's today's version." },
]
