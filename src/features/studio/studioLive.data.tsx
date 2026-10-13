import { type ReactNode } from "react";
import { FiHeart, FiSmile, FiArrowDown } from "react-icons/fi";
import { Translation } from "../../shared/i18n/Translation";
import type { TranslateOptions } from "../../shared/i18n/types";
import { MEMBERS, memberName } from "../members/data/members";
import { StudioEuroAmount } from "./StudioEuroAmount";

export const WF = [
  30, 55, 70, 90, 65, 80, 50, 42, 60, 75, 55, 88, 62, 48, 72, 80, 34, 58, 80,
  46, 64, 78, 42, 90, 54, 38, 66, 74, 48, 60, 35, 50, 42, 65, 78, 50, 68, 42,
  36,
];

export const coverImage =
  "https://images.unsplash.com/photo-1527261834078-9b37d35a4a32?q=80&w=600&auto=format&fit=crop";

/** Number of waveform bars already played */
export const PLAYED = 15;

/**
 * A `studioShowcase` catalog key plus the literal data it interpolates
 * (artist names, clock times, money). Consumers resolve it with
 * `t(copy.key, copy.values)`.
 */
export interface LiveCopy {
  key: string;
  values?: TranslateOptions;
}

function playedLine(artist: string, start: string, end: string): LiveCopy {
  return {
    key: "studioShowcase:live.set.who.played",
    values: { artist, start, end },
  };
}

function payToArtist(artist: string): LiveCopy {
  return {
    key: "studioShowcase:live.set.pay.toArtist",
    values: { artist },
  };
}

export interface LiveSetRow {
  n: string;
  pre: string;
  em?: string;
  post?: string;
  whoLabel: LiveCopy;
  payLabel?: LiveCopy;
  payNoteKey?: string;
  payEmLabel?: LiveCopy;
  tm: string;
  state: string;
  tint: string;
  image?: string;
}

export const SET: LiveSetRow[] = [
  {
    n: "1",
    pre: "A summer in ",
    em: "Cascais",
    whoLabel: playedLine(memberName("ines"), "21:00", "21:04"),
    payLabel: payToArtist(MEMBERS.ines!.first),
    tm: "4:12",
    state: "played",
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1416273567255-8abe875affcd?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: "2",
    pre: "Paris is ",
    em: "still",
    post: " burning",
    whoLabel: playedLine("Akin Diallo", "21:04", "21:09"),
    payLabel: payToArtist("Akin"),
    tm: "5:08",
    state: "played",
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: "3",
    pre: "If you have to ",
    em: "ask",
    whoLabel: playedLine("Yara Reis", "21:09", "21:10"),
    payLabel: payToArtist("Yara"),
    tm: "1:22",
    state: "played",
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1474692295473-66ba4d54e0d3?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: "4",
    pre: "Salt water, ",
    em: "slowly",
    whoLabel: playedLine("Akin Diallo", "21:10", "21:16"),
    payLabel: payToArtist("Akin"),
    tm: "5:31",
    state: "played",
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1484876065684-b683cf17d276?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: "5",
    pre: "Cantiga para a ",
    em: "vizinha",
    whoLabel: playedLine("Coro de Outubro", "21:16", "21:22"),
    payLabel: payToArtist("Coro"),
    tm: "6:08",
    state: "played",
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1496698161505-d1703dbcab63?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: "6",
    pre: "Carta para a ",
    em: "santa",
    whoLabel: {
      key: "studioShowcase:live.set.who.playingNow",
      values: { artist: "Mariana Sol", elapsed: "1:42", length: "4:18" },
    },
    payNoteKey: "studioShowcase:live.set.pay.payingNow",
    payLabel: payToArtist("Mariana"),
    tm: "4:18",
    state: "now",
    tint: "coral",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=600&auto=format&fit=crop",
  },
  {
    n: "7",
    pre: "Pedro on the ",
    em: "25",
    whoLabel: {
      key: "studioShowcase:live.set.who.upNext",
      values: { artist: "Pedro Limão", countdown: "2:36" },
    },
    payEmLabel: {
      key: "studioShowcase:live.set.pay.queuedBy",
      values: { curator: "Sara" },
    },
    tm: "4:20",
    state: "upnext",
    tint: "jade",
    image:
      "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=800&auto=format&fit=crop",
  },
  {
    n: "8",
    pre: "Mother, ",
    em: "weather",
    whoLabel: {
      key: "studioShowcase:live.set.who.planned",
      values: { artist: "Yuki Tanaka" },
    },
    payLabel: { key: "studioShowcase:live.set.pay.perPlay" },
    tm: "7:14",
    state: "queued",
    tint: "plum",
    image:
      "https://images.unsplash.com/photo-1502056618377-f15b18d813b7?q=80&w=800&auto=format&fit=crop",
  },
];

/**
 * A chat line. `name`, `text` and `time` are nodes so platform words ("You",
 * "Anonymous", "pinned") render through `<Translation>`, which resolves the
 * active language at render time and keeps this list a plain const that can
 * seed `useState`. People's names, initials and clock times stay literal.
 */
