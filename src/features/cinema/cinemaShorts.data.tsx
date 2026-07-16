import type { ImageSlotTint } from "../../shared/components/ui/ImageSlot";

/** A member-made film in the "Made Here" community catalogue. */
export interface ShortFilm {
  id: string;
  titlePre: string;
  titleEm: string;
  titlePost?: string;
  maker: string;
  makerShort: string;
  initials: string;
  tint: ImageSlotTint;
  kind: "Documentary" | "Narrative" | "Essay";
  lang: string;
  subs: string[];
  ad: boolean;
  /** Content-note text, or null when there are none. */
  cn: string | null;
  place: string;
  moods: string[];
  runtime: number;
  year: number;
  watches: number;
  tips: number;
  tipsMonth: number;
  debut: boolean;
  grant: string | null;
  newWk: boolean;
}

/** Shared state threaded to every card so hearts + shares sync across shelves. */
export interface ShortsShelf {
  saved: string[];
  seen: string[];
  onToggleSave: (id: string) => void;
  onShare: (label: string) => void;
  notify: (message: string) => void;
}

export const shortFilms: ShortFilm[] = [
  {
    id: "first-sunday",
    titlePre: "The first ",
    titleEm: "Sunday",
    maker: "Inês Tavares & collective",
    makerShort: "Inês T.",
    initials: "IT",
    tint: "coral",
    kind: "Documentary",
    lang: "PT",
    subs: ["EN"],
    ad: true,
    cn: null,
    place: "Lisbon",
    moods: ["tender", "documentary"],
    runtime: 28,
    year: 2026,
    watches: 6100,
    tips: 94,
    tipsMonth: 94,
    debut: false,
    grant: "sustainer pool",
    newWk: false,
  },
  {
    id: "pharmacy-3am",
    titlePre: "The pharmacy at ",
    titleEm: "3am",
    maker: "Rui Almeida",
    makerShort: "Rui A.",
    initials: "RA",
    tint: "jade",
    kind: "Narrative",
    lang: "PT",
    subs: ["EN", "PT"],
    ad: true,
    cn: "drug use",
    place: "Lisbon",
    moods: ["tender", "dreamy"],
    runtime: 18,
    year: 2026,
    watches: 538,
    tips: 61,
    tipsMonth: 61,
    debut: false,
    grant: "€2k grant",
    newWk: true,
  },
  {
    id: "grandmother-say",
    titlePre: "What my grandmother ",
    titleEm: "did",
    titlePost: " say",
    maker: "Helena Pires",
    makerShort: "Helena P.",
    initials: "HP",
    tint: "plum",
    kind: "Documentary",
    lang: "PT",
    subs: ["EN"],
    ad: true,
    cn: "grief",
    place: "Porto",
    moods: ["tender", "grief"],
    runtime: 12,
    year: 2026,
    watches: 412,
    tips: 22,
    tipsMonth: 22,
    debut: true,
    grant: "spring grant",
    newWk: true,
  },
  {
    id: "bicha",
    titlePre: "Bicha, with ",
    titleEm: "love",
    maker: "Mateus Ferreira",
    makerShort: "Mateus F.",
    initials: "MF",
    tint: "coral",
    kind: "Essay",
    lang: "PT/BR",
    subs: ["EN"],
    ad: false,
    cn: null,
    place: "Lisbon",
    moods: ["funny", "joyful", "political"],
    runtime: 9,
    year: 2026,
    watches: 286,
    tips: 18,
    tipsMonth: 18,
    debut: true,
    grant: null,
    newWk: true,
  },
  {
    id: "noite-fado",
    titlePre: "Noite de ",
    titleEm: "fado",
    maker: "Maria Vaz",
    makerShort: "Maria V.",
    initials: "MV",
    tint: "jade",
    kind: "Narrative",
    lang: "PT",
    subs: ["EN"],
    ad: false,
    cn: null,
    place: "Lisbon",
    moods: ["tender", "dreamy"],
    runtime: 22,
    year: 2026,
    watches: 201,
    tips: 14,
    tipsMonth: 14,
    debut: false,
    grant: null,
    newWk: true,
  },
  {
    id: "antes-acordar",
    titlePre: "Antes de ",
    titleEm: "acordar",
    maker: "Ana Costa",
    makerShort: "Ana C.",
    initials: "AC",
    tint: "plum",
    kind: "Narrative",
    lang: "PT",
    subs: ["EN"],
    ad: true,
    cn: null,
    place: "Coimbra",
    moods: ["dreamy", "tender"],
    runtime: 14,
    year: 2025,
    watches: 1240,
    tips: 67,
    tipsMonth: 67,
    debut: false,
    grant: null,
    newWk: false,
  },
  {
    id: "piso-cristobal",
    titlePre: "El piso de ",
    titleEm: "Cristóbal",
    maker: "Sofía Castro",
    makerShort: "Sofía C.",
    initials: "SC",
    tint: "coral",
    kind: "Narrative",
    lang: "ES/PT",
    subs: ["EN", "PT"],
    ad: false,
    cn: null,
    place: "Madrid",
    moods: ["funny", "horny"],
    runtime: 33,
    year: 2025,
    watches: 980,
    tips: 44,
    tipsMonth: 44,
    debut: false,
    grant: null,
    newWk: false,
  },
  {
    id: "last-tasca",
    titlePre: "The last ",
    titleEm: "tasca",
    maker: "Inês Tavares",
    makerShort: "Inês T.",
    initials: "IT",
    tint: "coral",
    kind: "Documentary",
    lang: "PT",
    subs: ["EN"],
    ad: true,
    cn: "grief",
    place: "Lisbon",
    moods: ["tender", "documentary"],
    runtime: 26,
    year: 2024,
    watches: 903,
    tips: 31,
    tipsMonth: 8,
    debut: false,
    grant: null,
    newWk: false,
  },
  {
    id: "madrugada",
    titlePre: "",
    titleEm: "Madrugada",
    maker: "Beatriz Lima",
    makerShort: "Beatriz L.",
    initials: "BL",
    tint: "jade",
    kind: "Narrative",
    lang: "PT",
    subs: ["EN"],
    ad: false,
    cn: null,
    place: "Lisbon",
    moods: ["dreamy", "horny"],
    runtime: 19,
    year: 2025,
    watches: 511,
    tips: 19,
    tipsMonth: 6,
    debut: false,
    grant: null,
    newWk: false,
  },
  {
    id: "quarto-azul",
    titlePre: "O quarto ",
    titleEm: "azul",
    maker: "Miguel Antunes",
    makerShort: "Miguel A.",
    initials: "MA",
    tint: "plum",
    kind: "Narrative",
    lang: "PT",
    subs: ["EN"],
    ad: true,
    cn: null,
    place: "Faro",
    moods: ["tender"],
    runtime: 17,
    year: 2024,
    watches: 402,
    tips: 12,
    tipsMonth: 4,
    debut: false,
    grant: null,
    newWk: false,
  },
  {
    id: "beso-chueca",
    titlePre: "Un beso en ",
    titleEm: "Chueca",
    maker: "Pablo Díaz",
    makerShort: "Pablo D.",
    initials: "PD",
    tint: "coral",
    kind: "Narrative",
    lang: "ES",
    subs: ["EN", "PT"],
    ad: false,
    cn: null,
    place: "Madrid",
    moods: ["funny", "joyful", "horny"],
    runtime: 13,
    year: 2025,
    watches: 388,
    tips: 15,
    tipsMonth: 5,
    debut: false,
    grant: null,
    newWk: false,
  },
  {
    id: "salt-terrace",
    titlePre: "Salt on the ",
    titleEm: "terrace",
    maker: "Cláudia Matos",
    makerShort: "Cláudia M.",
    initials: "CM",
    tint: "jade",
    kind: "Essay",
    lang: "PT",
    subs: ["EN"],
    ad: true,
    cn: null,
    place: "Lisbon",
    moods: ["dreamy", "tender"],
    runtime: 15,
    year: 2026,
    watches: 320,
    tips: 11,
    tipsMonth: 11,
    debut: false,
    grant: null,
    newWk: false,
  },
  {
    id: "costa-depois",
    titlePre: "Costa ",
    titleEm: "depois",
    maker: "Nuno Fonseca",
    makerShort: "Nuno F.",
    initials: "NF",
    tint: "plum",
    kind: "Documentary",
    lang: "PT",
    subs: ["EN"],
    ad: false,
    cn: "illness, death",
    place: "Setúbal",
    moods: ["grief", "documentary"],
    runtime: 34,
    year: 2025,
    watches: 276,
    tips: 9,
    tipsMonth: 3,
    debut: false,
    grant: null,
    newWk: false,
  },
  {
    id: "boys-bloom",
    titlePre: "Boys who ",
    titleEm: "bloom",
    maker: "Tó Zé Rocha",
    makerShort: "Tó Zé R.",
    initials: "TR",
    tint: "coral",
    kind: "Essay",
    lang: "PT",
    subs: ["EN"],
    ad: true,
    cn: null,
    place: "Lisbon",
    moods: ["joyful", "political"],
    runtime: 8,
    year: 2026,
    watches: 244,
    tips: 14,
    tipsMonth: 14,
    debut: true,
    grant: "€2k grant",
    newWk: false,
  },
  {
    id: "amar-codigo",
    titlePre: "Amar em ",
    titleEm: "código",
    maker: "Diana Sousa",
    makerShort: "Diana S.",
    initials: "DS",
    tint: "jade",
    kind: "Essay",
    lang: "PT/BR",
    subs: ["EN"],
    ad: false,
    cn: null,
    place: "Braga",
    moods: ["dreamy", "funny"],
    runtime: 11,
    year: 2026,
    watches: 190,
    tips: 7,
    tipsMonth: 7,
    debut: true,
    grant: null,
    newWk: false,
  },
  {
    id: "verao-99",
    titlePre: "Verão de ",
    titleEm: "99",
    maker: "Sara Melo",
    makerShort: "Sara M.",
    initials: "SM",
    tint: "plum",
    kind: "Narrative",
    lang: "PT",
    subs: ["EN"],
    ad: true,
    cn: null,
    place: "Aveiro",
    moods: ["tender", "dreamy"],
    runtime: 16,
    year: 2023,
    watches: 298,
    tips: 6,
    tipsMonth: 2,
    debut: false,
    grant: null,
    newWk: false,
  },
  {
    id: "domingo-tarde",
    titlePre: "Domingo à ",
    titleEm: "tarde",
    maker: "Rita Carvalho",
    makerShort: "Rita C.",
    initials: "RC",
    tint: "coral",
    kind: "Narrative",
    lang: "PT",
    subs: ["EN"],
    ad: false,
    cn: null,
    place: "Lisbon",
    moods: ["tender", "funny"],
    runtime: 21,
    year: 2025,
    watches: 233,
    tips: 8,
    tipsMonth: 3,
    debut: false,
    grant: null,
    newWk: false,
  },
  {
    id: "nao-fase",
    titlePre: "Não é uma ",
    titleEm: "fase",
    maker: "Pedro Vicente",
    makerShort: "Pedro V.",
    initials: "PV",
    tint: "jade",
    kind: "Documentary",
    lang: "PT",
    subs: ["EN"],
    ad: true,
    cn: "transphobia",
    place: "Lisbon",
    moods: ["angry", "political", "documentary"],
    runtime: 24,
    year: 2026,
    watches: 167,
    tips: 9,
    tipsMonth: 9,
    debut: false,
    grant: "€2k grant",
    newWk: false,
  },
  {
    id: "carta-mandei",
    titlePre: "A carta que não ",
    titleEm: "mandei",
    maker: "Hugo Barros",
    makerShort: "Hugo B.",
    initials: "HB",
    tint: "plum",
    kind: "Essay",
    lang: "PT",
    subs: ["EN"],
    ad: false,
    cn: null,
    place: "Porto",
    moods: ["grief", "tender"],
    runtime: 9,
    year: 2025,
    watches: 145,
    tips: 5,
    tipsMonth: 2,
    debut: true,
    grant: null,
    newWk: false,
  },
  {
    id: "ruido-branco",
    titlePre: "Ruído ",
    titleEm: "branco",
    maker: "Tomás Neves",
    makerShort: "Tomás N.",
    initials: "TN",
    tint: "coral",
    kind: "Essay",
    lang: "PT",
    subs: ["EN"],
    ad: true,
    cn: "anxiety",
    place: "Lisbon",
    moods: ["angry", "dreamy"],
    runtime: 7,
    year: 2026,
    watches: 132,
    tips: 6,
    tipsMonth: 6,
    debut: true,
    grant: null,
    newWk: false,
  },
  {
    id: "festa-acaba",
    titlePre: "A festa não ",
    titleEm: "acaba",
    maker: "Leonor Dias",
    makerShort: "Leonor D.",
    initials: "LD",
    tint: "jade",
    kind: "Narrative",
    lang: "PT",
    subs: ["EN"],
    ad: false,
    cn: null,
    place: "Lisbon",
    moods: ["joyful", "horny", "funny"],
    runtime: 29,
    year: 2025,
    watches: 604,
    tips: 22,
    tipsMonth: 7,
    debut: false,
    grant: null,
    newWk: false,
  },
  {
    id: "mar-dentro",
    titlePre: "O mar cá ",
    titleEm: "dentro",
    maker: "Vera Pinto",
    makerShort: "Vera P.",
    initials: "VP",
    tint: "plum",
    kind: "Documentary",
    lang: "PT",
    subs: ["EN"],
    ad: true,
    cn: null,
    place: "Açores",
    moods: ["tender", "documentary"],
    runtime: 31,
    year: 2024,
    watches: 421,
    tips: 13,
    tipsMonth: 3,
    debut: false,
    grant: null,
    newWk: false,
  },
];

