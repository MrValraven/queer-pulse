import type { HandleReason } from "./api/handles.api";

/**
 * Catalog keys for the username field's live availability states. Warm,
 * second person, no blame — every "no" points at the next thing to try.
 * Pattern A: this file holds keys, `UsernameField.tsx` resolves them via `t()`.
 */

export const USERNAME_CHECKING_KEY = "settings:usernameField.checking";

/** Shown when a clean, free handle is entered. */
export const USERNAME_FREE_KEY = "settings:usernameField.free";

/** Shown when the handle is the member's current one (kept as-is). */
export const USERNAME_YOURS_KEY = "settings:usernameField.yours";

/** Why a handle can't be used. `null` reasons never reach this map. */
export const USERNAME_REASON_KEYS: Record<
  Exclude<HandleReason, null>,
  string
> = {
  invalid: "settings:usernameField.reason.invalid",
  reserved: "settings:usernameField.reason.reserved",
  taken: "settings:usernameField.reason.taken",
};
