import { useEffect } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  VJ_LIBRARY_CHANGE_KINDS,
  type VjLibraryChange,
} from "../../../shared/contracts/vj";
import { openVjDemoChannel, VJ_DEMO_TAB_ID } from "../demo/vjDemoChannel";
import { useInvalidateVjLibrary } from "./useInvalidateVjLibrary";

function isVjLibraryChange(payload: unknown): payload is VjLibraryChange {
  if (typeof payload !== "object" || payload === null) return false;
  const candidate = payload as Partial<VjLibraryChange>;
  return (
    VJ_LIBRARY_CHANGE_KINDS.some((kind) => kind === candidate.kind) &&
    Array.isArray(candidate.packIds)
  );
}

/**
 * Demo only. The library lives in storage every demo tab shares, so a write in
 * another tab arrives as a `library:changed` message on the demo channel and
 * refreshes this tab's queries. Live mode reads again on mount and focus.
 */
export function useVjDemoLibrarySync(): void {
  const { demoMode } = useDemoMode();
  const invalidateLibrary = useInvalidateVjLibrary();
  useEffect(() => {
    if (!demoMode) return undefined;
    const channel = openVjDemoChannel();
    const unsubscribe = channel.subscribe((message) => {
      if (message.name !== "library:changed") return;
      if (message.tabId === VJ_DEMO_TAB_ID) return;
      invalidateLibrary(
        isVjLibraryChange(message.payload) ? message.payload : null,
      );
    });
    return () => {
      unsubscribe();
      channel.close();
    };
  }, [demoMode, invalidateLibrary]);
}
