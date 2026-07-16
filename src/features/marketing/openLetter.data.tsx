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

/** The three concrete asks in the letter body — keys resolved via t(). */
export const ASKS: { leadKey: string; bodyKey: string }[] = [
  {
    leadKey: "marketing:openLetter.body.ask1.lead",
    bodyKey: "marketing:openLetter.body.ask1.body",
  },
  {
    leadKey: "marketing:openLetter.body.ask2.lead",
    bodyKey: "marketing:openLetter.body.ask2.body",
  },
  {
    leadKey: "marketing:openLetter.body.ask3.lead",
    bodyKey: "marketing:openLetter.body.ask3.body",
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

/** Visibility options in the sign form — labelKey resolves via t(); value is
 *  the stable canonical id stored in form state. */
export const VISIBILITY_OPTIONS = [
  { value: "full", labelKey: "marketing:openLetter.visibility.full" },
  { value: "initials", labelKey: "marketing:openLetter.visibility.initials" },
  { value: "anon", labelKey: "marketing:openLetter.visibility.anon" },
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
