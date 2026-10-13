import type { TFunction, TranslateOptions } from "../../shared/i18n/types";

export type Tint = "coral" | "jade" | "plum" | "default";

/** A `studioShowcase` catalog key plus its interpolation values. */
export interface KeyedText {
  key: string;
  values?: TranslateOptions;
}

/**
 * Text that is either literal (proper nouns only, or a note the curator
 * typed in the UI) or a catalog key resolved at render.
 */
export type LocalText = string | KeyedText;

/** Resolves a `LocalText` for display in the active language. */
export function resolveText(text: LocalText, t: TFunction): string {
  return typeof text === "string" ? text : t(text.key, text.values);
}

/** The headline cover artist of the week. */
export interface Cover {
  image: string;
  tint: Tint;
  titlePre: string;
  titleEm: string;
  by: KeyedText;
  /** Catalog key; the value carries an `<em>` run. */
  noteKey: string;
}

/** A single placed in the week's slate. Note is editable in the UI. */
export interface Single {
  id: string;
  image: string;
  tint: Tint;
  titlePre: string;
  titleEm: string;
  who: LocalText;
  note: LocalText;
}

/** A curated collection rotating this week. */
export interface Collection {
  id: string;
  titlePre: string;
  titleEm: string;
  meta: KeyedText;
  badge: KeyedText;
  badgeTone: "in" | "out" | "flat";
}

/** A live broadcast scheduled this week. */
export interface Broadcast {
  id: string;
  day: string;
  weekdayKey: string;
  /** Catalog key for a chrome label shown before the title. */
  leadKey?: string;
  titlePre: string;
  titleEm: string;
  meta: KeyedText;
  time: string;
}

/** An inbox submission awaiting triage into the slate. */
export interface Submission {
  id: string;
  image: string;
  tint: Tint;
  titlePre: string;
  titleEm: string;
  who: LocalText;
  quoteKey: string;
}

export const COVER: Cover = {
  image:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop",
  tint: "coral",
  titlePre: "Cidade dos ",
  titleEm: "santos",
  by: {
    key: "studioShowcase:program.cover.by",
    values: { artist: "Mariana Sol", city: "Sintra", count: 11 },
  },
  noteKey: "studioShowcase:program.cover.note",
};

export const SINGLES: Single[] = [
  {
    id: "s1",
    image:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=400&auto=format&fit=crop",
    tint: "jade",
    titlePre: "The kitchen in ",
    titleEm: "April",
    who: "Rita Ferreira · Évora · 2026",
    note: { key: "studioShowcase:program.singles.note.kitchenInApril" },
  },
  {
    id: "s2",
    image:
      "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?q=80&w=400&auto=format&fit=crop",
    tint: "coral",
    titlePre: "Bicha, with ",
    titleEm: "love",
    who: "Mateus F. & DJ Carrasco",
    note: { key: "studioShowcase:program.singles.note.bichaWithLove" },
  },
  {
    id: "s3",
    image:
      "https://images.unsplash.com/photo-1508025690966-2a9a1957da31?q=80&w=400&auto=format&fit=crop",
    tint: "plum",
    titlePre: "Cantiga para a ",
    titleEm: "vizinha",
    who: {
      key: "studioShowcase:program.singles.who.lisbon",
      values: { artist: "Coro de Outubro" },
    },
    note: { key: "studioShowcase:program.singles.note.cantigaParaAVizinha" },
  },
  {
    id: "s4",
    image:
      "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=400&auto=format&fit=crop",
    tint: "jade",
    titlePre: "Pedro on the ",
    titleEm: "25",
    who: {
      key: "studioShowcase:program.singles.who.lisbon",
      values: { artist: "Pedro Limão" },
    },
    note: { key: "studioShowcase:program.singles.note.pedroOnThe25" },
  },
  {
    id: "s5",
    image:
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop",
    tint: "coral",
    titlePre: "Salt water, ",
    titleEm: "slowly",
    who: "Akin Diallo · Dakar / Paris",
    note: { key: "studioShowcase:program.singles.note.saltWaterSlowly" },
  },
  {
    id: "s6",
    image:
      "https://images.unsplash.com/photo-1499415479124-43c32433a620?q=80&w=400&auto=format&fit=crop",
    tint: "plum",
    titlePre: "If you have to ",
    titleEm: "ask",
    who: {
      key: "studioShowcase:program.singles.who.lisbon",
      values: { artist: "Yara Reis" },
    },
    note: { key: "studioShowcase:program.singles.note.ifYouHaveToAsk" },
  },
  {
    id: "s7",
    image:
      "https://images.unsplash.com/photo-1454922915609-78549ad709bb?q=80&w=400&auto=format&fit=crop",
    tint: "jade",
    titlePre: "Mother, ",
    titleEm: "weather",
    who: "Yuki Tanaka · Hokkaido",
    note: "",
  },
  {
    id: "s8",
    image:
      "https://images.unsplash.com/photo-1445985543470-41fba5c3144a?q=80&w=400&auto=format&fit=crop",
    tint: "coral",
    titlePre: "Carnation, ",
    titleEm: "still",
    who: "Sofía Castro · Porto",
    note: { key: "studioShowcase:program.singles.note.carnationStill" },
  },
];

