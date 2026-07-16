import type { HandleReason } from "./api/handles.api";

/**
 * Copy for the username field's live availability states. Warm, second person,
 * no blame — every "no" points at the next thing to try.
 */

export const USERNAME_CHECKING = "Checking…";

/** Shown when a clean, free handle is entered. */
export const USERNAME_FREE = "Looks free — this one can be yours.";

/** Shown when the handle is the member's current one (kept as-is). */
export const USERNAME_YOURS = "This is your handle.";

/** Why a handle can't be used. `null` reasons never reach this map. */
export const USERNAME_REASON_COPY: Record<
  Exclude<HandleReason, null>,
  string
> = {
  invalid:
    "Handles are 3–30 characters — lowercase letters, numbers and hyphens.",
  reserved: "That word's kept for the platform — try another.",
  taken: "Someone already goes by that — try another one.",
};
