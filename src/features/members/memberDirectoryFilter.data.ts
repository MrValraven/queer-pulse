import { memberProfiles } from "./data/memberProfiles";
import { OPEN_TO_PRESETS, openToPresetIds, type OpenToId } from "./openTo.data";

export interface ChipOption {
  label: string;
  active?: boolean;
}

/** Self-declared identity id — stable, never changes with language; see
 *  `IDENTITY_OPTIONS` for the id → labelKey pairing. */
export type Identity =
  | "transNonBinary"
  | "lesbian"
  | "gay"
  | "biPan"
  | "aroAce"
  | "qpoc"
  | "disabledChronicIllness";

export interface MemberCard {
  /** Registry slug — identity (name, initials, tint, photo) is derived from it,
   *  and the card links to `/members/<slug>`. */
  slug: string;
  meta: string;
  role: string;
  // Identity for live (API) cards that have no entry in the local member
  // registry. Demo cards leave these undefined and resolve name/avatar from the
  // registry by slug; live cards carry their own so the card never depends on a
  // mock profile existing.
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  tags: { label: string; match?: boolean }[];
  // ---- structured fields the filters / sort run against ----
  openTo: OpenToId[];
  hood: string;
  /** Broad professional field — drives the "What they do" filter. */
  discipline: string;
  /** Specific job within `discipline` — drives the "Profession" filter. */
  profession: string;
  identities: Identity[];
  languages: string[];
  /** Years on QueerPulse. */
  years: number;
  /** Sort keys (lower = more recent / earlier). */
  joinedRank: number;
  vouchCount: number;
  mutualsCount: number;
}

/** The filter's checkbox rows — now the same vocabulary the profile chips use.
 *  Counts are never authored here: they're counted off the members actually
 *  loaded (`facetCounts`), so an empty directory shows no numbers. */
export const OPEN_TO_OPTIONS: FilterOption[] = OPEN_TO_PRESETS.map(
  (preset) => ({
    id: preset.id,
    labelKey: preset.labelKey,
  }),
);

/** id → labelKey, for resolving a stored "open to" id back to a display label
 *  wherever the full `OPEN_TO_OPTIONS` list isn't at hand (e.g. `appliedChips`). */
export const OPEN_TO_LABEL_KEY: Record<string, string> = Object.fromEntries(
  OPEN_TO_OPTIONS.map((o) => [o.id, o.labelKey]),
);

/** The "show every neighbourhood" convenience chip — not a real neighbourhood,
 *  so (unlike the proper nouns below) it's chrome and needs a translated
 *  label; see `HOOD_LABEL_KEY`. */
export const ALL_OF_LISBON = "All of Lisbon";

/** Where members are based. Real Lisbon neighbourhood names are proper nouns
 *  and stay identical in every language — never translated (i18n sweep §6) —
 *  so most of these carry no labelKey at all; only `ALL_OF_LISBON` does. */
export const NEIGHBOURHOODS: ChipOption[] = [
  { label: "Anjos", active: true },
  { label: "Mouraria", active: true },
  { label: "Graça" },
  { label: "Alfama" },
  { label: "Bairro Alto" },
  { label: "Marvila" },
  { label: "Príncipe Real" },
  { label: ALL_OF_LISBON },
];

/** label → labelKey for the one non-proper-noun hood option above. */
export const HOOD_LABEL_KEY: Partial<Record<string, string>> = {
  [ALL_OF_LISBON]: "members:directory.hood.all",
};

/** A "What they do" / "Profession" filter chip. The `id` is the stable,
 *  canonical value stored in `FilterState` / `MemberCard.discipline` /
 *  `MemberCard.profession` and never changes with language; `labelKey`
 *  resolves via `t()` at render only. Splitting these was a deliberate fix —
 *  see the i18n sweep §5.1 note on `memberDirectoryFilter.data.ts` for why a
 *  plain translated `label` used to double as the compared/stored value. */
export interface FilterOption {
  id: string;
  labelKey: string;
  active?: boolean;
}

