import type { SubprofileView } from "./api/subprofiles.adapters";

/**
 * The completeness requirements an unlinked persona must meet to publish, in the
 * order they're shown. Each requirement maps the exact contract-C5 unmet codes
 * that fail it (`codes`) to friendly, second-person copy, plus the reassuring
 * line shown once it's met (`met`). The live 422 body / demo check returns those
 * same codes, so the checklist reads them straight through.
 *
 * i18n Pattern A: `titleKey`/`metKey`/`failKey` hold catalog keys, resolved by
 * `PublishChecklist.tsx` via `t()`. `codes` are fixed contract-C5 identifiers,
 * never displayed directly, so they stay as plain English ids.
 */
export interface PublishRequirement {
  key: string;
  titleKey: string;
  /** Catalog key for the copy shown when this requirement is satisfied. */
  metKey: string;
  /** Contract-C5 codes that fail this requirement. */
  codes: string[];
  /** Per-code catalog key shown when the requirement isn't met yet. */
  failKey: Record<string, string>;
}

export const PUBLISH_REQUIREMENTS: PublishRequirement[] = [
  {
    key: "handle",
    titleKey: "subprofiles:checklist.reqHandleTitle",
    metKey: "subprofiles:checklist.reqHandleMet",
    codes: ["handle_invalid", "handle_taken", "handle_reserved"],
    failKey: {
      handle_invalid: "subprofiles:checklist.reqHandleFailInvalid",
      handle_taken: "subprofiles:checklist.reqHandleFailTaken",
      handle_reserved: "subprofiles:checklist.reqHandleFailReserved",
    },
  },
  {
    key: "avatar",
    titleKey: "subprofiles:checklist.reqAvatarTitle",
    metKey: "subprofiles:checklist.reqAvatarMet",
    codes: ["avatar_missing"],
    failKey: {
      avatar_missing: "subprofiles:checklist.reqAvatarFail",
    },
  },
  {
    key: "bio",
    titleKey: "subprofiles:checklist.reqBioTitle",
    metKey: "subprofiles:checklist.reqBioMet",
    codes: ["bio_too_short"],
    failKey: {
      bio_too_short: "subprofiles:checklist.reqBioFail",
    },
  },
  {
    key: "items",
    titleKey: "subprofiles:checklist.reqItemsTitle",
    metKey: "subprofiles:checklist.reqItemsMet",
    codes: ["not_enough_items"],
    failKey: {
      not_enough_items: "subprofiles:checklist.reqItemsFail",
    },
  },
  {
    key: "language",
    titleKey: "subprofiles:checklist.reqLanguageTitle",
    metKey: "subprofiles:checklist.reqLanguageMet",
    codes: ["blocked_terms"],
    failKey: {
      blocked_terms: "subprofiles:checklist.reqLanguageFail",
    },
  },
];

/**
 * Optional "polish" nudges — never gate publishing, carry no contract-C5 `unmet`
 * code, and never touch the backend. Each is derived client-side straight off
 * the loaded `SubprofileView` so the polish list can render instantly alongside
 * the (separate, blocking) `PUBLISH_REQUIREMENTS` checklist above.
 */
export interface PolishNudge {
  key: string;
  titleKey: string;
  /** True once this nudge is satisfied and should drop out of the list. */
  isSatisfied: (subprofile: SubprofileView) => boolean;
}

export const POLISH_NUDGES: PolishNudge[] = [
  {
    key: "cover",
    titleKey: "subprofiles:checklist.polishCover",
    isSatisfied: (subprofile) => Boolean(subprofile.coverUrl),
  },
  {
    key: "socials",
    titleKey: "subprofiles:checklist.polishSocials",
    isSatisfied: (subprofile) => subprofile.socialLinks.length > 0,
  },
  {
    key: "availability",
    titleKey: "subprofiles:checklist.polishAvailability",
    isSatisfied: (subprofile) => Boolean(subprofile.availability),
  },
];
