import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useToast } from "../../../shared/components/feedback/useToast";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { clearStudioRecentlyPlayed } from "../player/studioListeningMemory";
import { studioReasonCopyKey, studioReasonOf } from "../studioReason";
import { deleteStudioListening } from "./studioListening.api";
import type { StudioListeningSummaryDTO } from "./studioListening.types";
import { studioKeys } from "./studioQueryKeys";

/**
 * Clear listening history (CONTRACT-PART-2 section 4.3): the server's rows
 * and this device's Recently played. The cached summaries and history fold
 * to empty in place, so the lists close through their Collapse with no
 * skeleton flash. Artists you support and the history switch stay as they
 * are. `clearHistory` resolves true on success and false on a failure, which
 * toasts with its reason; it never rejects.
 */
export function useClearStudioListening(): {
  clearHistory: () => Promise<boolean>;
  isClearing: boolean;
} {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const mutation = useMutation<void, Error, void>({
    meta: { silentError: true },
    mutationFn: async () => {
      if (demoMode) {
        (await import("./studioDemoYourListening")).demoClearStudioListening();
        return;
      }
      await deleteStudioListening();
    },
    onSuccess: () => {
      clearStudioRecentlyPlayed();
      queryClient.setQueriesData<StudioListeningSummaryDTO>(
        { queryKey: studioKeys.listeningSummaries(demoMode) },
        (previous) =>
          previous && {
            ...previous,
            totalListens: 0,
            listeningDays: 0,
            topArtists: [],
            topTracks: [],
          },
      );
      // The shape useStudioCursorPages stores: one empty last page.
      queryClient.setQueryData(studioKeys.listeningRecent(demoMode), {
        pages: [{ items: [], nextCursor: null }],
        pageParams: [null],
      });
      showToast(t("studio:listening.clear.done"), "success");
    },
    onError: (error) => {
      showToast(
        `${t("studio:listening.clear.failed")}. ${t(
          studioReasonCopyKey(studioReasonOf(error), "save"),
        )}`,
        "error",
      );
    },
  });
  return {
    clearHistory: async () => {
      try {
        await mutation.mutateAsync();
        return true;
      } catch {
        return false;
      }
    },
    isClearing: mutation.isPending,
  };
}
