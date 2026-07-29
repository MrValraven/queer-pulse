import { memberName } from "../members/data/members";

export const HERO_ART =
  "https://images.unsplash.com/photo-1683464276767-bfac74dbd6b8?q=80&w=600&auto=format&fit=crop";

export interface SetRow {
  n: number;
  cvTint: "coral" | "jade" | "plum";
  titlePre: string;
  titleEm?: string;
  who: string;
  pay: string;
  payNote?: string;
  tm: string;
  now?: boolean;
  image?: string;
}

export const SET: SetRow[] = [
  {
    n: 1,
    cvTint: "coral",
    titlePre: "A summer in ",
    titleEm: "Cascais",
    who: memberName("ines"),
    payNote: "paid",
    pay: "€0.05 to Inês",
    tm: "4:12",
    image:
      "https://images.unsplash.com/photo-1669026219505-0545ae1dabf5?q=80&w=600&auto=format&fit=crop",
  },
  {
    n: 2,
    cvTint: "plum",
    titlePre: "Paris is ",
    titleEm: "still burning",
    who: "Akin Diallo",
    payNote: "paid",
    pay: "€0.05 to Akin",
    tm: "5:08",
    image:
      "https://images.unsplash.com/photo-1615749303653-6d12ed97eb1e?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 3,
    cvTint: "jade",
    titlePre: "If you have to ",
    titleEm: "ask",
    who: "Yara Reis",
    payNote: "paid",
    pay: "€0.05 to Yara",
    tm: "1:22",
    image:
      "https://images.unsplash.com/photo-1618327907102-e07a8d7081c6?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 4,
    cvTint: "coral",
    titlePre: "Salt water, ",
    titleEm: "slowly",
    who: "Akin Diallo",
    payNote: "paid",
    pay: "€0.05 to Akin",
    tm: "5:31",
    image:
      "https://images.unsplash.com/photo-1618853606853-bacd55fb7f70?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 5,
    cvTint: "plum",
    titlePre: "Cantiga para a ",
    titleEm: "vizinha",
    who: "Coro de Outubro",
    payNote: "paid",
    pay: "€0.05 to Coro",
    tm: "6:08",
    image:
      "https://images.unsplash.com/photo-1634146330658-b052db81cd15?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 6,
    cvTint: "coral",
    titlePre: "Carta para a ",
    titleEm: "santa",
    who: "Mariana Sol · now playing",
    payNote: "paying",
    pay: "€0.05 to Mariana",
    tm: "4:18",
    now: true,
    image:
      "https://images.unsplash.com/photo-1635237773272-dcd7a1e16859?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 7,
    cvTint: "jade",
    titlePre: "Pedro on the ",
    titleEm: "25",
    who: "Pedro Limão",
    pay: "up next →",
    tm: "4:20",
    image:
      "https://images.unsplash.com/photo-1636207608470-dfedb46c2380?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: 8,
    cvTint: "plum",
    titlePre: "Mother, ",
    titleEm: "weather",
    who: "Yuki Tanaka",
    pay: "€0.05 / play",
    tm: "7:14",
    image:
      "https://images.unsplash.com/photo-1657627157213-c5f44dbd0724?q=80&w=800&auto=format&fit=crop",
  },
];

export interface TrackCard {
  cvTint: "coral" | "jade" | "plum";
  tag: "free" | "mem";
  tagLabelKey: string;
  curator: string;
  titlePre: string;
  titleEm?: string;
  who: string;
  time: string;
  image?: string;
}

export const HERO_TRACK = {
  id: "post:studio-carta-para-a-santa",
  kind: "post" as const,
  title: "Carta para a santa",
  titlePre: "Carta para a ",
  titleEm: "santa",
  href: "/studio",
  meta: "Mariana Sol",
  artist: "Mariana Sol",
  album: "Cidade dos santos",
  year: "2026",
  place: "Sintra",
  description:
    "A letter to the saint who never wrote back — solo voice and piano, in one take.",
};

/** Live-session stats — mock numbers only; the surrounding sentences are chrome. */
export const HERO_STATS = {
  onAirTrack: 6,
  listeningNow: 312,
  trackTotal: 11,
  duration: "4:18",
  audioFormat: "Flac · 24/48",
  perPlayAmount: 0.05,
};

export const WEDNESDAY_SET = {
  titlePre: "Vespertina, ",
  titleEm: "vol. iv",
  description:
    "Twelve tracks for the hour between sunset and the second bottle.",
  curator: "Sara Marques",
  listeners: 312,
  sustainers: 89,
  casual: 223,
  cities: 41,
  ledgerPaidArtists: 11940,
  ledgerPlays: "202k",
  ledgerArtistShare: 0.803,
  ledgerPerPlay: 0.05,
};

export const RECAP_AVATARS = ["JR", "RT", "SC", "YR", "PL", "DO"];

export const TRACKS: TrackCard[] = [
  {
    cvTint: "jade",
    tag: "free",
    tagLabelKey: "studio:tag.free",
    curator: "Programmed by SM",
    titlePre: "The kitchen in ",
    titleEm: "April",
    who: "Rita Ferreira",
    time: "3:42",
    image:
      "https://images.unsplash.com/photo-1660585266731-8cb1b1162d70?q=80&w=600&auto=format&fit=crop",
  },
  {
    cvTint: "coral",
    tag: "mem",
    tagLabelKey: "studio:tag.sustainer",
    curator: "Programmed by DO",
    titlePre: "Bicha, with ",
    titleEm: "love",
    who: "Mateus F. & DJ Carrasco",
    time: "5:54",
    image:
      "https://images.unsplash.com/photo-1670956008011-a9dfc94e12b8?q=80&w=800&auto=format&fit=crop",
  },
  {
    cvTint: "plum",
    tag: "free",
    tagLabelKey: "studio:tag.free",
    curator: "Programmed by JR",
    titlePre: "Cantiga para a ",
    titleEm: "vizinha",
    who: "Coro de Outubro",
    time: "6:08",
    image:
      "https://images.unsplash.com/photo-1671703938773-df94fd42e838?q=80&w=800&auto=format&fit=crop",
  },
  {
    cvTint: "jade",
    tag: "mem",
    tagLabelKey: "studio:tag.sustainer",
    curator: "Programmed by YR",
    titlePre: "Pedro on the ",
    titleEm: "25",
    who: "Pedro Limão",
    time: "4:20",
    image:
      "https://images.unsplash.com/photo-1675283090273-4739316cdf80?q=80&w=800&auto=format&fit=crop",
  },
];
