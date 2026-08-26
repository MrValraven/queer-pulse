import { apiGet, apiPut } from "../../../shared/api/client";

/**
 * The member's lock-screen notification-preview switch.
 *
 * ---------------------------------------------------------------------------
 * Why this is a server setting and not a browser one (ID-13)
 * ---------------------------------------------------------------------------
 * It shipped as an IndexedDB flag that the service worker read before
 * `showNotification` (`src/pushPrivacy.ts`), which works everywhere except the
 * one place it matters most. iOS never runs the push handler's JavaScript: it
 * renders the payload's plain `title`/`body` itself. The backend put the
 * sender's name in those fields, so on iPhone the toggle did nothing while the
 * settings row said previews were hidden.
 *
 * The switch now lives on `member_preferences` and the backend composer reads
 * it per recipient, so a member who hides previews is sent a payload that never
 * contained a name. Being server-side is also what carries the choice to a
 * second device. The IndexedDB flag survives as a local mirror, so the service
 * worker can still degrade a payload on engines that run it.
 *
 * The field is `hidePreviews`, not `enabled`: "enabled" reads as "previews on"
 * to half the people who see it and "hiding on" to the other half, and a
 * privacy control that a plausible misreading can wire backwards eventually
 * will be.
 *
 * The switch suppresses nothing. Every notification is still written and still
 * delivered; the app shows all of it once it is open and unlocked.
 */
export interface PushPreviewsDTO {
  hidePreviews: boolean;
}

/**
 * Previews default to HIDDEN for a member who has never opened settings.
 * Mirrors the backend's `DEFAULT_HIDE_PUSH_PREVIEWS`, and is what the toggle
 * renders before the first fetch resolves so the row never flickers from
 * "showing" to "hidden".
 *
 * Hidden is the safe default because the two errors are not symmetric: a
 * wrongly hidden preview costs one extra tap, a wrongly shown one cannot be
 * taken back once somebody has read it.
 */
export const DEFAULT_HIDE_PUSH_PREVIEWS = true;

/** GET /me/push-previews: never 404s; synthesises the default when unset. */
export const getPushPreviews = () =>
  apiGet<PushPreviewsDTO>("/me/push-previews");

/** PUT /me/push-previews: echoes back what was actually stored. */
export const putPushPreviews = (hidePreviews: boolean) =>
  apiPut<PushPreviewsDTO>("/me/push-previews", { hidePreviews });