export type Msg =
  | { systemLine: LiveCopy }
  | {
      av: string;
      tone?: "jade" | "plum";
      name: ReactNode;
      curator?: boolean;
      roleKey?: string;
      roleClass?: string;
      text: ReactNode;
      time: ReactNode;
      tip?: boolean;
    };

export const CHAT: Msg[] = [
  {
    systemLine: {
      key: "studioShowcase:live.chat.system.opened",
      values: { time: "21:00", host: "Sara Marques" },
    },
  },
  {
    av: "SM",
    tone: "jade",
    name: "Sara Marques",
    curator: true,
    roleKey: "studioShowcase:live.chat.role.curator",
    roleClass: "cu",
    text: (
      <Translation
        i18nKey="studioShowcase:live.chat.msg.welcome"
        components={{ em: <em /> }}
      />
    ),
    time: (
      <Translation
        i18nKey="studioShowcase:live.chat.pinnedAt"
        values={{ time: "21:01" }}
      />
    ),
  },
  {
    av: "RT",
    name: "Rita T.",
    text: (
      <Translation
        i18nKey="studioShowcase:live.chat.msg.first"
        slots={{ icon: <FiSmile /> }}
      />
    ),
    time: "21:01",
  },
  {
    av: "PL",
    name: "Pedro L.",
    text: <Translation i18nKey="studioShowcase:live.chat.msg.cascaisOpener" />,
    time: "21:02",
  },
  {
    systemLine: {
      key: "studioShowcase:live.chat.system.listening",
      values: { time: "21:10", listeners: "312", cities: "41" },
    },
  },
  {
    av: "DO",
    tone: "jade",
    name: "D. Okoye",
    roleKey: "studioShowcase:live.chat.role.sustainer",
    text: (
      <Translation
        i18nKey="studioShowcase:live.chat.msg.akinDouble"
        slots={{ icon: <FiHeart /> }}
      />
    ),
    time: "21:15",
  },
  {
    av: "SM",
    tone: "jade",
    name: "Sara Marques",
    curator: true,
    roleKey: "studioShowcase:live.chat.role.curator",
    roleClass: "cu",
    text: (
      <Translation
        i18nKey="studioShowcase:live.chat.msg.byAccident"
        components={{ em: <em /> }}
      />
    ),
    time: "21:16",
  },
  {
    av: "PL",
    tone: "jade",
    name: "Pedro L.",
    roleKey: "studioShowcase:live.chat.role.artist",
    roleClass: "artist",
    tip: true,
    text: (
      <Translation
        i18nKey="studioShowcase:live.chat.msg.saltWaterTip"
        components={{ b: <b /> }}
        values={{ artist: "Akin" }}
        slots={{ amount: <StudioEuroAmount value={5} /> }}
      />
    ),
    time: "21:17",
  },
  {
    systemLine: {
      key: "studioShowcase:live.chat.system.nowPlaying",
      values: {
        time: "21:22",
        title: "Carta para a santa",
        artist: "Mariana Sol",
      },
    },
  },
  {
    av: "RT",
    name: "Rita T.",
    text: (
      <Translation
        i18nKey="studioShowcase:live.chat.msg.secondVerse"
        components={{ em: <em /> }}
      />
    ),
    time: "21:23",
  },
  {
    av: "DO",
    tone: "jade",
    name: "D. Okoye",
    roleKey: "studioShowcase:live.chat.role.sustainer",
    text: (
      <Translation
        i18nKey="studioShowcase:live.chat.msg.pinnedInNotes"
        slots={{ icon: <FiArrowDown /> }}
      />
    ),
    time: "21:23",
  },
  {
    av: "PL",
    name: "Pedro L.",
    roleKey: "studioShowcase:live.chat.role.artist",
    roleClass: "artist",
    tip: true,
    text: (
      <Translation
        i18nKey="studioShowcase:live.chat.msg.earnItTip"
        components={{ b: <b /> }}
        values={{ artist: "Mariana" }}
        slots={{ amount: <StudioEuroAmount value={5} /> }}
      />
    ),
    time: "21:24",
  },
  {
    av: "SM",
    tone: "jade",
    name: "Sara Marques",
    curator: true,
    roleKey: "studioShowcase:live.chat.role.curator",
    roleClass: "cu",
    text: (
      <Translation
        i18nKey="studioShowcase:live.chat.msg.pianoWait"
        components={{ em: <em /> }}
      />
    ),
    time: "21:24",
  },
  {
    av: "·",
    tone: "plum",
    name: <Translation i18nKey="studioShowcase:live.chat.anonymous" />,
    tip: true,
    text: (
      <Translation
        i18nKey="studioShowcase:live.chat.msg.tipNoNote"
        components={{ b: <b /> }}
        values={{ artist: "Mariana" }}
        slots={{ amount: <StudioEuroAmount value={10} /> }}
      />
    ),
    time: "21:24",
  },
];

// `id` is the stable stored tab value and stays untranslated;
// `labelKey` resolves via t().
export const TABS = [
  { id: "chat", labelKey: "studio:liveChat.tabs.chat.label", ct: "312" },
  { id: "tips", labelKey: "studio:liveChat.tabs.tips.label", ct: "87" },
  {
    id: "listeners",
    labelKey: "studio:liveChat.tabs.listeners.label",
    ct: "",
  },
];
