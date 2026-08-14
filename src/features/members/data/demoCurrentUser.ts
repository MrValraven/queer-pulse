import { FiBookOpen, FiCalendar, FiMusic } from "react-icons/fi";
import type { Member } from "./members";
import { routes } from "../../../app/routeMap";

// ── The demo-mode signed-in user, standalone ────────────────────────────────
// `members.ts` builds `currentUser`/`currentUserSlug` off its full ~3,400-line
// MEMBERS registry (every seed + real member, ~120KB) just to pick out the one
// "tiago" record — but three root providers (AuthProvider, ProfileProvider,
// WorkshopsProvider) import `currentUser`/`currentUserSlug` from there and are
// ALWAYS mounted (src/app/App.tsx's RootProviders/DataProviders, never behind
// a lazy route), so that whole registry rode along in the entry chunk purely
// for this one persona. This file holds only tiago's own record — a verbatim
// copy of `MEMBERS.tiago` from members.ts — so those three providers (and any
// other always-mounted demo-identity read) never pull in the other members.
// `data/members.ts` itself is untouched and still exports the same values (for
// its own `currentUser`/`currentUserSlug`) for every already-lazy route/hook
// that reads the full registry.
//
// Keep this file's `currentUser` in sync by hand if `MEMBERS.tiago` in
// members.ts changes — there's no shared source, by design (sharing one would
// re-import the registry this file exists to avoid).

/** Slug of the currently logged-in (demo-mode) user. Mirrors `currentUserSlug`
 *  in members.ts. */
export const currentUserSlug = "tiago";

/** Email for the demo-mode logged-in user, derived from their slug — mirrors
 *  `currentUserEmail` in members.ts. */
export const currentUserEmail = `${currentUserSlug}@queerpulse.app`;

/** The demo-mode logged-in user's full profile record. A verbatim copy of
 *  `MEMBERS.tiago` in members.ts, including its registration-order `id`
 *  (21 — tiago is the 21st and last entry of `SEED_ENTRIES`, and `REAL_ENTRIES`
 *  carries no `tiago` key to shift it; recompute if that ordering ever
 *  changes). See the file-level comment above for why this is a standalone
 *  copy instead of an import off `MEMBERS`. */
export const currentUser: Member = {
  id: 21,
  slug: "tiago",
  first: "Tiago",
  last: "Costa",
  role: "Fullstack Developer",
  pronouns: "he/they",
  hood: "Arroios",
  tags: ["React - testing", "TypeScript", "Node.js", "Poetry"],
  visibility: "open",
  initials: "TC",
  tint: "jade",
  verified: true,
  since: "2025",
  photo:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
  bio: "test bio description for logged in user (tiago)",
  now: "Building things for the web, writing poetry, and organising events for the queer and non-monogamy communities in Lisbon.",
  openTo: [
    { kind: "preset", id: "collaborating" },
    { kind: "custom", label: "Community events" },
    { kind: "preset", id: "mentoring" },
  ],
  identities: ["Gay", "Bisexual", "Queer"],
  lookingFor: [
    "Community & friendship",
    "Professional networking",
    "Gatherings & events",
    "Creative collaboration",
    "Reading & culture",
  ],
  lookingForPublic: true,
  work: [
    {
      category: "Fullstack Developer",
      title:
        "Broadvoice, real-time VoIP systems (React, Node, NestJS, Apache Kafka)",
      year: "2022–2025",
      image:
        "https://plus.unsplash.com/premium_photo-1732115973557-47e5c91ba6e9?q=80&w=800&auto=format&fit=crop",
    },
    {
      category: "Fullstack Developer",
      title:
        "AAUE, Universidade de Évora, web platforms & a custom CMS (Vue, React, Node)",
      year: "2020–2022",
      image:
        "https://plus.unsplash.com/premium_photo-1737392496893-07869d657a6e?q=80&w=800&auto=format&fit=crop",
    },
    {
      category: "Poetry",
      title: "Four poems published in the Ofélia books",
      year: "2024",
      image:
        "https://plus.unsplash.com/premium_photo-1759762964086-184095920575?q=80&w=800&auto=format&fit=crop",
    },
  ],
  board: [
    {
      kind: "offering",
      title: "Web development & mentorship for community projects",
      slug: "web-dev-help",
    },
  ],
  vouchers: ["ines", "rui"],
  voucherNames: "Inês & Rui",
  related: ["rui", "ines", "andre"],
  skills: [
    { name: "Web development", meta: "Available · React, TypeScript, Node" },
    {
      name: "API design & development",
      meta: "Trade · backend & infrastructure",
    },
    { name: "DJ sets", meta: "Hot Mess Express · queer parties" },
  ],
  groups: [
    { name: "Hot Mess Express", role: "DJ duo · with Camila" },
    { name: "Queer Community Events", role: "Organiser" },
    { name: "Non-Monogamy Network", role: "Organiser" },
  ],
  activity: [
    {
      icon: FiBookOpen,
      title: "Published in the Ofélia books",
      sub: "Four poems · 2024",
      to: routes.magazine,
    },
    {
      icon: FiMusic,
      title: "DJ set as Hot Mess Express",
      sub: "Queer party · with Camila",
      to: routes.event,
    },
    {
      icon: FiCalendar,
      title: "Organised a community gathering",
      sub: "Queer + non-monogamy meetup",
      to: routes.event,
    },
  ],
  shapings: {
    film: {
      title: "Star Wars",
      note: "An odd, deep love for the lore. Worldbuilding is my favourite kind of magic.",
    },
    book: {
      title: "The Player's Handbook (D&D 5e)",
      note: "I'm a College of Lore bard: a bit of everything about everything.",
    },
    song: {
      title: "João Borsch & modinhas alentejanas",
      note: "Portuguese music, from lesser-known indie to the songs my region raised me on.",
    },
    moment: {
      title: "Seeing people safe to be themselves",
      note: "Pride parades, heavy metal concerts. I get teary knowing they'll never be alone.",
    },
  },
};
