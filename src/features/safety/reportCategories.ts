import type { ReasonCode, ReportSubjectType } from "./reportReasons";

/**
 * The standalone form's categories, mapped to the shared reason taxonomy.
 *
 * Deliberately a UNION of two subject types, because this form has no subject
 * picker: `venue_safety` routes the report to a `venue` subject and every
 * other code to a `member` one (see {@link subjectTypeForCategory}). So it
 * must offer everything `SUBJECT_REASONS.member` offers, plus the venue codes
 * it chooses to surface. `reportCategories.test.ts` asserts the member half.
 *
 * `outing` and `doxxing` lead, and they were MISSING here. They are the only
 * two codes the backend maps to emergency severity (a 1-hour SLA and the
 * moderation queue's emergency band); the closest thing this form offered was
 * `harassment` at 24 hours, and a reporter who did not read it that way was
 * left with "Something else" at seven days. On the platform's main public
 * report form, reachable by anyone, that is the exact failure the emergency
 * band exists to prevent. Nothing may remove them from this list.
 */
export const CATEGORIES: { code: ReasonCode; labelKey: string }[] = [
  { code: "outing", labelKey: "safety:report.category.outing" },
  { code: "doxxing", labelKey: "safety:report.category.doxxing" },
  { code: "harassment", labelKey: "safety:report.category.harassment" },
  {
    code: "unwanted_contact",
    labelKey: "safety:report.category.unwantedContact",
  },
  {
    code: "impersonation",
    labelKey: "safety:report.category.impersonation",
  },
  { code: "discrimination", labelKey: "safety:report.category.discrimination" },
  { code: "venue_safety", labelKey: "safety:report.category.venueSafety" },
  { code: "other", labelKey: "safety:report.category.other" },
];

/**
 * The reported category is the only real signal about what KIND of thing a
 * report concerns: venue-safety reports are about a place, everything else
 * about a person. This is a straight read of the reporter's own choice. It
 * replaces the old heuristic that turned "contains a slash" into
 * `subjectType: "post"`.
 * Neither branch carries an id. See {@link UNLINKED_SUBJECT_ID}.
 */
export function subjectTypeForCategory(reason: ReasonCode): ReportSubjectType {
  return reason === "venue_safety" ? "venue" : "member";
}
