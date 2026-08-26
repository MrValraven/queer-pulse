import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  claimPerk,
  setBadgeVisibility,
  type BadgeVisibilityDTO,
  type PerkClaimDTO,
} from "./recognition.api";

/**
 * Claim an unlocked perk (`POST /me/recognition/perks/:key/claim`).
 *
 * Until SUS-04 the backend had no claim route at all, so the perks page could
 * only simulate the redemption in demo and refuse it in live. It is real now:
 * the backend recomputes the caller's level from stored XP, refuses a claim
 * below the perk's unlock level with a 403, writes one row (idempotently), and
 * the claimed invite-quota perks feed `InvitesService`'s monthly limit.
 *
 * Demo resolves without a network call, exactly like `useVouchMember`. Live
 * invalidates every recognition query so the perk moves into "Already
 * claimed" and the level/perk chips agree with the new state.
 */
export function useClaimPerk() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<PerkClaimDTO | undefined, Error, string>({
    mutationFn: async (perkKey) => {
      if (demoMode) return undefined;
      return claimPerk(perkKey);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["recognition"] });
      // The compose page's "N invites available this month" panel reads the
      // quota the claim just raised.
      void queryClient.invalidateQueries({ queryKey: ["invite-quota"] });
    },
  });
}

export interface BadgeVisibilityInput {
  badgeKey: string;
  hiddenFromProfile: boolean;
}

/**
 * Hide one earned badge from how other members see you, or show it again
 * (`PATCH /me/recognition/badges/:key/visibility`).
 *
 * This used to be a `localStorage` flag whose own help text admitted it
 * changed nothing for anybody else. It is a server column now, honoured on the
 * read path: another member's view of you omits the badge entirely, and your
 * own view keeps it, flagged.
 */
export function useSetBadgeVisibility() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<
    BadgeVisibilityDTO | undefined,
    Error,
    BadgeVisibilityInput
  >({
    mutationFn: async ({ badgeKey, hiddenFromProfile }) => {
      if (demoMode) return undefined;
      return setBadgeVisibility(badgeKey, hiddenFromProfile);
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({ queryKey: ["recognition"] });
    },
  });
}
