import { createContext, useContext, useEffect } from "react";
import { type PublicEligibility } from "../../features/members/publicFigure";
import { type PublicProfileVisibilityDTO } from "../../features/members/api/publicProfile.api";
import { usePublicProfileVisibility } from "../../features/members/api/usePublicProfileVisibility";

export interface PublicProfileContextValue {
  /** Whether the member has asked for a public profile. Off by default. */
  enabled: boolean;
  /** Set the preference; resolves false when the write failed. */
  setEnabled: (value: boolean) => Promise<boolean>;
  toggle: () => Promise<boolean>;
  /** True while a write is in flight. */
  saving: boolean;
  /** Derived from the live self profile — whether the member may go public. */
  eligibility: PublicEligibility;
  /** Whether the (live) eligibility signals are still loading / errored / ready. */
  eligibilityStatus: "loading" | "ready" | "error";
  /** Refetch the live eligibility signals after an error. No-op in demo mode. */
  retryEligibility: () => void;
  /**
   * Adopt the stored preference. Idempotent per live session: only the FIRST
   * call lands. Hydration is now driven by whichever consumer's query resolves,
   * and consumers mount and unmount as the member navigates — without this
   * latch, mounting a second consumer would replay hydration over a toggle the
   * member had just made.
   */
  hydrate: (data: PublicProfileVisibilityDTO) => void;
}

export const PublicProfileContext =
  createContext<PublicProfileContextValue | null>(null);

/** The public shape — unchanged from before this provider was scoped. */
export type PublicProfileValue = Omit<PublicProfileContextValue, "hydrate">;

function usePublicProfileContext(): PublicProfileContextValue {
  const ctx = useContext(PublicProfileContext);
  if (!ctx)
    throw new Error(
      "usePublicProfile must be used within a PublicProfileProvider",
    );
  return ctx;
}

/**
 * The member's public-profile preference and eligibility.
 *
 * Calling this SUBSCRIBES to GET /me/public-profile — that subscription is why
 * the request now fires only where the control is shown. Both current consumers
 * read the hydrated `enabled` flag, so both belong here; a future write-only
 * consumer would need a `usePublicProfileActions()` returning the context alone
 * rather than being routed through this hook.
 */
export function usePublicProfile(): PublicProfileValue {
  const { hydrate, ...rest } = usePublicProfileContext();
  const { data } = usePublicProfileVisibility();

  useEffect(() => {
    if (data) hydrate(data);
  }, [data, hydrate]);

  return rest;
}
