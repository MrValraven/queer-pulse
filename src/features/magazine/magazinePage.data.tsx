import type { ReactNode } from "react";
import type { AvatarTint } from "../../shared/components/ui/Avatar";
import { MEMBERS, memberName } from "../members/data/members";

export interface Card {
  id: string;
  kicker: string;
  title: ReactNode;
  excerpt: string;
  author: string;
  meta: string;
  initials: string;
  tint: AvatarTint;
  verdict?: "essential" | "recommended";
  imgDesc: string;
  src?: string;
}

const FEATURE_IMG1 =
  "https://plus.unsplash.com/premium_photo-1714047511079-7fe82a6080b4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const FEATURE_IMG2 =
  "https://images.unsplash.com/photo-1572224384995-f9529873f379?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const FEATURE_IMG3 =
  "https://plus.unsplash.com/premium_photo-1697730015743-cdac31fb9337?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const INTERVIEW_IMG1 =
  "https://images.unsplash.com/photo-1637348318881-03b4c930a723?q=80&w=600&auto=format&fit=crop";
const INTERVIEW_IMG2 =
  "https://images.unsplash.com/photo-1545732868-0d48f805c440?q=80&w=800&auto=format&fit=crop";
const INTERVIEW_IMG3 =
  "https://images.unsplash.com/photo-1553150858-ad6fda08b9e3?q=80&w=800&auto=format&fit=crop";

const REVIEW_IMG1 =
  "https://images.unsplash.com/photo-1557247311-67fb597462bf?q=80&w=800&auto=format&fit=crop";
const REVIEW_IMG2 =
  "https://images.unsplash.com/photo-1562861039-ce20a5fb38a4?q=80&w=800&auto=format&fit=crop";
const REVIEW_IMG3 =
  "https://images.unsplash.com/photo-1581906970826-b179d8d01d56?q=80&w=800&auto=format&fit=crop";

const COMMUNITY_IMG1 =
  "https://images.unsplash.com/photo-1583853448792-13103c3af99e?q=80&w=800&auto=format&fit=crop";
const COMMUNITY_IMG2 =
  "https://images.unsplash.com/photo-1590400146548-7b04a418108e?q=80&w=800&auto=format&fit=crop";
const COMMUNITY_IMG3 =
  "https://images.unsplash.com/photo-1600718818756-3f73a7d52f4f?q=80&w=800&auto=format&fit=crop";

export interface ArchiveIssue {
  title: string;
  /** Held as a `Date` so the component formats it through `useFormat()`. */
  date: Date;
  issueNumber: number;
  articleCount: number;
  background: string;
}

export interface Letter {
  body: string;
  from: string;
}

/** Promo data for the interactive slide deck, surfaced as a discovery block
 * on the magazine front. Mirrors the example deck's own surface fields
 * (`src/features/magazine/data/decks.mock.tsx`, id "ten-years-mouraria") so
 * the promo stays consistent with the deck it links to. */
export const FEATURED_DECK: {
  id: string;
  title: ReactNode;
  byline: string;
  readTime: string;
  cover: string;
  coverDesc: string;
  excerpt: string;
} = {
  id: "ten-years-mouraria",
  title: (
    <>
      Ten years in Mouraria,
      <br />
      <em>slide by slide</em>
    </>
  ),
  byline: memberName("ines"),
  readTime: "7 slides · 4 min",
  cover:
    "https://images.unsplash.com/photo-1601977078202-8825cd23ddf3?q=80&w=1000&auto=format&fit=crop",
  coverDesc:
    "Narrow street in Mouraria, late afternoon light, laundry lines overhead",
  excerpt:
    "Seven of them met at a language exchange in 2016. This is what the next ten years did to a chosen family — one slide at a time.",
};

export const FEATURES: Card[] = [
  {
    id: "mouraria-family",
    kicker: "Community",
    title: "Mouraria's chosen family, ten years later",
    excerpt:
      "The original group is scattered. Some left Lisbon. Two died. The rest still meet on the same corner. A decade on, what holds a chosen family together?",
    author: memberName("ines"),
    meta: "2,400 words",
    initials: MEMBERS.ines!.initials,
    tint: "jade",
    imgDesc: "Narrow street in Mouraria, afternoon light, laundry overhead",
    src: FEATURE_IMG1,
  },
  {
    id: "last-bar",
    kicker: "Nightlife",
    title: "The last queer bar in Bairro Alto that isn't trying",
    excerpt:
      "No Instagram. No theme nights. No cocktail menu. Just a room, a sound system, and forty years of the community walking through the same door.",
    author: memberName("diogo"),
    meta: "1,800 words",
    initials: MEMBERS.diogo!.initials,
    tint: "plum",
    imgDesc:
      "Low-lit bar interior at daytime, mismatched chairs, faded pride flag",
    src: FEATURE_IMG2,
  },
  {
    id: "housing-law",
    kicker: "Politics",
    title: "What the new housing law actually means for us",
    excerpt:
      "The legislation passed in April. We spoke to three housing lawyers and four community members already living its consequences.",
    author: "Mariana Costa",
    meta: "3,100 words",
    initials: "MC",
    tint: "coral",
    imgDesc: "Person reading documents at kitchen table, morning light",
    src: FEATURE_IMG3,
  },
];