const byId = new Map(shortFilms.map((f) => [f.id, f]));
export const getShort = (id: string) => byId.get(id);

/** Header stat tiles. */
export const headerStats = [
  { k: "Films", v: "34", note: "Submitted by members" },
  { k: "Watches", v: "86k", note: "This year" },
  { k: "Paid to makers", v: "€18k", note: "Via grants + tips" },
  { k: "Open grant", v: "€2.5k", note: "Closes 21 June" },
];

/** Seeded "watched" ids so the seen-state styling has something to show. */
export const seededSeen = ["antes-acordar", "beso-chueca", "verao-99"];

/** Continue-watching progress, keyed by film id (percent complete). */
export const continueWatching: { id: string; pct: number }[] = [
  { id: "piso-cristobal", pct: 41 },
  { id: "last-tasca", pct: 68 },
];

export const programmes = [
  {
    id: "first-loves",
    count: "6 films · 74 min",
    titlePre: "First loves, ",
    titleEm: "badly lit",
    curator: "Curated by Inês Tavares",
    tint: "coral" as ImageSlotTint,
  },
  {
    id: "trans-joy",
    count: "5 films · 61 min",
    titlePre: "Trans joy, ",
    titleEm: "on purpose",
    curator: "Curated by the Thursday collective",
    tint: "jade" as ImageSlotTint,
  },
  {
    id: "our-elders",
    count: "7 films · 96 min",
    titlePre: "Our elders, ",
    titleEm: "speaking",
    curator: "Curated by Rui A.",
    tint: "plum" as ImageSlotTint,
  },
];

