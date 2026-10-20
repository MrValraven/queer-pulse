import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { UpdateCommunityDto } from "../../features/communities/api/communities.api";
import type { CommunityGivingDTO } from "../../features/communities/api/communityGiving.api";
import { useDemoMode } from "./DemoModeProvider";
import { CommunityEditsContext } from "./useCommunityEdits";

/**
 * Session-level store for owner/mod edits to community info — the DEMO source of
 * truth, and nothing more. In live mode the server owns community info: the edit
 * modal PATCHes `/communities/:slug` and the detail query refetches, so this
 * store starts empty and stays empty (nothing writes to it in live mode).
 *
 * It also holds demo edits to a community's support section (`givingOverrides`),
 * so a saved section survives the tab unmounting and clears with the demo
 * toggle like every other demo edit. Live saves PUT `/communities/:slug/giving`
 * and never write here.
 */
export function CommunityEditsProvider({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  const [overrides, setOverrides] = useState<
    Record<string, UpdateCommunityDto>
  >({});
  const [givingOverrides, setGivingOverrides] = useState<
    Record<string, CommunityGivingDTO>
  >({});

  // Clear when the "Populate platform" toggle flips: edits are demo-only fiction.
  const [previousDemoMode, setPreviousDemoMode] = useState(demoMode);
  if (previousDemoMode !== demoMode) {
    setPreviousDemoMode(demoMode);
    setOverrides({});
    setGivingOverrides({});
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

  const givingOverrideFor = useCallback(
    (slug: string) => givingOverrides[slug],
    [givingOverrides],
  );

  const applyGivingOverride = useCallback(
    (slug: string, giving: CommunityGivingDTO) => {
      setGivingOverrides((previous) => ({ ...previous, [slug]: giving }));
    },
    [],
  );

  const value = useMemo(
    () => ({
      overrides,
      overrideFor,
      applyOverride,
      givingOverrides,
      givingOverrideFor,
      applyGivingOverride,
    }),
    [
      overrides,
      overrideFor,
      applyOverride,
      givingOverrides,
      givingOverrideFor,
      applyGivingOverride,
    ],
  );

  return (
    <CommunityEditsContext.Provider value={value}>
      {children}
    </CommunityEditsContext.Provider>
  );
}
