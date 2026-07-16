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

export const WORK_SKILLS_KEYS = [
  "economy:workProfile.skill.branding",
  "economy:workProfile.skill.backend",
  "economy:workProfile.skill.fundraising",
  "economy:workProfile.skill.photography",
  "economy:workProfile.skill.copywriting",
  "economy:workProfile.skill.product",
];

export const FOCUS_AREAS_KEYS = [
  "economy:workProfile.focus.careerDirection",
  "economy:workProfile.focus.comingOut",
  "economy:workProfile.focus.creativePractice",
  "economy:workProfile.focus.startingBusiness",
  "economy:workProfile.focus.difficultWorkplace",
  "economy:workProfile.focus.mentalHealth",
];
