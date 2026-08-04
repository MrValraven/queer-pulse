import { useAuth } from "./authContext";
import { useDemoMode } from "./DemoModeProvider";

/**
 * The namespace the per-user localStorage caches (`SavedProvider`,
 * `VouchProvider`, `DraftsProvider`, and the message-composer drafts in
 * `features/messages/drafts.ts`) should key themselves under, so a **shared
 * device never surfaces one signed-in member's cached data to the next**:
 *
 * - **Demo mode** → `"demo"`. A single fixed mock persona; consumers map this
 *   back to the original un-suffixed key (see `useScopedLocalStorage`), so
 *   existing demo data and the storage contract the demo tests assert stay
 *   intact, and demo writes can never bleed into a live per-user bucket.
 * - **Live, signed in** → the authenticated user's id, so each member reads and
 *   writes an isolated bucket.
 * - **Live, signed out / still checking** → `null`: no bucket, so the caches
 *   render empty until the session (and server hydration) resolves, instead of
 *   showing whoever used this browser last. A later sign-out flips the scope
 *   back to `null`, which resets the in-memory state — the "clear on sign-out"
 *   half of the fix.
 */
export function useStorageScope(): string | null {
  const { demoMode } = useDemoMode();
  const { loggedIn, user } = useAuth();
  if (demoMode) return "demo";
  if (!loggedIn || !user) return null;
  return user.id;
}
