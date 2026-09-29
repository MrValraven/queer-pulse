import { memberProfiles } from "./data/memberProfiles";
import { compareActivityBands, type ActivityBand } from "./activityBand";
import { demoBandForSlug } from "./activityBand.data";
import { OPEN_TO_PRESETS, openToPresetIds, type OpenToId } from "./openTo.data";
import { LISBON_NEIGHBOURHOOD_NAMES } from "../../shared/geo/lisbonNeighbourhoods";
import {
  AMBASSADOR_FOCUS_AREAS,
  AMBASSADOR_FOCUS_LABEL_KEY,
  type AmbassadorFocusArea,
} from "../../shared/ambassadors/ambassadorFocusAreas.data";
import { DEMO_AMBASSADORS } from "../../shared/ambassadors/ambassadorRegistry.data";
import { staffBadgeRolesFor } from "../../shared/staff/badgedStaffRoles";
import { DEMO_STAFF } from "../../shared/staff/staffRegistry.data";
import {
  PROFESSION_IDS_BY_FIELD,
  UNLISTED_FIELD_IDS,
  fieldLabelKey,
  professionLabelKey,
} from "./workTaxonomy.data";

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
  /** Coarse "recently active" band, or `null`/absent when the member opted out
   *  or the platform has never observed a session for them. See
   *  `activityBand.ts`: `null` renders as nothing at all, never as "not active
   *  recently". */
  activityBand?: ActivityBand | null;
}

/** One checkbox row in the sidebar. `labelKey` is optional because one group's
 *  ids are already their own label: the neighbourhoods are Lisbon proper nouns
 *  and stay identical in every language (i18n sweep §6), so there is nothing to
 *  translate and the id is what a member reads. Every other group carries a
 *  key, and a row without one falls back to its id. */
export interface CheckboxOption {
  id: string;
  labelKey?: string;
}

/** The filter's checkbox rows — now the same vocabulary the profile chips use.
 *  Counts are never authored here: they come from `directoryFacetCounts` (demo)
 *  or `GET /members`' `facets` (live), so an empty directory shows honest
 *  zeroes rather than invented numbers. */
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

/** Where members are based: the shared Lisbon vocabulary the profile editor's
 *  neighbourhood select offers, plus the `ALL_OF_LISBON` chrome row.
 *
 *  Deriving it is the point. This list was seven hand-picked bairros while the
 *  profile field was free text, so a member who wrote "Arroios" — a real
 *  freguesia, just not one of the seven — could never be found by any filter
 *  and showed no neighbourhood on their card. Both ends now read the same
 *  module (mirrored server-side by `profiles/neighbourhoods.ts`), so a name a
 *  member can pick is always a name someone can filter by.
 *
 *  Real Lisbon neighbourhood names are proper nouns and stay identical in
 *  every language — never translated (i18n sweep §6) — so they carry no
 *  labelKey at all; only `ALL_OF_LISBON` does. */
export const NEIGHBOURHOODS: ChipOption[] = [
  ...LISBON_NEIGHBOURHOOD_NAMES.map((label) => ({ label })),
  { label: ALL_OF_LISBON },
];

/** label → labelKey for the one non-proper-noun hood option above. */
export const HOOD_LABEL_KEY: Partial<Record<string, string>> = {
  [ALL_OF_LISBON]: "members:directory.hood.all",
};

/** The "Where they're based" rows, as checkbox options: the same shape and the
 *  same count treatment as "What they're open to" and "Identity". They were
 *  chips once, which made them the one group in the sidebar with no numbers on
 *  it and no way to see which neighbourhoods were empty before clicking. */
export const HOOD_OPTIONS: CheckboxOption[] = NEIGHBOURHOODS.map((hood) => ({
  id: hood.label,
  labelKey: HOOD_LABEL_KEY[hood.label],
}));

