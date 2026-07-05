import type { ReactNode } from "react";
import {
  FiMessageSquare,
  FiAlignLeft,
  FiActivity,
  FiCheck,
  FiGlobe,
  FiList,
  FiEye,
  FiVolume2,
  FiPause,
} from "react-icons/fi";

export type ItemStatus = "live" | "soon";

export interface AccessItem {
  icon: ReactNode;
  /** Heading, split so the emphasised part can render as an italic <em>. */
  pre: string;
  em: string;
  post?: string;
  body: ReactNode;
  status: ItemStatus;
}

export interface AccessGroup {
  /** Section title, split so the emphasised part can render as an italic <em>. */
  pre: string;
  em: string;
  post?: string;
  dek: string;
  items: AccessItem[];
}

export const GROUPS: AccessGroup[] = [
  {
    pre: "For Deaf & ",
    em: "hard-of-hearing",
    post: " listeners",
    dek: "A music platform can't pretend everyone hears it the same way. So we caption the talk and surface the words.",
    items: [
      {
        icon: <FiMessageSquare />,
        pre: "Captioned ",
        em: "live rooms",
        body: (
          <>
            Every broadcast is auto-captioned in real time; council broadcasts
            get a <em>human pass</em>. The talk between songs, the dedications,
            the artist's asides — all transcribed and adjustable in size.
          </>
        ),
        status: "live",
      },
      {
        icon: <FiAlignLeft />,
        pre: "Time-synced ",
        em: "lyrics",
        body: (
          <>
            Where the artist supplied them, lyrics scroll in time with playback,
            with the current line highlighted. Readable as a static sheet too,
            for any track.
          </>
        ),
        status: "live",
      },
      {
        icon: <FiActivity />,
        pre: "Visual ",
        em: "waveforms",
        body: (
          <>
            Live rooms and tracks show a real-time waveform tied to the actual
            audio, so rhythm and dynamics are visible, not only audible.
          </>
        ),
        status: "live",
      },
      {
        icon: <FiCheck />,
        pre: "Signed ",
        em: "broadcasts",
        body: (
          <>
            Flagship council broadcasts include a Portuguese Sign Language (LGP)
            interpreter window. Expanding to weekly rooms next quarter.
          </>
        ),
        status: "soon",
      },
    ],
  },
  {
    pre: "For listeners in ",
    em: "any language",
    dek: "The catalogue is mostly in Portuguese, with songs in a dozen other languages. Words shouldn't be a wall.",
    items: [
      {
        icon: <FiGlobe />,
        pre: "Lyric ",
        em: "translation",
        body: (
          <>
            Community translations sit beside the original. Show one or both at
            once. Translators are credited and{" "}
            <em>paid from the solidarity fund</em> — translation is labour.
          </>
        ),
        status: "live",
      },
      {
        icon: <FiList />,
        pre: "Interface in ",
        em: "your language",
        body: (
          <>
            Studio's chrome ships in Portuguese, English, Spanish and French,
            with more added as members translate them. Set it in Settings →
            Captions &amp; lyrics.
          </>
        ),
        status: "live",
      },
    ],
  },
  {
    pre: "For low-vision & ",
    em: "keyboard",
    post: " navigation",
    dek: "The whole player is operable without a mouse, and the dark theme is built to clear contrast — not just to look moody.",
    items: [
      {
        icon: <FiEye />,
        pre: "Contrast that ",
        em: "passes",
        body: (
          <>
            Body text sits at 4.5:1 or better against the plum; interactive
            elements at 3:1 minimum, with a high-contrast mode that lifts
            everything further. Focus rings are always visible.
          </>
        ),
        status: "live",
      },
      {
        icon: <FiVolume2 />,
        pre: "Screen-reader notes on the ",
        em: "player",
        body: (
          <>
            The persistent transport announces track, artist, elapsed time, and{" "}
            <em>what this play pays the artist</em>. Tip and save are labelled
            buttons; the live tip feed is a polite ARIA live region, never a
            barrage.
          </>
        ),
        status: "live",
      },
      {
        icon: <FiPause />,
        pre: "Respects ",
        em: "reduced motion",
        body: (
          <>
            Every decorative animation — the pulse dot, the waveforms, the
            equaliser bars — stills itself when your system asks for reduced
            motion. Nothing essential moves.
          </>
        ),
        status: "live",
      },
    ],
  },
];

export interface ShortcutRow {
  /** Description, split so the emphasised part can render as an italic <em>. */
  pre: string;
  em?: string;
  post?: string;
  keys: string[];
}

export const SHORTCUTS: ShortcutRow[] = [
  { pre: "Play / ", em: "pause", keys: ["Space"] },
  { pre: "Previous / next ", em: "track", keys: ["←", "→"] },
  { pre: "Volume ", em: "up / down", keys: ["↑", "↓"] },
  { pre: "Tip the current artist", keys: ["T"] },
  { pre: "Save to library", keys: ["S"] },
  { pre: "Toggle ", em: "captions / lyrics", keys: ["C"] },
  { pre: "Open search", keys: ["/"] },
];
