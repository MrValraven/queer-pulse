import type { TFunction } from "../../../shared/i18n/types";

/**
 * DES-417. The copy helpers for a `safe_space_review` row, kept in their own
 * module so `formatNotification.ts` stays inside its function-length cap.
 *
 * The backend's `SafeSpaceNotifierService` writes `payload.action` as one of
 * the codes below, each carrying the `safe_space_` prefix, plus `audience`
 * (`nominator` | `owner` | `flagger` | `staff`), the venue's `placeName` and,
 * on a declined nomination, the moderator's `reason`. Every word of the
 * sentence is written here, in the member's own language, from those codes.
 */
const SAFE_SPACE_ACTION_PREFIX = "safe_space_";

/** The action codes (prefix stripped) that have their own sentence. */
const SAFE_SPACE_REVIEW_ACTIONS = new Set<string>([
  "nomination_acknowledged",
  "nomination_declined",
  "nomination_awarded",
  "badge_suspended",
  "badge_restored",
  "flag_review_opened",
  "flag_resolved",
  "queue_overdue",
]);

/**
 * The actions whose sentence reads differently to the venue's owner: the
 * award thanks a nominator and congratulates an owner, and a restore thanks a
 * flagger and reassures an owner. Each has a `.owner` variant in the catalog.
 */
const OWNER_VARIANT_ACTIONS = new Set<string>([
  "nomination_awarded",
  "badge_restored",
]);

/** The payload's action code with its `safe_space_` prefix stripped, or null. */
function safeSpaceActionOf(payload: unknown): string | null {
  const action = (payload as { action?: unknown } | null)?.action;
  if (typeof action !== "string") return null;
  return action.startsWith(SAFE_SPACE_ACTION_PREFIX)
    ? action.slice(SAFE_SPACE_ACTION_PREFIX.length)
    : action;
}

/**
 * Resolve the i18n subkey a `safe_space_review` row's copy lives under:
 * `safe_space_review.<action>`, with `.owner` appended for the two actions
 * whose owner sentence differs. An unknown or missing action falls back to
 * the flat `safe_space_review.*` copy, so a code added on the backend later
 * still reads as a whole sentence.
 */
export function safeSpaceReviewKeyFor(payload: unknown): string {
  const action = safeSpaceActionOf(payload);
  if (!action || !SAFE_SPACE_REVIEW_ACTIONS.has(action)) {
    return "safe_space_review";
  }
  const audience = (payload as { audience?: unknown } | null)?.audience;
  return OWNER_VARIANT_ACTIONS.has(action) && audience === "owner"
    ? `safe_space_review.${action}.owner`
    : `safe_space_review.${action}`;
}

/**
 * Whether a `moderation_outcome` row is one of the safe-space bells written
 * before `safe_space_review` existed. Those rows carry a `safe_space_*`
 * action and render with the neutral safe-space line.
 */
export function isLegacySafeSpaceOutcome(payload: unknown): boolean {
  const action = (payload as { action?: unknown } | null)?.action;
  return (
    typeof action === "string" && action.startsWith(SAFE_SPACE_ACTION_PREFIX)
  );
}

/**
 * The venue's name for the copy's `{placeName}` slot, defensively resolved: a
 * flag resolved after its listing was deleted carries no name, and the row
 * still reads as a whole sentence naming "this place".
 */
export function safeSpacePlaceNameToken(
  payload: unknown,
  t: TFunction,
): string {
  const placeName = (payload as { placeName?: unknown } | null)?.placeName;
  return typeof placeName === "string" && placeName.trim()
    ? placeName.trim()
    : t("notifications:type.safe_space_review.placeNameFallback");
}