/** A "What they do" / "Profession" filter chip. The `id` is the stable,
 *  canonical value stored in `FilterState` / `MemberCard.discipline` /
 *  `MemberCard.profession` and never changes with language; `labelKey`
 *  resolves via `t()` at render only. Splitting these was a deliberate fix —
 *  see the i18n sweep §5.1 note on `memberDirectoryFilter.data.ts` for why a
 *  plain translated `label` used to double as the compared/stored value. */
export interface FilterOption extends CheckboxOption {
  labelKey: string;
  active?: boolean;
}

/** Every field as a filter option, in `PROFESSION_IDS_BY_FIELD` order. The
 *  ids come from `workTaxonomy.data.ts`, the mirror of the backend's
 *  `profiles/professions.ts`, and each labelKey is derived from its id. */
export const DISCIPLINES: FilterOption[] = Object.keys(
  PROFESSION_IDS_BY_FIELD,
).map((fieldId) => ({ id: fieldId, labelKey: fieldLabelKey(fieldId) }));

/** id → labelKey, for resolving a stored discipline id back to a display
 *  label wherever the full `DISCIPLINES` list isn't at hand (e.g. `appliedChips`). */
export const DISCIPLINE_LABEL_KEY: Record<string, string> = Object.fromEntries(
  DISCIPLINES.map((d) => [d.id, d.labelKey]),
);

/** Specific professions grouped under each broad field (`discipline` id).
 *  The Profession filter narrows to these once a field is chosen. */
export const PROFESSIONS_BY_FIELD: Record<string, FilterOption[]> =
  Object.fromEntries(
    Object.entries(PROFESSION_IDS_BY_FIELD).map(([fieldId, professionIds]) => [
      fieldId,
      professionIds.map((professionId) => ({
        id: professionId,
        labelKey: professionLabelKey(professionId),
      })),
    ]),
  );

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

/**
 * Fields a member can pick in the "What do you do?" picker (onboarding, the
 * profile editor, Settings) that the member directory must keep off its
 * filter, its counts, its applied chips and the text-search resolver: the
 * pick still shows on the member's own full profile. Listing sex work in the
 * directory could out someone, so the directory reads the listed vocabulary
 * only. The backend enforces the same rule server-side; these lists keep the
 * UI honest by construction rather than by remembering to filter `adultWork`
 * out at every call site.
 */
export const UNLISTED_DISCIPLINE_IDS: ReadonlySet<string> = new Set(
  UNLISTED_FIELD_IDS,
);

/** True when `id` names an unlisted field (see `UNLISTED_DISCIPLINE_IDS`). */
export function isUnlistedDiscipline(id: string): boolean {
  return UNLISTED_DISCIPLINE_IDS.has(id);
}

/** `DISCIPLINES` minus the unlisted fields: what the member directory's
 *  filter, its counts and its applied chips are allowed to show. The picker
 *  keeps reading the full `DISCIPLINES` list. */
export const DIRECTORY_DISCIPLINES: FilterOption[] = DISCIPLINES.filter(
  (discipline) => !isUnlistedDiscipline(discipline.id),
);

/** `ALL_PROFESSIONS` minus the professions of unlisted fields: the directory
 *  counterpart to `DIRECTORY_DISCIPLINES`. */