export const ESSAYS: Card[] = [
  {
    id: "i-arrived",
    kicker: "Essay of the month",
    title: (
      <>
        I didn't come out.
        <br />
        <em>I arrived.</em>
      </>
    ),
    excerpt:
      "On becoming queer as arrival rather than revelation — and why the community gave me the language for the identity, not the other way around.",
    author: memberName("tomas"),
    meta: "8 min read",
    initials: MEMBERS.tomas!.initials,
    tint: "plum",
    imgDesc: "",
  },
  {
    id: "visibility-politics",
    kicker: "Essay",
    title: (
      <>
        On visibility, and <em>who it actually serves</em>
      </>
    ),
    excerpt:
      "Visibility saves lives. The data says so. But whose visibility are we building infrastructure for — and is the billboard kind ever enough?",
    author: "Rui Fernandes",
    meta: "7 min read",
    initials: "RF",
    tint: "jade",
    imgDesc: "",
  },
  {
    id: "politics-of-staying",
    kicker: "Essay",
    title: (
      <>
        The politics <em>of staying</em>
      </>
    ),
    excerpt:
      "Everyone who left had a reasonable reason. But rebuilding the informal infrastructure of a queer life is specific, slow work — and the staying was the building.",
    author: "Catarina Melo",
    meta: "6 min read",
    initials: "CM",
    tint: "coral",
    imgDesc: "",
  },
];

export const INTERVIEWS: Card[] = [
  {
    id: "kiko-neves",
    kicker: "Music",
    title: '"The audience at my worst gig taught me more than my best one"',
    excerpt:
      "Kiko Neves on improvisation, Marvila, and what it means to make queer jazz in a city that hasn't quite decided what it is yet.",
    author: memberName("sofia"),
    meta: "Interview",
    initials: MEMBERS.sofia!.initials,
    tint: "plum",
    imgDesc: "Kiko Neves at the piano in his Marvila studio",
    src: INTERVIEW_IMG1,
  },
  {
    id: "beatriz-pinto",
    kicker: "Art & Craft",
    title: "Beatriz Pinto: making things that will outlast the conversation",
    excerpt:
      "The ceramicist on slowness, the politics of functional objects, and why she hasn't installed a social media account.",
    author: memberName("ines"),
    meta: "Interview",
    initials: MEMBERS.ines!.initials,
    tint: "coral",
    imgDesc: "Beatriz Pinto's hands shaping clay in her studio",
    src: INTERVIEW_IMG2,
  },
  {
    id: "ilga-director",
    kicker: "Activism",
    title: "ILGA Portugal's new director on what the next decade requires",
    excerpt:
      "A conversation about what has changed, what hasn't, and why the movement's most important work is happening in places that aren't visible yet.",
    author: "Mariana Costa",
    meta: "2,200 words",
    initials: "MC",
    tint: "jade",
    imgDesc: "Portrait in the ILGA Portugal offices",
    src: INTERVIEW_IMG3,
  },
];

export const REVIEWS: Card[] = [
  {
    id: "review-argonauts",
    kicker: "Book",
    title: (
      <>
        <em>The Argonauts</em> — Maggie Nelson
      </>
    ),
    excerpt:
      "Rereading Nelson in Lisbon in 2026: how the most cited book in queer theory still reads like a report from the inside.",
    author: "Ana Lima",
    meta: "",
    initials: "AL",
    tint: "plum",
    verdict: "essential",
    imgDesc: "Copy of The Argonauts on a table with coffee",
    src: REVIEW_IMG1,
  },
  {
    id: "review-levante",
    kicker: "Film",
    title: (
      <>
        <em>Levante</em> dir. Lillah Halla
      </>
    ),
    excerpt:
      "A Brazilian debut about a swimmer, an institution, and the particular heroism of friendship. The best film shown in Lisbon this year.",
    author: memberName("diogo"),
    meta: "",
    initials: MEMBERS.diogo!.initials,
    tint: "plum",
    verdict: "essential",
    imgDesc: "Cinema Ideal marquee at night, wet cobblestones",
    src: REVIEW_IMG2,
  },
  {
    id: "review-sereia",
    kicker: "Venue",
    title: "Sereia, Intendente — a bar that wants to be boring",
    excerpt:
      "Six weeks old, no theme nights, no Instagram. Sereia is attempting something rare in a new queer bar: to simply be somewhere you can drink slowly and talk.",
    author: memberName("sofia"),
    meta: "",
    initials: MEMBERS.sofia!.initials,
    tint: "jade",
    verdict: "recommended",
    imgDesc: "Bar interior with old tiles, warm low lighting",
    src: REVIEW_IMG3,
  },
];

