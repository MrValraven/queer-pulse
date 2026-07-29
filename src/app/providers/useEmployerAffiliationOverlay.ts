import { createContext, useContext } from "react";
import { type EmployerAffiliation } from "../../features/economy/api/useEmployerAffiliationQuery";

export type { EmployerAffiliation };

/**
 * The overlay's tri-state. This is the load-bearing type of phase 3.
 *
 * - `EmployerAffiliation` — a local value: the demo store's contents, or a live
 *   optimistic value awaiting/holding a server confirmation.
 * - `null` — an explicit "no affiliation": the demo store is empty, or the
 *   member just cleared it optimistically.
 * - `undefined` — **no local decision at all; defer to the server query.**
 *
 * The third arm is what the old single-slot design lacked, and why it could not
 * be scoped. With only `T | null`, an optimistic clear and a cold start look
 * identical, so server truth would immediately paper back over the clear.
 */
export type AffiliationOverlay = EmployerAffiliation | null | undefined;

export interface EmployerAffiliationOverlayValue {
  overlay: AffiliationOverlay;
  /** Grant (or switch) the member's employer affiliation. */
  affiliate: (companySlug: string, role: string) => void;
  clearAffiliation: () => void;
}

export const EmployerAffiliationContext =
  createContext<EmployerAffiliationOverlayValue | null>(null);

/**
 * Raw overlay access. **Not for pages** — it exposes the tri-state, which is an
 * implementation detail of the merge. Consumers use
 * `useEmployerAffiliation()` (read) or `useEmployerAffiliationActions()`
 * (write-only), both from `src/features/economy/api/useEmployerAffiliation.ts`.
 */
export function useEmployerAffiliationOverlay() {
  const ctx = useContext(EmployerAffiliationContext);
  if (!ctx) {
    throw new Error(
      "useEmployerAffiliationOverlay must be used within EmployerAffiliationProvider",
    );
  }
  return ctx;
}