export const DISCIPLINES: FilterOption[] = [
  {
    id: "design",
    labelKey: "members:directory.discipline.design",
    active: true,
  },
  { id: "editorial", labelKey: "members:directory.discipline.editorial" },
  { id: "healthcare", labelKey: "members:directory.discipline.healthcare" },
  { id: "legal", labelKey: "members:directory.discipline.legal" },
  { id: "education", labelKey: "members:directory.discipline.education" },
  { id: "tech", labelKey: "members:directory.discipline.tech" },
  { id: "photo", labelKey: "members:directory.discipline.photo" },
  { id: "film", labelKey: "members:directory.discipline.film" },
  { id: "performance", labelKey: "members:directory.discipline.performance" },
  { id: "music", labelKey: "members:directory.discipline.music" },
  { id: "architecture", labelKey: "members:directory.discipline.architecture" },
  { id: "community", labelKey: "members:directory.discipline.community" },
  { id: "curation", labelKey: "members:directory.discipline.curation" },
  { id: "food", labelKey: "members:directory.discipline.food" },
  { id: "craft", labelKey: "members:directory.discipline.craft" },
  { id: "science", labelKey: "members:directory.discipline.science" },
];

/** id → labelKey, for resolving a stored discipline id back to a display
 *  label wherever the full `DISCIPLINES` list isn't at hand (e.g. `appliedChips`). */
export const DISCIPLINE_LABEL_KEY: Record<string, string> = Object.fromEntries(
  DISCIPLINES.map((d) => [d.id, d.labelKey]),
);

/** Specific professions grouped under each broad field (`discipline` id).
 *  The Profession filter narrows to these once a field is chosen. */
