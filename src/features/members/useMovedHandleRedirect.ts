import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { ApiError } from "../../shared/api/client";
import { memberPath } from "../forum/forumAuthor.helpers";

/**
 * Router state the forwarding navigation carries to the destination, so the
 * page that lands there can say the visitor arrived through an old address.
 * Read it with `useLocation().state`.
 */
export interface MovedHandleNavigationState {
  /** The username the visitor actually typed, scanned or clicked. */
  movedFromSlug?: string;
}

/**
 * The current slug of the member who used to own the requested username, when
 * the server says the username moved.
 *
 * The backend answers a released-but-still-in-cooldown username with HTTP 404
 * carrying `{ code: "PROFILE_MOVED", message, slug }` (see
 * `ProfilesService.throwMovedOrNotFound`). A 404 rather than a 301/308 is
 * deliberate on both sides: a permanent redirect is cacheable past the 30-day
 * reclaim cooldown, which is precisely the window this forwarding must expire
 * with, and `fetch` follows a redirect transparently, so the app would render
 * the profile under the dead URL and never correct the address bar.
 *
 * `client.ts` keeps the parsed error body on `ApiError.data`, so the payload
 * reaches us intact.
 */
export function movedProfileSlugFromError(error: unknown): string | null {
  if (!(error instanceof ApiError) || error.status !== 404) return null;
  const body = error.data as
    { code?: string; slug?: string } | null | undefined;
  if (body?.code !== "PROFILE_MOVED") return null;
  const movedSlug = typeof body.slug === "string" ? body.slug.trim() : "";
  return movedSlug.length > 0 ? movedSlug : null;
}

/**
 * Rebuild the current path against the member's new username, keeping every
 * other segment. A segment swap rather than a string replace: a slug can
 * legitimately appear elsewhere in a path, and rewriting the wrong occurrence
 * would send the visitor somewhere nobody asked for.
 */
function pathWithSlugReplaced(
  pathname: string,
  fromSlug: string,
  toSlug: string,
): string {
  const segments = pathname.split("/");
  const slugIndex = segments.indexOf(fromSlug);
  if (slugIndex === -1) return memberPath(toSlug);
  segments[slugIndex] = toSlug;
  return segments.join("/");
}

/**
 * Forward a member profile opened under a username its owner renamed away from.
 *
 * Every printed membership card, shared link and pasted @mention pointed at the
 * old address, and until now all of them died on a "no such member" wall the
 * moment somebody renamed. This turns the server's moved payload into a
 * `replace` navigation, so the dead URL leaves the history stack and Back never
 * returns to a wall.
 *
 * Returns whether a forwarding navigation is in flight. **Callers must render a
 * waiting state on `true` and must check it before their not-found screen**:
 * `navigate` can only run from an effect, so without that check the wall would
 * paint for one frame on the way through, which is the whole failure this
 * exists to remove.
 *
 * Demo mode has no server and no handle ledger, so it can never produce this
 * response and is gated out here rather than at each call site.
 */
export function useMovedHandleRedirect(
  currentSlug: string | undefined,
  error: unknown,
): boolean {
  const { demoMode } = useDemoMode();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  const movedSlug = demoMode ? null : movedProfileSlugFromError(error);
  // A payload naming the address we are already on would navigate to itself,
  // fail identically, and loop. The server resolves the moved slug from a LIVE
  // profile, so it should never answer with the slug it was handed, and a
  // forwarding chain is impossible for the same reason. This is the belt on
  // those braces.
  const isRedirecting = Boolean(
    movedSlug && currentSlug && movedSlug !== currentSlug,
  );

  useEffect(() => {
    if (!isRedirecting || !movedSlug || !currentSlug) return;
    const destination =
      pathWithSlugReplaced(pathname, currentSlug, movedSlug) + search + hash;
    void navigate(destination, {
      replace: true,
      state: {
        movedFromSlug: currentSlug,
      } satisfies MovedHandleNavigationState,
    });
  }, [isRedirecting, movedSlug, currentSlug, pathname, search, hash, navigate]);

  return isRedirecting;
}
