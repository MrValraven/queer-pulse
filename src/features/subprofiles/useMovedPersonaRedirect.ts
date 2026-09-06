import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMovedHandleRedirect } from "../members/useMovedHandleRedirect";
import { ApiError } from "../../shared/api/client";
import { personaPath } from "../../app/routeMap";

/**
 * Router state the forwarding navigation carries to the destination, so the
 * persona page that lands there can say the visitor arrived through an old
 * address. Read it with `useLocation().state`.
 *
 * Its own key rather than the member side's `movedFromSlug`: `SubprofilePage`
 * serves both `/p/:handle` and `/members/:slug/:subslug`, and the two
 * forwardings mean different things. One says the persona was re-addressed,
 * the other says its owner renamed and the persona never moved at all.
 */
export interface MovedPersonaNavigationState {
  /** The persona handle the visitor actually typed, scanned or clicked. */
  movedFromHandle?: string;
}

/**
 * The current handle of the persona that used to hold the requested one, when
 * the server says the handle moved.
 *
 * The backend answers a released-but-still-in-cooldown persona handle with HTTP
 * 404 carrying `{ code: "PERSONA_MOVED", message, handle }` (see
 * `SubprofilePublicReadService.throwPersonaMovedOrNotFound`). A 404 rather than
 * a 301/308 is deliberate on both sides: a permanent redirect is cacheable past
 * the 30-day reclaim cooldown, which is precisely the window this forwarding
 * must expire with, and `fetch` follows a redirect transparently, so the app
 * would render the persona under the dead URL and never correct the address bar.
 *
 * The mirror of `movedProfileSlugFromError` in `features/members`, and separate
 * from it because the two codes address different things: that one names a
 * member, this one names a persona, and reading either as the other would
 * forward a visitor to the wrong kind of page.
 */
export function movedPersonaHandleFromError(error: unknown): string | null {
  if (!(error instanceof ApiError) || error.status !== 404) return null;
  const body = error.data as
    { code?: string; handle?: string } | null | undefined;
  if (body?.code !== "PERSONA_MOVED") return null;
  const movedHandle = typeof body.handle === "string" ? body.handle.trim() : "";
  return movedHandle.length > 0 ? movedHandle : null;
}

/**
 * Rebuild the current path against the persona's new handle, keeping every
 * other segment. A segment swap rather than a string replace: a handle can
 * legitimately appear elsewhere in a path, and rewriting the wrong occurrence
 * would send the visitor somewhere nobody asked for.
 */
function pathWithHandleReplaced(
  pathname: string,
  fromHandle: string,
  toHandle: string,
): string {
  const segments = pathname.split("/");
  const handleIndex = segments.indexOf(fromHandle);
  if (handleIndex === -1) return personaPath(toHandle);
  segments[handleIndex] = toHandle;
  return segments.join("/");
}

/**
 * Forward a persona page opened under a handle its owner renamed away from.
 *
 * A persona handle is the address that goes on a card, in a bio and under a QR
 * code, and it is shared by people who will never see it break. Until now
 * renaming one killed every printed copy at once. This turns the server's moved
 * payload into a `replace` navigation, so the dead URL leaves the history stack
 * and Back never returns to a wall.
 *
 * Returns whether a forwarding navigation is in flight. **Callers must render a
 * waiting state on `true` and must check it before their not-found screen**:
 * `navigate` can only run from an effect, so without that check the wall would
 * paint for one frame on the way through, which is the whole failure this
 * exists to remove.
 *
 * Demo mode has no server and no handle ledger, so it can never produce this
 * response and is gated out here rather than at the call site.
 */
export function useMovedPersonaRedirect(
  currentHandle: string | undefined,
  error: unknown,
): boolean {
  const { demoMode } = useDemoMode();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  const movedHandle = demoMode ? null : movedPersonaHandleFromError(error);
  // A payload naming the address we are already on would navigate to itself,
  // fail identically, and loop. The server resolves the moved handle from the
  // persona's LIVE `handle` column, so it should never answer with the one it
  // was handed, and a forwarding chain is impossible for the same reason. This
  // is the belt on those braces.
  const isRedirecting = Boolean(
    movedHandle && currentHandle && movedHandle !== currentHandle,
  );

  useEffect(() => {
    if (!isRedirecting || !movedHandle || !currentHandle) return;
    const destination =
      pathWithHandleReplaced(pathname, currentHandle, movedHandle) +
      search +
      hash;
    void navigate(destination, {
      replace: true,
      state: {
        movedFromHandle: currentHandle,
      } satisfies MovedPersonaNavigationState,
    });
  }, [
    isRedirecting,
    movedHandle,
    currentHandle,
    pathname,
    search,
    hash,
    navigate,
  ]);

  return isRedirecting;
}

/**
 * Both forwardings the public persona page can be handed, in the order it needs
 * them. Returns whether a forwarding navigation is in flight, for either.
 *
 * `SubprofilePage` serves two addresses and each moves for its own reason, so
 * both hooks run on every render and each stays inert unless the payload is the
 * one it reads.
 *
 * `/p/:handle` moves when the PERSONA is re-addressed. Nothing on that page
 * names a member, so it uses the persona hook above.
 *
 * `/members/:slug/:subslug` moves when its OWNER renames, while the persona
 * itself never moved at all. That is a username change, so it reuses the member
 * hook verbatim: the hook swaps the owner segment and leaves the persona
 * segment where it was, which is exactly the rebuild this path needs.
 */
export function useMovedPersonaAddressRedirect(
  currentHandle: string | undefined,
  currentOwnerSlug: string | undefined,
  error: unknown,
): boolean {
  const isRedirectingToMovedHandle = useMovedPersonaRedirect(
    currentHandle,
    error,
  );
  const isRedirectingToMovedOwner = useMovedHandleRedirect(
    currentOwnerSlug,
    error,
  );
  return isRedirectingToMovedHandle || isRedirectingToMovedOwner;
}