export const PROFESSIONS_BY_FIELD: Record<string, FilterOption[]> = {
  design: [
    {
      id: "graphicDesigner",
      labelKey: "members:directory.profession.graphicDesigner",
    },
    { id: "uxDesigner", labelKey: "members:directory.profession.uxDesigner" },
    { id: "illustrator", labelKey: "members:directory.profession.illustrator" },
    { id: "artDirector", labelKey: "members:directory.profession.artDirector" },
  ],
  editorial: [
    { id: "editor", labelKey: "members:directory.profession.editor" },
    { id: "journalist", labelKey: "members:directory.profession.journalist" },
    { id: "copywriter", labelKey: "members:directory.profession.copywriter" },
    { id: "translator", labelKey: "members:directory.profession.translator" },
    { id: "poet", labelKey: "members:directory.profession.poet" },
  ],
  healthcare: [
    { id: "therapist", labelKey: "members:directory.profession.therapist" },
    {
      id: "psychologist",
      labelKey: "members:directory.profession.psychologist",
    },
    { id: "nurse", labelKey: "members:directory.profession.nurse" },
    { id: "gp", labelKey: "members:directory.profession.gp" },
    {
      id: "physiotherapist",
      labelKey: "members:directory.profession.physiotherapist",
    },
    {
      id: "peerCounsellor",
      labelKey: "members:directory.profession.peerCounsellor",
    },
    {
      id: "communityHealthWorker",
      labelKey: "members:directory.profession.communityHealthWorker",
    },
  ],
  legal: [
    {
      id: "immigrationLawyer",
      labelKey: "members:directory.profession.immigrationLawyer",
    },
    {
      id: "familyLawyer",
      labelKey: "members:directory.profession.familyLawyer",
    },
    { id: "paralegal", labelKey: "members:directory.profession.paralegal" },
    {
      id: "legalAdvocate",
      labelKey: "members:directory.profession.legalAdvocate",
    },
  ],
  education: [
    { id: "teacher", labelKey: "members:directory.profession.teacher" },
    {
      id: "workshopFacilitator",
      labelKey: "members:directory.profession.workshopFacilitator",
    },
    { id: "researcher", labelKey: "members:directory.profession.researcher" },
    { id: "tutor", labelKey: "members:directory.profession.tutor" },
  ],
  tech: [
    {
      id: "softwareEngineer",
      labelKey: "members:directory.profession.softwareEngineer",
    },
    {
      id: "backendEngineer",
      labelKey: "members:directory.profession.backendEngineer",
    },
    {
      id: "dataScientist",
      labelKey: "members:directory.profession.dataScientist",
    },
    {
      id: "productManager",
      labelKey: "members:directory.profession.productManager",
    },
  ],
  photo: [
    {
      id: "portraitPhotographer",
      labelKey: "members:directory.profession.portraitPhotographer",
    },
    {
      id: "photojournalist",
      labelKey: "members:directory.profession.photojournalist",
    },
    { id: "retoucher", labelKey: "members:directory.profession.retoucher" },
  ],
  film: [
    {
      id: "documentaryFilmmaker",
      labelKey: "members:directory.profession.documentaryFilmmaker",
    },
    { id: "filmmaker", labelKey: "members:directory.profession.filmmaker" },
    {
      id: "cinematographer",
      labelKey: "members:directory.profession.cinematographer",
    },
    { id: "filmEditor", labelKey: "members:directory.profession.filmEditor" },
  ],
  performance: [
    {
      id: "choreographer",
      labelKey: "members:directory.profession.choreographer",
    },
    { id: "dancer", labelKey: "members:directory.profession.dancer" },
    {
      id: "theatreMaker",
      labelKey: "members:directory.profession.theatreMaker",
    },
    {
      id: "performanceArtist",
      labelKey: "members:directory.profession.performanceArtist",
    },
  ],
  music: [
    {
      id: "musicProducer",
      labelKey: "members:directory.profession.musicProducer",
    },
    { id: "dj", labelKey: "members:directory.profession.dj" },
    {
      id: "sessionMusician",
      labelKey: "members:directory.profession.sessionMusician",
    },
    {
      id: "soundDesigner",
      labelKey: "members:directory.profession.soundDesigner",
    },
    {
      id: "musicIndustryAR",
      labelKey: "members:directory.profession.musicIndustryAR",
    },
  ],
  architecture: [
    { id: "architect", labelKey: "members:directory.profession.architect" },
    {
      id: "urbanDesigner",
      labelKey: "members:directory.profession.urbanDesigner",
    },
    {
      id: "interiorArchitect",
      labelKey: "members:directory.profession.interiorArchitect",
    },
  ],
  community: [
    {
      id: "communityOrganiser",
      labelKey: "members:directory.profession.communityOrganiser",
    },
    {
      id: "housingOrganiser",
      labelKey: "members:directory.profession.housingOrganiser",
    },
    {
      id: "housingAdvocate",
      labelKey: "members:directory.profession.housingAdvocate",
    },
    {
      id: "supportCoordinator",
      labelKey: "members:directory.profession.supportCoordinator",
    },
    {
      id: "accessibilityAdvocate",
      labelKey: "members:directory.profession.accessibilityAdvocate",
    },
    { id: "activist", labelKey: "members:directory.profession.activist" },
  ],
  curation: [
    { id: "curator", labelKey: "members:directory.profession.curator" },
    { id: "archivist", labelKey: "members:directory.profession.archivist" },
    {
      id: "galleryDirector",
      labelKey: "members:directory.profession.galleryDirector",
    },
  ],
  food: [
    { id: "chef", labelKey: "members:directory.profession.chef" },
    { id: "barista", labelKey: "members:directory.profession.barista" },
    { id: "baker", labelKey: "members:directory.profession.baker" },
    {
      id: "supperClubHost",
      labelKey: "members:directory.profession.supperClubHost",
    },
  ],
  craft: [
    { id: "ceramicist", labelKey: "members:directory.profession.ceramicist" },
    { id: "woodworker", labelKey: "members:directory.profession.woodworker" },
    {
      id: "textileArtist",
      labelKey: "members:directory.profession.textileArtist",
    },
  ],
  science: [
    { id: "biologist", labelKey: "members:directory.profession.biologist" },
    { id: "ecologist", labelKey: "members:directory.profession.ecologist" },
    {
      id: "labResearcher",
      labelKey: "members:directory.profession.labResearcher",
    },
  ],
};

