import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { ApiError } from "../../../shared/api/client";
import { movedProfileSlugFromError } from "../../members/useMovedHandleRedirect";
import { movedPersonaHandleFromError } from "../useMovedPersonaRedirect";
import {
  getProfileSubprofiles,
  getSubprofileByHandle,
  getSubprofileBySlugForProfile,
  type RestrictedState,
} from "./subprofiles.api";
import {
  publicSubprofileToView,
  type PublicSubprofileView,
} from "./subprofiles.adapters";
import type { DemoPublicAccessResult } from "../data/subprofiles.data";

/** Args discriminate the two public entry points: a standalone `/p/:handle`
 *  persona, or a linked persona nested under `/members/:slug/:subslug`. */
export type PublicSubprofileArgs =
  | { handle: string; ownerSlug?: undefined; subslug?: undefined }
  | { handle?: undefined; ownerSlug: string; subslug: string };

// `RestrictedState` (the Shared Contract's restricted-state signal — the
// persona exists but this viewer isn't allowed to see it, and why) is
// declared once, on the wire-contract file, and re-exported here so existing
// importers of this module keep working.
export type { RestrictedState };

/**
 * `usePublicSubprofile`'s result — a discriminated union over the Shared
 * Contract's four public-fetch outcomes, so `SubprofilePage` can render each
 * one on purpose instead of collapsing everything but a genuine 404 into
 * "not found":
 *  - `loading`     — the query hasn't settled yet.
 *  - `ok`           — viewable; `data.status` may be `"draft"` when the
 *                      viewer is the owner/co-owner previewing their own
 *                      unpublished persona (mount `SubprofileDraftBanner`).
 *  - `restricted`   — exists, but this viewer can't see it (private/
 *                      members-only/removed) — render `SubprofilePageStates`.
 *  - `not-found`    — genuinely no such handle/slug, OR an unpublished draft
 *                      viewed by a non-owner (indistinguishable from absent
 *                      on purpose — see the Shared Contract).
 */
export type PublicSubprofileResult =
  | { state: "loading" }
  | { state: "ok"; data: PublicSubprofileView }
  | { state: "restricted"; restricted: RestrictedState }
  | { state: "not-found" }
  /** The request itself fell over. Its own state because collapsing it into
   *  `not-found` told a visitor that a persona which exists does not (DES-22),
   *  and told its owner their page had vanished. `retry` re-runs the read. */
  | { state: "error"; retry: () => void }
  /** PRD-204. The address exists, at a different one. The server answered a
   *  handle (or an owner slug) released by a rename and still inside its
   *  reclaim cooldown, and named where it now leads. The raw `ApiError` is
   *  handed on because the two forwarding shapes name different things
   *  (`PERSONA_MOVED` a persona handle, `PROFILE_MOVED` a member username) and
   *  the page reads whichever one its own route can act on. */
  | { state: "moved"; error: unknown };

/** `PublicSubprofileResult` minus the `loading` branch — what the react-query
 *  `queryFn` itself resolves to. Restricted/not-found are legitimate business
 *  outcomes of a public read, not query failures, so the query never enters
 *  its error state for them (no pointless retry, no `isError` branch the page
 *  would have to special-case). A genuine fault (network/5xx/anything not
 *  carrying a `restrictedState` body) still `throw`s and IS a query error,
 *  which the hook now returns as its own `error` state rather than folding
 *  into `not-found`. */
export type PublicSubprofileOutcome = Exclude<
  PublicSubprofileResult,
  { state: "loading" } | { state: "error" } | { state: "moved" }
>;

/** Read a 403 body's `restrictedState`, or `undefined` if it isn't shaped
 *  that way (a stale CSRF 403, a quota 403, etc. — those aren't ours to map). */
function restrictedStateFromError(err: unknown): RestrictedState | undefined {
  if (!(err instanceof ApiError)) return undefined;
  if (err.status === 403) {
    const body = err.data as { restrictedState?: RestrictedState } | undefined;
    return body?.restrictedState;
  }
  return undefined;
}

/** Whether a failure is one of PRD-204's forwarding payloads — a persona
 *  handle, or the owner username a nested persona hangs off, released by a
 *  rename and still inside its reclaim cooldown. Both arrive as a 404 carrying
 *  a `code`, and both have to reach the page as an ERROR rather than as an
 *  outcome: the whole point is to forward, and reporting an absence is the one
 *  answer that is wrong. */
function isMovedError(err: unknown): boolean {
  return (
    movedPersonaHandleFromError(err) !== null ||
    movedProfileSlugFromError(err) !== null
  );
}

/** Map a live `getSubprofileByHandle`/`getSubprofileBySlugForProfile` failure
 *  per the Shared Contract: 403 + `{restrictedState}` → `restricted`; 404 →
 *  `not-found`; anything else re-throws (a genuine fault, or a moved payload —
 *  neither is a business outcome this hook can answer with a value). */
function mapLiveError(err: unknown): PublicSubprofileOutcome {
  const restricted = restrictedStateFromError(err);
  if (restricted) return { state: "restricted", restricted };
  // PRD-204. Checked BEFORE the plain-404 branch below, which would otherwise
  // claim the moved payload as an absence and strand the visitor on the dead
  // address. Every other 404 stays indistinguishable, exactly as the endpoint
  // makes it.
  if (isMovedError(err)) throw err;
  if (err instanceof ApiError && err.status === 404)
    return { state: "not-found" };
  throw err;
}

