import type { ReactNode } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { Badge } from "../../shared/components/ui";
import { useGettingStarted } from "./useGettingStarted";

/**
 * Trailing badge for the "Getting started" account-menu row: a coral count of
 * the first-steps a member still has left. Returns `undefined` — so the row
 * renders with no pill — in demo mode (the surface is live-only), while the
 * eligibility signals are still resolving (so the count never flashes high then
 * settles), and once every step is done (nothing left to nudge). Shared by the
 * desktop `AccountMenu` and the mobile `AccountSheet` so the two stay in step.
 */
export function useGettingStartedBadge(): ReactNode {
  const { demoMode } = useDemoMode();
  const { completedCount, totalCount, loading } = useGettingStarted();
  const remaining = totalCount - completedCount;
  if (demoMode || loading || remaining <= 0) return undefined;
  return <Badge tone="coral">{remaining}</Badge>;
}
