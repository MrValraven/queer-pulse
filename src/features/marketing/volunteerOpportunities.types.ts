import { type ReactNode } from "react";
import type { Cause } from "./api/volunteering.api";

export type VolunteerCommit = "low" | "medium";

export interface TeamMember {
  initials: string;
  background: string;
  color: string;
  name: string;
  /** Undefined for mock/demo team members (the prototype pool has no real
   *  member records) — live data always carries it, sourced from the
   *  detail DTO's `MemberRefDTO`. */
  slug?: string;
}

export interface VolunteerOpportunity {
  slug: string;
  /* ---- card (Volunteer listing) ---- */
  org: string;
  /** The badge's text mark: a linked partner's `logo`, else initials from
   *  `org`. The card shows `community.avatarUrl` in its place when set. */
  avatar: string;
  background: string;
  color: string;
  role: string;
  /** One to three, in the order the poster picked them. `causes[0]` is the one
   *  the card leads with and takes `background`/`color` from. Labels come from
   *  `causes.data.ts` at render time, which is why these are wire values and
   *  not display strings. */
  causes: Cause[];
  commit: VolunteerCommit;
  time: string;
  location: string;
  skills: string[];
  description: string;
  /* ---- detail header ---- */
  /** Nodes, so the live adapter can hand over chrome that translates at
   *  render (`volunteerChrome.tsx`, DES-422) beside the demo's authored copy;
   *  the same holds for the `label`s below. */
  eyebrow: ReactNode;
  urgent: ReactNode;
  titleLead: string;
  titleEm: string;
  sub: ReactNode;
  stats: { value: ReactNode; label: ReactNode }[];
  /* ---- detail body ---- */
  why: ReactNode[];
  tasks: { title: string; description: string }[];
  commitments: { b: string; s: string }[];
  goodFor: ReactNode[];
  teamIntro: string;
  team: TeamMember[];
  /* ---- apply sidebar ---- */
  applyRole: string;
  spotsFilled: string;
  spotsPct: number;
  spots: { label: ReactNode; value: ReactNode }[];
  applyConfirm: ReactNode;
  /* ---- partner card (optional) ---- */
  /** `slug`, when present (live mode), links the card to the partner's page;
   *  mock data omits it, so the card falls back to the generic partners hub. */
  partner: { name: string; text: ReactNode; slug?: string } | null;
  /* ---- community card (optional; mutually exclusive with `partner` in
   *  practice, as `OrganizationField` explains) ---- */
  community: { name: string; slug?: string; avatarUrl?: string | null } | null;
}

export const C = "var(--accent-ink)";
export const J = "var(--jade)";
// `--text-strong` and a `--line-rgb` wash flip with the theme; plain plum
// initials on a plum wash vanished on a dark card. The coral and jade pairs
// already read on both.
export const P = "var(--text-strong)";

export const TEAM_POOL: TeamMember[] = [
  {
    initials: "CV",
    background: "rgba(var(--accent-rgb),.14)",
    color: C,
    name: "Catarina V.",
  },
  {
    initials: "JF",
    background: "rgba(var(--jade-rgb),.16)",
    color: J,
    name: "Jonas F.",
  },
  {
    initials: "NA",
    background: "rgba(var(--line-rgb),.10)",
    color: P,
    name: "Nuno A.",
  },
  {
    initials: "RV",
    background: "rgba(var(--accent-rgb),.14)",
    color: C,
    name: "Rita V.",
  },
  {
    initials: "AK",
    background: "rgba(var(--jade-rgb),.16)",
    color: J,
    name: "Anika K.",
  },
  {
    initials: "SC",
    background: "rgba(var(--line-rgb),.10)",
    color: P,
    name: "Sofia C.",
  },
];