export const DIRECTORY_PROFESSIONS: FilterOption[] = ALL_PROFESSIONS.filter(
  (profession) => !isUnlistedDiscipline(FIELD_BY_PROFESSION[profession.id]!),
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

/** Listed-only counterpart to `professionsForFields`, for the member
 *  directory's filter. No field selected → the listed pool
 *  (`DIRECTORY_PROFESSIONS`); otherwise the same union, always filtered down
 *  to listed professions, dropping any profession whose field is unlisted
 *  even when it was passed in directly. The picker keeps calling
 *  `professionsForFields` so it still offers the unlisted field's own
 *  professions on the member's own profile. */
export function directoryProfessionsForFields(
  disciplineIds: string[],
): FilterOption[] {
  if (!disciplineIds.length) return DIRECTORY_PROFESSIONS;
  return professionsForFields(disciplineIds).filter(
    (profession) => !isUnlistedDiscipline(FIELD_BY_PROFESSION[profession.id]!),
  );
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

/**
 * Per-option availability counts for the sidebar's filter groups — the numbers
 * beside each option ("Mentoring 7").
 *
 * "Availability" is the contract: each group's counts are taken with THAT
 * group's own selections lifted and every other group's still applied, so the
 * number answers "how many of my current results would I get if I ticked this".
 * Keeping a group's own selections would zero every unticked sibling the moment
 * one was ticked, which reads as the directory emptying rather than as a filter
 * narrowing.
 *
 * Every known option carries an entry, `0` included. An ABSENT key means "not
 * counted" and renders no badge at all; a `0` means "counted, and empty" and
 * renders a dimmed, unpickable option. Collapsing the two would make an
 * unavailable option indistinguishable from an uncounted one — which is exactly
 * how the live directory used to behave, showing no numbers rather than wrong
 * ones. Live mode fills this from `GET /members`; see `directoryFacetCounts`
 * for the demo-mode equivalent.
 */
export interface DirectoryFacetCounts {
  openTo: Record<string, number>;
  hoods: Record<string, number>;
  identities: Record<string, number>;
  disciplines: Record<string, number>;
  professions: Record<string, number>;
  languages: Record<string, number>;
  /** Per-focus-area count, each ASSUMING `isAmbassadorsOnly` is on: there is no
   *  separate "how many ambassadors total" figure (mirrors the backend's
   *  per-focus `ambassador` facet, Task B6). Every other filter group still
   *  applies, same "lift my own group" contract as the rest of this type. */
  ambassador: Record<AmbassadorFocusArea, number>;
}

/** Which `FilterState` key a counted group narrows — the key lifted when
 *  counting that group. */
type CountedGroup = keyof DirectoryFacetCounts;

/**
 * DEMO-MODE facet counts, computed in the browser over the whole mock list.
 *
 * The live directory cannot do this — it holds one 20-card page of a set that
 * may run to hundreds — so live mode reads the server's counts instead. Both
 * paths must mean the SAME thing, hence the shared `DirectoryFacetCounts`
 * contract and this function's mirroring of the backend's "lift my own group"
 * rule; demo used to count the whole mock list flat, which quietly showed
 * population figures where live now shows availability.
 */
export function directoryFacetCounts(
  members: MemberCard[],
  filters: FilterState,
): DirectoryFacetCounts {
  // One filtered population per group, each with only that group's own
  // selections lifted.
  const population = (group: CountedGroup): MemberCard[] =>
    members.filter((member) =>
      matchesFilters(member, { ...filters, [group]: [] }),
    );

  // Seeded with a zero for every known option, so an option nobody holds comes
  // back as a truthful 0 rather than as a missing key.
  const tally = (
    group: CountedGroup,
    optionIds: string[],
    valuesOf: (member: MemberCard) => readonly string[],
  ): Record<string, number> => {
    const counts: Record<string, number> = Object.fromEntries(
      optionIds.map((id) => [id, 0]),
    );
    for (const member of population(group))
      for (const value of valuesOf(member))
        // A value outside the known option list (a stale card, a vocabulary
        // the sidebar no longer offers) is counted under nothing rather than
        // conjuring an option row that has no checkbox.
        if (counts[value] !== undefined) counts[value] += 1;
    return counts;
  };

  // "All of Lisbon" is the "no hood restriction" row, so no member's `hood`
  // ever equals it and a plain tally would leave it on a permanent 0, which the
  // sidebar draws as an unpickable dead end. Its count is the whole population
  // it is counted against, which is exactly what ticking it returns.
  const hoods = tally(
    "hoods",
    NEIGHBOURHOODS.map((hood) => hood.label),
    (member) => [member.hood],
  );
  hoods[ALL_OF_LISBON] = population("hoods").length;

  // Ambassador focus counts skip the `CountedGroup` tally helper: the group
  // they lift spans two `FilterState` fields together (`isAmbassadorsOnly`,
  // `ambassadorFocusAreas`), so force the switch on and the focus selection
  // lifted, keep every other group as-is, then tally each ambassador's focus
  // area within that population. Routing through `matchesFilters` also folds
  // in its `wearsStaffBadgeInDemo` check, so a staff-badged demo ambassador
  // (who shows only the staff badge on their card) is left out of these
  // counts the same way they are left out of the filtered results.
  const ambassadorPopulation = members.filter((member) =>
    matchesFilters(member, {
      ...filters,
      isAmbassadorsOnly: true,
      ambassadorFocusAreas: [],
    }),
  );
  const ambassador: Record<AmbassadorFocusArea, number> = Object.fromEntries(
    AMBASSADOR_FOCUS_AREAS.map((focusArea) => [focusArea, 0]),
  ) as Record<AmbassadorFocusArea, number>;
  for (const member of ambassadorPopulation) {
    const identity = DEMO_AMBASSADORS[member.slug];
    if (identity) ambassador[identity.focusArea] += 1;
  }

  return {
    openTo: tally(
      "openTo",
      OPEN_TO_OPTIONS.map((o) => o.id),
      (member) => member.openTo,
    ),
    hoods,
    identities: tally(
      "identities",
      IDENTITY_OPTIONS.map((o) => o.id),
      (member) => member.identities,
    ),
    // Demo cards carry ONE discipline and ONE profession each (the live DTO
    // carries arrays); wrapping keeps both sides on the same tally.
    // Counted over the LISTED vocabulary only: this mock filtering is a
    // findable surface (the sidebar's own numbers), so an unlisted field
    // (`adultWork`) must never show a count, an option row or a tally bucket
    // here, same as it never shows a chip in `FilterProfessions.tsx`.
    disciplines: tally(
      "disciplines",
      DIRECTORY_DISCIPLINES.map((o) => o.id),
      (member) => [member.discipline],
    ),
    professions: tally(
      "professions",
      DIRECTORY_PROFESSIONS.map((o) => o.id),
      (member) => [member.profession],
    ),
    languages: tally(
      "languages",
      LANGUAGES.map((o) => o.label),
      (member) => member.languages,
    ),
    ambassador,
  };
}

export const LANGUAGES: ChipOption[] = [
  { label: "PT", active: true },
  { label: "EN", active: true },
  { label: "ES" },
  { label: "FR" },
  { label: "DE" },
];

// Now includes "games" (Task A6), the five business disciplines (Task
// BIZ-FE) and the JOBS-FE expansion's ten new listed disciplines. Drawn from
// `DIRECTORY_DISCIPLINES`, so a generated card with no `SLUG_FACETS` entry can
// only ever land on a listed field, the same findability rule as the
// sidebar's counts. `pick(DISCIPLINE_POOL, r)` below
// only ever decides a member's facet when that member has no `SLUG_FACETS`
// entry, and the demo tests (`memberDirectory.test.ts`) pin no discipline or
// profession for any such member, so widening this pool changes no
// test-visible value (re-verified for the JOBS-FE expansion: still no such
// pin exists).
const DISCIPLINE_POOL = DIRECTORY_DISCIPLINES.map(
  (discipline) => discipline.id,
);
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
    bio: "Runs a twelve-seat supper club in Mouraria. No menu, lots of fermentation.",
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
    bio: "Fullstack developer bringing useful, and sometimes silly, web ideas to life.",
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
      // Demo only. Live cards carry the real band off the wire; see
      // `cardDtoToMemberCard`.
      activityBand: demoBandForSlug(slug),
    });
  }
  return out;
}