/** Flat list of every profession across all fields. */
export const ALL_PROFESSIONS: FilterOption[] =
  Object.values(PROFESSIONS_BY_FIELD).flat();

/** id → labelKey, for resolving a stored profession id back to a display
 *  label wherever the full per-field list isn't at hand (e.g. `appliedChips`). */
export const PROFESSION_LABEL_KEY: Record<string, string> = Object.fromEntries(
  ALL_PROFESSIONS.map((p) => [p.id, p.labelKey]),
);

/** Reverse lookup: which field id a profession id belongs to. Used so that
 *  picking a profession from a free-text search also selects its parent
 *  field, keeping the profession ⊆ field invariant (see `reconcileProfessions`). */
export const FIELD_BY_PROFESSION: Record<string, string> = Object.fromEntries(
  Object.entries(PROFESSIONS_BY_FIELD).flatMap(([field, profs]) =>
    profs.map((p) => [p.id, field]),
  ),
);

/** The professions available to pick given the selected field ids.
 *  No field selected → everything; otherwise the union of those fields' pools. */
export function professionsForFields(disciplineIds: string[]): FilterOption[] {
  if (!disciplineIds.length) return ALL_PROFESSIONS;
  const seen = new Set<string>();
  const out: FilterOption[] = [];
  for (const disciplineId of disciplineIds)
    for (const profession of PROFESSIONS_BY_FIELD[disciplineId] ?? [])
      if (!seen.has(profession.id)) {
        seen.add(profession.id);
        out.push(profession);
      }
  return out;
}

/** Self-declared identity vocabulary — same stored-id / rendered-label
 *  contract as `OPEN_TO_OPTIONS` (i18n sweep §5.1); counts come from the
 *  loaded members. */
export const IDENTITY_OPTIONS: FilterOption[] = [
  {
    id: "transNonBinary",
    labelKey: "members:directory.identity.transNonBinary",
  },
  { id: "lesbian", labelKey: "members:directory.identity.lesbian" },
  { id: "gay", labelKey: "members:directory.identity.gay" },
  { id: "biPan", labelKey: "members:directory.identity.biPan" },
  { id: "aroAce", labelKey: "members:directory.identity.aroAce" },
  { id: "qpoc", labelKey: "members:directory.identity.qpoc" },
  {
    id: "disabledChronicIllness",
    labelKey: "members:directory.identity.disabledChronicIllness",
  },
];

/** id → labelKey, for resolving a stored identity id back to a display label
 *  wherever the full `IDENTITY_OPTIONS` list isn't at hand (e.g. `appliedChips`). */
export const IDENTITY_LABEL_KEY: Record<string, string> = Object.fromEntries(
  IDENTITY_OPTIONS.map((o) => [o.id, o.labelKey]),
);

/** How many of `members` declare each value of a multi-select facet. Only
 *  values someone actually declares get a key, so a caller can tell "nobody"
 *  (absent) apart from a real zero it never asked about. */
export function facetCounts(
  members: MemberCard[],
  field: "openTo" | "identities",
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const member of members)
    for (const value of member[field]) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

export const LANGUAGES: ChipOption[] = [
  { label: "PT", active: true },
  { label: "EN", active: true },
  { label: "ES" },
  { label: "FR" },
  { label: "DE" },
];

const DISCIPLINE_POOL = Object.keys(PROFESSIONS_BY_FIELD);
// `IDENTITY_OPTIONS` is a `FilterOption[]` (id + labelKey), not `Identity[]` —
// the pool needs the stable *id*, not the option object itself (i18n sweep
// §5.1: a stray `FilterOption[]` here would compare objects against string
// ids everywhere else and silently match nothing).
const IDENTITY_POOL: Identity[] = IDENTITY_OPTIONS.map(
  (option) => option.id as Identity,
);
const LANG_POOL = ["PT", "EN", "ES", "FR", "DE"];
const PRONOUNS = ["she/her", "he/him", "they/them", "she/they", "he/they"];

