import { getMember } from "../members/data/members";

const INVITER = getMember("ines")!;
const INVITER_NAME = `${INVITER.first} ${INVITER.last}`;

/** The mock inviter, shown when the page is reached without an invite in flight. */
export const FALLBACK_INVITER = {
  name: INVITER_NAME,
  initials: INVITER.initials,
  photo: INVITER.photo,
};

export type Visibility = "open" | "network" | "private";

export const PRONOUNS = [
  "he/him",
  "she/her",
  "they/them",
  "she/they",
  "he/they",
];

export const STRENGTH_LABELS = [
  "At least 10 characters",
  "Weak",
  "Fair",
  "Good",
  "Strong",
];
export const STRENGTH_COLORS = [
  "var(--ink-40)",
  "var(--accent-ink)",
  "var(--amber)",
  "var(--jade)",
  "var(--jade)",
];
export const PW_MIN = 10;

export function passwordScore(value: string): number {
  let score = 0;
  if (value.length >= 10) score++;
  if (value.length >= 14) score++;
  if (/[0-9]/.test(value) || /[^a-zA-Z0-9]/.test(value)) score++;
  if (value.length >= 18) score++;
  return Math.min(score, 4);
}

export const VIS_OPTS = [
  {
    value: "open",
    label: "Visible to all members",
    sub: "Your profile appears in the member directory",
  },
  {
    value: "network",
    label: "Visible to connections only",
    sub: "Only people you've connected with can see your full profile",
  },
  {
    value: "private",
    label: "Private",
    sub: "Your profile is hidden; you can still browse and join gatherings",
  },
] as const;
