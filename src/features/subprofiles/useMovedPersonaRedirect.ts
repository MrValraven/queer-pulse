import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useMovedHandleRedirect } from "../members/useMovedHandleRedirect";
import { ApiError } from "../../shared/api/client";
import { nestedPersonaPath, personaPath } from "../../app/routeMap";

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

/** The nested address a `/members/:ownerSlug/:slug` persona now lives at, once
 *  the creator role that address depends on has moved to someone else. */
export interface RehomedPersonaTarget {
  ownerSlug: string;
  slug: string;
}

/**
 * The persona's current nested address, when the server says the one
 * requested has been rehomed.
 *
 * `SubprofileMembershipService.transferCreatorWithin` moves the creator role
 * on a shared persona to the longest-standing remaining co-owner whenever the
 * creator leaves, is erased, or was already gone before the repair migration
 * ran. `/members/:ownerSlug/:slug` is keyed on the CREATOR's slug plus the
 * persona's own slug, and both can change in that move: the owner segment
 * because the creator is now someone else, the persona segment because a slug
 * collision under the new creator forces a suffix. The public read answers a
 * request for the old pair with HTTP 404 carrying
 * `{ code: "PERSONA_REHOMED", message, ownerSlug, slug }` naming the current
 * pair (see `SubprofilePublicReadService`'s public-read fallbacks). The
 * unlinked `/p/:handle` address is unaffected by any of this; a persona keeps
 * its global handle across a creator change, which is exactly why
 * `movedPersonaHandleFromError` above answers a different question.
 */
export function rehomedNestedPersonaFromError(
  error: unknown,
): RehomedPersonaTarget | null {
  if (!(error instanceof ApiError) || error.status !== 404) return null;
  const body = error.data as
    { code?: string; ownerSlug?: string; slug?: string } | null | undefined;
  if (body?.code !== "PERSONA_REHOMED") return null;
  const ownerSlug =
    typeof body.ownerSlug === "string" ? body.ownerSlug.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (ownerSlug.length === 0 || slug.length === 0) return null;
  return { ownerSlug, slug };
}

/**
 * Rebuild the current path against the persona's new owner slug AND its new
 * own slug together, keeping every other segment.
 *
 * Anchors the persona-slug replacement on the position right after the owner
 * segment rather than searching for it independently: the route is always
 * `/members/:ownerSlug/:slug`, and a bare `indexOf` could land on an unrelated
 * segment elsewhere in the path that happens to equal the old slug.
 */