/** Per-member facets for the generated directory card. The preview `bio` is a
 *  short third-person echo of the member's own profile bio, and `discipline` /
 *  `profession` are the closest filter-enum bucket for that person — so a card's
 *  preview sentence, tags and the filters it answers to all describe the *real*
 *  member behind the avatar, not a randomly assembled persona.
 *  Keyed by registry slug; see `./data/members`. */
interface MemberFacet {
  discipline: string;
  profession: string;
  bio: string;
}
const SLUG_FACETS: Record<string, MemberFacet> = {
  ines: {
    discipline: "design",
    profession: "graphicDesigner",
    bio: "Designs brand identities and editorial systems for cultural orgs and small presses.",
  },
  rui: {
    discipline: "tech",
    profession: "backendEngineer",
    bio: "Backend engineer building durable systems, open to mentoring and code review.",
  },
  sofia: {
    discipline: "film",
    profession: "documentaryFilmmaker",
    bio: "Documentary filmmaker making slow, observational portraits shot around Lisbon.",
  },
  tomas: {
    discipline: "food",
    profession: "supperClubHost",
    bio: "Runs a twelve-seat supper club in Mouraria — no menu, lots of fermentation.",
  },
  mariana: {
    discipline: "healthcare",
    profession: "psychologist",
    bio: "Clinical psychologist working with LGBTQ+ adults on identity and visibility.",
  },
  andre: {
    discipline: "photo",
    profession: "portraitPhotographer",
    bio: "Shoots film portraits, offering free sittings for trans & nonbinary members.",
  },
  carla: {
    discipline: "tech",
    profession: "productManager",
    bio: "Product manager from fintech, thinking hard about how to build ethically.",
  },
  beatriz: {
    discipline: "craft",
    profession: "ceramicist",
    bio: "Makes functional ceramics in a Graça studio and teaches occasional workshops.",
  },
  diogo: {
    discipline: "music",
    profession: "musicProducer",
    bio: "Produces and mixes live sets for queer club nights and stranger projects.",
  },
  "sofia-rodrigues": {
    discipline: "design",
    profession: "uxDesigner",
    bio: "Designs public-service tools that don't make people feel stupid.",
  },
  "tomas-mendes": {
    discipline: "architecture",
    profession: "architect",
    bio: "Architect working on co-housing and who gets to stay in a neighbourhood.",
  },
  anika: {
    discipline: "editorial",
    profession: "poet",
    bio: "Translator and poet working between Slovene, English and Portuguese.",
  },
  jordan: {
    discipline: "community",
    profession: "communityOrganiser",
    bio: "Community organiser facilitating hard conversations, mediation and trust.",
  },
  maria: {
    discipline: "healthcare",
    profession: "psychologist",
    bio: "Clinical psychologist in Porto caring mostly for queer and trans clients.",
  },
  kai: {
    discipline: "film",
    profession: "filmmaker",
    bio: "Filmmaker newly in Lisbon, making documentaries about disappearing places.",
  },
  monica: {
    discipline: "healthcare",
    profession: "physiotherapist",
    bio: "Physiotherapist offering trans-affirming bodywork and post-surgical rehab.",
  },
  fatima: {
    discipline: "community",
    profession: "supportCoordinator",
    bio: "Coordinates peer support and crisis referral for queer migrants in Lisbon.",
  },
  "catarina-vaz": {
    discipline: "community",
    profession: "housingOrganiser",
    bio: "Housing organiser standing with tenants in Marvila and Graça against eviction.",
  },
  jonas: {
    discipline: "healthcare",
    profession: "communityHealthWorker",
    bio: "Community health worker doing harm-reduction and PrEP outreach in Cais do Sodré.",
  },
  "raquel-baptista": {
    discipline: "legal",
    profession: "familyLawyer",
    bio: "Pro-bono lawyer taking on queer family law and discrimination cases.",
  },
  rita: {
    discipline: "design",
    profession: "illustrator",
    bio: "Makes zines and queer comics on a temperamental shared-studio risograph.",
  },
  "sofia-castano": {
    discipline: "photo",
    profession: "photojournalist",
    bio: "Documentary photographer of queer nightlife, raised between Vigo and Lisbon.",
  },
  nuno: {
    discipline: "tech",
    profession: "softwareEngineer",
    bio: "Frontend engineer and accessibility advocate building sites that lock no one out.",
  },
  luisa: {
    discipline: "curation",
    profession: "curator",
    bio: "Curator of contemporary shows, building a stubborn queer community archive.",
  },
  "mariana-costa": {
    discipline: "editorial",
    profession: "journalist",
    bio: "Journalist reporting on the slow machinery of LGBTQ+ rights in Portugal.",
  },
  "rui-fernandes": {
    discipline: "community",
    profession: "activist",
    bio: "Trans-rights activist and essayist, organising in the gaps between meetings.",
  },
  "catarina-melo": {
    discipline: "community",
    profession: "housingAdvocate",
    bio: "Housing advocate fighting for queer tenants pushed out by a city for sale.",
  },
  "sara-pinheiro": {
    discipline: "community",
    profession: "accessibilityAdvocate",
    bio: "Disabled queer accessibility auditor working at the edge of disability justice.",
  },
  "bilal-kaya": {
    discipline: "music",
    profession: "soundDesigner",
    bio: "Sound designer for film and theatre, tuning club rigs that hit your chest.",
  },
  "ines-fonseca": {
    discipline: "performance",
    profession: "choreographer",
    bio: "Choreographer making tender, feral contemporary dance about queer bodies.",
  },
  "daniel-oliveira": {
    discipline: "healthcare",
    profession: "nurse",
    bio: "Nurse and harm-reduction worker caring for the clubs around Cais do Sodré.",
  },
  tiago: {
    discipline: "tech",
    profession: "softwareEngineer",
    bio: "Fullstack developer bringing useful — and sometimes silly — web ideas to life.",
  },
};

