import type { ReactNode } from "react";
import { Badge } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useAuth } from "../../app/providers/authContext";
import { useMyCommunityOwnershipOffers } from "./api/useCommunityOwnershipOffers";
import { COMMUNITY_INVITATIONS_PATH } from "./communityInvitations.path";

/**
 * How many ownership offers wait on this member's answer (PRD-514). Zero
 * while the list loads, after a failed read, and when nothing is waiting.
 *
 * GATE: this mounts on every page, so `GET /me/community-ownership-offers`
 * waits for a settled, signed-in, active session, with `retry: false` so a
 * guard rejection is not retried. Demo reads the colocated mock inbox. Every
 * caller shares the one query, so the badge, the row link and the trigger
 * dot never disagree.
 */
export function useWaitingOwnershipOfferCount(): number {
  const { demoMode } = useDemoMode();
  const { loggedIn, checking, status } = useAuth();
  const canFetch = demoMode || (!checking && loggedIn && status === "active");
  const { offers } = useMyCommunityOwnershipOffers({
    enabled: canFetch,
    retry: false,
  });
  return canFetch ? offers.length : 0;
}

/**
 * Where the account menu's communities row leads while offers wait: the
 * invitations page, which lists them with their answer buttons. `undefined`
 * when nothing waits, so the row keeps its own link.
 */
export function useOwnershipOfferRowHref(): string | undefined {
  return useWaitingOwnershipOfferCount() > 0
    ? COMMUNITY_INVITATIONS_PATH
    : undefined;
}

/**
 * Trailing badge for the account menu's communities row (PRD-514, and the
 * project rule that a member with ownership claims to review sees a badge): a
 * coral count with a dot while ownership offers wait on this member's answer.
 *
 * Renders nothing (returns `undefined`) when nothing is waiting, the same
 * "render nothing for a zero" rule `usePersonaBadge` and `useInviteQuotaBadge`
 * follow. Assistive tech skips the bare count and hears the full sentence, so
 * the row reads "Communities, 1 ownership offer waiting". Shared by
 * `AccountMenu` and `AccountSheet` so the two never drift.
 */
export function useCommunityOwnershipOfferBadge(): ReactNode {
  const { t } = useTranslation();
  const count = useWaitingOwnershipOfferCount();
  if (count === 0) return undefined;
  return (
    <Badge tone="coral" dot>
      <span aria-hidden>{count}</span>
      <span className="visuallyHidden">
        {t("communities:ownershipOffer.badgeLabel", { count })}
      </span>
    </Badge>
  );
}
