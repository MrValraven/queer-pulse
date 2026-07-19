import { useMemo } from "react";
import {
  useEmployerAffiliationOverlay,
  type EmployerAffiliation,
} from "../../../app/providers/EmployerAffiliationProvider";
import { useEmployerAffiliationQuery } from "./useEmployerAffiliationQuery";

export interface EmployerAffiliationActions {
  /** Grant (or switch) the member's employer affiliation. */
  affiliate: (companySlug: string, role: string) => void;
  clearAffiliation: () => void;
}

export interface EmployerAffiliationResult extends EmployerAffiliationActions {
  /** The affiliation as the member should see it: overlay over server truth. */
  affiliation: EmployerAffiliation | null;
  /**
   * True while the server is still being asked and no local overlay answers the
   * question. Always false in demo mode and while logged out (the query is
   * disabled there, so react-query reports `isLoading: false` — a disabled query
   * is not pending-and-fetching). New in phase 3: before it, localStorage always
   * had an instant answer, right or wrong.
   */
  isLoading: boolean;
}

/**
 * WRITE-ONLY access to the employer affiliation.
 *
 * Deliberately does not touch `useEmployerAffiliationQuery`. `AffiliateCompanyModal`
 * only ever calls `affiliate()` — if it used the read hook below it would
 * subscribe to the query and fire `GET /me/affiliation` from wherever that modal
 * mounts, quietly reintroducing the request this whole phase removes. Nothing
 * would break; the endpoint would simply never leave the budget. Use this hook
 * from any consumer that writes and does not read.
 */
export function useEmployerAffiliationActions(): EmployerAffiliationActions {
  const { affiliate, clearAffiliation } = useEmployerAffiliationOverlay();
  return useMemo(
    () => ({ affiliate, clearAffiliation }),
    [affiliate, clearAffiliation],
  );
}

/**
 * The member's employer affiliation — overlay merged over server truth.
 *
 * Subscribing to this is what makes `GET /me/affiliation` fire, so it fires when
 * a page that reads the affiliation mounts, and never before. That is the entire
 * mechanism of phase 3; there is no route list anywhere.
 *
 * The merge rule, and why it is `!== undefined` rather than `??`:
 *
 *   overlay === undefined  → no local decision; the server answers.
 *   overlay === null       → the member cleared it (or demo has none). **Wins.**
 *   overlay is a value     → demo store, or a live optimistic/confirmed value. Wins.
 *
 * A `??` would collapse the middle case into the first and let server truth
 * resurrect an affiliation the member just cleared. The overlay outranking the
 * query for the rest of the session is the pre-existing behaviour: the old
 * single-slot provider also kept whatever a mutation last wrote.
 */
export function useEmployerAffiliation(): EmployerAffiliationResult {
  const { overlay, affiliate, clearAffiliation } =
    useEmployerAffiliationOverlay();
  const query = useEmployerAffiliationQuery();

  const affiliation = overlay !== undefined ? overlay : (query.data ?? null);
  const isLoading = overlay === undefined && query.isLoading;

  return { affiliation, affiliate, clearAffiliation, isLoading };
}
