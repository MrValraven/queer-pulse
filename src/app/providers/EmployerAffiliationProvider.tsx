import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Which company the current member is authorised to post jobs for. */
export interface EmployerAffiliation {
  companySlug: string;
  /** The member's role at the company, e.g. "Founder", "Hiring lead". */
  role: string;
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
 * Affiliating a company is simulated instantly (create-it-live) and persisted so
 * it survives a reload.
 */
export function EmployerAffiliationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [affiliation, setAffiliation] = useState<EmployerAffiliation | null>(
    readInitial,
  );

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

  const affiliate = useCallback((companySlug: string, role: string) => {
    setAffiliation({ companySlug, role });
  }, []);

  const clearAffiliation = useCallback(() => setAffiliation(null), []);

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
