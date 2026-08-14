/** Static data for the Cinema Collections index (`/cinema/collections`). */

/** Shared poster pool — four are picked per collection for the mosaic thumb. */
const POSTERS = [
  "https://images.unsplash.com/photo-1572188863110-46d457c9234d?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618410321132-9f4cebb2f7f5?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1655367574486-f63675dd69eb?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1711479898431-9031deb4ff0e?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1758232589376-9f3db5aa371d?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1759547020777-14a1ca4c3fdf?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1759773944717-0e3617799860?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1760031009842-9175946953c8?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1761142681497-b2dc51f4e28c?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1761948245703-cbf27a3e7502?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1770902895934-b04a10daa893?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1778372670061-e84b57764aec?q=80&w=400&auto=format&fit=crop",
];

/** Four posters starting at `start`, wrapping around the pool. */
function four(start: number): string[] {
  return [0, 1, 2, 3].map((i) => POSTERS[(start + i) % POSTERS.length]!);
}

export interface Collection {
  slug: string;
  /** Two-digit index shown as a ghosted numeral over the mosaic. */
  num: string;
  /** Kicker line above the title (jade). */
  tag: string;
  titlePre: string;
  titleEm: string;
  titlePost: string;
  desc: string;
  curator: string;
  curatorInitials: string;
  /** Only rendered on the featured card. */
  curatorRole?: string;
  /** Rich meta chips for the featured card's meta row. */
  stats: string[];
  /** Compact footer for grid cards. */
  footLeft: string;
  footRight: string;
  /** Used to total the film count in the filter bar. */
  filmCount: number;
  /** Chip vocabulary this collection matches, for the filter bar. */
  filters: string[];
  posters: string[];
}

export const collectionsHeader = {
  eyebrow: "Curated collections",
  titlePre: "Not playlists. ",
  titleEm: "Arguments.",
  sub: "Every collection is a curator's thesis: built slowly, over months, ordered deliberately. Watch in sequence at least once. After that, wander.",
  quote: {
    pre: "“A collection is the shape of what a curator believes, made visible. ",
    em: "It's an argument in film.",
    post: "”",
    attr: "Sara Marques · programming lead",
  },
};

/** Chips in the filter bar. "All" is the default and matches everything. */
export const collectionFilters = [
  "All",
  "New",
  "Free",
  "Sustainer",
  "Short collections",
  "Portugal",
  "Trans filmmakers",
  "Documentary",
  "Feature",
];

/**
 * Label-key indirection (docs/i18n/extraction-brief.md): `collectionFilters`
 * and each collection's `filters: [...]` array keep the stable canonical
 * English id as the stored/matched value — a language switch must never
 * corrupt the active filter. Only the rendered chip label resolves via `t()`,
 * reusing already-translated cinema keys where the wording matches exactly.
 */
export const COLLECTION_FILTER_LABEL_KEYS: Record<string, string> = {
  All: "cinema:collectionsIndex.filter.all",
  New: "cinema:collectionsIndex.filter.new",
  Free: "cinema:access.free",
  Sustainer: "cinema:access.sustainer",
  "Short collections": "cinema:collectionsIndex.filter.shortCollections",
  Portugal: "cinema:browse.country.portugal",
  "Trans filmmakers": "cinema:browse.madeBy.trans",
  Documentary: "cinema:format.documentary",
  Feature: "cinema:format.feature",
};

/**
 * All collections, most editorial first. The first item matching the active
 * filter renders large (featured); the rest fill the grid.
 */
