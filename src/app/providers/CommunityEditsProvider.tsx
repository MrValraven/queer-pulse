import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UpdateCommunityDto } from "../../features/communities/api/communities.api";
import { useDemoMode } from "./DemoModeProvider";

interface CommunityEditsContextValue {
  /** Merged edit patch per community slug — DEMO source of truth only. */
  overrides: Record<string, UpdateCommunityDto>;
  overrideFor: (slug: string) => UpdateCommunityDto | undefined;
  applyOverride: (slug: string, patch: UpdateCommunityDto) => void;
}

const CommunityEditsContext =
  createContext<CommunityEditsContextValue | null>(null);

/**
 * Session-level store for owner/mod edits to community info — the DEMO source of
 * truth, and nothing more. In live mode the server owns community info: the edit
 * modal PATCHes `/communities/:slug` and the detail query refetches, so this
 * store starts empty and stays empty (nothing writes to it in live mode).
 */
export function CommunityEditsProvider({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  const [overrides, setOverrides] = useState<
    Record<string, UpdateCommunityDto>
  >({});

  // Clear when the "Populate platform" toggle flips: edits are demo-only fiction.
  const [previousDemoMode, setPreviousDemoMode] = useState(demoMode);
  if (previousDemoMode !== demoMode) {
    setPreviousDemoMode(demoMode);
    setOverrides({});
  }

  const overrideFor = useCallback(
    (slug: string) => overrides[slug],
    [overrides],
  );

  const applyOverride = useCallback(
    (slug: string, patch: UpdateCommunityDto) => {
      setOverrides((previous) => ({
        ...previous,
        [slug]: { ...previous[slug], ...patch },
      }));
    },
    [],
  );

  const value = useMemo(
    () => ({ overrides, overrideFor, applyOverride }),
    [overrides, overrideFor, applyOverride],
  );

  return (
    <CommunityEditsContext.Provider value={value}>
      {children}
    </CommunityEditsContext.Provider>
  );
}

export function useCommunityEdits() {
  const context = useContext(CommunityEditsContext);
  if (!context) {
    throw new Error(
      "useCommunityEdits must be used within CommunityEditsProvider",
    );
  }
  return context;
}
