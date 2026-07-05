import type { ReactNode } from "react";

export type Tint = "coral" | "jade" | "plum" | "default";

/** The headline cover artist of the week. */
export interface Cover {
  image: string;
  tint: Tint;
  titlePre: string;
  titleEm: string;
  by: string;
  note: ReactNode;
}

/** A single placed in the week's slate. Note is editable in the UI. */
export interface Single {
  id: string;
  image: string;
  tint: Tint;
  titlePre: string;
  titleEm: string;
  who: string;
  note: string;
}

/** A curated collection rotating this week. */
export interface Collection {
  id: string;
  titlePre: string;
  titleEm: string;
  meta: string;
  badge: string;
  badgeTone: "in" | "out" | "flat";
}

/** A live broadcast scheduled this week. */
export interface Broadcast {
  id: string;
  day: string;
  weekday: string;
  titlePre: string;
  titleEm: string;
  meta: string;
  time: string;
}

/** An inbox submission awaiting triage into the slate. */
export interface Submission {
  id: string;
  image: string;
  tint: Tint;
  titlePre: string;
  titleEm: string;
  who: string;
  quote: string;
}

export const COVER: Cover = {
  image:
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=800&auto=format&fit=crop",
  tint: "coral",
  titlePre: "Cidade dos ",
  titleEm: "santos",
  by: "Mariana Sol · Sintra · debut album · 11 tracks · premiere Wed 10 Jun",
  note: (
    <>
      <em>Stay through the second verse of track six.</em> A Beja-born
      songwriter on her own terms, finally. Eleven tracks of fado-pop, addressed
      plainly to a saint who isn't listening. The Wednesday set will end with
      the album closer.
    </>
  ),
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
    note: "A patient piano ballad about coming home to a mother who left the radio on.",
  },
  {
    id: "s2",
    image:
      "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?q=80&w=400&auto=format&fit=crop",
    tint: "coral",
    titlePre: "Bicha, with ",
    titleEm: "love",
    who: "Mateus F. & DJ Carrasco",
    note: "Six speakers, one Brazilian word, now a 120-bpm dancefloor edit. The remix the original always wanted.",
  },
  {
    id: "s3",
    image:
      "https://images.unsplash.com/photo-1508025690966-2a9a1957da31?q=80&w=400&auto=format&fit=crop",
    tint: "plum",
    titlePre: "Cantiga para a ",
    titleEm: "vizinha",
    who: "Coro de Outubro · Lisbon",
    note: "Fifteen trans voices, recorded live in a kitchen. No reverb. No edits.",
  },
  {
    id: "s4",
    image:
      "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=400&auto=format&fit=crop",
    tint: "jade",
    titlePre: "Pedro on the ",
    titleEm: "25",
    who: "Pedro Limão · Lisbon",
    note: "A tram, a saxophone, and the only honest song about cruising the Praça do Comércio I've heard this year.",
  },
  {
    id: "s5",
    image:
      "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop",
    tint: "coral",
    titlePre: "Salt water, ",
    titleEm: "slowly",
    who: "Akin Diallo · Dakar / Paris",
    note: "A Wolof-language elegy for a brother who didn't get on the boat. Sparse, tidal, breathtaking.",
  },
  {
    id: "s6",
    image:
      "https://images.unsplash.com/photo-1499415479124-43c32433a620?q=80&w=400&auto=format&fit=crop",
    tint: "plum",
    titlePre: "If you have to ",
    titleEm: "ask",
    who: "Yara Reis · Lisbon",
    note: "Eighty seconds of unaccompanied vocal. A 1970s dyke-bar standard, sung from memory.",
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
    note: "Fifty years on, a new song for the revolution. A waltz, in 5/4.",
  },
];

export const COLLECTIONS: Collection[] = [
  {
    id: "c1",
    titlePre: "Songs to play your ",
    titleEm: "mother",
    meta: "curated by Sara Marques · 14 tracks",
    badge: "3 in / 1 out",
    badgeTone: "in",
  },
  {
    id: "c2",
    titlePre: "Lisbon dyke-bar ",
    titleEm: "standards",
    meta: "by Yara Reis · 28 tracks",
    badge: "no change",
    badgeTone: "flat",
  },
  {
    id: "c3",
    titlePre: "Trans choral, ",
    titleEm: "worldwide",
    meta: "by D. Okoye · 22 tracks · 2 new from Tokyo Trans Choir",
    badge: "2 in",
    badgeTone: "in",
  },
];

export const BROADCASTS: Broadcast[] = [
  {
    id: "b1",
    day: "10",
    weekday: "Wed",
    titlePre: "Vespertina ",
    titleEm: "vol. iv",
    meta: "Sara Marques · 1h 42m · the Wednesday set · live waveform + chat",
    time: "21:00 LIS",
  },
  {
    id: "b2",
    day: "11",
    weekday: "Thu",
    titlePre: "Premiere · ",
    titleEm: "Cidade dos santos",
    meta: "Mariana Sol · listening room · all 11 tracks · captioned EN + PT",
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
    who: "Renato V. · Porto · first submission",
    quote:
      "i'm a 56-year-old former dock worker. i bought a piano at 49 and i'm writing the songs i should have written at 24.",
  },
  {
    id: "i2",
    image:
      "https://images.unsplash.com/photo-1732719674511-e94d37e7d1c5?q=80&w=400&auto=format&fit=crop",
    tint: "plum",
    titlePre: "Coro de ",
    titleEm: "Porto",
    who: "eight voices · Porto",
    quote:
      "we're the porto cousin of coro de outubro. four songs of our own, all in mirandês.",
  },
  {
    id: "i3",
    image:
      "https://images.unsplash.com/photo-1736882178500-f99bbe22d77d?q=80&w=400&auto=format&fit=crop",
    tint: "jade",
    titlePre: "Tomboy · ",
    titleEm: "Outubro",
    who: "DJ from São Paulo · second submission",
    quote:
      "sapatão-sci-fi mix, 38 minutes, all heard from below the dancefloor.",
  },
  {
    id: "i4",
    image:
      "https://images.unsplash.com/photo-1740508905511-bccff9d04f7d?q=80&w=400&auto=format&fit=crop",
    tint: "coral",
    titlePre: "Ainda",
    titleEm: "",
    who: "Helena P. · Aveiro · first single",
    quote: "two minutes and forty-six seconds. a piano and a small fire.",
  },
  {
    id: "i5",
    image:
      "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=400&auto=format&fit=crop",
    tint: "jade",
    titlePre: "House for the ",
    titleEm: "still",
    who: "Akim N. · Berlin / Luanda",
    quote:
      "slow house for people who don't drink anymore. recorded in one take.",
  },
  {
    id: "i6",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=400&auto=format&fit=crop",
    tint: "plum",
    titlePre: "Tia, ",
    titleEm: "obrigada",
    who: "Júlia B. · Salvador · 1 of 8 tracks",
    quote: "an album in mãe-tongue, mostly. one song per aunt in my life.",
  },
];
