import type { TranslateOptions } from "../../shared/i18n/types";

/**
 * A `studioShowcase` catalog key plus the literal data it interpolates
 * (device model names, audio specs). Consumers resolve it with
 * `t(copy.key, copy.values)`.
 */
export interface BroadcastCopy {
  key: string;
  values?: TranslateOptions;
}

export interface Device {
  id: string;
  nameLabel: BroadcastCopy;
  subLabel: BroadcastCopy;
}

export const DEVICES: Device[] = [
  {
    id: "scarlett",
    nameLabel: {
      key: "studioShowcase:broadcast.devices.interface.name",
      values: { device: "Scarlett 2i2" },
    },
    subLabel: {
      key: "studioShowcase:broadcast.devices.interface.sub",
      values: { spec: "24-bit / 48kHz" },
    },
  },
  {
    id: "macbook",
    nameLabel: {
      key: "studioShowcase:broadcast.devices.laptopMic.name",
      values: { device: "MacBook Pro" },
    },
    subLabel: { key: "studioShowcase:broadcast.devices.laptopMic.sub" },
  },
  {
    id: "loopback",
    nameLabel: { key: "studioShowcase:broadcast.devices.loopback.name" },
    subLabel: { key: "studioShowcase:broadcast.devices.loopback.sub" },
  },
];

export type CueBadge = "onair" | "matched" | "hold";

export interface Cue {
  id: number;
  time: string;
  /** Track title split for the <em> run; titles are proper nouns, kept literal. */
  pre?: string;
  em?: string;
  post?: string;
  /** Replaces pre/em/post when the title is platform copy (an unidentified track). */
  titleKey?: string;
  /** The artist as typed or catalogued (a proper noun). */
  who?: string;
  /** Replaces `who` when the cue has no named artist. */
  whoKey?: string;
  metaKey: string;
  badge: CueBadge;
}

/** The badge's display label is derived from `badge` (a stable id) via this
 * map at render time; store only the id, the label resolves through t() (§5.1). */
export const CUE_BADGE_LABEL_KEYS: Record<CueBadge, string> = {
  onair: "studio:broadcast.nowPlaying.badge.onAir",
  matched: "studio:broadcast.nowPlaying.badge.matched",
  hold: "studio:broadcast.nowPlaying.badge.hold",
};

/** Cue meta a demoted on-air cue switches to once a newer cue is added. */
export const CUE_MATCHED_META_KEY =
  "studioShowcase:broadcast.cues.meta.matched";

/** Cue meta for a track the artist plays live themselves (existing studio key). */
export const CUE_LIVE_OWN_META_KEY = "studio:broadcast.nowPlaying.liveYourOwn";

export const INITIAL_CUES: Cue[] = [
  {
    id: 1,
    time: "00:42:01",
    pre: "Carta para a ",
    em: "santa",
    who: "Mariana Sol",
    metaKey: CUE_LIVE_OWN_META_KEY,
    badge: "onair",
  },
  {
    id: 2,
    time: "00:37:44",
    pre: "Salt water, ",
    em: "slowly",
    who: "Akin Diallo",
    metaKey: "studioShowcase:broadcast.cues.meta.matchedInCatalogue",
    badge: "matched",
  },
  {
    id: 3,
    time: "00:31:10",
    titleKey: "studioShowcase:broadcast.cues.unknownTitle",
    whoKey: "studioShowcase:broadcast.cues.unmatched",
    metaKey: "studioShowcase:broadcast.cues.meta.creditHeld",
    badge: "hold",
  },
  {
    id: 4,
    time: "00:24:52",
    pre: "Cantiga para a ",
    em: "vizinha",
    who: "Coro de Outubro",
    metaKey: CUE_MATCHED_META_KEY,
    badge: "matched",
  },
  {
    id: 5,
    time: "00:18:30",
    pre: "If you have to ",
    em: "ask",
    who: "Yara Reis",
    metaKey: CUE_MATCHED_META_KEY,
    badge: "matched",
  },
];

export interface Tip {
  id: number;
  initials: string;
  name: string;
  amount: number;
  noteKey: string;
  privateTip?: boolean;
}

const PRIVATE_NOTE_KEY = "studioShowcase:broadcast.tips.note.privateNote";

export const INITIAL_TIPS: Tip[] = [
  {
    id: 1,
    initials: "RM",
    name: "Rita M.",
    amount: 5,
    noteKey: "studioShowcase:broadcast.tips.note.earnItForMyMae",
  },
  {
    id: 2,
    initials: "JR",
    name: "João R.",
    amount: 2,
    noteKey: PRIVATE_NOTE_KEY,
    privateTip: true,
  },
  {
    id: 3,
    initials: "SC",
    name: "Sofía C.",
    amount: 10,
    noteKey: "studioShowcase:broadcast.tips.note.liveVersion",
  },
  {
    id: 4,
    initials: "YR",
    name: "Yara R.",
    amount: 3,
    noteKey: "studioShowcase:broadcast.tips.note.quietTip",
    privateTip: true,
  },
];

/** Pool of tips the simulation prepends every ~6.5s. */
export const INCOMING_TIPS: Omit<Tip, "id">[] = [
  {
    initials: "DO",
    name: "D. Okoye",
    amount: 5,
    noteKey: "studioShowcase:broadcast.tips.note.thisIsTheOne",
  },
  {
    initials: "PL",
    name: "Pedro L.",
    amount: 2,
    noteKey: PRIVATE_NOTE_KEY,
    privateTip: true,
  },
  {
    initials: "MF",
    name: "Mateus F.",
    amount: 3,
    noteKey: "studioShowcase:broadcast.tips.note.withLove",
  },
  {
    initials: "Ak",
    name: "Akin D.",
    amount: 10,
    noteKey: PRIVATE_NOTE_KEY,
    privateTip: true,
  },
];

/** A talkback line. `own` lines are the artist's: their name renders as
 * "You" from the catalog, so they carry no `name`. */
export interface TalkbackMessage {
  id: number;
  initials: string;
  name?: string;
  roleKey?: string;
  textKey: string;
  own?: boolean;
}

export const TALKBACK: TalkbackMessage[] = [
  {
    id: 1,
    initials: "DC",
    name: "DJ Carrasco",
    roleKey: "studioShowcase:broadcast.talkback.role.mod",
    textKey: "studioShowcase:broadcast.talkback.msg.chatLovely",
  },
  {
    id: 2,
    initials: "MS",
    textKey: "studioShowcase:broadcast.talkback.msg.intoTheCover",
    own: true,
  },
  {
    id: 3,
    initials: "DC",
    name: "DJ Carrasco",
    roleKey: "studioShowcase:broadcast.talkback.role.mod",
    textKey: "studioShowcase:broadcast.talkback.msg.bothPinned",
  },
  {
    id: 4,
    initials: "SM",
    name: "Sara M.",
    roleKey: "studioShowcase:broadcast.talkback.role.council",
    textKey: "studioShowcase:broadcast.talkback.msg.featureReplay",
  },
];
