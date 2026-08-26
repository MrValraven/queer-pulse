import type { ReasonCode } from "../safety/reportReasons";

/**
 * Persona-specific report reasons for `SubprofileReportModal`, keeping the
 * design prototype's own wording rather than the generic
 * `SUBJECT_REASONS.subprofile` labels the `ReportSubjectControl` ->
 * `ReportListingModal` path renders.
 *
 * Each option maps to a stable, existing `ReasonCode` so the report lands in
 * the same `/reports` taxonomy moderators already triage. Every code here is
 * drawn from `SUBJECT_REASONS.subprofile` (`harassment` / `discrimination` /
 * `impersonation` / `spam` / `other`). `housing_scam` (a housing/listing
 * concept) does not validate for a `subprofile` subject, so `notReal` falls
 * back to `other`, as do the two options with no dedicated code
 * (`sexualContent` / `somethingElse`). The submitting component always folds
 * the chosen option's own label into the report's `detail`, so a moderator
 * still sees the persona-specific wording where the stored code collides.
 *
 * This list had DRIFTED from the taxonomy: it offered no `discrimination`
 * option at all, so a persona that demeans people or misgenders them could
 * only be filed as "Something else", which derives Low severity and a
 * seven-day response where `discrimination` derives Medium and three days.
 * Three of the six options collapsed onto `other`.
 * `subprofileReportModal.test.ts` now compares this list to the taxonomy,
 * which is the check that would have caught it.
 *
 * ORDER is severity-descending, because a list like this is scanned rather
 * than read: `harassment` (High, 24 hours) first, then `discrimination` and
 * `impersonation` (Medium, three days), then the `other`-backed persona
 * specifics and `spam`, with `somethingElse` last so it stays the fallback
 * instead of an early exit. Nothing here is preselected, so the top of the
 * list is a scan anchor and never a silent default the reporter sends by
 * accident.
 */
export interface PersonaReportReason {
  /** Stable local key: radio group value + i18n key suffix. */
  key: string;
  reasonCode: ReasonCode;
  labelKey: string;
}

export const PERSONA_REPORT_REASONS: PersonaReportReason[] = [
  {
    key: "hateOrHarassment",
    reasonCode: "harassment",
    labelKey: "subprofiles:reportModal.reasons.hateOrHarassment",
  },
  {
    key: "discrimination",
    reasonCode: "discrimination",
    labelKey: "subprofiles:reportModal.reasons.discrimination",
  },
  {
    key: "impersonating",
    reasonCode: "impersonation",
    labelKey: "subprofiles:reportModal.reasons.impersonating",
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
