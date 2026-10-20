import { useCallback, useContext } from "react";
import { AuthContext } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import type { AccountItem } from "./accountMenu.data";

/**
 * The per-row visibility rule for ACCOUNT_GROUPS, read once per render and
 * returned as a predicate so the row filters can call it per item (a hook
 * cannot run inside a `.filter` callback).
 *
 * - `liveOnly` rows drop out in demo mode.
 * - `earlyAccess` rows show to members holding that grant, plus demo mode and
 *   `pnpm dev` so the row can be checked locally. The grant list is read the
 *   same way `useHasEarlyAccess` reads it, straight off the auth context, so a
 *   render without an `AuthProvider` reads "no grant". Launch flags such as
 *   `IS_QUIZSHOW_LAUNCHED` play no part: the row is for members who have the
 *   feature switched on for them.
 *
 * Shared by `AccountMenu` (desktop) and `AccountSheet` (mobile) so the two
 * surfaces never drift.
 */
export function useAccountRowVisibility(): (item: AccountItem) => boolean {
  const { demoMode } = useDemoMode();
  const auth = useContext(AuthContext);
  const grantedFeatures = auth?.user?.earlyAccessFeatures;
  return useCallback(
    (item: AccountItem) => {
      if (item.liveOnly && demoMode) return false;
      if (!item.earlyAccess) return true;
      if (demoMode || import.meta.env.DEV) return true;
      return grantedFeatures?.includes(item.earlyAccess) ?? false;
    },
    [demoMode, grantedFeatures],
  );
}