export const COLLECTIONS: Collection[] = [
  {
    id: "c1",
    titlePre: "Songs to play your ",
    titleEm: "mother",
    meta: {
      key: "studioShowcase:program.collections.meta.curatedBy",
      values: { curator: "Sara Marques", count: 14 },
    },
    badge: {
      key: "studioShowcase:program.collections.badge.inOut",
      values: { added: 3, removed: 1 },
    },
    badgeTone: "in",
  },
  {
    id: "c2",
    titlePre: "Lisbon dyke-bar ",
    titleEm: "standards",
    meta: {
      key: "studioShowcase:program.collections.meta.by",
      values: { curator: "Yara Reis", count: 28 },
    },
    badge: { key: "studioShowcase:program.collections.badge.noChange" },
    badgeTone: "flat",
  },
  {
    id: "c3",
    titlePre: "Trans choral, ",
    titleEm: "worldwide",
    meta: {
      key: "studioShowcase:program.collections.meta.byWithNew",
      values: {
        curator: "D. Okoye",
        count: 22,
        newCount: 2,
        source: "Tokyo Trans Choir",
      },
    },
    badge: {
      key: "studioShowcase:program.collections.badge.in",
      values: { added: 2 },
    },
    badgeTone: "in",
  },
];

export const BROADCASTS: Broadcast[] = [
  {
    id: "b1",
    day: "10",
    weekdayKey: "studioShowcase:program.broadcasts.weekday.wed",
    titlePre: "Vespertina ",
    titleEm: "vol. iv",
    meta: {
      key: "studioShowcase:program.broadcasts.meta.wednesdaySet",
      values: { host: "Sara Marques", duration: "1h 42m" },
    },
    time: "21:00 LIS",
  },
  {
    id: "b2",
    day: "11",
    weekdayKey: "studioShowcase:program.broadcasts.weekday.thu",
    leadKey: "studioShowcase:program.broadcasts.premiereLead",
    titlePre: "",
    titleEm: "Cidade dos santos",
    meta: {
      key: "studioShowcase:program.broadcasts.meta.premiere",
      values: { host: "Mariana Sol", count: 11 },
    },
    time: "21:00 LIS",
  },
];

export const INBOX: Submission[] = [
  {
    id: "i1",
    image:
      "https://images.unsplash.com/photo-1642444525640-d3eb287ed389?q=80&w=400&auto=format&fit=crop",
    tint: "coral",
    titlePre: "The piano ",
    titleEm: "I waited for",
    who: {
      key: "studioShowcase:program.inbox.who.firstSubmission",
      values: { name: "Renato V.", city: "Porto" },
    },
    quoteKey: "studioShowcase:program.inbox.quote.pianoIWaitedFor",
  },
  {
    id: "i2",
    image:
      "https://images.unsplash.com/photo-1732719674511-e94d37e7d1c5?q=80&w=400&auto=format&fit=crop",
    tint: "plum",
    titlePre: "Coro de ",
    titleEm: "Porto",
    who: {
      key: "studioShowcase:program.inbox.who.choir",
      values: { city: "Porto" },
    },
    quoteKey: "studioShowcase:program.inbox.quote.coroDePorto",
  },
  {
    id: "i3",
    image:
      "https://images.unsplash.com/photo-1736882178500-f99bbe22d77d?q=80&w=400&auto=format&fit=crop",
    tint: "jade",
    titlePre: "Tomboy · ",
    titleEm: "Outubro",
    who: {
      key: "studioShowcase:program.inbox.who.djSecondSubmission",
      values: { city: "São Paulo" },
    },
    quoteKey: "studioShowcase:program.inbox.quote.tomboyOutubro",
  },
  {
    id: "i4",
    image:
      "https://images.unsplash.com/photo-1740508905511-bccff9d04f7d?q=80&w=400&auto=format&fit=crop",
    tint: "coral",
    titlePre: "Ainda",
    titleEm: "",
    who: {
      key: "studioShowcase:program.inbox.who.firstSingle",
      values: { name: "Helena P.", city: "Aveiro" },
    },
    quoteKey: "studioShowcase:program.inbox.quote.ainda",
  },
  {
    id: "i5",
    image:
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=400&auto=format&fit=crop",
    tint: "jade",
    titlePre: "House for the ",
    titleEm: "still",
    who: "Akim N. · Berlin / Luanda",
    quoteKey: "studioShowcase:program.inbox.quote.houseForTheStill",
  },
  {
    id: "i6",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=400&auto=format&fit=crop",
    tint: "plum",
    titlePre: "Tia, ",
    titleEm: "obrigada",
    who: {
      key: "studioShowcase:program.inbox.who.trackOfAlbum",
      values: { name: "Júlia B.", city: "Salvador", position: 1, total: 8 },
    },
    quoteKey: "studioShowcase:program.inbox.quote.tiaObrigada",
  },
];