/** Same mapping as `mapLiveError`, over `resolvePublicAccessDemo`'s result
 *  shape instead of a thrown `ApiError` — the demo branch never throws for a
 *  business outcome, so this is a plain value map, not a catch. */
function fromDemoResult(
  result: DemoPublicAccessResult,
): PublicSubprofileOutcome {
  if (result.kind === "ok") {
    return { state: "ok", data: publicSubprofileToView(result.dto) };
  }
  if (result.kind === "restricted") {
    return { state: "restricted", restricted: result.restricted };
  }
  return { state: "not-found" };
}

/** Public view of a subprofile — by global handle, or by owner slug + persona
 *  slug (the nested linked URL). Demo mirrors the backend's
 *  `resolvePublicAccess` rule order over the demo registry
 *  (`resolvePublicAccessDemo`); live calls the matching endpoint and reads
 *  the 403/404 shape off `ApiError`. */
export function usePublicSubprofile(
  args: PublicSubprofileArgs,
): PublicSubprofileResult {
  const { demoMode } = useDemoMode();
  const { user } = useAuth();
  // The signed-in viewer's profile slug, or `null` when signed out — drives
  // both the owner-override and the (Phase-1b-simplified) "authenticated
  // member" check in `resolvePublicAccessDemo`, and is part of the query key
  // so switching identity/sign-in state refetches instead of reusing another
  // viewer's cached restricted/ok result.
  const viewerSlug = user?.profile.slug ?? null;
  const { handle, ownerSlug, subslug } = args;

  const query = useQuery<PublicSubprofileOutcome>({
    queryKey: [
      "subprofile",
      "public",
      demoMode,
      handle,
      ownerSlug,
      subslug,
      viewerSlug,
    ],
    enabled: Boolean(handle || (ownerSlug && subslug)),
    // A 403/404 business outcome is resolved to a VALUE below rather than
    // thrown, so it never reaches the retry logic. The one failure that does
    // and is still deliberate is PRD-204's moved payload: retrying it would
    // only hold the visitor on the dead address for another round trip before
    // forwarding them.
    retry: (failureCount, error) => failureCount < 1 && !isMovedError(error),
    queryFn: async ({ signal }) => {
      if (handle) {
        if (demoMode) {
          const { findDemoSubprofileByHandle, resolvePublicAccessDemo } =
            await import("../data/subprofiles.data");
          return fromDemoResult(
            resolvePublicAccessDemo(
              findDemoSubprofileByHandle(handle),
              viewerSlug,
            ),
          );
        }
        try {
          const dto = await getSubprofileByHandle(handle, signal);
          return { state: "ok", data: publicSubprofileToView(dto) };
        } catch (err) {
          return mapLiveError(err);
        }
      }

      if (!ownerSlug || !subslug) return { state: "not-found" };
      if (demoMode) {
        const { findDemoSubprofileByOwnerSlug, resolvePublicAccessDemo } =
          await import("../data/subprofiles.data");
        return fromDemoResult(
          resolvePublicAccessDemo(
            findDemoSubprofileByOwnerSlug(ownerSlug, subslug),
            viewerSlug,
          ),
        );
      }
      // Nested linked persona: the single-item route resolves the same
      // `resolvePublicAccess` contract as the by-handle route (200/403/404) —
      // see `getSubprofileBySlugForProfile`. The bulk `getProfileSubprofiles`
      // list (used by `useProfileSubprofiles`'s "Also as…" block below) can't
      // carry a single item's restricted signal, so this hook never uses it.
      try {
        const dto = await getSubprofileBySlugForProfile(
          ownerSlug,
          subslug,
          signal,
        );
        return { state: "ok", data: publicSubprofileToView(dto) };
      } catch (err) {
        return mapLiveError(err);
      }
    },
  });

  if (query.isLoading) return { state: "loading" };
  // PRD-204, checked ahead of the fault branch: a moved payload IS a query
  // error, and it is the one error that carries an answer rather than a
  // failure. Showing the retry wall for it would hide the forwarding behind a
  // button nobody has a reason to press.
  if (query.isError && isMovedError(query.error)) {
    return { state: "moved", error: query.error };
  }
  // A fault is its own answer. "No such persona" is a claim about the world,
  // and a request that never landed is no basis for making it.
  if (query.isError) {
    return { state: "error", retry: () => void query.refetch() };
  }
  return query.data ?? { state: "not-found" };
}

/** All of a member's linked + published personas (the main-profile "Also as…"
 *  block). Demo reads the mock registry; live calls GET /profiles/:slug/subprofiles. */
export function useProfileSubprofiles(slug: string | undefined) {
  const { demoMode } = useDemoMode();
  return useQuery<PublicSubprofileView[]>({
    queryKey: ["subprofiles", "byProfile", demoMode, slug],
    enabled: Boolean(slug),
    queryFn: async ({ signal }) => {
      if (!slug) return [];
      if (demoMode) {
        const { mockSubprofilesForProfile } =
          await import("../data/subprofiles.data");
        return mockSubprofilesForProfile(slug).map(publicSubprofileToView);
      }
      const dtos = await getProfileSubprofiles(slug, signal);
      return dtos.map(publicSubprofileToView);
    },
  });
}
