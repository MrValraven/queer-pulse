/**
 * The stable identifiers the Transparency Report endpoint sends, in the order
 * the page renders them.
 *
 * The backend already sends its rows in a fixed order, so these lists are the
 * page's ALLOW-LIST rather than its sort: a key the catalogue has no label for
 * is dropped from the table instead of printed raw. A published governing
 * document showing `space_safety` to a reader would undo the credibility the
 * page exists to build, and it is a visible prompt to add the missing label.
 *
 * Each list mirrors a closed, server-owned vocabulary:
 * `TransparencyReasonCategory`, `MOD_ACTION_CODES`, and `AppealStatus`.
 */

export const REASON_CATEGORY_KEYS = [
  "privacy",
  "harassment",
  "impersonation",
  "spam",
  "space_safety",
  "other",
] as const;

export const ACTION_KEYS = [
  "dismiss",
  "warn",
  "hide_content",
  "remove_content",
  "restrict",
  "suspend",
  "ban",
  "escalate",
] as const;

export const APPEAL_OUTCOME_KEYS = [
  "upheld",
  "overturned",
  "awaiting",
] as const;

/**
 * The legal-request vocabularies (PRD-32), mirroring `LEGAL_REQUEST_TYPES` and
 * `LEGAL_REQUEST_OUTCOMES` in the backend's `legal-request-vocabulary.ts`, in
 * the same fixed order the endpoint sends them. The backend lists every bucket
 * even at zero, so the table's shape is never itself a signal.
 */
export const LEGAL_REQUEST_TYPE_KEYS = [
  "subpoena",
  "court_order",
  "police_request",
  "emergency_disclosure_request",
  "preservation_request",
  "takedown_demand",
  "other",
] as const;

/** Ordered worst case for the member first, matching the backend. */
export const LEGAL_REQUEST_OUTCOME_KEYS = [
  "complied_in_full",
  "complied_in_part",
  "narrowed",
  "refused",
  "withdrawn",
  "pending",
] as const;

/** The limits the report states about itself, in render order. */
export const NOT_COUNTED_KEYS = [
  "communityModeration",
  "appealTiming",
  "outsidePlatform",
  "selfReported",
] as const;