export const makers = [
  {
    initials: "IT",
    tint: "coral" as ImageSlotTint,
    name: "Inês Tavares",
    role: "documentary · Lisbon",
    stat: "3 films · 6.9k watches",
  },
  {
    initials: "RA",
    tint: "jade" as ImageSlotTint,
    name: "Rui Almeida",
    role: "narrative · Lisbon",
    stat: "funded twice this year",
  },
  {
    initials: "LD",
    tint: "plum" as ImageSlotTint,
    name: "Leonor Dias",
    role: "narrative · Lisbon",
    stat: "604 watches this month",
  },
  {
    initials: "SC",
    tint: "coral" as ImageSlotTint,
    name: "Sofía Castro",
    role: "narrative · Madrid",
    stat: "crossed the border to us",
  },
  {
    initials: "TR",
    tint: "jade" as ImageSlotTint,
    name: "Tó Zé Rocha",
    role: "essayist · debut",
    stat: "grant-funded first film",
  },
];

export interface WatchParty {
  d: string;
  dm: string;
  time: string;
  next?: boolean;
  titlePre: string;
  titleEm: string;
  titlePost?: string;
  sub: string;
  going: number;
}

export const watchParties: WatchParty[] = [
  {
    d: "10",
    dm: "Thu",
    time: "Jul · 21:00",
    next: true,
    titlePre: "Trans joy, ",
    titleEm: "on purpose",
    titlePost: " — the full set",
    sub: "5 films back to back · live Q&A with the Thursday collective · captioned live",
    going: 38,
  },
  {
    d: "16",
    dm: "Wed",
    time: "Jul · 20:00",
    titlePre: "Docs night: ",
    titleEm: "The last tasca",
    titlePost: " + Costa depois",
    sub: "Two documentaries on disappearing places · hosted by Inês Tavares",
    going: 21,
  },
  {
    d: "24",
    dm: "Thu",
    time: "Jul · 21:00",
    titlePre: "Everything under ",
    titleEm: "ten minutes",
    sub: "A fast programme of shorts · bring a drink · no commitment",
    going: 14,
  },
  {
    d: "02",
    dm: "Sat",
    time: "Aug · 19:00",
    titlePre: "First loves, ",
    titleEm: "badly lit",
    titlePost: " — with drinks after",
    sub: "In-person at Casa do Comum, Lisbon · also streamed · limited seats",
    going: 9,
  },
];

