/**
 * Anonymous rate-transparency board — mock seed + types.
 *
 * Members anonymously share day rates by role/experience. Nothing here is
 * verified — it's community-reported, stored on-device, and shareable via
 * JSON import/export. See RB_DISCLAIMER below.
 */

export type Experience = "junior" | "mid" | "senior" | "lead";
export type RateType = "freelance" | "employed";

export interface RateEntry {
  id: string;
  role: string;
  experience: Experience;
  /** Day rate in euros (gross). */
  dayRate: number;
  type: RateType;
}

export const EXPERIENCE_OPTIONS: { value: Experience; label: string }[] = [
  { value: "junior", label: "Junior (0–2 yrs)" },
  { value: "mid", label: "Mid (3–5 yrs)" },
  { value: "senior", label: "Senior (6–9 yrs)" },
  { value: "lead", label: "Lead (10+ yrs)" },
];

export const TYPE_OPTIONS: { value: RateType; label: string }[] = [
  { value: "freelance", label: "Freelance" },
  { value: "employed", label: "Employed (day equivalent)" },
];

export const ROLE_OPTIONS: string[] = [
  "Designer",
  "Software Engineer",
  "Writer",
  "Photographer",
  "Consultant",
  "Other",
];

/** Shown wherever community-reported figures appear. Not verified, not advice. */
export const RB_DISCLAIMER =
  "Shared anonymously by community members and not verified — figures are " +
  "self-reported and individual situations differ. Treat this as a starting " +
  "point for the conversation, not a guarantee. Saved on this device only.";

/** Collision-resistant enough for a local prototype. */
export const newRateId = () =>
  "rb_" +
  Date.now().toString(36) +
  "_" +
  Math.random().toString(36).slice(2, 8);

/** ~8 realistic anonymous entries so the distribution reads well on first view. */
export const SEED: RateEntry[] = [
  {
    id: "rb_seed_1",
    role: "Designer",
    experience: "mid",
    dayRate: 320,
    type: "freelance",
  },
  {
    id: "rb_seed_2",
    role: "Designer",
    experience: "senior",
    dayRate: 480,
    type: "freelance",
  },
  {
    id: "rb_seed_3",
    role: "Software Engineer",
    experience: "senior",
    dayRate: 560,
    type: "freelance",
  },
  {
    id: "rb_seed_4",
    role: "Software Engineer",
    experience: "lead",
    dayRate: 700,
    type: "employed",
  },
  {
    id: "rb_seed_5",
    role: "Writer",
    experience: "mid",
    dayRate: 240,
    type: "freelance",
  },
  {
    id: "rb_seed_6",
    role: "Photographer",
    experience: "senior",
    dayRate: 420,
    type: "freelance",
  },
  {
    id: "rb_seed_7",
    role: "Consultant",
    experience: "lead",
    dayRate: 850,
    type: "freelance",
  },
  {
    id: "rb_seed_8",
    role: "Designer",
    experience: "junior",
    dayRate: 180,
    type: "employed",
  },
];
