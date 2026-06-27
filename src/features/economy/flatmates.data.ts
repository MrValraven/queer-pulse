import { getMember, fullName, type Member } from '../members/data/members'

export type ListingType = 'seeking' | 'offering'

/**
 * A flatmate-board listing. Identity (name, pronouns, avatar, neighbourhood,
 * member-since) is pulled from the canonical member registry by `slug` — so
 * everyone posting here is a real member who exists elsewhere on the platform.
 * Only the listing-specific fields live below.
 */
interface Listing {
  /** Member slug in the registry. */
  slug: string
  pronouns: string
  type: ListingType
  /** Filterable neighbourhood; defaults to the member's home hood. */
  neighbourhood?: string
  /** Display string for the listing (can be broader than the filter value). */
  neighbourhoodLabel: string
  budget: string
  budgetRange: number
  movein: string
  moveinKey: string
  note: string
  tags: string[]
}

export interface Profile {
  id: number
  slug: string
  name: string
  pronouns: string
  type: ListingType
  neighbourhood: string
  neighbourhoodLabel: string
  budget: string
  budgetRange: number
  movein: string
  moveinKey: string
  note: string
  tags: string[]
  initials: string
  tint: Member['tint']
  photo?: string
  verified: boolean
  since: string
}

const LISTINGS: Listing[] = [
  {
    slug: 'carla',
    pronouns: 'she/her',
    type: 'seeking',
    neighbourhoodLabel: 'Arroios or Anjos',
    budget: '€700–900',
    budgetRange: 800,
    movein: 'Flexible',
    moveinKey: 'flex',
    note: "Between roles right now and looking for somewhere settled in Arroios after a summer of subletting. I'm a product manager — tidy, around during the day, and I walk everywhere so I'm rarely underfoot in the evenings. Looking for a household where I don't have to translate myself.",
    tags: ['WFH', 'Quiet household', 'Sociable', 'Early riser'],
  },
  {
    slug: 'rui',
    pronouns: 'he/him',
    type: 'offering',
    neighbourhoodLabel: 'Marvila',
    budget: '€750 / month',
    budgetRange: 750,
    movein: 'Available now',
    moveinKey: 'now',
    note: "There's a room going in our warehouse flat in Marvila — high ceilings, far too many plants, and three of us in tech and music who mostly keep good hours. Looking for a fourth who's easy-going and cares about a calm home. The cat is already in residence.",
    tags: ['Plant parent', 'WFH', 'Quiet household', 'Pets welcome'],
  },
  {
    slug: 'ines',
    pronouns: 'she/her',
    type: 'offering',
    neighbourhoodLabel: 'Príncipe Real',
    budget: '€950 / month',
    budgetRange: 950,
    movein: 'Mid-July',
    moveinKey: 'jul',
    note: "I have a bright first-floor flat in Príncipe Real with a spare room and a garden view. I run my design studio from the back, often at odd hours, so I'm after someone calm and self-contained — you'd have your own bathroom and a very quiet street.",
    tags: ['WFH', 'Quiet household', 'Introvert-friendly', 'Plant parent'],
  },
  {
    slug: 'kai',
    pronouns: 'they/them',
    type: 'seeking',
    neighbourhoodLabel: 'Cais do Sodré or anywhere central',
    budget: '€600–800',
    budgetRange: 700,
    movein: 'Flexible',
    moveinKey: 'flex',
    note: "Just landed in Lisbon and shooting a documentary on the city's queer nightlife, so my hours are honestly all over the place. I'm tidy, easy company, and good at being quiet when you need the flat calm. Looking for somewhere I don't have to explain the 4am returns.",
    tags: ['Night owl', 'Late nights fine', 'Sociable'],
  },
  {
    slug: 'beatriz',
    pronouns: 'she/her',
    type: 'offering',
    neighbourhoodLabel: 'Graça',
    budget: '€700 / month',
    budgetRange: 700,
    movein: '1 August',
    moveinKey: 'aug',
    note: "The smaller room in my place in Graça is opening up — good afternoon light, a tidy-ish kitchen, and me, usually covered in clay and home most days. I like a quiet household with real conversation in it. My cat already runs the place.",
    tags: ['WFH', 'Quiet household', 'Plant parent', 'Cats welcome'],
  },
  {
    slug: 'anika',
    pronouns: 'she/they',
    type: 'seeking',
    neighbourhoodLabel: 'Mouraria or Arroios',
    budget: '€600–750',
    budgetRange: 675,
    movein: 'Flexible',
    moveinKey: 'flex',
    note: "Translator and poet, working from home most days with headphones on and the kettle always going. I'm after a calm flat with people who are happy to share the occasional dinner and otherwise let the quiet be. Sober-friendly, plant-friendly, low drama.",
    tags: ['WFH', 'Quiet household', 'Sober household', 'Plant parent'],
  },
  {
    slug: 'jordan',
    pronouns: 'they/them',
    type: 'seeking',
    neighbourhoodLabel: 'Graça or Mouraria',
    budget: '€800–1,000',
    budgetRange: 900,
    movein: 'Available now',
    moveinKey: 'now',
    note: "Community organiser — after a decade of this work I've learned to protect a calm home. I'm looking for a steady, considerate household in Graça: I cook, I clean up after myself, and I'm very good at keeping the peace. No drama, just a place to land.",
    tags: ['Quiet household', 'Sociable', 'WFH', 'Early riser'],
  },
  {
    slug: 'andre',
    pronouns: 'he/him',
    type: 'offering',
    neighbourhoodLabel: 'Cais do Sodré',
    budget: '€850 / month',
    budgetRange: 850,
    movein: 'Mid-July',
    moveinKey: 'jul',
    note: "Big room going in my flat in Cais do Sodré, five minutes from the river and from my darkroom. I shoot portraits on film so the hours bend a bit, but I respect a shared home completely. Sociable when you want it, invisible when you don't.",
    tags: ['Sociable', 'Late nights fine', 'Pets welcome', 'Night owl'],
  },
]

