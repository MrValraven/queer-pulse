import { type ReactNode } from "react";

export type VolunteerCause = "Rights" | "Health" | "Youth" | "Housing" | "Arts";
export type VolunteerCommit = "low" | "medium";

export interface TeamMember {
  initials: string;
  bg: string;
  color: string;
  name: string;
}

export interface VolunteerOpportunity {
  slug: string;
  /* ---- card (Volunteer listing) ---- */
  org: string;
  av: string;
  bg: string;
  color: string;
  role: string;
  cause: VolunteerCause;
  commit: VolunteerCommit;
  time: string;
  location: string;
  skills: string[];
  desc: string;
  /* ---- detail header ---- */
  eyebrow: string;
  urgent: string;
  titleLead: string;
  titleEm: string;
  sub: ReactNode;
  stats: { value: ReactNode; label: string }[];
  /* ---- detail body ---- */
  why: ReactNode[];
  tasks: { title: string; desc: string }[];
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
  partner: { name: string; text: ReactNode } | null;
}

export const C = "var(--accent-ink)";
export const J = "var(--jade)";
export const P = "var(--plum)";

export const TEAM_POOL: TeamMember[] = [
  {
    initials: "CV",
    bg: "rgba(var(--accent-rgb),.14)",
    color: C,
    name: "Catarina V.",
  },
  {
    initials: "JF",
    bg: "rgba(var(--jade-rgb),.16)",
    color: J,
    name: "Jonas F.",
  },
  { initials: "NA", bg: "rgba(45,27,61,.10)", color: P, name: "Nuno A." },
  {
    initials: "RV",
    bg: "rgba(var(--accent-rgb),.14)",
    color: C,
    name: "Rita V.",
  },
  {
    initials: "AK",
    bg: "rgba(var(--jade-rgb),.16)",
    color: J,
    name: "Anika K.",
  },
  { initials: "SC", bg: "rgba(45,27,61,.10)", color: P, name: "Sofia C." },
];
