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

/** i18n Pattern A — labelKey resolved via t() by RateBoardForm. */
export const EXPERIENCE_OPTIONS: { value: Experience; labelKey: string }[] = [
  { value: "junior", labelKey: "economy:rateBoard.experienceOption.junior" },
  { value: "mid", labelKey: "economy:rateBoard.experienceOption.mid" },
  { value: "senior", labelKey: "economy:rateBoard.experienceOption.senior" },
  { value: "lead", labelKey: "economy:rateBoard.experienceOption.lead" },
];

export const TYPE_OPTIONS: { value: RateType; labelKey: string }[] = [
  { value: "freelance", labelKey: "economy:rateBoard.typeOption.freelance" },
  { value: "employed", labelKey: "economy:rateBoard.typeOption.employed" },
];

export const ROLE_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "Designer", labelKey: "economy:rateBoard.roleOption.designer" },
  {
    value: "Software Engineer",
    labelKey: "economy:rateBoard.roleOption.softwareEngineer",
  },
  { value: "Writer", labelKey: "economy:rateBoard.roleOption.writer" },
  {
    value: "Photographer",
    labelKey: "economy:rateBoard.roleOption.photographer",
  },
  { value: "Consultant", labelKey: "economy:rateBoard.roleOption.consultant" },
  { value: "Other", labelKey: "economy:rateBoard.roleOption.other" },
];

/** Shown wherever community-reported figures appear. Not verified, not advice. */
export const RB_DISCLAIMER_KEY = "economy:rateBoard.disclaimer";

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
