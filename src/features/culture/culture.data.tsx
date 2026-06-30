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

export const TABS: { key: TabKey; label: string }[] = [
  { key: "club", label: "Book · Film · Music Club" },
  { key: "commission", label: "Commission Board" },
  { key: "showcase", label: "Art Showcase" },
  { key: "radio", label: "Radio" },
];

export type PickKind = "book" | "film" | "music";

export interface Pick {
  kind: PickKind;
  emoji: IconType;
  title: string;
  author: string;
  discussing: string;
  when: string;
}

export const PICKS: Pick[] = [
  {
    kind: "book",
    emoji: FiBookOpen,
    title: "Giovanni's Room",
    author: "James Baldwin · 1956",
    discussing: "42 discussing",
    when: "Meets 14 Jun",
  },
  {
    kind: "film",
    emoji: FiFilm,
    title: "Portrait of a Lady on Fire",
    author: "Céline Sciamma · 2019",
    discussing: "38 discussing",
    when: "Screening 19 Jun",
  },
  {
    kind: "music",
    emoji: FiMusic,
    title: "The Gag Order",
    author: "Kehlani · 2023",
    discussing: "27 discussing",
    when: "Listening party 22 Jun",
  },
];

export interface Thread {
  initials: string;
  tint: AvatarTint;
  q: string;
  meta: string;
  replies: number;
}

export const THREADS: Thread[] = [
  {
    initials: "ML",
    tint: "jade",
    q: "Baldwin's Paris as escape vs. prison — does that tension still resonate in Lisbon today?",
    meta: "Mariana Loução · 2h ago · Book Club",
    replies: 14,
  },
  {
    initials: "SA",
    tint: "coral",
    q: "The look vs. the gaze — how Sciamma plays with who has the power to see in Portrait",
    meta: "Sofia Andrade · 5h ago · Film Club",
    replies: 9,
  },
  {
    initials: "RP",
    tint: "plum",
    q: "July nominations — I'm pushing hard for Detransition, Baby. Who else has a strong case?",
    meta: "Rafael Pinto · 1d ago · Nominations",
    replies: 21,
  },
  {
    initials: "BN",
    tint: "jade",
    q: "Kehlani and vulnerability as armour — production choices that shape the emotional arc",
    meta: "Beatriz Noronha · 2d ago · Music Club",
    replies: 7,
  },
];

export type CommissionCat = "Photo" | "Music" | "Writing" | "Design" | "Film";

export interface Commission {
  cat: CommissionCat;
  catLabel: string;
  title: string;
  desc: string;
  seeking: string;
  tags: string[];
  who: { initials: string; tint: AvatarTint; name: string; role: string };
}

export const COMMISSIONS: Commission[] = [
  {
    cat: "Photo",
    catLabel: "Photography",
    title: "Portraits of Queer Elders in Mouraria",
    desc: "Documenting the queer people who have lived in this neighbourhood for 30+ years — before gentrification, before visibility. I have access and subjects. I need a writer for long-form captions and an editor who knows photo books.",
    seeking: "Looking for — Writer · Photo editor",
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
    cat: "Music",
    catLabel: "Music",
    title: "EP about growing up queer in Setúbal",
    desc: "Six songs in Portuguese, recorded live. Fully produced — looking for a cellist for two tracks, and someone with a Lisbon studio who'd let me finish the mixing session. Non-commercial, first EP, for the community.",
    seeking: "Looking for — Cellist · Studio space",
    tags: ["Portuguese", "Acoustic", "Credit offered"],
    who: { initials: "TB", tint: "jade", name: "Tomás Beto", role: "Chef" },
  },
  {
    cat: "Writing",
    catLabel: "Writing",
    title: "Translating a forgotten queer Portuguese novel into English",
    desc: "Working on an English translation of a 1987 novel no one outside Portugal has read. Looking for a co-translator who can catch what I miss in idiomatic English, and a sensitivity reader for LGBTQ+ nuance.",
    seeking: "Looking for — Co-translator (EN/PT) · Sensitivity reader",
    tags: ["Translation", "Literary fiction", "Historical"],
    who: {
      initials: "MP",
      tint: "plum",
      name: "Marta Pereira",
      role: "Writer",
    },
  },
  {
    cat: "Design",
    catLabel: "Design",
    title: "Zine on queer housing discrimination in Lisbon",
    desc: "Combining collected testimonials (anonymised) with data visualisation. Need an illustrator and a typesetter — this will be printed and distributed at community spaces across the city.",
    seeking: "Looking for — Illustrator · Typesetter",
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
  feat?: boolean;
}

export const GALLERY: GalleryItem[] = [
  {
    emoji: FiDroplet,
    gradient:
      "linear-gradient(135deg,rgba(var(--plum-rgb),.18),rgba(var(--accent-rgb),.14))",
    title: "Corpo Estranho, 2024",
    artist: "Inês Tavares · Mixed media",
    feat: true,
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
  curatorLabel: string;
  curatorTitle: ReactNode;
  curatedBy: string;
  quote: string;
  now: { track: string; artist: string; progress: number; time: string };
  queue: { n: number; track: string; artist: string; dur: string }[];
}

export const RADIO: RadioData = {
  curatorLabel: "This week's curator",
  curatorTitle: (
    <>
      A noite que ficou <em>em Lisboa</em>
    </>
  ),
  curatedBy: "curated by Beatriz Noronha",
  quote:
    '"Songs for 2am in Príncipe Real. Songs that sound like staying when you thought you\'d leave. Play loud or barely at all."',
  now: {
    track: "Cais do Sodré",
    artist: "Surma · Uó (2022)",
    progress: 38,
    time: "2:14 / 3:47",
  },
  queue: [
    { n: 1, track: "Tejo", artist: "Dino d'Santiago", dur: "4:02" },
    { n: 2, track: "Corre", artist: "Blaya", dur: "3:28" },
    { n: 3, track: "Sem Chão", artist: "Mariza", dur: "5:11" },
  ],
};
