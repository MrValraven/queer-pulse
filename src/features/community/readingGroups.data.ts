export type Genre = "fiction" | "nonfiction" | "theory" | "poetry" | "memoir";

/** How a group meets. `either` is a real answer the "start your own group"
 *  form offers, and a live group carries it through rather than being
 *  flattened onto one side; both format filters match it. */
export type Format = "irl" | "online" | "either";

/**
 * One card in the reading-group directory.
 *
 * DEMO groups come from the curated `GROUPS` set below and fill every field.
 * LIVE groups are communities tagged `book-club` (see
 * `readingGroups.adapters.ts`) and legitimately know less: the proposal form
 * asks for a book, a reason, a format and a headcount, and never asks for a
 * genre, a meeting place, a cadence or a language. Those fields are nullable
 * for exactly that reason, and every surface omits a null one rather than
 * printing a plausible-looking default.
 */
export interface Group {
  id: string;
  genre: Genre | null;
  format: Format;
  book: string;
  author: string | null;
  spine: string;
  spineColor: string;
  name: string | null;
  description: string | null;
  where: string | null;
  frequency: string | null;
  /** Seats still open. Null on a live group: a community counts the members it
   *  has, and inventing spare chairs from a headcount nobody has re-confirmed
   *  would be a number the card cannot stand behind. */
  spots: number | null;
  language: string | null;
  /** LIVE only: the community this group IS. Present means the card links to a
   *  real page and its join affordance reaches a real owner. */
  communitySlug?: string;
  /** LIVE only: how many members the group's community has. */
  memberCount?: number;
  /** LIVE only: true when the viewer is already on the group's roster, so the
   *  card offers the way in rather than the way to ask. */
  isJoined?: boolean;
}

/**
 * Spine colours a LIVE group's book gets, picked deterministically from its
 * slug so a group keeps the same spine on every visit and across devices. The
 * curated demo groups carry their own hand-picked colour instead.
 */
export const SPINE_COLORS = [
  "var(--plum)",
  "var(--jade)",
  "var(--accent-ink)",
  "var(--violet)",
  "var(--amber)",
] as const satisfies readonly [string, ...string[]];

