export type ListingType = 'seeking' | 'offering'

export interface Profile {
  id: number
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
  av: string
  avBg: string
  avCol: string
  since: string
}

export const PROFILES: Profile[] = [
  { id: 1, name: 'Rosa M.', pronouns: 'she/her', type: 'seeking', neighbourhood: 'Arroios', neighbourhoodLabel: 'Arroios or Mouraria', budget: '€700–900', budgetRange: 800, movein: 'July 2026', moveinKey: 'jul', note: "I'm a textile designer working from home. I'm a quiet presence — mornings are sacred, I'll have coffee ready if you want it. Looking for a flat where I won't have to explain my relationship history to a flatmate.", tags: ['Early riser', 'WFH', 'Plant parent', 'Quiet household', 'Cats welcome'], av: 'RM', avBg: 'rgba(var(--accent-rgb),.16)', avCol: 'var(--accent-ink)', since: 'Jan 2025' },
  { id: 2, name: 'Diogo V.', pronouns: 'he/him', type: 'offering', neighbourhood: 'Marvila', neighbourhoodLabel: 'Marvila', budget: '€750 / month', budgetRange: 750, movein: 'Available now', moveinKey: 'now', note: "Three of us in a warehouse flat in Marvila — a musician, a UX designer (me), and a nurse. Looking for a fourth who's easy-going and doesn't mind the occasional late session. Big kitchen, good light, lots of plants.", tags: ['Sociable', 'Musicians welcome', 'Late nights fine', 'Pets welcome'], av: 'DV', avBg: 'rgba(var(--jade-rgb),.18)', avCol: 'var(--jade)', since: 'Sep 2024' },
  { id: 3, name: 'Cleo S.', pronouns: 'they/them', type: 'seeking', neighbourhood: 'Príncipe Real', neighbourhoodLabel: 'Príncipe Real or Bairro Alto', budget: '€600–800', budgetRange: 700, movein: 'August 2026', moveinKey: 'aug', note: "PhD researcher, mostly working from cafés and the library. I'm sober and looking for a household that's either sober or relaxed about it. I'm an early riser and will be delighted if you are too. I bake bread sometimes.", tags: ['Sober household', 'Early riser', 'Quiet household', 'WFH'], av: 'CS', avBg: 'rgba(var(--plum-rgb),.12)', avCol: 'var(--plum)', since: 'Mar 2025' },
  { id: 4, name: 'Inês T.', pronouns: 'she/her', type: 'offering', neighbourhood: 'Príncipe Real', neighbourhoodLabel: 'Príncipe Real', budget: '€950 / month', budgetRange: 950, movein: 'Mid-July', moveinKey: 'jul', note: "I have a beautiful first-floor flat with a second room going spare. I work in film, often irregular hours. Looking for someone calm and self-contained — you'll have your own bathroom. Good light, garden view, very quiet street.", tags: ['WFH', 'Quiet household', 'Introvert-friendly', 'Plant parent'], av: 'IT', avBg: 'rgba(var(--accent-rgb),.16)', avCol: 'var(--accent-ink)', since: 'Nov 2024' },
  { id: 5, name: 'Marco A.', pronouns: 'he/him', type: 'seeking', neighbourhood: 'Graça', neighbourhoodLabel: 'Graça or Mouraria', budget: '€800–1,000', budgetRange: 900, movein: 'Available now', moveinKey: 'now', note: "Sound engineer and DJ, mainly working evenings. I keep the flat clean and I'm good at it. Looking for somewhere I don't have to justify my schedule or my friends. I'm sociable but I genuinely respect your space.", tags: ['Night owl', 'Sociable', 'Late nights fine', '420-friendly'], av: 'MA', avBg: 'rgba(var(--violet-rgb),.14)', avCol: 'var(--violet)', since: 'Jun 2024' },
  { id: 6, name: 'Yara B.', pronouns: 'she/they', type: 'offering', neighbourhood: 'Arroios', neighbourhoodLabel: 'Arroios', budget: '€700 / month', budgetRange: 700, movein: '1 August', moveinKey: 'aug', note: "I'm offering the smaller room in my two-bed in Arroios. Graphic designer, very tidy, vegan kitchen (not strict if you have friends visiting). I like a quiet household with good conversation. My cat is already resident.", tags: ['Vegan kitchen', 'Quiet household', 'WFH', 'Plant parent', 'Pets welcome'], av: 'YB', avBg: 'rgba(var(--jade-rgb),.18)', avCol: 'var(--jade)', since: 'Feb 2025' },
  { id: 7, name: 'Tomé F.', pronouns: 'he/him', type: 'seeking', neighbourhood: 'Mouraria', neighbourhoodLabel: 'Anywhere central', budget: '€600–750', budgetRange: 675, movein: 'Flexible', moveinKey: 'flex', note: 'Just moved to Lisbon from Porto. Working at a bookshop in Chiado. Looking for a calm flatmate setup — I\'m quite private but happy to share dinners now and then. Sober. I have a small cat and she travels with me.', tags: ['Sober household', 'Early riser', 'Quiet household', 'Cats welcome'], av: 'TF', avBg: 'rgba(var(--plum-rgb),.12)', avCol: 'var(--plum)', since: 'May 2025' },
  { id: 8, name: 'Ana C.', pronouns: 'she/her', type: 'offering', neighbourhood: 'Cais do Sodré', neighbourhoodLabel: 'Cais do Sodré', budget: '€850 / month', budgetRange: 850, movein: 'Mid-July', moveinKey: 'jul', note: 'My flatmate is moving out and I need someone for the big room. Very central, five minutes from the river. Small balcony. I\'m sociable and respect privacy completely. I work in hospitality so evenings are my thing.', tags: ['Sociable', 'Late nights fine', 'Pets welcome', 'Night owl'], av: 'AC', avBg: 'rgba(var(--accent-rgb),.16)', avCol: 'var(--accent-ink)', since: 'Aug 2024' },
]

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
