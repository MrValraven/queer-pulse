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
  "member" | "post" | "reply" | "venue" | "message" | "community";

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
