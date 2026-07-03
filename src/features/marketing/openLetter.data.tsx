import type { ReactNode } from "react";

/** Campaign meta shown in the hero. */
export const OPEN_LETTER = {
  partners: "Trans Hub + ILGA + QueerPulse",
  daysLeft: 11,
  title: (
    <>
      Make trans-affirming care <em>portable</em> across the SNS.
    </>
  ),
  addressedTo: "Ministério da Saúde · Direção-Geral da Saúde",
  date: "1 July 2026",
  startCount: 2847,
  goal: 5000,
  lastSigned: { at: "14 minutes ago", by: "Filipa L." },
  handoverNote: "we hand-deliver at 5,000 · co-signed by ILGA & 4 NGOs",
};

/** The three concrete asks in the letter body. */
export const ASKS: { lead: string; body: ReactNode }[] = [
  {
    lead: "A national HRT prescription registry",
    body: ", opt-in and clinician-only, accessible to any SNS-affiliated GP a patient consents to. Same model as the diabetes care registry adopted in 2019.",
  },
  {
    lead: 'A 14-day "continuity script" rule',
    body: " — when a patient moves regions, their new GP may issue a 90-day script bridging to a full review, without requiring a fresh diagnostic process.",
  },
  {
    lead: "Inclusion of trans-affirming care in the standard GP onboarding module",
    body: " — mandatory, four hours, drafted in collaboration with WPATH-certified Portuguese clinicians.",
  },
];

/** The people who authored / lead-signed the letter. */
export const SIGNATORIES = [
  {
    av: "CV",
    tint: "accent" as const,
    name: "Catarina Vaz",
    role: "Trans Hub coordinator · co-treasurer · QueerPulse",
  },
  {
    av: "FM",
    tint: "jade" as const,
    name: "Filipa Mendes",
    role: "Executive Director · ILGA Portugal",
  },
];

/** Visibility options in the sign form. */
export const VISIBILITY_OPTIONS = [
  { value: "full", label: "Full name · public" },
  { value: "initials", label: "Initials only" },
  { value: "anon", label: 'Anonymous · "A member"' },
];

export type SignatureTint = "accent" | "jade" | "plum";

export interface Signature {
  av: string;
  tint: SignatureTint;
  name: string;
  note?: string;
}

/** Seed list shown under "Recent signatures". */
export const RECENT_SIGNATURES: Signature[] = [
  {
    av: "FL",
    tint: "accent",
    name: "Filipa Lopes",
    note: "I've moved cities three times. Each time, I lost six months.",
  },
  {
    av: "AK",
    tint: "jade",
    name: "Anika Kovač",
    note: "As someone who runs the Thursday clinic — yes.",
  },
  {
    av: "RV",
    tint: "plum",
    name: "Rita Vasquez",
    note: "My clients live this every week.",
  },
  { av: "JF", tint: "accent", name: "Jonas Ferreira" },
  { av: "SC", tint: "accent", name: "Sofia Castaño" },
];

/** The signed-in member (mock) doing the signing. */
export const CURRENT_MEMBER = { name: "Tomás Mendes", pronouns: "he/him" };
