import type { ReasonCode } from "../safety/reportReasons";

/**
 * The reason options `ReportEventModal` renders, mapped to the shared reason
 * taxonomy (`safety/reportReasons.ts`, `SUBJECT_REASONS.event`, which mirrors
 * the backend's `reason-catalogue.ts` exactly). The human labels stay
 * localized in the `myevents` catalog; only the stable `code` is sent to
 * `POST /reports`.
 *
 * Lifted out of the component so `reportEventModal.test.ts` can compare it to
 * the taxonomy without the component file exporting a non-component, exactly
 * as `safety/reportCategories.ts` was extracted from `ReportPage`.
 *
 * This list had DRIFTED from the taxonomy: it offered `hate_speech`,
 * `venue_safety`, `spam`, `off_topic` and `other`, and was missing both
 * `harassment` and `discrimination`. A discriminatory gathering could
 * therefore only be filed as "Something else", which derives Low severity and
 * a seven-day response where `discrimination` derives Medium and three days,
 * and a gathering where someone was being targeted could at best be filed
 * under the old "Hate speech or harassment" label, which stores `hate_speech`
 * (Medium, three days) in place of `harassment` (High, 24 hours). On a
 * platform whose gatherings are the point, a gathering that discriminates is
 * close to the central thing a member would want to report.
 *
 * ORDER is severity-descending, because a list like this is scanned rather
 * than read and a member in a bad moment should meet the words for the worst
 * thing first: `harassment` and `venue_safety` (High, 24 hours), then
 * `hate_speech` and `discrimination` (Medium, three days), then the
 * housekeeping codes, with `other` last so it stays the fallback instead of
 * an early exit. `harassment` leads its severity band because it is the code
 * the old label absorbed and so the one a reporter is most likely to be
 * looking for here.
 */
export interface EventReportReason {
  /** i18n key for the visible label. */
  key: string;
  /** Stable, server-owned code stored on the report. */
  code: ReasonCode;
}

export const EVENT_REPORT_REASONS: EventReportReason[] = [
  { key: "myevents:reportModal.reason.harassment", code: "harassment" },
  { key: "myevents:reportModal.reason.unsafe", code: "venue_safety" },
  { key: "myevents:reportModal.reason.hate", code: "hate_speech" },
  {
    key: "myevents:reportModal.reason.discrimination",
    code: "discrimination",
  },
  { key: "myevents:reportModal.reason.spam", code: "spam" },
  { key: "myevents:reportModal.reason.shouldntBeHere", code: "off_topic" },
  { key: "myevents:reportModal.reason.somethingElse", code: "other" },
];
