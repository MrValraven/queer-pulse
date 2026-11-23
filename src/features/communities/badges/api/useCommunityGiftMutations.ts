import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useDemoMode } from "../../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import {
  demoRemoveGift,
  demoSendGift,
  demoSetGiftHidden,
} from "../communityBadgesDemoStore";
import { useDemoBadgeViewerResolver } from "../useDemoBadgeViewer";
import {
  removeCommunityGift,
  sendCommunityGift,
  updateCommunityGift,
  type CommunitySentGiftDTO,
  type CommunityShelfGiftDTO,
  type SendCommunityGiftBody,
} from "./communityBadges.api";
import {
  communityBadgeKeys,
  demoViewerKeyPart,
  refreshLiveNameLines,
} from "./communityBadgeKeys";

/**
 * Gift writes. Every one answers its own error in the dialog that fired it, so
 * each carries `meta.silentError`. Success re-reads the badge queries of the
 * community; live also re-reads the roster, posts and loaded-more replies, which carry the gift
 * mark on a name line (demo reads the mark from the store, so it needs no such
 * refetch).
 */

function refreshAfterGiftWrite(
  queryClient: QueryClient,
  slug: string,
  isDemoMode: boolean,
): void {
  void queryClient.invalidateQueries({
    queryKey: communityBadgeKeys.all(slug),
  });
  if (isDemoMode) return;
  refreshLiveNameLines(queryClient, slug);
}

/** Sends a gift. The server's fresh allowance goes straight into the cache, so
 *  the dialog's counter is right before the refetch lands. */
export function useSendCommunityGift(
  slug: string,
): UseMutationResult<CommunitySentGiftDTO, Error, SendCommunityGiftBody> {
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  const { language } = useTranslation();
  const resolveViewer = useDemoBadgeViewerResolver();
  return useMutation<CommunitySentGiftDTO, Error, SendCommunityGiftBody>({
    meta: { silentError: true },
    mutationFn: async (body) =>
      demoMode
        ? demoSendGift(slug, resolveViewer(slug), body)
        : sendCommunityGift(slug, body),
    onSuccess: (sent) => {
      queryClient.setQueryData(
        communityBadgeKeys.allowance(
          slug,
          demoMode,
          language,
          demoMode ? demoViewerKeyPart(resolveViewer(slug)) : [],
        ),
        sent.allowance,
      );
      refreshAfterGiftWrite(queryClient, slug, demoMode);
    },
  });
}

/** The recipient hides or shows one gift's mark on their name line. */
export function useSetCommunityGiftHidden(
  slug: string,
): UseMutationResult<
  CommunityShelfGiftDTO,
  Error,
  { giftId: string; isHidden: boolean }
> {
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  const resolveViewer = useDemoBadgeViewerResolver();
  return useMutation<
    CommunityShelfGiftDTO,
    Error,
    { giftId: string; isHidden: boolean }
  >({
    meta: { silentError: true },
    mutationFn: async ({ giftId, isHidden }) =>
      demoMode
        ? demoSetGiftHidden(slug, resolveViewer(slug), giftId, isHidden)
        : updateCommunityGift(slug, giftId, isHidden),
    onSuccess: () => refreshAfterGiftWrite(queryClient, slug, demoMode),
  });
}

/** The sender, or an owner-level member, takes a gift back. */
export function useRemoveCommunityGift(
  slug: string,
): UseMutationResult<{ id: string }, Error, { giftId: string }> {
  const queryClient = useQueryClient();
  const { demoMode } = useDemoMode();
  const resolveViewer = useDemoBadgeViewerResolver();
  return useMutation<{ id: string }, Error, { giftId: string }>({
    meta: { silentError: true },
    mutationFn: async ({ giftId }) =>
      demoMode
        ? demoRemoveGift(slug, resolveViewer(slug), giftId)
        : removeCommunityGift(slug, giftId),
    onSuccess: () => refreshAfterGiftWrite(queryClient, slug, demoMode),
  });
}
