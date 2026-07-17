import { routes } from "../../app/routeMap";

export type TabId = "notes" | "chapters" | "transcript";

export const SHOW = routes.podcastShow;
export const HOME = "/";
export const MEMBER = routes.members;
export const ARTICLE = routes.article;

export const SPEEDS = ["0.8×", "1.0×", "1.2×", "1.5×", "2.0×"];

/** Total runtime of the episode, in seconds (52:14). */
export const DURATION_SEC = 52 * 60 + 14;

/** Parse an `mm:ss` timestamp into whole seconds. */
export function timeToSec(t: string): number {
  const [m = 0, s = 0] = t.split(":").map(Number);
  return m * 60 + s;
}

/** Format whole seconds back to `mm:ss` (or `h:mm:ss` if needed). */
export function secToTime(total: number): string {
  const safe = Math.max(0, Math.floor(total));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export interface Chapter {
  time: string;
  /** Start of the chapter in seconds, derived from `time`. */
  sec: number;
  title: string;
}

export const CHAPTERS: Chapter[] = [
  {
    time: "00:00",
    title:
      'Cold open · "I make €38 less per hour than my non-affirming colleagues"',
  },
  { time: "05:23", title: "How Inês ended up in Anjos · the Amsterdam years" },
  { time: "19:42", title: "The 2022 protocol · what it actually says" },
  { time: "30:45", title: "The morning her boss tried to fire her" },
  {
    time: "39:24",
    title: "Saturday phone calls · the unwritten part of the job",
  },
  { time: "47:00", title: "What she'd want a young GP to know · closing" },
].map((c) => ({ ...c, sec: timeToSec(c.time) }));

/** Sleep-timer presets, in minutes. */
export const SLEEP_PRESETS = [15, 30, 45, 60];

/** Fake nearby devices for the cast / AirPlay picker. `kindKey` is a chrome
 * catalog key (protocol + device-type description); `name` is the specific
 * fictional device name, left as-is. */
export interface CastTarget {
  id: string;
  name: string;
  kindKey: string;
}

export const CAST_TARGETS: CastTarget[] = [
  {
    id: "living",
    name: "Living Room HomePod",
    kindKey: "magazine:audio.cast.kind.airplaySpeaker",
  },
  {
    id: "kitchen",
    name: "Kitchen display",
    kindKey: "magazine:audio.cast.kind.castScreen",
  },
  {
    id: "studio",
    name: "Atelier Pulso monitors",
    kindKey: "magazine:audio.cast.kind.airplayTwoSpeakers",
  },
  {
    id: "headphones",
    name: "Catarina's AirPods Pro",
    kindKey: "magazine:audio.cast.kind.bluetoothHeadphones",
  },
];

export interface TranscriptBlock {
  who: string;
  time: string;
  /** Cue point in seconds, derived from `time`. */
  sec: number;
  text: string;
}

export const TRANSCRIPT: TranscriptBlock[] = [
  {
    who: "Catarina",
    time: "00:01",
    text: "Inês, thank you for staying past closing. Set the scene — for someone who's never been here, what do we see when we walk in?",
  },
  {
    who: "Inês",
    time: "00:14",
    text: "The first thing you see is the reception desk, but the second thing you see is that there isn't a reception form. It's been that way since 2022. People come in, give a name — whichever name they want — and we go from there. The receptionist has a small notebook and a very good memory.",
  },
  {
    who: "Catarina",
    time: "00:42",
    text: "That's the protocol change you're famous for. But that's only one of about a dozen, right?",
  },
  {
    who: "Inês",
    time: "19:42",
    text: "So the protocol — the actual document — is two pages. People assume it's enormous because of how much friction it removed, but it's two pages. The first page is everything we stopped asking. The second page is everything we instead looked up from the patient's existing chart, with their consent, before they walked in.",
  },
  {
    who: "Catarina",
    time: "20:18",
    text: "And the bureaucratic gauntlet on the way to getting that signed off was — how long?",
  },
  {
    who: "Inês",
    time: "20:25",
    text: 'Eight months. Most of which was about who\'s liable if a patient is "misidentified" — a word I am, to be clear, not using approvingly. The legal team got there. Eventually.',
  },
].map((t) => ({ ...t, sec: timeToSec(t.time) }));

/** Build a plain-text transcript file body for download. */
export function buildTranscriptText(): string {
  const header = [
    "The Back Room · Episode 34",
    "Dr. Inês Pereira on fifteen minutes of someone else's time",
    "Recorded 6 May at Café Beirão · 52 min",
    "",
    "— — —",
    "",
  ].join("\n");
  const body = TRANSCRIPT.map((t) => `[${t.time}] ${t.who}\n${t.text}`).join(
    "\n\n",
  );
  return `${header}${body}\n`;
}