/** All slugs in the registry that resolve to a real person profile. */
const PROFILE_SLUGS = Object.keys(memberProfiles);

/** Tiny deterministic PRNG so the generated directory is stable across renders. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)]!;
}

function some<T>(arr: T[], r: () => number, min: number, max: number): T[] {
  const n = min + Math.floor(r() * (max - min + 1));
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(r() * copy.length), 1)[0]!);
  }
  return out;
}

/** Build a deterministic, filterable directory — one card per real profile, so
 *  no member ever appears twice. */
function buildMembers(): MemberCard[] {
  const count = PROFILE_SLUGS.length;
  const out: MemberCard[] = [];
  for (let i = 0; i < count; i++) {
    const r = rng(i * 9973 + 7);
    const slug = PROFILE_SLUGS[i]!;
    const member = memberProfiles[slug];
    // The card describes the *real* member: bio + filter buckets come from the
    // facet table, with a graceful fallback for any slug not yet curated.
    const fallbackDiscipline = pick(DISCIPLINE_POOL, r);
    const facet: MemberFacet = SLUG_FACETS[slug] ?? {
      discipline: fallbackDiscipline,
      profession:
        pick(PROFESSIONS_BY_FIELD[fallbackDiscipline] ?? [], r)?.id ??
        "unspecified",
      bio: member?.role ?? "",
    };
    const { discipline, profession, bio } = facet;
    // Real fields, read from the registry — never invented. A member with no
    // openTo yields an empty facet, not a fabricated match.
    const openTo = member ? openToPresetIds(member.openTo) : [];
    const hood = member?.hood ?? "";
    const vouchCount = member?.vouchers.length ?? 0;
    const identities = some(IDENTITY_POOL, r, 1, 2);
    const languages = ["PT", ...some(LANG_POOL.slice(1), r, 1, 2)];
    const years = Math.floor(r() * 9);
    const mutualsCount = Math.floor(r() * 14);

    // Show the member's own profile tags so the card reads as one coherent person.
    const realTags = member?.tags ?? [];
    // Language chip lists the first two, collapsing any extras into a "+N" so the
    // chip never runs long.
    const langLabel =
      languages.length > 2
        ? `${languages.slice(0, 2).join(" · ")} +${languages.length - 2}`
        : languages.join(" · ");
    const tags: MemberCard["tags"] = [
      ...realTags.slice(0, 2).map((label) => ({ label, match: true })),
      { label: langLabel },
    ];

    out.push({
      slug,
      meta: `${pick(PRONOUNS, r)} · ${hood}`,
      role: bio,
      tags,
      openTo,
      hood,
      discipline,
      profession,
      identities,
      languages,
      years,
      joinedRank: count - i,
      vouchCount,
      mutualsCount,
    });
  }
  return out;
}

