import { MEMBERS, memberName } from '../members/data/members'

export type Tint = 'coral' | 'jade' | 'plum'

export interface Recommendation {
  initials: string
  name: string
  tint: Tint
  stars: number
  text: string
  when: string
}

export interface Landlord {
  slug: string
  name: string
  initials: string
  tint: Tint
  hood: string
  stars: number
  /** Short quote shown on the board card. */
  note: string
  /* detail */
  tagline: string
  about: string[]
  areas: string[]
  stats: { value: string; label: string }[]
  recommendations: Recommendation[]
  rentingNote: string
}

export const LANDLORDS: Landlord[] = [
  {
    slug: 'senhor-costa', name: 'Senhor Costa', initials: 'SC', tint: 'plum', hood: 'Arroios · Rooms + flats', stars: 5,
    note: '"Completely unfazed by our relationship, fixed things quickly, never dropped by unannounced. Recommended by 3 members."',
    tagline: 'A steady, hands-off Arroios landlord who fixes things fast and minds his own business.',
    about: [
      'Senhor Costa has owned a handful of rooms and small flats around Arroios for decades. He is, by every account members have given, the kind of landlord you hope for and rarely get: responsive, fair, and entirely uninterested in your private life beyond whether the rent is paid and the place is cared for.',
      'He works on a handshake-then-contract basis — clear written tenancy, no surprises, repairs handled within days. He has never, members report, dropped by unannounced.',
    ],
    areas: ['Rooms in shared flats · Arroios', 'One- and two-bed flats · Arroios / Anjos', 'Long-term tenancies preferred'],
    stats: [
      { value: '3', label: 'Member recommendations' },
      { value: '15+', label: 'Years renting locally' },
      { value: '≤ 48h', label: 'Typical repair response' },
      { value: '5.0', label: 'Community rating' },
    ],
    recommendations: [
      { initials: MEMBERS.carla.initials, name: memberName('carla'), tint: 'coral', stars: 5, text: 'Rented from him for two years. A radiator died in January and was replaced in two days. Never once made us feel like our relationship was his business.', when: 'Recommended Mar 2026' },
      { initials: 'JF', name: 'Jonas Ferreira', tint: 'jade', stars: 5, text: 'Clear contract, fair deposit, returned in full. He is exactly as advertised — unremarkable in the best possible way.', when: 'Recommended Jan 2026' },
      { initials: 'RV', name: 'Rita Varela', tint: 'plum', stars: 5, text: 'Three years, zero problems. The bar for landlords is in hell and he clears it with room to spare.', when: 'Recommended Nov 2025' },
    ],
    rentingNote: 'Senhor Costa lists through the community board and word of mouth. Ask for a written contract (he always provides one) and exchange references — he expects it too.',
  },
  {
    slug: 'ana-ferreira', name: 'Ana Ferreira', initials: 'AF', tint: 'coral', hood: 'Mouraria · Studio flats', stars: 5,
    note: '"Has been renting to queer tenants for 15 years. Genuinely lovely. Contracts are clear and fair."',
    tagline: 'A Mouraria landlady who has rented to queer tenants for fifteen years — warm, fair, unbothered.',
    about: [
      'Ana Ferreira owns several studio flats in Mouraria and has been renting to queer tenants, deliberately and warmly, for fifteen years. Members describe her as genuinely lovely — the kind of landlady who remembers your name and asks how you are and means it.',
      'Her contracts are clear and fair, her deposits reasonable and returned, and she has a long memory for good tenants. Several members have rented from her twice.',
    ],
    areas: ['Studio flats · Mouraria', 'Occasionally one-beds · Intendente', 'Short and long term'],
    stats: [
      { value: '5', label: 'Member recommendations' },
      { value: '15', label: 'Years renting to queer tenants' },
      { value: '≤ 24h', label: 'Typical response' },
      { value: '5.0', label: 'Community rating' },
    ],
    recommendations: [
      { initials: MEMBERS.tomas.initials, name: memberName('tomas'), tint: 'coral', stars: 5, text: 'Ana rented me my first place in Lisbon when no one else would look at a freelancer. Fair, warm, completely unbothered by anything about me except whether I was happy there.', when: 'Recommended Apr 2026' },
      { initials: 'SC', name: 'Sofia Castaño', tint: 'jade', stars: 5, text: 'Two studios over four years. Deposit returned both times, to the cent. She is the reason I tell people Lisbon can be kind.', when: 'Recommended Feb 2026' },
    ],
    rentingNote: 'Ana prefers an introduction through the community. Request one and mention you found her on the QueerPulse board — she likes knowing tenants come vouched.',
  },
  {
    slug: 'familia-rodrigues', name: 'Família Rodrigues', initials: 'FR', tint: 'plum', hood: 'Graça · Flats', stars: 4,
    note: '"Older couple, very traditional but completely respectful. No problems. Good building, quiet street."',
    tagline: 'A traditional Graça couple — old-fashioned, scrupulously respectful, and entirely reliable.',
    about: [
      'The Rodrigues family own a well-kept building on a quiet Graça street. They are an older, traditional couple — not the people you\'ll be having drinks with — but members are unanimous that they are completely respectful, fair, and without fuss.',
      'The building is solid and the street is quiet. They keep things in good repair and expect the same care in return. Four stars rather than five only because they are formal and a little slow to warm up, not for any problem.',
    ],
    areas: ['One- and two-bed flats · Graça', 'Long-term tenancies only', 'Well-maintained building'],
    stats: [
      { value: '2', label: 'Member recommendations' },
      { value: '20+', label: 'Years owning the building' },
      { value: '≤ 72h', label: 'Typical repair response' },
      { value: '4.5', label: 'Community rating' },
    ],
    recommendations: [
      { initials: 'NA', name: 'Nuno Alves', tint: 'plum', stars: 4, text: 'Formal, traditional, and not once a problem. They fixed a leak properly, kept to the contract, and treated my partner and me with complete courtesy.', when: 'Recommended Mar 2026' },
      { initials: MEMBERS.beatriz.initials, name: memberName('beatriz'), tint: 'jade', stars: 5, text: 'Quiet street, solid building, fair people. Don\'t expect warmth on day one, but do expect to be treated properly. I stayed three years.', when: 'Recommended Dec 2025' },
    ],
    rentingNote: 'The Rodrigues family rent long-term only and value references and stability. Approach formally, bring your documents (NIF, proof of income), and be patient — they are slow but solid.',
  },
  {
    slug: 'paulo-matos', name: 'Paulo Matos', initials: 'PM', tint: 'jade', hood: 'Cais do Sodré · Rooms', stars: 5,
    note: '"Queer himself. Has a policy of never renting to people he thinks would make tenants uncomfortable."',
    tagline: 'A queer landlord in Cais do Sodré who screens for tenant safety as carefully as for rent.',
    about: [
      'Paulo Matos is queer himself and rents rooms in a couple of shared flats around Cais do Sodré. What members single out is his screening: he has an explicit policy of never renting to anyone he thinks would make his other tenants uncomfortable. The result is consistently good houses.',
      'He is responsive, fair on deposits, and genuinely invested in the flats being good places to live. He treats the community as a feature, not a risk.',
    ],
    areas: ['Rooms in shared flats · Cais do Sodré', 'Vets housemates for fit and safety', 'Short and long term'],
    stats: [
      { value: '4', label: 'Member recommendations' },
      { value: '8', label: 'Years renting' },
      { value: '≤ 12h', label: 'Typical response' },
      { value: '5.0', label: 'Community rating' },
    ],
    recommendations: [
      { initials: 'KL', name: 'Kai Larsson', tint: 'jade', stars: 5, text: 'Paulo actually screens for who you\'ll be living with. My house was full of people I\'d never have found alone and now can\'t imagine not knowing.', when: 'Recommended Apr 2026' },
      { initials: 'AK', name: 'Anika Kovač', tint: 'coral', stars: 5, text: 'A queer landlord who gets it. Fast on repairs, fair on everything, and the flat felt safe from day one. Rare and precious.', when: 'Recommended Feb 2026' },
    ],
    rentingNote: 'Paulo fills rooms through the community and a short chat to check fit — both ways. Reach out, tell him a little about yourself, and ask who else is in the flat.',
  },
]

export function getLandlord(slug: string | undefined): Landlord | undefined {
  return slug ? LANDLORDS.find((l) => l.slug === slug) : undefined
}