export interface VoteOption {
  id: string;
  pct: number;
  titlePre: string;
  titleEm: string;
  desc: string;
}

export const voteOptions: VoteOption[] = [
  {
    id: "horny-summer",
    pct: 52,
    titlePre: "Horny ",
    titleEm: "summer",
    desc: "Desire, heat, and terrible decisions — unapologetically.",
  },
  {
    id: "grief-gently",
    pct: 28,
    titlePre: "Grief, ",
    titleEm: "gently",
    desc: "Films that sit with loss without rushing you through it.",
  },
  {
    id: "first-jobs",
    pct: 20,
    titlePre: "First jobs, first ",
    titleEm: "closets",
    desc: "Being young, broke, and figuring it out in public.",
  },
];

export const transparencyNums = [
  { v: "€2,340", k: "paid to filmmakers" },
  { v: "214", k: "tips sent by members" },
  { v: "100%", k: "reached the makers" },
];

export interface ShortFilter {
  key: string;
  cat: "Runtime" | "Type" | "Access" | "More";
  /**
   * i18n Pattern A / label-key indirection: `key` is the canonical id
   * matched/stored in `CatalogState.active` (URL-shareable filter state, per
   * docs/i18n/extraction-brief.md — a language switch must not corrupt it).
   * Only `labelKey` (the rendered chip text) resolves via `t()`.
   */
  labelKey: string;
  jade?: boolean;
  test: (f: ShortFilm, saved: string[]) => boolean;
}

