import type { ReactNode } from "react";
import { useInviteQuota } from "../../../features/auth/api/useInviteQuota";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { Badge } from "../ui";

/**
 * Trailing badge for the "Invite someone" account-menu row (ACQ-08): a coral
 * count of the invites this member still has left this month. Unspent invites
 * are the whole point of the row — five slots reset monthly and used to expire
 * unseen, because the invite page had exactly one entry point.
 *
 * It renders NOTHING (returns `undefined`, so the row carries no pill at all)
 * whenever the number would be absent or wrong: while the quota is still
 * loading, if the fetch failed, and when nothing is left. A "0" pill is noise
 * and a stale count is worse than none — the same "render nothing rather than a
 * zero" rule `usePersonaBadge` and `useGettingStartedBadge` follow.
 *
 * GATE: this mounts on EVERY page, so it copies the persona badge's guard
 * exactly — `GET /invites/quota` is only issued once the session is settled,
 * the member is signed in, AND their status is `"active"`, with `retry: false`
 * so a guard rejection isn't hard-retried. Demo mode reads the colocated mock
 * (`inviteQuota.data.ts`), which is why the row is NOT `liveOnly`: the demo
 * sandbox has a real allowance to show.
 *
 * Shared by `AccountMenu` (desktop) and `AccountSheet` (mobile) so the two
 * surfaces never drift.
 */
export function useInviteQuotaBadge(): ReactNode {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const canFetch = demoMode || (!checking && loggedIn && status === "active");
  const {
    data: quota,
    isLoading,
    isError,
  } = useInviteQuota({ enabled: canFetch, retry: false });
  if (isLoading || isError || !quota) return undefined;
  if (quota.remaining <= 0) return undefined;
  return <Badge tone="coral">{quota.remaining}</Badge>;
}
