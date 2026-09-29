import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { personaPath } from "../../app/routeMap";
import type { PublicSubprofileResult } from "./api/usePublicSubprofile";

/**
 * Every persona now lives at `/p/<handle>`. The nested
 * `/members/:ownerSlug/:slug` address stays reachable for links shared before
 * the move (cards, QR codes, stored notifications and activity rows): it
 * resolves as before, including the PROFILE_MOVED and PERSONA_REHOMED
 * forwarding, and once the persona loads PUBLISHED with a handle this
 * replaces the URL with its `/p/` address, keeping the query, hash and
 * router state (the rehomed note reads that state on arrival).
 *
 * A linked persona with no handle (a legacy or demo row; the server stores a
 * derived handle on every linked draft it saves) has no `/p/` address, so it
 * renders in place. So does a persona that DOES carry a
 * handle but is still a DRAFT: the owner previewing their own nested address
 * before publishing is typing a handle the server has not yet settled, and
 * it may belong to someone else by the time it goes live.
 *
 * Returns whether the replace is in flight. The caller renders its waiting
 * state on `true`, so the nested page never paints on the way through.
 */
export function useLegacyNestedPersonaRedirect(
  isNestedRoute: boolean,
  result: PublicSubprofileResult,
): boolean {
  const navigate = useNavigate();
  const location = useLocation();
  const { search, hash } = location;
  // `Location`'s `state` is typed `any` (react-router carries no shape for
  // it). Read it as `unknown` and forward it untouched: this hook reads none
  // of its fields, so no assumption about its shape leaks in.
  const state: unknown = location.state;
  const handle =
    isNestedRoute && result.state === "ok" && result.data.status === "published"
      ? result.data.handle
      : null;
  const isRedirecting = Boolean(handle);

  useEffect(() => {
    if (!handle) return;
    void navigate(`${personaPath(handle)}${search}${hash}`, {
      replace: true,
      state,
    });
  }, [handle, search, hash, state, navigate]);

  return isRedirecting;
}
