import type { ReactNode } from "react";
import { useSubprofiles } from "../../../features/subprofiles/api/useSubprofiles";
import { useMyPersonaInvites } from "../../../features/subprofiles/api/useMyPersonaInvites";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useAuth } from "../../../app/providers/authContext";
import { Badge } from "../ui";

/**
 * Trailing badge for the "Your personas" account-menu row (personas Phase 5,
 * M3): a persistent count of the member's own personas, plus a dot when a
 * co-owner invite is waiting on them. This is ongoing state, NOT a
 * dismissible discovery nudge — it is deliberately not gated by
 * `useNudges()`'s dismissal/cap rules (Decision §1). Returns `undefined`
 * when there's nothing to show (no personas, no pending invite), so the row
 * renders with no badge at all rather than an empty pill. Shared by both
 * `AccountMenu` (desktop) and `AccountSheet` (mobile) so the two surfaces
 * stay consistent.
 */
export function usePersonaBadge(): ReactNode {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  // GATE: this badge renders on EVERY page (it's inside the account-menu row),
  // so it must not fetch `GET /subprofiles/mine` until the session is settled,
  // the member is signed in, AND their status is `"active"` — the exact guard
  // `useMyPersonaInvites` uses. `/subprofiles/mine` sits behind
  // `ActiveMemberGuard`, so a logged-out/visitor viewer never hits it, and a
  // signed-in-but-pending/suspended member would otherwise 403 on every page
  // load. Demo mode is always enabled (a local, network-free mock read).
  // `retry: false` so a guard rejection isn't hard-retried.
  const canFetch = demoMode || (!checking && loggedIn && status === "active");
  const { data: personas } = useSubprofiles({
    enabled: canFetch,
    retry: false,
  });
  const { data: invites } = useMyPersonaInvites();
  const personaCount = personas?.length ?? 0;
  const hasPendingInvite = (invites?.length ?? 0) > 0;
  if (personaCount === 0 && !hasPendingInvite) return undefined;
  return (
    <Badge tone="plum" dot={hasPendingInvite}>
      {personaCount > 0 ? personaCount : null}
    </Badge>
  );
}