export const shortFilters: ShortFilter[] = [
  {
    key: "rt-u10",
    cat: "Runtime",
    labelKey: "cinema:shorts.filter.rtU10",
    test: (f) => f.runtime < 10,
  },
  {
    key: "rt-1030",
    cat: "Runtime",
    labelKey: "cinema:shorts.filter.rt1030",
    test: (f) => f.runtime >= 10 && f.runtime < 30,
  },
  {
    key: "rt-30",
    cat: "Runtime",
    labelKey: "cinema:shorts.filter.rt30",
    test: (f) => f.runtime >= 30,
  },
  {
    key: "k-doc",
    cat: "Type",
    labelKey: "cinema:shorts.filter.kDoc",
    test: (f) => f.kind === "Documentary",
  },
  {
    key: "k-nar",
    cat: "Type",
    labelKey: "cinema:shorts.filter.kNar",
    test: (f) => f.kind === "Narrative",
  },
  {
    key: "k-ess",
    cat: "Type",
    labelKey: "cinema:shorts.filter.kEss",
    test: (f) => f.kind === "Essay",
  },
  {
    key: "a-ad",
    cat: "Access",
    labelKey: "cinema:shorts.filter.aAd",
    jade: true,
    test: (f) => f.ad,
  },
  {
    key: "a-cnf",
    cat: "Access",
    labelKey: "cinema:shorts.filter.aCnf",
    jade: true,
    test: (f) => !f.cn,
  },
  {
    key: "m-grant",
    cat: "More",
    labelKey: "cinema:shorts.filter.mGrant",
    jade: true,
    test: (f) => !!f.grant,
  },
  {
    key: "m-lisbon",
    cat: "More",
    labelKey: "cinema:shorts.filter.mLisbon",
    jade: true,
    test: (f) => f.place === "Lisbon",
  },
  {
    key: "m-saved",
    cat: "More",
    labelKey: "cinema:shorts.filter.mSaved",
    jade: true,
    test: (f, saved) => saved.includes(f.id),
  },
];

