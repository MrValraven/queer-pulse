/**
 * i18n Pattern A — all chrome (safety-critical settings copy, closed-set
 * taxonomies), so every field is a catalog key resolved by
 * WorkProfileSections.tsx via `t()`.
 */
export interface OutAtWorkOption {
  value: string;
  labelKey: string;
  descKey: string;
}

/** The out-at-work spectrum — a choice, never a binary toggle. */
export const OUT_AT_WORK: OutAtWorkOption[] = [
  {
    value: "out",
    labelKey: "economy:workProfile.outAtWork.out.label",
    descKey: "economy:workProfile.outAtWork.out.desc",
  },
  {
    value: "verified",
    labelKey: "economy:workProfile.outAtWork.verified.label",
    descKey: "economy:workProfile.outAtWork.verified.desc",
  },
  {
    value: "private",
    labelKey: "economy:workProfile.outAtWork.private.label",
    descKey: "economy:workProfile.outAtWork.private.desc",
  },
];

export interface TransSupportOption {
  id: string;
  labelKey: string;
  descKey: string;
}

/** Optional, sensitive supports — framed as care, surfaced only if wanted. */
export const TRANS_SUPPORT: TransSupportOption[] = [
  {
    id: "chosen-name",
    labelKey: "economy:workProfile.transSupport.chosenName.label",
    descKey: "economy:workProfile.transSupport.chosenName.desc",
  },
  {
    id: "hide-legal",
    labelKey: "economy:workProfile.transSupport.hideLegal.label",
    descKey: "economy:workProfile.transSupport.hideLegal.desc",
  },
  {
    id: "transition-friendly",
    labelKey: "economy:workProfile.transSupport.transitionFriendly.label",
    descKey: "economy:workProfile.transSupport.transitionFriendly.desc",
  },
];

export interface VisRow {
  fieldKey: string;
  employersKey: string;
  communityKey: string;
}

/** What employers see vs what the community sees, at a glance. */
export const VIS_MATRIX: VisRow[] = [
  {
    fieldKey: "economy:workProfile.visMatrix.nameInUse",
    employersKey: "economy:workProfile.visMatrix.visible",
    communityKey: "economy:workProfile.visMatrix.visible",
  },
  {
    fieldKey: "economy:workProfile.visMatrix.legalName",
    employersKey: "economy:workProfile.visMatrix.hidden",
    communityKey: "economy:workProfile.visMatrix.hidden",
  },
  {
    fieldKey: "economy:workProfile.visMatrix.pronouns",
    employersKey: "economy:workProfile.visMatrix.yourChoice",
    communityKey: "economy:workProfile.visMatrix.visible",
  },
  {
    fieldKey: "economy:workProfile.visMatrix.queerIdentity",
    employersKey: "economy:workProfile.visMatrix.perSettingAbove",
    communityKey: "economy:workProfile.visMatrix.visible",
  },
  {
    fieldKey: "economy:workProfile.visMatrix.skillsFocus",
    employersKey: "economy:workProfile.visMatrix.visible",
    communityKey: "economy:workProfile.visMatrix.visible",
  },
];

/**
 * A selectable chip in the skills exchange. `id` is the stable wire/storage
 * value (identical to the backend's `WORK_SKILL_IDS` / `FOCUS_AREA_IDS`);
 * `labelKey` renders the chip. Mirrors the `{ id, labelKey }` idiom of
 * `TRANS_SUPPORT` — single source of truth for its list on this side.
 */
export interface WorkTaxonomyOption {
  id: string;
  labelKey: string;
}

/** Skills a member can offer — what they're matched on as a mentor/peer. */
export const WORK_SKILLS: WorkTaxonomyOption[] = [
  { id: "branding", labelKey: "economy:workProfile.skill.branding" },
  { id: "backend", labelKey: "economy:workProfile.skill.backend" },
  { id: "fundraising", labelKey: "economy:workProfile.skill.fundraising" },
  { id: "photography", labelKey: "economy:workProfile.skill.photography" },
  { id: "copywriting", labelKey: "economy:workProfile.skill.copywriting" },
  { id: "product", labelKey: "economy:workProfile.skill.product" },
];

/** Focus areas a member wants support with — what mentors are matched against. */
export const FOCUS_AREAS: WorkTaxonomyOption[] = [
  { id: "career-direction", labelKey: "economy:workProfile.focus.careerDirection" },
  { id: "coming-out", labelKey: "economy:workProfile.focus.comingOut" },
  { id: "creative-practice", labelKey: "economy:workProfile.focus.creativePractice" },
  { id: "starting-business", labelKey: "economy:workProfile.focus.startingBusiness" },
  { id: "difficult-workplace", labelKey: "economy:workProfile.focus.difficultWorkplace" },
  { id: "mental-health", labelKey: "economy:workProfile.focus.mentalHealth" },
];

/** The closed id sets — used by the API normalizer to drop unknown wire values. */
export const WORK_SKILL_IDS = WORK_SKILLS.map((option) => option.id);
export const FOCUS_AREA_IDS = FOCUS_AREAS.map((option) => option.id);