export const collections: Collection[] = [
  {
    slug: "iberian-queer-cinema",
    num: "01",
    tag: "Featured · updated June 2026",
    titlePre: "Iberian queer cinema, ",
    titleEm: "1974–now",
    titlePost: "",
    desc: "From the carnation revolution to Almodóvar to TikTok-native shorts from Porto. A 24-film arc through Portuguese and Spanish queer image-making, starting before Year Zero.",
    curator: "João Ribeiro & Sofía Castro",
    curatorInitials: "JR",
    curatorRole: "lead curators",
    stats: ["24 films", "37h total", "9 free · 15 sustainer", "PT · ES · GL"],
    footLeft: "24 films · 9 free",
    footRight: "37h",
    filmCount: 24,
    filters: ["Free", "Sustainer", "Portugal", "Feature"],
    posters: four(0),
  },
  {
    slug: "trans-documentaries-2020s",
    num: "02",
    tag: "Trans filmmakers · documentary",
    titlePre: "Trans documentaries: ",
    titleEm: "the 2020s",
    titlePost: "",
    desc: "The decade is half over. Twelve documentaries, five by trans filmmakers, all selected for how they treat their subjects as collaborators.",
    curator: "D. Okoye",
    curatorInitials: "DO",
    stats: ["12 films", "18h total", "3 free"],
    footLeft: "12 films · 3 free",
    footRight: "18h",
    filmCount: 12,
    filters: ["Trans filmmakers", "Documentary", "Free"],
    posters: four(3),
  },
  {
    slug: "films-our-parents-could-watch",
    num: "03",
    tag: "All free · generational",
    titlePre: "Films our parents ",
    titleEm: "could",
    titlePost: " watch",
    desc: "Quiet, generous, generationally translatable. Bring a parent. Bring an aunt. Bring the friend who's still working it out.",
    curator: "Sara Marques",
    curatorInitials: "SM",
    stats: ["9 films", "14h total", "all free"],
    footLeft: "9 films · all free",
    footRight: "14h",
    filmCount: 9,
    filters: ["Free", "Feature"],
    posters: four(6),
  },
  {
    slug: "lesbian-sci-fi",
    num: "04",
    tag: "Lesbian · science fiction",
    titlePre: "Lesbian sci-fi, 1978 to ",
    titleEm: "tomorrow",
    titlePost: "",
    desc: "From Born in Flames to the Brazilian shorts no one's importing yet. The future has always had us in it.",
    curator: "Yara Reis",
    curatorInitials: "YR",
    stats: ["18 films", "26h total", "6 free"],
    footLeft: "18 films · 6 free",
    footRight: "26h",
    filmCount: 18,
    filters: ["Free", "Sustainer", "Feature"],
    posters: four(9),
  },
  {
    slug: "house-that-crossed-the-ocean",
    num: "05",
    tag: "Africa · diaspora · ballroom",
    titlePre: "The house that ",
    titleEm: "crossed",
    titlePost: " the ocean",
    desc: "Ballroom culture in West Africa and its diaspora: eight films tracing how the form travelled, transformed, and refused to be archived.",
    curator: "D. Okoye",
    curatorInitials: "DO",
    stats: ["8 films", "11h total", "2 free"],
    footLeft: "8 films · 2 free",
    footRight: "11h",
    filmCount: 8,
    filters: ["Documentary", "Free", "Sustainer", "Short collections"],
    posters: four(2),
  },
  {
    slug: "slow-east-asian",
    num: "06",
    tag: "Japan · Korea · quiet cinema",
    titlePre: "Slow, ",
    titleEm: "East Asian",
    titlePost: "",
    desc: "Six films from Japan and Korea that resist the pace of Western queer cinema. Patient, elliptical, gorgeous.",
    curator: "Yara Reis",
    curatorInitials: "YR",
    stats: ["6 films", "10h total", "1 free"],
    footLeft: "6 films · 1 free",
    footRight: "10h",
    filmCount: 6,
    filters: ["Sustainer", "Free", "Short collections", "Feature"],
    posters: four(5),
  },
  {
    slug: "queer-elders-portraits",
    num: "07",
    tag: "New · updated June 2026",
    titlePre: "Queer elders: ",
    titleEm: "portrait",
    titlePost: " films",
    desc: "Twelve portraits: one film, one person, minimum 30 minutes. No conclusions. Just looking, for long enough.",
    curator: "João Ribeiro",
    curatorInitials: "JR",
    stats: ["12 films", "22h total", "5 free"],
    footLeft: "12 films · 5 free",
    footRight: "22h",
    filmCount: 12,
    filters: ["New", "Documentary", "Free", "Sustainer"],
    posters: four(8),
  },
];

export const proposeContent = {
  eyebrow: "Curators' council",
  titlePre: "Want to ",
  titleEm: "propose",
  titlePost: " a collection?",
  body: "The council rotates yearly. If you're a QueerPulse member with a thesis you believe in, a set of films that argue something together, write to us. We read every proposal.",
  steps: [
    {
      pre: "Write a 200-word thesis: ",
      em: "what does this collection argue?",
      post: "",
    },
    { pre: "List 8–24 films with brief rationale for each.", em: "", post: "" },
    {
      pre: "Council reviews within 3 weeks. We respond either way.",
      em: "",
      post: "",
    },
    {
      pre: "If accepted: we onboard the films, build the page together, and pay you a curator's stipend.",
      em: "",
      post: "",
    },
  ],
};
