import { type ReactNode } from "react";

export type VolunteerCause = "Rights" | "Health" | "Youth" | "Housing" | "Arts";
export type VolunteerCommit = "low" | "medium";

export interface TeamMember {
  initials: string;
  background: string;
  color: string;
  name: string;
}

export interface VolunteerOpportunity {
  slug: string;
  /* ---- card (Volunteer listing) ---- */
  org: string;
  avatar: string;
  background: string;
  color: string;
  role: string;
  cause: VolunteerCause;
  commit: VolunteerCommit;
  time: string;
  location: string;
  skills: string[];
  description: string;
  /* ---- detail header ---- */
  eyebrow: string;
  urgent: string;
  titleLead: string;
  titleEm: string;
  sub: ReactNode;
  stats: { value: ReactNode; label: string }[];
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
  spots: { label: string; value: ReactNode }[];
  applyConfirm: ReactNode;
  /* ---- partner card (optional) ---- */
  /** `slug`, when present (live mode), links the card to the partner's page;
   *  mock data omits it, so the card falls back to the generic partners hub. */
  partner: { name: string; text: ReactNode; slug?: string } | null;
}

export const C = "var(--accent-ink)";
export const J = "var(--jade)";
export const P = "var(--plum)";

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
  { initials: "NA", background: "rgba(45,27,61,.10)", color: P, name: "Nuno A." },
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
  { initials: "SC", background: "rgba(45,27,61,.10)", color: P, name: "Sofia C." },
];