/** The full generated directory — one card per real profile. The list shows a
 *  page of these at a time. */
export const MEMBERS: MemberCard[] = buildMembers();

// "Recently active" orders by the coarse activity band, which is a MONTH under
// the hood and three buckets on the wire (see activityBand.ts). It is a real
// server-side ordering in live mode and a band comparison in demo mode, so the
// key earns its place in this list. Members who opted out and members the
// platform has never observed carry no ordering value and land at the end.
// "Recently joined" is still the default.
export type SortKey =
  | "Recently joined"
  | "Recently active"
  | "Closest mutuals"
  | "A to Z"
  | "Most vouched";

export const SORTS: SortKey[] = [
  "Recently joined",
  "Recently active",
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
  "Recently active": "members:directory.sort.recentlyActive",
  "Closest mutuals": "members:directory.sort.closestMutuals",
  "A to Z": "members:directory.sort.aToZ",
  "Most vouched": "members:directory.sort.mostVouched",
};

/** Wire token per sort key for the live directory API's `?sort=`. Must match the
 *  backend `MemberSort` enum. Demo mode sorts in the browser (see `sortMembers`)
 *  and ignores this; live mode sends it and renders the server's order. */
export const SORT_PARAM: Record<SortKey, string> = {
  "Recently joined": "recentlyJoined",
  "Recently active": "recentlyActive",
  "Closest mutuals": "closestMutuals",
  "A to Z": "aToZ",
  "Most vouched": "mostVouched",
};