/** The full generated directory — one card per real profile. The list shows a
 *  page of these at a time. */
export const MEMBERS: MemberCard[] = buildMembers();

/** Total directory population — the real registry size, not a vanity figure.
 *  Drives the hero count and the "of N members" line. */
export const TOTAL_MEMBERS = MEMBERS.length;

/** How many cards are shown per page. */
export const PAGE_SIZE = 12;

// "Recently active" is deliberately absent: the backend tracks no last-active
// timestamp, so in live mode it could only ever be a no-op (which is exactly the
// "sort does nothing" bug it caused). Sorting is server-side in live mode, so a
// key with no real ordering must not exist. "Recently joined" is the default.
export type SortKey =
  | "Recently joined"
  | "Closest mutuals"
  | "A to Z"
  | "Most vouched";

export const SORTS: SortKey[] = [
  "Recently joined",
  "Closest mutuals",
  "A to Z",
  "Most vouched",
];

/** Display label per sort key — a small, platform-defined vocabulary (chrome),
 *  resolved through `t()`. `SortKey` itself stays the English literal used as
 *  the internal comparator id (see `sortMembers`); only the on-screen label
 *  is translated. */
export const SORT_LABEL_KEY: Record<SortKey, string> = {
  "Recently joined": "members:directory.sort.recentlyJoined",
  "Closest mutuals": "members:directory.sort.closestMutuals",
  "A to Z": "members:directory.sort.aToZ",
  "Most vouched": "members:directory.sort.mostVouched",
};

/** Wire token per sort key for the live directory API's `?sort=`. Must match the
 *  backend `MemberSort` enum. Demo mode sorts in the browser (see `sortMembers`)
 *  and ignores this; live mode sends it and renders the server's order. */
export const SORT_PARAM: Record<SortKey, string> = {
  "Recently joined": "recentlyJoined",
  "Closest mutuals": "closestMutuals",
  "A to Z": "aToZ",
  "Most vouched": "mostVouched",
};

/** The chips shown applied at the top, with the control + value each maps to. */
export interface AppliedChip {
  label: string;
  group:
    "openTo" | "hood" | "discipline" | "profession" | "language" | "identity";
  value: string;
}

/** Everything the controls write into — the single source of truth for results. */
export interface FilterState {
  openTo: string[];
  hoods: string[];
  disciplines: string[];
  professions: string[];
  identities: string[];
  languages: string[];
  yearsFrom: number;
  yearsTo: number;
}

export const DEFAULT_FILTERS: FilterState = {
  openTo: ["mentoring"],
  hoods: ["Anjos", "Mouraria"],
  disciplines: [],
  professions: [],
  identities: [],
  languages: ["PT", "EN"],
  yearsFrom: 0,
  yearsTo: 9,
};

/** A truly empty filter set — what "Clear filters" resets to (the page opens on
 *  the curated DEFAULT_FILTERS, so clearing must reach for this, not the default). */
export const EMPTY_FILTERS: FilterState = {
  openTo: [],
  hoods: [],
  disciplines: [],
  professions: [],
  identities: [],
  languages: [],
  yearsFrom: 0,
  yearsTo: 9,
};

