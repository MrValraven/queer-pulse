import type { ReactNode } from "react";

export interface Device {
  id: string;
  name: string;
  sub: string;
}

export const DEVICES: Device[] = [
  {
    id: "scarlett",
    name: "Scarlett 2i2 · input 1–2",
    sub: "USB interface · 24-bit / 48kHz",
  },
  {
    id: "macbook",
    name: "MacBook Pro mic",
    sub: "Built-in · mono",
  },
  {
    id: "loopback",
    name: "System audio (loopback)",
    sub: "For decks & DJ software",
  },
];

export type CueBadge = "onair" | "matched" | "hold";

export interface Cue {
  id: number;
  time: string;
  pre: string;
  em: string;
  post?: string;
  who: string;
  meta: string;
  badge: CueBadge;
}

/** The badge's display label is derived from `badge` (a stable id) via this
 * map at render time — never store the translated label itself (§5.1). */
export const CUE_BADGE_LABEL_KEYS: Record<CueBadge, string> = {
  onair: "studio:broadcast.nowPlaying.badge.onAir",
  matched: "studio:broadcast.nowPlaying.badge.matched",
  hold: "studio:broadcast.nowPlaying.badge.hold",
};

export const INITIAL_CUES: Cue[] = [
  {
    id: 1,
    time: "00:42:01",
    pre: "Carta para a ",
    em: "santa",
    who: "Mariana Sol",
    meta: "live, your own",
    badge: "onair",
  },
  {
    id: 2,
    time: "00:37:44",
    pre: "Salt water, ",
    em: "slowly",
    who: "Akin Diallo",
    meta: "matched in catalogue",
    badge: "matched",
  },
  {
    id: 3,
    time: "00:31:10",
    pre: "A bootleg edit ",
    em: "(unknown)",
    who: "Unmatched",
    meta: "payout held until cleared",
    badge: "hold",
  },
  {
    id: 4,
    time: "00:24:52",
    pre: "Cantiga para a ",
    em: "vizinha",
    who: "Coro de Outubro",
    meta: "matched",
    badge: "matched",
  },
  {
    id: 5,
    time: "00:18:30",
    pre: "If you have to ",
    em: "ask",
    who: "Yara Reis",
    meta: "matched",
    badge: "matched",
  },
];

export interface Tip {
  id: number;
  initials: string;
  name: string;
  amount: number;
  note: string;
  privateTip?: boolean;
}

export const INITIAL_TIPS: Tip[] = [
  {
    id: 1,
    initials: "RM",
    name: "Rita M.",
    amount: 5,
    note: "earn it, mariana — this one's for my mãe",
  },
  {
    id: 2,
    initials: "JR",
    name: "João R.",
    amount: 2,
    note: "Private note · just for you",
    privateTip: true,
  },
  {
    id: 3,
    initials: "SC",
    name: "Sofía C.",
    amount: 10,
    note: "the live version destroys me every time",
  },
  {
    id: 4,
    initials: "YR",
    name: "Yara R.",
    amount: 3,
    note: "Quiet tip · no note",
    privateTip: true,
  },
];

/** Pool of tips the simulation prepends every ~6.5s. */
export const INCOMING_TIPS: Omit<Tip, "id">[] = [
  { initials: "DO", name: "D. Okoye", amount: 5, note: "this is the one" },
  {
    initials: "PL",
    name: "Pedro L.",
    amount: 2,
    note: "Private note · just for you",
    privateTip: true,
  },
  { initials: "MF", name: "Mateus F.", amount: 3, note: "bicha, with love" },
  {
    initials: "Ak",
    name: "Akin D.",
    amount: 10,
    note: "Private note · just for you",
    privateTip: true,
  },
];

export interface TalkbackMessage {
  id: number;
  initials: string;
  name: string;
  role?: string;
  text: ReactNode;
  own?: boolean;
}

export const TALKBACK: TalkbackMessage[] = [
  {
    id: 1,
    initials: "DC",
    name: "DJ Carrasco",
    role: "mod",
    text: "chat's lovely tonight, no flags. when you're ready for the cover, give me a nod and I'll pin the lyric.",
  },
  {
    id: 2,
    initials: "MS",
    name: "You",
    text: "nod — going into the cover after this one. can you pin the translation too?",
    own: true,
  },
  {
    id: 3,
    initials: "DC",
    name: "DJ Carrasco",
    role: "mod",
    text: "on it. PT + EN both pinned. room's at 418, holding steady.",
  },
  {
    id: 4,
    initials: "SM",
    name: "Sara M.",
    role: "council",
    text: "dropping by — this set is gorgeous. I'll feature the replay on Monday's slate.",
  },
];