export const COMMUNITY: Card[] = [
  {
    id: "sunday-table",
    kicker: "Gathering",
    title: "The Sunday table at Esplanada do Intendente",
    excerpt:
      "Three years of eight to twenty-three people gathering every Sunday for an event that has no organiser, no invitation, and no agenda. A portrait.",
    author: memberName("ines"),
    meta: "6 min read",
    initials: MEMBERS.ines!.initials,
    tint: "jade",
    imgDesc: "Outdoor café tables in Intendente, Sunday afternoon",
    src: COMMUNITY_IMG1,
  },
  {
    id: "barter-board",
    kicker: "Economy",
    title: "How the barter board actually works",
    excerpt:
      "Legal advice for language lessons. Ceramics for photography. Therapy for dog-sitting. Eighteen months in, the barter board has become something nobody predicted.",
    author: "Mariana Costa",
    meta: "7 min read",
    initials: "MC",
    tint: "coral",
    imgDesc: "Handwritten note on a corkboard",
    src: COMMUNITY_IMG2,
  },
  {
    id: "archive-night",
    kicker: "Memory",
    title: "The Archive Night: memory as infrastructure",
    excerpt:
      "On the last Friday of each month, a room in Mouraria fills with people talking about queer Lisbon history — the kind held in boxes under beds, not institutions.",
    author: "Rui Fernandes",
    meta: "8 min read",
    initials: "RF",
    tint: "jade",
    imgDesc: "Someone holding old photographs, warm lamp light",
    src: COMMUNITY_IMG3,
  },
];

export const LETTERS: Letter[] = [
  {
    body: "The trans healthcare piece from last month was the first time I've seen the SNS process explained without someone trying to protect me from the bad parts. Knowing the waiting times in advance helped.",
    from: "— Member, 28, Intendente",
  },
  {
    body: "I started a reading group after seeing the listing on the platform. We've met four times. Two people in it have become actual friends. Not acquaintances. Friends.",
    from: "— Member, 34, Mouraria",
  },
  {
    body: "Thank you for publishing Rui's essay on burnout without making it a productivity piece. Someone finally understood what I was trying to say to people who love me and couldn't hear it.",
    from: "— Member, 41, Cais do Sodré",
  },
  {
    body: "The housing law piece should be required reading for every queer person renting in Lisbon. I've already forwarded it to four people.",
    from: "— Member, 31, Arroios",
  },
];

export const ARCHIVE: ArchiveIssue[] = [
  {
    title: "The Night We Stopped Pretending",
    date: new Date(2026, 4, 1),
    issueNumber: 17,
    articleCount: 8,
    background: "var(--plum)",
  },
  {
    title: "What Solidarity Actually Costs",
    date: new Date(2026, 3, 1),
    issueNumber: 16,
    articleCount: 7,
    background: "var(--jade)",
  },
  {
    title: "Bodies in Translation",
    date: new Date(2026, 2, 1),
    issueNumber: 15,
    articleCount: 9,
    background: "var(--accent-ink)",
  },
  {
    title: "The Queer City Guide",
    date: new Date(2026, 1, 1),
    issueNumber: 14,
    articleCount: 6,
    background: "#1E3A5F",
  },
];

/**
 * i18n Pattern A — section nav anchors. The anchor slugs are fixed English
 * strings (they must match the `id`s rendered by `MagazineSections`
 * regardless of language); only the visible label is translated.
 */
export const NAV_ITEMS: { anchor: string; labelKey: string }[] = [
  { anchor: "features", labelKey: "magazine:landing.nav.features" },
  { anchor: "essays", labelKey: "magazine:landing.nav.essays" },
  { anchor: "interviews", labelKey: "magazine:landing.nav.interviews" },
  { anchor: "reviews", labelKey: "magazine:landing.nav.reviews" },
  {
    anchor: "community-life",
    labelKey: "magazine:landing.nav.communityLife",
  },
  { anchor: "letters", labelKey: "magazine:landing.nav.letters" },
  { anchor: "archive", labelKey: "magazine:landing.nav.archive" },
];
