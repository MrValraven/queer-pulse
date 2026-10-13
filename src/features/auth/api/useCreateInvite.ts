import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { INVITE_CODE, inviteFullUrlFor, inviteUrlFor } from "../invite.data";
import { createInvite, type CreateInvitePayload } from "./invite.api";
import { inviteQuotaKey } from "./useInviteQuota";
import { sentInviteKeys } from "./useSentInvites";

/** A persisted invite, with the share-ready links derived from its code. */
export interface CreatedInvite {
  code: string;
  /** Display link, e.g. "queerpulse.com/invite/QP-7F3K-2026". */
  url: string;
  /** Full shareable URL with scheme. */
  fullUrl: string;
  expiresAt: string;
}

/**
 * Persist an invite via POST /invites and return its share links. Demo mode skips
 * the network and echoes the sample code, so the share flow works with no backend.
 *
 * Live mode then refreshes the sent-invite lists and counts and the monthly
 * allowance, so the new invite shows in the list below the panel and the
 * remaining count drops by one. Demo's echo persists nothing (the demo list is
 * its fixture), so demo leaves both caches as they are.
 */
export function useCreateInvite() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<CreatedInvite, Error, CreateInvitePayload>({
    // InviteLinkPanel toasts its own error, so silence the global duplicate.
    meta: { silentError: true },
    mutationFn: async (payload) => {
      if (demoMode) {
        return {
          code: INVITE_CODE,
          url: inviteUrlFor(INVITE_CODE),
          fullUrl: inviteFullUrlFor(INVITE_CODE),
          expiresAt: "",
        };
      }
      const dto = await createInvite(payload);
      return {
        code: dto.code,
        url: inviteUrlFor(dto.code),
        fullUrl: inviteFullUrlFor(dto.code),
        expiresAt: dto.expiresAt,
      };
    },
    onSuccess: () => {
      if (demoMode) return;
      void queryClient.invalidateQueries({
        queryKey: sentInviteKeys.root(demoMode),
      });
      void queryClient.invalidateQueries({
        queryKey: inviteQuotaKey(demoMode),
      });
    },
  });
}
