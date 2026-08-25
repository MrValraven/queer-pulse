import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  FiBookOpen,
  FiCamera,
  FiDroplet,
  FiEdit2,
  FiFilm,
  FiImage,
  FiMonitor,
  FiMusic,
} from "react-icons/fi";
import { FaLeaf, FaMasksTheater, FaTents } from "react-icons/fa6";
import type { AvatarTint } from "../../shared/components/ui";

export type TabKey = "club" | "commission" | "showcase" | "radio";

export const TABS: { key: TabKey; labelKey: string }[] = [
  { key: "club", labelKey: "culture:tabs.club" },
  { key: "commission", labelKey: "culture:tabs.commission" },
  { key: "showcase", labelKey: "culture:tabs.showcase" },
  { key: "radio", labelKey: "culture:tabs.radio" },
];

export type PickKind = "book" | "film" | "music";

/** i18n Pattern A — label-key indirection. `kind` is the canonical id shown
 * as a badge; `PICK_KIND_LABEL_KEY` resolves its translated text. `eventKey`
 * pairs with `eventDate` so `ClubSection`'s render composes
 * `t(eventKey, { date: fmt.date(eventDate, …) })` instead of baking a
 * hand-formatted date into a fused "Meets 14 Jun" string. */
export const PICK_KIND_LABEL_KEY: Record<PickKind, string> = {
  book: "culture:club.kind.book",
  film: "culture:club.kind.film",
  music: "culture:club.kind.music",
};

export interface Pick {
  kind: PickKind;
  emoji: IconType;
  title: string;
  author: string;
  discussingCount: number;
  eventKey: string;
  eventDate: Date;
}

export const PICKS: Pick[] = [
  {
    kind: "book",
    emoji: FiBookOpen,
    title: "Giovanni's Room",
    author: "James Baldwin · 1956",
    discussingCount: 42,
    eventKey: "culture:club.picks.eventKind.meets",
    eventDate: new Date(2026, 5, 14),
  },
  {
    kind: "film",
    emoji: FiFilm,
    title: "Portrait of a Lady on Fire",
    author: "Céline Sciamma · 2019",
    discussingCount: 38,
    eventKey: "culture:club.picks.eventKind.screening",
    eventDate: new Date(2026, 5, 19),
  },
  {
    kind: "music",
    emoji: FiMusic,
    title: "The Gag Order",
    author: "Kehlani · 2023",
    discussingCount: 27,
    eventKey: "culture:club.picks.eventKind.listeningParty",
    eventDate: new Date(2026, 5, 22),
  },
];

export interface Thread {
  initials: string;
  tint: AvatarTint;
  question: string;
  meta: string;
  replies: number;
}

export const THREADS: Thread[] = [
  {
    initials: "ML",
    tint: "jade",
    question:
      "Baldwin's Paris as escape vs. prison: does that tension still resonate in Lisbon today?",
    meta: "Mariana Loução · 2h ago · Book Club",
    replies: 14,
  },
  {
    initials: "SA",
    tint: "coral",
    question:
      "The look vs. the gaze: how Sciamma plays with who has the power to see in Portrait",
    meta: "Sofia Andrade · 5h ago · Film Club",
    replies: 9,
  },
  {
    initials: "RP",
    tint: "plum",
    question:
      "July nominations: I'm pushing hard for Detransition, Baby. Who else has a strong case?",
    meta: "Rafael Pinto · 1d ago · Nominations",
    replies: 21,
  },
  {
    initials: "BN",
    tint: "jade",
    question:
      "Kehlani and vulnerability as armour: production choices that shape the emotional arc",
    meta: "Beatriz Noronha · 2d ago · Music Club",
    replies: 7,
  },
];

export type CommissionCat = "Photo" | "Music" | "Writing" | "Design" | "Film";

/** i18n Pattern A — label-key indirection. `cat` is the canonical id (also
 * the shape the backend's `CreateCommissionInterestDto.commissionCategory`
 * expects, see `api/culture.api.ts`); this map resolves its display label. */
export const COMMISSION_CAT_LABEL_KEY: Record<CommissionCat, string> = {
  Photo: "culture:commissions.cat.photo",
  Music: "culture:commissions.cat.music",
  Writing: "culture:commissions.cat.writing",
  Design: "culture:commissions.cat.design",
  Film: "culture:commissions.cat.film",
};

export interface Commission {
  category: CommissionCat;
  title: string;
  description: string;
  seeking: string;
  tags: string[];
  who: { initials: string; tint: AvatarTint; name: string; role: string };
}

