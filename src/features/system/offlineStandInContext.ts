import { createContext, useContext } from "react";

/**
 * True while the routed subtree is rendering PRD-375's OFFLINE STAND-IN
 * session: a cold offline launch restored from the saved messaging cache,
 * with a provisional member and no live network, or the same record read
 * mid-session while the connection is down. Provided by `OfflineGate`
 * (`src/features/system/OfflineGate.tsx`); false everywhere else, including
 * demo mode.
 *
 * Read by UI that needs to explain a gap THIS session cannot fill (a thread
 * the device never saved) without claiming that gap for a real,
 * fully-connected session too. See `MessageThreadOfflineEmptyState.tsx`.
 */
export const OfflineStandInContext = createContext(false);

export function useIsOfflineStandInSession(): boolean {
  return useContext(OfflineStandInContext);
}
