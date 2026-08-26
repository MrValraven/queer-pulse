import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  flagSafeSpace,
  withdrawSafeSpaceFlag,
  type MemberSafeSpaceFlagDTO,
  type SafeSpaceFlagReason,
} from "./safeSpaceGovernance.api";
import { SAFE_SPACE_BADGE_STATE_KEY } from "./useSafeSpaceBadgeState";

export interface SafeSpaceFlagInput {
  /** The space's listing slug (the public URL id). */
  slug: string;
  reasonCode: SafeSpaceFlagReason;
  detail?: string;
}

/**
 * Raise a flag against a badged safe space.
 *
 * The write is idempotent server-side: flagging twice returns the existing
 * flag with `wasAlreadyFlagged: true` rather than counting a second time, so
 * a nervous double tap costs the member nothing and cannot move a badge.
 *
 * Demo mode resolves without a network call, returning a shaped response so
 * the confirmation panel reads the same in both modes.
 */
export function useFlagSafeSpace() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<MemberSafeSpaceFlagDTO, Error, SafeSpaceFlagInput>({
    mutationFn: async ({ slug, reasonCode, detail }) => {
      if (demoMode) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          id: "demo-flag",
          listingSlug: slug,
          reasonCode,
          state: "open",
          createdAt: new Date().toISOString(),
          resolvedAt: null,
          resolution: null,
          wasAlreadyFlagged: false,
        };
      }
      return flagSafeSpace(slug, { reasonCode, detail });
    },
    onSuccess: (_flag, { slug }) => {
      void queryClient.invalidateQueries({
        queryKey: [SAFE_SPACE_BADGE_STATE_KEY, slug],
      });
    },
  });
}

/** Withdraw the current member's own flag. */
export function useWithdrawSafeSpaceFlag() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<{ ok: true }, Error, { slug: string }>({
    mutationFn: async ({ slug }) => {
      if (demoMode) return { ok: true };
      return withdrawSafeSpaceFlag(slug);
    },
    onSuccess: (_result, { slug }) => {
      void queryClient.invalidateQueries({
        queryKey: [SAFE_SPACE_BADGE_STATE_KEY, slug],
      });
    },
  });
}