function pathWithNestedPersonaReplaced(
  pathname: string,
  fromOwnerSlug: string,
  fromSlug: string,
  toOwnerSlug: string,
  toSlug: string,
): string {
  const segments = pathname.split("/");
  const ownerIndex = segments.indexOf(fromOwnerSlug);
  const slugIndex = ownerIndex === -1 ? -1 : ownerIndex + 1;
  if (ownerIndex === -1 || segments[slugIndex] !== fromSlug) {
    return nestedPersonaPath(toOwnerSlug, toSlug);
  }
  segments[ownerIndex] = toOwnerSlug;
  segments[slugIndex] = toSlug;
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
 * Router state the rehoming navigation carries to the destination, so the
 * persona page that lands there can say the visitor arrived through an old
 * nested address. Read it with `useLocation().state`.
 *
 * Its own shape rather than either existing navigation state above: this
 * forwarding replaces both segments of `/members/:ownerSlug/:slug` at once, so
 * the destination page needs both old values to describe what happened, and
 * neither `MovedPersonaNavigationState` nor `MovedHandleNavigationState` carry
 * more than one.
 */
export interface RehomedPersonaNavigationState {
  /** The owner slug segment the visitor actually followed. */
  rehomedFromOwnerSlug?: string;
  /** The persona slug segment the visitor actually followed. */
  rehomedFromSlug?: string;
}

/**
 * Forward a nested persona page opened at the address its creator role has
 * since moved away from.
 *
 * `/members/:ownerSlug/:slug` is keyed on who created the persona, and a
 * creator role can now move without anyone touching a link: the creator
 * leaves, is erased, or the repair migration catches a persona whose creator
 * was already gone. Every printed card and pasted link still names the old
 * pair, and until this forwarding exists it would die on a "no such persona"
 * wall the moment the transfer happened. This turns the server's rehomed
 * payload into a `replace` navigation, so the dead pair leaves the history
 * stack and Back never returns to a wall.
 *
 * Returns whether a forwarding navigation is in flight. **Callers must render
 * a waiting state on `true` and must check it before their not-found
 * screen**: `navigate` can only run from an effect, so without that check the
 * wall would paint for one frame on the way through, which is the whole
 * failure this exists to remove.
 *
 * Demo mode has no server and no creator-transfer ledger, so it can never
 * produce this response and is gated out here rather than at the call site.
 */
export function useRehomedPersonaRedirect(
  currentOwnerSlug: string | undefined,
  currentSlug: string | undefined,
  error: unknown,
): boolean {
  const { demoMode } = useDemoMode();
  const navigate = useNavigate();
  const { pathname, search, hash } = useLocation();

  const target = demoMode ? null : rehomedNestedPersonaFromError(error);
  const targetOwnerSlug = target?.ownerSlug ?? null;
  const targetSlug = target?.slug ?? null;
  // A payload naming the pair we are already on would navigate to itself,
  // fail identically, and loop. Both segments are checked together: a
  // transfer that only forced a slug suffix still has to forward even when
  // the owner segment already matches, and the reverse holds just as well.
  const isRedirecting = Boolean(
    targetOwnerSlug &&
    targetSlug &&
    currentOwnerSlug &&
    currentSlug &&
    (targetOwnerSlug !== currentOwnerSlug || targetSlug !== currentSlug),
  );

  useEffect(() => {
    if (
      !isRedirecting ||
      !targetOwnerSlug ||
      !targetSlug ||
      !currentOwnerSlug ||
      !currentSlug
    )
      return;
    const destination =
      pathWithNestedPersonaReplaced(
        pathname,
        currentOwnerSlug,
        currentSlug,
        targetOwnerSlug,
        targetSlug,
      ) +
      search +
      hash;
    void navigate(destination, {
      replace: true,
      state: {
        rehomedFromOwnerSlug: currentOwnerSlug,
        rehomedFromSlug: currentSlug,
      } satisfies RehomedPersonaNavigationState,
    });
  }, [
    isRedirecting,
    targetOwnerSlug,
    targetSlug,
    currentOwnerSlug,
    currentSlug,
    pathname,
    search,
    hash,
    navigate,
  ]);

  return isRedirecting;
}

/**
 * Every forwarding the public persona page can be handed, in the order it
 * needs them. Returns whether a forwarding navigation is in flight, for any.
 *
 * `SubprofilePage` serves two addresses and each can move for more than one
 * reason, so every hook below runs on every render and each stays inert
 * unless the payload is the one it reads.
 *
 * `/p/:handle` moves when the PERSONA is re-addressed. Nothing on that page
 * names a member, so it uses the persona hook above.
 *
 * `/members/:slug/:subslug` moves for two different reasons that need two
 * different rebuilds:
 * - its OWNER renames, while the persona itself never moved at all. That is a
 *   username change, so it reuses the member hook verbatim: the hook swaps
 *   the owner segment and leaves the persona segment where it was.
 * - the persona's CREATOR role transfers to another member, which can move
 *   both segments at once (a new owner slug, and possibly a suffixed persona
 *   slug). `useRehomedPersonaRedirect` reads the nested route's own `subslug`
 *   param directly rather than taking it as a fourth argument here: it is
 *   this page's other address entirely, and `currentHandle` /
 *   `currentOwnerSlug` above already each name one end of the two addresses
 *   this hook serves.
 */
export function useMovedPersonaAddressRedirect(
  currentHandle: string | undefined,
  currentOwnerSlug: string | undefined,
  error: unknown,
): boolean {
  const { subslug: currentPersonaSlug } = useParams();
  const isRedirectingToMovedHandle = useMovedPersonaRedirect(
    currentHandle,
    error,
  );
  const isRedirectingToMovedOwner = useMovedHandleRedirect(
    currentOwnerSlug,
    error,
  );
  const isRedirectingToRehomedPersona = useRehomedPersonaRedirect(
    currentOwnerSlug,
    currentPersonaSlug,
    error,
  );
  return (
    isRedirectingToMovedHandle ||
    isRedirectingToMovedOwner ||
    isRedirectingToRehomedPersona
  );
}