export const COMMISSIONS: Commission[] = [
  {
    category: "Photo",
    title: "Portraits of Queer Elders in Mouraria",
    description:
      "Documenting the queer people who have lived in this neighbourhood for 30+ years, before gentrification, before visibility. I have access and subjects. I need a writer for long-form captions and an editor who knows photo books.",
    seeking: "Looking for: Writer · Photo editor",
    tags: [
      "Documentary",
      "Long-form",
      "Book proposal in progress",
      "Revenue share if published",
    ],
    who: {
      initials: "IT",
      tint: "coral",
      name: "Inês Tavares",
      role: "Graphic Designer",
    },
  },
  {
    category: "Music",
    title: "EP about growing up queer in Setúbal",
    description:
      "Six songs in Portuguese, recorded live. Fully produced. Looking for a cellist for two tracks, and someone with a Lisbon studio who'd let me finish the mixing session. Non-commercial, first EP, for the community.",
    seeking: "Looking for: Cellist · Studio space",
    tags: ["Portuguese", "Acoustic", "Credit offered"],
    who: { initials: "TB", tint: "jade", name: "Tomás Beto", role: "Chef" },
  },
  {
    category: "Writing",
    title: "Translating a forgotten queer Portuguese novel into English",
    description:
      "Working on an English translation of a 1987 novel no one outside Portugal has read. Looking for a co-translator who can catch what I miss in idiomatic English, and a sensitivity reader for LGBTQ+ nuance.",
    seeking: "Looking for: Co-translator (EN/PT) · Sensitivity reader",
    tags: ["Translation", "Literary fiction", "Historical"],
    who: {
      initials: "MP",
      tint: "plum",
      name: "Marta Pereira",
      role: "Writer",
    },
  },
  {
    category: "Design",
    title: "Zine on queer housing discrimination in Lisbon",
    description:
      "Combining collected testimonials (anonymised) with data visualisation. Need an illustrator and a typesetter. This will be printed and distributed at community spaces across the city.",
    seeking: "Looking for: Illustrator · Typesetter",
    tags: ["Print", "Social justice", "Housing", "Data viz"],
    who: {
      initials: "CF",
      tint: "jade",
      name: "Catarina Faria",
      role: "Architect",
    },
  },
];

export interface GalleryItem {
  emoji: IconType;
  gradient: string;
  title: string;
  artist: string;
  featured?: boolean;
}

export const GALLERY: GalleryItem[] = [
  {
    emoji: FiDroplet,
    gradient:
      "linear-gradient(135deg,rgba(var(--plum-rgb),.18),rgba(var(--accent-rgb),.14))",
    title: "Corpo Estranho, 2024",
    artist: "Inês Tavares · Mixed media",
    featured: true,
  },
  {
    emoji: FiCamera,
    gradient:
      "linear-gradient(135deg,rgba(var(--jade-rgb),.18),rgba(var(--jade-rgb),.06))",
    title: "Without Title, 2023",
    artist: "Sofia Andrade · Photography",
  },
  {
    emoji: FiImage,
    gradient:
      "linear-gradient(135deg,rgba(var(--accent-rgb),.18),rgba(var(--plum-rgb),.06))",
    title: "Fronteira, 2024",
    artist: "Rafael Pinto · Painting",
  },
  {
    emoji: FiEdit2,
    gradient:
      "linear-gradient(135deg,rgba(var(--plum-rgb),.14),rgba(var(--jade-rgb),.1))",
    title: "Série Madrugada, 2023",
    artist: "Marta Pereira · Illustration",
  },
  {
    emoji: FaMasksTheater,
    gradient:
      "linear-gradient(135deg,rgba(var(--accent-rgb),.14),rgba(var(--jade-rgb),.12))",
    title: "Fragmentos, 2024",
    artist: "Paulo Mendes · Performance",
  },
  {
    emoji: FiMonitor,
    gradient:
      "linear-gradient(135deg,rgba(var(--violet-rgb),.16),rgba(var(--plum-rgb),.08))",
    title: "Não Binário, 2024",
    artist: "Beatriz Noronha · Digital",
  },
  {
    emoji: FaLeaf,
    gradient:
      "linear-gradient(135deg,rgba(var(--jade-rgb),.2),rgba(var(--accent-rgb),.08))",
    title: "Raízes, 2023",
    artist: "Catarina Faria · Ceramics",
  },
  {
    emoji: FaTents,
    gradient:
      "linear-gradient(135deg,rgba(var(--plum-rgb),.12),rgba(var(--accent-rgb),.16))",
    title: "Depois do Arco-Íris, 2024",
    artist: "Tomás Beto · Installation",
  },
];

export interface RadioData {
  /** Chrome eyebrow — a static label, not curator-authored content. */
  curatorLabelKey: string;
  /** Content: this week's curator's own playlist title (already
   * Portuguese-flavoured mock copy, unrelated to the i18n sweep). */
  curatorTitle: ReactNode;
  /** Content: the curator's name, interpolated into the "curated by {name}"
   * chrome phrase at render (`CultureRadioPanel.tsx`). */
  curatorName: string;
  quote: string;
  now: { track: string; artist: string; progress: number; time: string };
  queue: { number: number; track: string; artist: string; duration: string }[];
}

export const RADIO: RadioData = {
  curatorLabelKey: "culture:radio.curatorLabel",
  curatorTitle: (
    <>
      A noite que ficou <em>em Lisboa</em>
    </>
  ),
  curatorName: "Beatriz Noronha",
  quote:
    '"Songs for 2am in Príncipe Real. Songs that sound like staying when you thought you\'d leave. Play loud or barely at all."',
  now: {
    track: "Cais do Sodré",
    artist: "Surma · Uó (2022)",
    progress: 38,
    time: "2:14 / 3:47",
  },
  queue: [
    { number: 1, track: "Tejo", artist: "Dino d'Santiago", duration: "4:02" },
    { number: 2, track: "Corre", artist: "Blaya", duration: "3:28" },
    { number: 3, track: "Sem Chão", artist: "Mariza", duration: "5:11" },
  ],
};
