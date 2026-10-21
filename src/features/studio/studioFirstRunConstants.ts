/* Import-free constants for the Studio welcome (PRD-12), so the listening
   memory wipe and the router can read them without pulling the welcome in. */

/** The member's welcome picks on this device (genres and moods). Never sent
 *  to the server. Every listening-memory wipe removes it. */
export const STUDIO_TASTE_STORAGE_KEY = "qp.studio.taste.v1";

/** That this member has seen the welcome on this device: only their member
 *  id, no picks. Survives sign-out, so signing back in never replays the
 *  welcome; Quick Exit alone removes it (endStudioListeningMemory). */
export const STUDIO_WELCOME_SEEN_STORAGE_KEY = "qp.studio.welcomeSeen.v1";

/** Router state that asks Studio home to open the welcome (Help's "Show the
 *  welcome again" and the /studio/welcome redirect). */
export const STUDIO_WELCOME_REQUEST_STATE = {
  shouldOpenStudioWelcome: true,
} as const;

export function isStudioWelcomeRequest(state: unknown): boolean {
  return (
    typeof state === "object" &&
    state !== null &&
    (state as Record<string, unknown>).shouldOpenStudioWelcome === true
  );
}
