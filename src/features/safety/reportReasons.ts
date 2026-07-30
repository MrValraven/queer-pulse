/**
 * The single, shared reason taxonomy for the whole reporting → moderation loop
 * (spec 04). It replaces the four per-surface string arrays that used to live in
 * ReportPage / feed.data / ReportReplyModal / FlagModal. `reasonCode` is stable
 * and server-owned; the human labels are localized here on the client.
 *
 * In live mode the authoritative list comes from `GET /reports/reasons`
 * (see reports.api.ts + useReportReasons); this module is the demo fallback and
 * the label source both modes render.
 */

/** What can be reported. `subjectType` + `subjectId` identify the target. */
export type ReportSubjectType =
  | "member"
  | "post"
  | "reply"
  | "venue"
  | "message"
  | "community"
  | "housing"
  | "flatmate"
  | "landlord"
  | "listing"
  | "event"
  | "business"
  | "company"
  | "job"
  | "subprofile";

export type ReasonCode =
  | "outing"
  | "doxxing"
  | "harassment"
  | "hate_speech"
  | "unwanted_contact"
  | "impersonation"
  | "discrimination"
  | "spam"
  | "off_topic"
  | "venue_safety"
  | "venue_staff"
  | "venue_accessibility"
  | "housing_unsafe"
  | "housing_scam"
  | "other";

/** Stable code → human label. Labels are the only thing that gets localized. */
export const REASON_LABELS: Record<ReasonCode, string> = {
  outing: "Outing / sharing private identity without consent",
  doxxing: "Sharing personal or location data (doxxing)",
  harassment: "Targeted harassment or threats",
  hate_speech: "Hate speech or a slur",
  unwanted_contact: "Unwanted contact after being asked to stop",
  impersonation: "Misrepresentation or impersonation",
  discrimination: "Discrimination or misgendering",
  spam: "Spam or self-promotion",
  off_topic: "Off-topic or disruptive",
  venue_safety: "A harassment or safety incident at the space",
  venue_staff: "Staff didn't intervene when needed",
  venue_accessibility: "An accessibility problem",
  housing_unsafe: "Unsafe, discriminatory, or misrepresented housing",
  housing_scam: "Scam or fake listing",
  other: "Something else — explained in detail",
};

/**
 * Stable code → catalog key. `reasonCode` is the value that gets stored on the
 * report (server-owned, stable across languages) — never the translated label.
 * `ReportPage.tsx` and `FlagModal.tsx` (the two in-namespace consumers) resolve
 * these with `t()` at render time instead of reading `REASON_LABELS` directly.
 * `REASON_LABELS` itself is left untouched: `forum`/`feed`/`admin` (outside this
 * sweep's scope) still depend on its plain-English shape.
 */
export const REASON_LABEL_KEYS: Record<ReasonCode, string> = {
  outing: "safety:reason.outing",
  doxxing: "safety:reason.doxxing",
  harassment: "safety:reason.harassment",
  hate_speech: "safety:reason.hateSpeech",
  unwanted_contact: "safety:reason.unwantedContact",
  impersonation: "safety:reason.impersonation",
  discrimination: "safety:reason.discrimination",
  spam: "safety:reason.spam",
  off_topic: "safety:reason.offTopic",
  venue_safety: "safety:reason.venueSafety",
  venue_staff: "safety:reason.venueStaff",
  venue_accessibility: "safety:reason.venueAccessibility",
  housing_unsafe: "safety:reason.housingUnsafe",
  housing_scam: "safety:reason.housingScam",
  other: "safety:reason.other",
};

/**
 * Which reason codes are offered per subject type. Every subject also gets
 * `other`. Emergency severity (outing / doxxing / threat) is derived
 * server-side — the reporter never chooses it.
 */