export const GROUPS: Group[] = [
  {
    id: "g1",
    genre: "fiction",
    format: "irl",
    book: "Giovanni's Room",
    author: "James Baldwin",
    spine: "G",
    spineColor: "var(--plum)",
    name: "Bairro Alto Fiction",
    description:
      "Monthly fiction group that started two years ago with Mrs Dalloway and has not looked back. Argumentative, warm, and always overruns by an hour.",
    where: "Príncipe Real café (rotates)",
    frequency: "Monthly · last Sunday",
    spots: 2,
    language: "EN / PT",
  },
  {
    id: "g2",
    genre: "theory",
    format: "irl",
    book: "Gender Trouble",
    author: "Judith Butler",
    spine: "G",
    spineColor: "var(--jade)",
    name: "Theory Thursdays",
    description:
      "We read slowly. We argue in footnotes. Everyone is welcome regardless of academic background: this is the opposite of a seminar.",
    where: "Someone's kitchen in Mouraria",
    frequency: "Every 3 weeks · Thursday evening",
    spots: 1,
    language: "EN",
  },
  {
    id: "g3",
    genre: "memoir",
    format: "online",
    book: "The Argonauts",
    author: "Maggie Nelson",
    spine: "A",
    spineColor: "var(--accent-ink)",
    name: "Memoir & Essay Online",
    description:
      "Online group, no time zone requirement. We read memoirs and essays about queer life. Written discussion on Fridays, optional voice call on Sundays.",
    where: "Online (Discord)",
    frequency: "Monthly",
    spots: 4,
    language: "EN",
  },
  {
    id: "g4",
    genre: "fiction",
    format: "irl",
    book: "A Little Life",
    author: "Hanya Yanagihara",
    spine: "L",
    spineColor: "var(--violet)",
    name: "Long Reads Lisbon",
    description:
      "For people who want to read the big, difficult books together. Emotional support provided. Content warnings posted in advance.",
    where: "Intendente, rotating hosts",
    frequency: "6-weekly",
    spots: 0,
    language: "EN / PT",
  },
  {
    id: "g5",
    genre: "nonfiction",
    format: "irl",
    book: "Pleasure Activism",
    author: "adrienne maree brown",
    spine: "P",
    spineColor: "var(--amber)",
    name: "Politics & Practice",
    description:
      "Queer politics, activism, and community organising: read together and discussed in the context of Lisbon. Bilingual by default.",
    where: "Casa Qui, Mouraria",
    frequency: "Monthly · first Saturday",
    spots: 3,
    language: "PT / EN",
  },
  {
    id: "g6",
    genre: "poetry",
    format: "online",
    book: "Citizen: An American Lyric",
    author: "Claudia Rankine",
    spine: "C",
    spineColor: "var(--jade)",
    name: "Poetry Reading (Online)",
    description:
      "We read one collection per month and meet online to discuss. Sometimes we read aloud. Sometimes we just send each other the lines that wrecked us.",
    where: "Online (Zoom)",
    frequency: "Monthly",
    spots: 5,
    language: "EN",
  },
  {
    id: "g7",
    genre: "fiction",
    format: "irl",
    book: "Orlando",
    author: "Virginia Woolf",
    spine: "O",
    spineColor: "var(--accent-ink)",
    name: "Queer Classics",
    description:
      "We reread the canon with queer eyes. Slow paced, generously hosted, always food. Portuguese-language members welcome. Some meetings run bilingual.",
    where: "Alfama (host's home)",
    frequency: "6-weekly · Saturday afternoon",
    spots: 2,
    language: "EN / PT",
  },
  {
    id: "g8",
    genre: "nonfiction",
    format: "irl",
    book: "Mutual Aid",
    author: "Dean Spade",
    spine: "M",
    spineColor: "var(--plum)",
    name: "Solidarity Reads",
    description:
      "Books about care, mutual aid, and community organising. Practical bias: we end every session with one thing we are going to do differently.",
    where: "LX Factory area",
    frequency: "Monthly · Wednesday evening",
    spots: 3,
    language: "EN",
  },
];

export const GENRE_BG: Record<Genre, string> = {
  fiction: "rgba(var(--plum-rgb), .07)",
  nonfiction: "rgba(var(--jade-rgb), .1)",
  theory: "rgba(var(--accent-rgb), .09)",
  poetry: "rgba(var(--jade-rgb), .08)",
  memoir: "rgba(var(--plum-rgb), .06)",
};
export const GENRE_FG: Record<Genre, string> = {
  fiction: "var(--plum)",
  nonfiction: "var(--jade)",
  theory: "var(--accent-ink)",
  poetry: "var(--jade)",
  memoir: "var(--ink-60)",
};

export const GENRE_FILTERS: { id: Genre | "all"; labelKey: string }[] = [
  { id: "all", labelKey: "readingGroups.genre.all" },
  { id: "fiction", labelKey: "readingGroups.genre.fiction" },
  { id: "nonfiction", labelKey: "readingGroups.genre.nonfiction" },
  { id: "theory", labelKey: "readingGroups.genre.theory" },
  { id: "poetry", labelKey: "readingGroups.genre.poetry" },
  { id: "memoir", labelKey: "readingGroups.genre.memoir" },
];
export const FORMAT_FILTERS: { id: Format | "all"; labelKey: string }[] = [
  { id: "all", labelKey: "readingGroups.format.filter.any" },
  { id: "irl", labelKey: "readingGroups.format.filter.irl" },
  { id: "online", labelKey: "readingGroups.format.filter.online" },
];

/** `Genre` doubles as the filter-comparison value — never translated. Its
 *  display chip resolves via `t(`community:readingGroups.genre.${genre}`)`. */
export const GENRE_LABEL_KEY: Record<Genre, string> = {
  fiction: "readingGroups.genre.fiction",
  nonfiction: "readingGroups.genre.nonfiction",
  theory: "readingGroups.genre.theory",
  poetry: "readingGroups.genre.poetry",
  memoir: "readingGroups.genre.memoir",
};
