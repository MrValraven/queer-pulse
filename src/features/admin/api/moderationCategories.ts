import type { ReasonCode } from "../../safety/reportReasons";

/**
 * The triage category a reason code falls under, as `admin` catalog keys.
 *
 * Several reason codes collapse onto one category ("outing" and "doxxing" are
 * both an emergency; every venue code is "Venue"), which is why this is its own
 * table rather than a derivation of `REASON_LABEL_KEYS`. It used to exist twice
 * as plain-English `Record<ReasonCode, string>` tables — `CATEGORY` in
 * `moderation.adapters.ts` and `QUEUE_CATEGORY_LABEL` in
 * `adminCommunities.adapters.ts` — so a Portuguese moderator read "Hate speech"
 * on a live row. Both adapters now resolve these keys through `t()` and the
 * table is defined once, here.
 */
export const REASON_CATEGORY_KEY: Partial<Record<ReasonCode, string>> = {
  outing: "admin:moderation.category.emergency",
  doxxing: "admin:moderation.category.emergency",
  harassment: "admin:moderation.category.harassment",
  hate_speech: "admin:moderation.category.hateSpeech",
  unwanted_contact: "admin:moderation.category.harassment",
  impersonation: "admin:moderation.category.impersonation",
  discrimination: "admin:moderation.category.discrimination",
  spam: "admin:moderation.category.spam",
  off_topic: "admin:moderation.category.offTopic",
  venue_safety: "admin:moderation.category.venue",
  venue_staff: "admin:moderation.category.venue",
  venue_accessibility: "admin:moderation.category.venue",
  other: "admin:moderation.category.other",
};

/** Shown when the backend sends a reason code this client hasn't mapped yet
 *  (housing/listing codes have no admin triage category of their own). */
export const REASON_CATEGORY_FALLBACK_KEY = "admin:moderation.category.report";

/** The catalog key for a reason code's triage category, always resolvable.
 *  Takes a plain `string` because the community queue DTO types `reasonCode`
 *  loosely. */
export function reasonCategoryKey(reasonCode: string): string {
  return (
    REASON_CATEGORY_KEY[reasonCode as ReasonCode] ??
    REASON_CATEGORY_FALLBACK_KEY
  );
}