export const filterCatOrder: ShortFilter["cat"][] = [
  "Runtime",
  "Type",
  "Access",
  "More",
];

/** Chrome label for each filter-chip group header. */
export const FILTER_CAT_LABEL_KEYS: Record<ShortFilter["cat"], string> = {
  Runtime: "cinema:shorts.filterCat.runtime",
  Type: "cinema:shorts.filterCat.type",
  Access: "cinema:shorts.filterCat.access",
  More: "cinema:shorts.filterCat.more",
};

export const langOptions = [
  { value: "", labelKey: "cinema:shorts.lang.any" },
  { value: "pt", labelKey: "cinema:shorts.lang.pt" },
  { value: "es", labelKey: "cinema:shorts.lang.es" },
  { value: "ptbr", labelKey: "cinema:shorts.lang.ptbr" },
  { value: "en", labelKey: "cinema:shorts.lang.en" },
];

/**
 * Canonical `value` is the stable stored/matched sort id (see
 * `CatalogState.sort` + `sortShorts` below); `labelKey` is the only piece
 * that resolves via `t()`.
 */
export const sortOptions = [
  { value: "newest", labelKey: "cinema:shorts.sort.newest" },
  { value: "mostWatched", labelKey: "cinema:shorts.sort.mostWatched" },
  { value: "mostTipped", labelKey: "cinema:shorts.sort.mostTipped" },
  { value: "shortest", labelKey: "cinema:shorts.sort.shortest" },
  { value: "staffPicks", labelKey: "cinema:shorts.sort.staffPicks" },
];

/** Formats a raw watch count like the design's fmtWatch. */
export function fmtWatch(n: number): string {
  if (n < 1000) return String(n);
  const val = (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".0", "");
  return `${val}k`;
}

export const filterByKey = new Map(shortFilters.map((f) => [f.key, f]));

export interface CatalogState {
  active: string[];
  lang: string;
  query: string;
  sort: string;
}

function matchLang(f: ShortFilm, lang: string): boolean {
  switch (lang) {
    case "pt":
      return f.lang.includes("PT");
    case "es":
      return f.lang.includes("ES");
    case "ptbr":
      return f.lang === "PT/BR";
    case "en":
      return f.subs.includes("EN");
    default:
      return true;
  }
}

function sortShorts(list: ShortFilm[], sort: string): ShortFilm[] {
  const l = [...list];
  switch (sort) {
    case "shortest":
      return l.sort((a, b) => a.runtime - b.runtime);
    case "mostWatched":
      return l.sort((a, b) => b.watches - a.watches);
    case "mostTipped":
      return l.sort((a, b) => b.tips - a.tips);
    case "staffPicks":
      return l.sort(
        (a, b) => (b.grant ? 1 : 0) - (a.grant ? 1 : 0) || b.tips - a.tips,
      );
    default:
      return l.sort((a, b) => b.year - a.year || b.watches - a.watches);
  }
}

/**
 * Filters + sorts the catalogue. Active filters OR within a category and AND
 * across categories, matching the design's grouping behaviour.
 */
export function filterAndSortShorts(
  state: CatalogState,
  saved: string[],
): ShortFilm[] {
  const q = state.query.trim().toLowerCase();
  const groups = new Map<string, ShortFilter[]>();
  state.active.forEach((key) => {
    const x = filterByKey.get(key);
    if (x) groups.set(x.cat, [...(groups.get(x.cat) ?? []), x]);
  });

  const filtered = shortFilms.filter((f) => {
    for (const group of groups.values()) {
      if (!group.some((x) => x.test(f, saved))) return false;
    }
    if (!matchLang(f, state.lang)) return false;
    if (q) {
      const hay =
        `${f.titlePre}${f.titleEm}${f.titlePost ?? ""} ${f.maker} ${f.moods.join(" ")} ${f.kind}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return sortShorts(filtered, state.sort);
}