export const PROFILES: Profile[] = LISTINGS.map((l, i) => {
  const m = getMember(l.slug)
  if (!m) throw new Error(`Flatmates: unknown member slug "${l.slug}"`)
  return {
    id: i + 1,
    slug: l.slug,
    name: fullName(m),
    pronouns: l.pronouns,
    type: l.type,
    neighbourhood: l.neighbourhood ?? m.hood,
    neighbourhoodLabel: l.neighbourhoodLabel,
    budget: l.budget,
    budgetRange: l.budgetRange,
    movein: l.movein,
    moveinKey: l.moveinKey,
    note: l.note,
    tags: l.tags,
    initials: m.initials,
    tint: m.tint,
    photo: m.photo,
    verified: m.verified,
    since: m.since,
  }
})

export const NEIGHBOURHOODS = ['Príncipe Real', 'Mouraria', 'Arroios', 'Graça', 'Bairro Alto', 'Cais do Sodré', 'Marvila', 'Estrela']
export const LIFESTYLE_TAGS = ['WFH', 'Quiet household', 'Sociable', 'Sober household', 'Early riser', 'Night owl', 'Pets welcome', 'Plant parent', 'Vegan kitchen', '420-friendly']
export const MODAL_TAGS = ['Early riser', 'Night owl', 'WFH', 'Quiet household', 'Sociable', 'Sober household', 'Pets welcome', 'Cats welcome', 'Plant parent', 'Vegan kitchen', 'Musicians welcome', 'Late nights fine', 'Introvert-friendly', '420-friendly']

export function matchesBudget(p: Profile, budget: string) {
  if (budget === 'all') return true
  const b = p.budgetRange
  if (budget === '600') return b <= 700
  if (budget === '700') return b > 700 && b <= 900
  if (budget === '900') return b > 900 && b <= 1100
  if (budget === '1100') return b > 1100
  return true
}
