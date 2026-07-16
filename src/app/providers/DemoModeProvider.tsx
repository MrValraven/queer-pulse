import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiAvailable, demoConfigured } from "../../shared/api/config";

interface DemoModeValue {
  /** When true, the app renders mock data and never hits the network. */
  demoMode: boolean;
  /**
   * True when the runtime toggle is usable: demo has to be compiled in
   * (`VITE_DEMO=1`) AND there must be a live API to switch back to.
   */
  available: boolean;
  setDemoMode: (b: boolean) => void;
  toggle: () => void;
}

const DemoModeContext = createContext<DemoModeValue | null>(null);
const STORAGE_KEY = "qp.demoMode.v1";

/** The toggle only means something when demo is opted into AND live is reachable. */
const toggleable = demoConfigured && apiAvailable;

function readInitial(): boolean {
  // Demo is an explicit build-time opt-in. A missing/typo'd VITE_API_URL must
  // never be read as "the operator wanted demo" — that inference is the bug.
  if (!demoConfigured) return false;
  if (!apiAvailable) return true; // standalone prototype: demo is all there is
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false; // default OFF = live API
  }
}

/**
 * Global demo-mode switch, derived from the `VITE_DEMO=1` build-time opt-in
 * (see `shared/api/config.ts`) — never from the API merely looking unavailable.
 *
 * - `VITE_DEMO=1`, no `VITE_API_URL` → forced ON and locked. This is the
 *   standalone prototype, and it must keep working.
 * - `VITE_DEMO=1` + `VITE_API_URL` → default OFF (live); the "Populate platform"
 *   item in the account menu flips it and the choice persists. ON makes auth and
 *   every data hook short-circuit to the mock user and mock `.data.ts` content.
 * - No `VITE_DEMO` → demo is unreachable at runtime, whatever the API does. A
 *   normal production build therefore cannot fall into demo, and the demo-only
 *   admin role-guard bypass in `authGate.ts` is safe by construction.
 */
export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoModeState] = useState<boolean>(readInitial);

  useEffect(() => {
    if (!toggleable) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, demoMode ? "true" : "false");
    } catch {
      /* storage unavailable — in-memory only */
    }
  }, [demoMode]);

  const setDemoMode = useCallback((b: boolean) => {
    if (toggleable) setDemoModeState(b);
  }, []);

  const value = useMemo<DemoModeValue>(
    () => ({
      demoMode,
      available: toggleable,
      setDemoMode,
      toggle: () => setDemoMode(!demoMode),
    }),
    [demoMode, setDemoMode],
  );

  return (
    <DemoModeContext.Provider value={value}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode(): DemoModeValue {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error("useDemoMode must be used within DemoModeProvider");
  return ctx;
}
