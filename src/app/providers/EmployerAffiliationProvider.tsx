import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getAffiliation,
  postAffiliation,
  deleteAffiliation,
} from "../../features/economy/api/affiliation.api";
import { useDemoMode } from "./DemoModeProvider";
import { useAuth } from "./authContext";
import { logError } from "../../shared/observability/logger";

/** Which company the current member is authorised to post jobs for. */
export interface EmployerAffiliation {
  companySlug: string;
  /** The member's role at the company, e.g. "Founder", "Hiring lead". */
  role: string;
  /** Live-only lifecycle: `pending` while affiliation is confirmed, then `active`.
   *  Optional — consumers only check the affiliation is non-null. */
  status?: "pending" | "active";
}

interface EmployerAffiliationContextValue {
  affiliation: EmployerAffiliation | null;
  /** Grant (or switch) the member's employer affiliation — simulated instantly. */
  affiliate: (companySlug: string, role: string) => void;
  clearAffiliation: () => void;
}

const STORAGE_KEY = "qp-employer-affiliation";

const EmployerAffiliationContext =
  createContext<EmployerAffiliationContextValue | null>(null);

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
 * Session store for the member's employer affiliation. Default is `null` — an
 * ordinary member with no company to post for — so the posting gate is visible.
 * In demo mode affiliating is simulated instantly (create-it-live, `active`) and
 * persisted so it survives a reload. In live mode the affiliation is hydrated
 * from GET /me/affiliation, requesting it POSTs (optimistically `pending`, then
 * the server-confirmed status), and clearing it DELETEs — both with rollback.
 */
export function EmployerAffiliationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [affiliation, setAffiliation] = useState<EmployerAffiliation | null>(
    readInitial,
  );
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (affiliation) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(affiliation));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage failures (private mode, quota) — session state still works.
    }
  }, [affiliation]);

  // Live hydration — the member's real affiliation. Never hits the network in
  // demo mode or while logged out (re-runs once login lands).
  useEffect(() => {
    if (demoMode || !loggedIn) return;
    let active = true;
    getAffiliation()
      .then((dto) => {
        if (!active) return;
        setAffiliation(
          dto
            ? {
                companySlug: dto.companySlug,
                role: dto.role,
                status: dto.status,
              }
            : null,
        );
      })
      .catch((err) => {
        logError(err);
      });
    return () => {
      active = false;
    };
  }, [demoMode, loggedIn]);

  const affiliate = useCallback(
    (companySlug: string, role: string) => {
      if (demoMode) {
        // Create-it-live: granted instantly, unchanged prototype behaviour.
        setAffiliation({ companySlug, role, status: "active" });
        return;
      }
      let previous: EmployerAffiliation | null = null;
      setAffiliation((prev) => {
        previous = prev;
        return { companySlug, role, status: "pending" };
      });
      postAffiliation({ companySlug, role })
        .then((dto) => {
          setAffiliation({
            companySlug: dto.companySlug,
            role: dto.role,
            status: dto.status,
          });
        })
        .catch((err) => {
          logError(err);
          setAffiliation(previous);
        });
    },
    [demoMode],
  );

  const clearAffiliation = useCallback(() => {
    if (demoMode) {
      setAffiliation(null);
      return;
    }
    let previous: EmployerAffiliation | null = null;
    setAffiliation((prev) => {
      previous = prev;
      return null;
    });
    deleteAffiliation().catch((err) => {
      logError(err);
      setAffiliation(previous);
    });
  }, [demoMode]);

  const value = useMemo(
    () => ({ affiliation, affiliate, clearAffiliation }),
    [affiliation, affiliate, clearAffiliation],
  );

  return (
    <EmployerAffiliationContext.Provider value={value}>
      {children}
    </EmployerAffiliationContext.Provider>
  );
}

export function useEmployerAffiliation() {
  const ctx = useContext(EmployerAffiliationContext);
  if (!ctx) {
    throw new Error(
      "useEmployerAffiliation must be used within EmployerAffiliationProvider",
    );
  }
  return ctx;
}