/** The chips shown applied at the top, with the control + value each maps to. */
export interface AppliedChip {
  label: string;
  group:
    | "openTo"
    | "hood"
    | "discipline"
    | "profession"
    | "language"
    | "identity"
    | "ambassador"
    | "ambassadorFocus";
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
  /** The "Ambassadors" switch. `ambassadorFocusAreas` is meaningless while
   *  this is off and is cleared alongside it (see `appliedChips` / the
   *  chip-removal in `MemberDirectorySections.tsx`). */
  isAmbassadorsOnly: boolean;
  ambassadorFocusAreas: AmbassadorFocusArea[];
}

export const DEFAULT_FILTERS: FilterState = {
  openTo: ["mentoring"],
  hoods: ["Anjos", "Mouraria"],
  disciplines: [],
  professions: [],
  identities: [],
  languages: ["PT", "EN"],
  isAmbassadorsOnly: false,
  ambassadorFocusAreas: [],
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
  isAmbassadorsOnly: false,
  ambassadorFocusAreas: [],
};

/** Drop any selected profession that no longer belongs to the selected fields,
 *  and drop any selected field or profession that is unlisted (see
 *  `UNLISTED_DISCIPLINE_IDS`); `FilterState` must never carry `adultWork` or
 *  one of its professions, whatever put it there. Keeps profession ⊆ field
 *  coherent after a field is removed. */
export function reconcileProfessions(f: FilterState): FilterState {
  const disciplines = f.disciplines.filter((id) => !isUnlistedDiscipline(id));
  const allowed = new Set(
    directoryProfessionsForFields(disciplines).map((option) => option.id),
  );
  const professions = f.professions.filter((p) => allowed.has(p));
  return disciplines.length === f.disciplines.length &&
    professions.length === f.professions.length
    ? f
    : { ...f, disciplines, professions };
}

/** Whether a member wears a staff badge in demo mode, by the same rule
 *  `MemberStaffBadge` renders by: an account tier or a badged grant. Staff
 *  wins over the Ambassador tag on the card (see `ambassadorRegistry.data.ts`),
 *  so a demo ambassador who is also staff must drop out of the ambassador
 *  filter and its counts too, or the directory shows a card with no Ambassador
 *  tag among "Showing N" ambassador results. */
