import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  postAffiliation,
  deleteAffiliation,
} from "../../features/economy/api/affiliation.api";
import {
  affiliationQueryKey,
  type EmployerAffiliation,
} from "../../features/economy/api/useEmployerAffiliationQuery";
import { useDemoMode } from "./DemoModeProvider";
import { logError } from "../../shared/observability/logger";
import {
  EmployerAffiliationContext,
  type AffiliationOverlay,
} from "./useEmployerAffiliationOverlay";

const STORAGE_KEY = "qp-employer-affiliation";

function readInitial(): EmployerAffiliation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as EmployerAffiliation;
    return parsed?.companySlug ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * The member's employer affiliation — **overlay only**. This provider no longer
 * fetches; server truth lives in `useEmployerAffiliationQuery`, which
 * `useEmployerAffiliation` (src/features/economy/api/useEmployerAffiliation.ts)
 * merges on top of this. See that file for the merge rule.
 *
 * Two responsibilities, discriminated by `demoMode` — they never coexist:
 *
 * - DEMO: this is the source of truth. Seeded from localStorage, persisted back,
 *   affiliating is granted instantly (`active`, create-it-live), exactly as the
 *   prototype has always behaved. No network, ever.
 * - LIVE: a memory-only optimistic overlay. `undefined` until the member acts,
 *   so the server query shows through; a `pending` value while a POST is in
 *   flight; `null` immediately after a DELETE. **localStorage is not read or
 *   written in live mode** — mirroring server truth into it, which is what this
 *   provider used to do, is an uninvalidated cache that can render a company the
 *   member no longer works for. `ConnectionsProvider` made the same call for the
 *   same reason (see its lines 98-99).
 */
export function EmployerAffiliationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const [overlay, setOverlay] = useState<AffiliationOverlay>(() =>
    demoMode ? readInitial() : undefined,
  );

  // Demo-only persistence. The guard is the whole point of the phase: before it,
  // this effect also fired on server-hydrated values, which is what made the
  // demo cache and live server truth indistinguishable at read time.
  useEffect(() => {
    if (!demoMode) return;
    if (typeof window === "undefined") return;
    try {
      if (overlay) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage failures (private mode, quota) — session state still works.
    }
  }, [demoMode, overlay]);

  // Reset when the mode flips at runtime (the "Populate platform" toggle):
  // re-seed from localStorage entering demo, drop to "defer to server" going
  // live. React's "adjust state during render" pattern rather than an effect, so
  // there's no cascading-render round-trip — same as ConnectionsProvider:113-117.
  const [prevDemo, setPrevDemo] = useState(demoMode);
  if (prevDemo !== demoMode) {
    setPrevDemo(demoMode);
    setOverlay(demoMode ? readInitial() : undefined);
  }

  const affiliate = useCallback(
    (companySlug: string, role: string) => {
      if (demoMode) {
        // Create-it-live: granted instantly, unchanged prototype behaviour.
        setOverlay({ companySlug, role, status: "active" });
        return;
      }
      // MOVED VERBATIM from the pre-phase-3 provider, `let` capture and all.
      // Yes, capturing `previous` inside a setState updater is StrictMode-
      // fragile. It is preserved on purpose: this phase relocates state, it does
      // not redesign rollback. Changing it here would put an untested behaviour
      // change inside a refactor whose proof of success is a request count.
      let previous: AffiliationOverlay = undefined;
      setOverlay((prev) => {
        previous = prev;
        return { companySlug, role, status: "pending" };
      });
      postAffiliation({ companySlug, role })
        .then((dto) => {
          const confirmed: EmployerAffiliation = {
            companySlug: dto.companySlug,
            role: dto.role,
            status: dto.status,
          };
          setOverlay(confirmed);
          // Added in phase 3: keep the cache honest. The overlay outranks the
          // query for the rest of the session, so this is not what the member
          // sees — it stops a later subscriber (or a devtools reader) finding a
          // cache entry that contradicts the overlay. Costs no request.
          queryClient.setQueryData(affiliationQueryKey(false), confirmed);
        })
        .catch((err) => {
          logError(err);
          setOverlay(previous);
        });
    },
    [demoMode, queryClient],
  );

  const clearAffiliation = useCallback(() => {
    if (demoMode) {
      setOverlay(null);
      return;
    }
    // MOVED VERBATIM — see the note in `affiliate`.
    let previous: AffiliationOverlay = undefined;
    setOverlay((prev) => {
      previous = prev;
      return null;
    });
    deleteAffiliation()
      .then(() => {
        queryClient.setQueryData(affiliationQueryKey(false), null);
      })
      .catch((err) => {
        logError(err);
        setOverlay(previous);
      });
  }, [demoMode, queryClient]);

  const value = useMemo(
    () => ({ overlay, affiliate, clearAffiliation }),
    [overlay, affiliate, clearAffiliation],
  );

  return (
    <EmployerAffiliationContext.Provider value={value}>
      {children}
    </EmployerAffiliationContext.Provider>
  );
}