export const SUBJECT_REASONS: Record<ReportSubjectType, ReasonCode[]> = {
  member: [
    "outing",
    "doxxing",
    "harassment",
    "unwanted_contact",
    "impersonation",
    "discrimination",
    "other",
  ],
  post: [
    "outing",
    "doxxing",
    "harassment",
    "hate_speech",
    "discrimination",
    "spam",
    "off_topic",
    "other",
  ],
  reply: [
    "outing",
    "doxxing",
    "harassment",
    "hate_speech",
    "discrimination",
    "spam",
    "off_topic",
    "other",
  ],
  venue: [
    "venue_safety",
    "discrimination",
    "venue_staff",
    "venue_accessibility",
    "other",
  ],
  message: [
    "outing",
    "doxxing",
    "harassment",
    "hate_speech",
    "unwanted_contact",
    "spam",
    "other",
  ],
  community: ["hate_speech", "spam", "other"],
  housing: [
    "housing_unsafe",
    "harassment",
    "discrimination",
    "housing_scam",
    "other",
  ],
  flatmate: [
    "harassment",
    "discrimination",
    "impersonation",
    "unwanted_contact",
    "other",
  ],
  landlord: [
    "discrimination",
    "harassment",
    "impersonation",
    "spam",
    "other",
  ],
  // Business-directory listing (`src/features/marketing/listBusiness`), mirrors
  // the backend's `ReportSubjectType.Listing` reason set exactly — no new
  // codes: `housing_scam`'s "Scam or fake listing" label covers a listing
  // that doesn't exist / is fraudulent, `spam` covers self-promotion abuse,
  // `venue_safety` covers a safety incident at the business, `discrimination`
  // covers discriminatory or otherwise inappropriate content/practices, and
  // `other` (with free-text detail) covers inaccurate/outdated info.
  listing: [
    "housing_scam",
    "spam",
    "venue_safety",
    "discrimination",
    "other",
  ],
  // An event (`src/features/myevents` report-an-event flow). No new codes:
  // `hate_speech` and `harassment` cover an abusive/threatening event or
  // its promotion, `discrimination` covers an exclusionary event, `spam`
  // covers self-promotion abuse, `venue_safety` covers a harassment or
  // safety incident at the gathering, `off_topic` covers "this shouldn't be
  // here", and `other` (free-text detail) covers anything else. Mirrors the
  // backend `ReportSubjectType.Event` reason set exactly.
  event: [
    "hate_speech",
    "harassment",
    "discrimination",
    "venue_safety",
    "spam",
    "off_topic",
    "other",
  ],
  // A business-directory business/company/job posting (`src/features/economy`).
  // Same shape as `listing` — `housing_scam`'s "Scam or fake listing" label
  // covers a fake/fraudulent business, `spam` covers self-promotion abuse,
  // `venue_safety` covers a safety incident, `discrimination` covers
  // discriminatory content/practices, and `other` covers inaccurate info.
  business: [
    "housing_scam",
    "spam",
    "venue_safety",
    "discrimination",
    "other",
  ],
  // An employer/company profile. `housing_scam` ("Scam or fake listing")
  // covers a fake company, `discrimination` a discriminatory employer,
  // `harassment` targeted abuse, `spam` self-promotion abuse, `other` else.
  company: [
    "housing_scam",
    "discrimination",
    "harassment",
    "spam",
    "other",
  ],
  // A job posting. `housing_scam` ("Scam or fake listing") covers a fake/
  // fraudulent job, `spam` self-promotion abuse, `discrimination` a
  // discriminatory ad, `harassment` targeted abuse, `other` anything else.
  job: [
    "housing_scam",
    "spam",
    "discrimination",
    "harassment",
    "other",
  ],
  // A member subprofile / persona (`src/features/subprofiles`). Person-shaped
  // like `member`/`flatmate`: `harassment`, `impersonation` (a persona
  // impersonating someone), `discrimination`, `spam`, and `other`.
  subprofile: [
    "harassment",
    "impersonation",
    "discrimination",
    "spam",
    "other",
  ],
};

export interface ReasonOption {
  code: ReasonCode;
  label: string;
}

/** The reason options a given surface should render, as `{ code, label }`. */
export function reasonsFor(subjectType: ReportSubjectType): ReasonOption[] {
  return SUBJECT_REASONS[subjectType].map((code) => ({
    code,
    label: REASON_LABELS[code],
  }));
}
