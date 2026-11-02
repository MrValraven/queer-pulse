import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useHasEarlyAccess } from "../../auth/api/useMyEarlyAccess";

/** Flips to true at launch, when every host gets "Add a month of events". */
export const IS_EVENT_BATCH_LAUNCHED = false;

/**
 * Whether the viewer can use "Add a month of events", modelled on `useIsQuizshowVisible`.
 * There is no dev-build clause: a dev build talks to a live backend that answers 404 without the grant.
 */
export function isAddEventMonthAvailable(options: {
  isDemoMode: boolean;
  hasEarlyAccess: boolean;
}): boolean {
  return (
    options.isDemoMode || IS_EVENT_BATCH_LAUNCHED || options.hasEarlyAccess
  );
}

/** `isAddEventMonthAvailable` for the current viewer: demo mode plus their own `eventBatch` grant. */
export function useCanAddEventMonth(): boolean {
  const { demoMode } = useDemoMode();
  const hasEarlyAccess = useHasEarlyAccess("eventBatch");
  return isAddEventMonthAvailable({ isDemoMode: demoMode, hasEarlyAccess });
}