/** Drop any selected profession that no longer belongs to the selected fields.
 *  Keeps profession ⊆ field coherent after a field is removed. */
export function reconcileProfessions(f: FilterState): FilterState {
  if (!f.disciplines.length) return f;
  const allowed = new Set(
    professionsForFields(f.disciplines).map((option) => option.id),
  );
  const professions = f.professions.filter((p) => allowed.has(p));
  return professions.length === f.professions.length
    ? f
    : { ...f, professions };
}

/** Does a member satisfy every active criterion? (AND across groups, OR within.) */
export function matchesFilters(m: MemberCard, f: FilterState): boolean {
  if (
    f.openTo.length &&
    !f.openTo.some((o) => m.openTo.includes(o as OpenToId))
  )
    return false;
  // ALL_OF_LISBON is a non-filtering convenience option.
  const hoods = f.hoods.filter((h) => h !== ALL_OF_LISBON);
  if (hoods.length && !hoods.includes(m.hood)) return false;
  if (f.disciplines.length && !f.disciplines.includes(m.discipline))
    return false;
  if (f.professions.length && !f.professions.includes(m.profession))
    return false;
  if (
    f.identities.length &&
    !f.identities.some((i) => m.identities.includes(i as Identity))
  )
    return false;
  if (f.languages.length && !f.languages.some((l) => m.languages.includes(l)))
    return false;
  if (m.years < f.yearsFrom || m.years > f.yearsTo) return false;
  return true;
}

/** Returns a new array sorted by the chosen key (non-mutating). */
export function sortMembers(list: MemberCard[], sort: SortKey): MemberCard[] {
  const out = [...list];
  switch (sort) {
    case "Recently joined":
      return out.sort((a, b) => a.joinedRank - b.joinedRank);
    case "Closest mutuals":
      return out.sort((a, b) => b.mutualsCount - a.mutualsCount);
    case "Most vouched":
      return out.sort((a, b) => b.vouchCount - a.vouchCount);
    case "A to Z":
      return out.sort((a, b) => a.slug.localeCompare(b.slug));
    default:
      return out;
  }
}

/** Flatten the active filters into removable chips for the top-of-results row.
 *  `t` resolves every id-backed group (openTo/discipline/profession/identity,
 *  plus the one non-proper-noun hood option) to its display label; real hood
 *  proper nouns and language codes still double as their own label (i18n
 *  sweep §6 — proper nouns and ISO-style codes are identical in every
 *  language, so no labelKey was needed for those). */
export function appliedChips(
  f: FilterState,
  t: (key: string) => string,
): AppliedChip[] {
  const chips: AppliedChip[] = [];
  f.openTo.forEach((value) =>
    chips.push({
      label: OPEN_TO_LABEL_KEY[value] ? t(OPEN_TO_LABEL_KEY[value]) : value,
      group: "openTo",
      value,
    }),
  );
  f.hoods.forEach((value) =>
    chips.push({
      label: HOOD_LABEL_KEY[value] ? t(HOOD_LABEL_KEY[value]) : value,
      group: "hood",
      value,
    }),
  );
  f.disciplines.forEach((value) =>
    chips.push({
      label: DISCIPLINE_LABEL_KEY[value]
        ? t(DISCIPLINE_LABEL_KEY[value])
        : value,
      group: "discipline",
      value,
    }),
  );
  f.professions.forEach((value) =>
    chips.push({
      label: PROFESSION_LABEL_KEY[value]
        ? t(PROFESSION_LABEL_KEY[value])
        : value,
      group: "profession",
      value,
    }),
  );
  f.identities.forEach((value) =>
    chips.push({
      label: IDENTITY_LABEL_KEY[value] ? t(IDENTITY_LABEL_KEY[value]) : value,
      group: "identity",
      value,
    }),
  );
  f.languages.forEach((value) =>
    chips.push({ label: value, group: "language", value }),
  );
  return chips;
}
