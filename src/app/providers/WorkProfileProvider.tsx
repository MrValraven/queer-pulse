import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface WorkProfileContextValue {
  /** Out-at-work spectrum value: 'out' | 'verified' | 'private'. */
  outAtWork: string;
  setOutAtWork: (v: string) => void;
  /** Selected trans-support option ids. */
  transSupport: string[];
  toggleTransSupport: (id: string) => void;
  /** Only surface community-verified-safe employers. */
  safeOnly: boolean;
  setSafeOnly: (v: boolean) => void;
}

const WorkProfileContext = createContext<WorkProfileContextValue | null>(null);

/** Session-level store for the member's Work Profile safety preferences. */
export function WorkProfileProvider({ children }: { children: ReactNode }) {
  const [outAtWork, setOutAtWork] = useState("verified");
  const [transSupport, setTransSupport] = useState<string[]>([]);
  const [safeOnly, setSafeOnly] = useState(true);

  const toggleTransSupport = useCallback((id: string) => {
    setTransSupport((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const value = useMemo(
    () => ({
      outAtWork,
      setOutAtWork,
      transSupport,
      toggleTransSupport,
      safeOnly,
      setSafeOnly,
    }),
    [outAtWork, transSupport, toggleTransSupport, safeOnly],
  );

  return (
    <WorkProfileContext.Provider value={value}>
      {children}
    </WorkProfileContext.Provider>
  );
}

export function useWorkProfile() {
  const ctx = useContext(WorkProfileContext);
  if (!ctx) {
    throw new Error("useWorkProfile must be used within WorkProfileProvider");
  }
  return ctx;
}