function wearsStaffBadgeInDemo(slug: string): boolean {
  const identity = DEMO_STAFF[slug];
  return (
    staffBadgeRolesFor(identity?.tier, identity?.badgedStaffRoles).length > 0
  );
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
  if (f.isAmbassadorsOnly) {
    const ambassador = DEMO_AMBASSADORS[m.slug];
    if (!ambassador || wearsStaffBadgeInDemo(m.slug)) return false;
    if (
      f.ambassadorFocusAreas.length &&
      !f.ambassadorFocusAreas.includes(ambassador.focusArea)
    )
      return false;
  }
  return true;
}

/** Returns a new array sorted by the chosen key (non-mutating). */
export function sortMembers(list: MemberCard[], sort: SortKey): MemberCard[] {
  const out = [...list];
  switch (sort) {
    case "Recently joined":
      return out.sort((a, b) => a.joinedRank - b.joinedRank);
    case "Recently active":
      // Band order first, then the joined tiebreaker, so the many members who
      // share a band keep a stable order. Demo only: live mode renders the
      // server's page in the order it arrived.
      return out.sort(
        (a, b) =>
          compareActivityBands(a.activityBand, b.activityBand) ||
          a.joinedRank - b.joinedRank,
      );
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
  // Unlisted fields and professions (`adultWork` and its six professions) are
  // skipped rather than resolved, whatever put them in `FilterState`; the
  // directory must never render one as an applied chip, even a raw-id one.
  f.disciplines.forEach((value) => {
    if (isUnlistedDiscipline(value)) return;
    chips.push({
      label: DISCIPLINE_LABEL_KEY[value]
        ? t(DISCIPLINE_LABEL_KEY[value])
        : value,
      group: "discipline",
      value,
    });
  });
  f.professions.forEach((value) => {
    const field = FIELD_BY_PROFESSION[value];
    if (field && isUnlistedDiscipline(field)) return;
    chips.push({
      label: PROFESSION_LABEL_KEY[value]
        ? t(PROFESSION_LABEL_KEY[value])
        : value,
      group: "profession",
      value,
    });
  });
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
  // One "Ambassadors" chip for the switch, then one per selected focus area.
  // Removing the switch chip must clear the focus areas too (see
  // `removeChip` below), so the two stay chips of different groups rather
  // than one combined chip.
  if (f.isAmbassadorsOnly) {
    chips.push({
      label: t("members:directory.filters.ambassadors.chipLabel"),
      group: "ambassador",
      value: "ambassador",
    });
    f.ambassadorFocusAreas.forEach((value) =>
      chips.push({
        label: t(AMBASSADOR_FOCUS_LABEL_KEY[value]),
        group: "ambassadorFocus",
        value,
      }),
    );
  }
  return chips;
}

/** Remove one value from whichever filter group a chip belongs to. Used by
 *  the applied-chip row (`MemberDirectorySections.tsx`); colocated with
 *  `FilterState` rather than that component so a plain function export never
 *  trips the `react-refresh/only-export-components` lint on a `.tsx` file. */
export function removeChip(
  filters: FilterState,
  chip: AppliedChip,
): FilterState {
  const drop = (values: string[]) => values.filter((v) => v !== chip.value);
  switch (chip.group) {
    case "openTo":
      return { ...filters, openTo: drop(filters.openTo) };
    case "hood":
      return { ...filters, hoods: drop(filters.hoods) };
    case "discipline":
      return { ...filters, disciplines: drop(filters.disciplines) };
    case "profession":
      return { ...filters, professions: drop(filters.professions) };
    case "identity":
      return { ...filters, identities: drop(filters.identities) };
    case "language":
      return { ...filters, languages: drop(filters.languages) };
    // The switch chip carries both the switch and the focus selection: an
    // "Ambassadors" chip with focus areas still active but the switch off
    // would show a filter that no longer filters anything.
    case "ambassador":
      return { ...filters, isAmbassadorsOnly: false, ambassadorFocusAreas: [] };
    case "ambassadorFocus":
      return {
        ...filters,
        ambassadorFocusAreas: filters.ambassadorFocusAreas.filter(
          (v) => v !== chip.value,
        ),
      };
  }
}
