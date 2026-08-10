import type { ReasonCode } from "../safety/reportReasons";

/**
 * Persona-specific report reasons for `SubprofileReportModal`, matching the
 * design prototype's exact wording (Impersonating / Hate or harassment / Not
 * a real practice or service / Sexual content without a warning / Spam /
 * Something else) — distinct copy from the generic `SUBJECT_REASONS.subprofile`
 * taxonomy the existing `ReportSubjectControl` → `ReportListingModal` path
 * (already wired into `SubprofileHeroActions`) renders.
 *
 * Each option still maps to a stable, existing `ReasonCode` so the report
 * lands in the same `/reports` taxonomy moderators already triage — nothing
 * new is added to `reportReasons.ts`. Every code here is drawn from
 * `SUBJECT_REASONS.subprofile` (`harassment` / `impersonation` /
 * `discrimination` / `spam` / `other`) — `housing_scam` (a housing/listing
 * concept) doesn't even validate for a `subprofile` subject, so `notReal`
 * falls back to `other` like the two options that have no dedicated code
 * (`sexualContent`/`somethingElse`). The submitting component always folds
 * the chosen option's own label into the report's `detail`, so a moderator
 * still sees the persona-specific wording even where the stored code
 * collides.
 */
export interface PersonaReportReason {
  /** Stable local key — radio group value + i18n key suffix. */
  key: string;
  reasonCode: ReasonCode;
  labelKey: string;
}

export const PERSONA_REPORT_REASONS: PersonaReportReason[] = [
  {
    key: "impersonating",
    reasonCode: "impersonation",
    labelKey: "subprofiles:reportModal.reasons.impersonating",
  },
  {
    key: "hateOrHarassment",
    reasonCode: "harassment",
    labelKey: "subprofiles:reportModal.reasons.hateOrHarassment",
  },
  {
    key: "notReal",
    reasonCode: "other",
    labelKey: "subprofiles:reportModal.reasons.notReal",
  },
  {
    key: "sexualContent",
    reasonCode: "other",
    labelKey: "subprofiles:reportModal.reasons.sexualContent",
  },
  {
    key: "spam",
    reasonCode: "spam",
    labelKey: "subprofiles:reportModal.reasons.spam",
  },
  {
    key: "somethingElse",
    reasonCode: "other",
    labelKey: "subprofiles:reportModal.reasons.somethingElse",
  },
];
