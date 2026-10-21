import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSaved } from "../../app/providers/useSaved";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  likedEntryToSavedItem,
  type StudioLikedEntryView,
} from "./api/studioLiked.adapters";
import { studioKeys } from "./api/studioQueryKeys";

/** Bulk unlike and its Undo send at most this many requests at once. */
const SAVE_CONCURRENCY = 6;
/** How long a batch waits on a request that never confirms (a refusal
 *  rolls itself back without calling back). */
const SAVE_SETTLE_MS = 8000;

/**
 * Unliking inside Liked songs, with Undo. A row's heart has already taken
 * the like out when `confirmUnliked` runs, so it only offers it back; the
 * selection bar's Unlike takes every picked like out at once. Undo likes
 * again only what is still unliked, so a heart pressed meanwhile wins. Each
 * action shows one summary toast; live, Liked songs reads again once, after
 * every request settled.
 */
export function useStudioLikedUndo(): {
  confirmUnliked: (entry: StudioLikedEntryView) => void;
  unlikeMany: (entries: StudioLikedEntryView[]) => void;
} {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const saved = useSaved();
  // Undo runs seconds later: it must read the store as it is then.
  const savedRef = useRef(saved);
  useEffect(() => {
    savedRef.current = saved;
  }, [saved]);

  /** Likes or unlikes each entry that is not there yet, six requests at a
   *  time, then has Liked songs read once when all of them settled. An entry
   *  already in the wanted state is left alone, so a heart pressed meanwhile
   *  wins. A like brought back this way may come back at the top of Liked
   *  songs: the server stamps a new saved time. Accepted for now; a backend
   *  follow-up keeps the original saved time. */
  const setLiked = useCallback(
    async (entries: StudioLikedEntryView[], isLiked: boolean) => {
      const pending = entries.filter(
        (entry) => savedRef.current.isSaved(entry.savedId) !== isLiked,
      );
      if (pending.length === 0) return;
      for (let start = 0; start < pending.length; start += SAVE_CONCURRENCY) {
        // Each batch reads the store as it stands after the last one.
        const store = savedRef.current;
        const batch = pending.slice(start, start + SAVE_CONCURRENCY);
        await Promise.all(
          batch.map(
            (entry) =>
              new Promise<void>((resolve) => {
                if (store.isSaved(entry.savedId) === isLiked) {
                  resolve();
                  return;
                }
                if (demoMode) {
                  store.toggleSave(likedEntryToSavedItem(entry));
                  resolve();
                  return;
                }
                // A refused request rolls itself back and says so (the
                // Saved store's own toast); the wait ends either way.
                const timer = window.setTimeout(resolve, SAVE_SETTLE_MS);
                store.toggleSave(likedEntryToSavedItem(entry), {
                  onSynced: () => {
                    window.clearTimeout(timer);
                    resolve();
                  },
                });
              }),
          ),
        );
      }
      if (!demoMode)
        void queryClient.invalidateQueries({
          queryKey: studioKeys.likedTracks(false),
        });
    },
    [demoMode, queryClient],
  );

  const offerUndo = useCallback(
    (message: string, entries: StudioLikedEntryView[]) => {
      showToast(message, "info", undefined, {
        label: t("studio:liked.page.undoCta"),
        onClick: () => void setLiked(entries, true),
      });
    },
    [showToast, t, setLiked],
  );

  const confirmUnliked = useCallback(
    (entry: StudioLikedEntryView) =>
      offerUndo(t("studio:like.removedToast"), [entry]),
    [offerUndo, t],
  );

  const unlikeMany = useCallback(
    (entries: StudioLikedEntryView[]) => {
      const likedEntries = entries.filter((entry) =>
        savedRef.current.isSaved(entry.savedId),
      );
      if (likedEntries.length === 0) return;
      void setLiked(likedEntries, false);
      offerUndo(
        t("studio:liked.page.unlikedManyToast", {
          count: likedEntries.length,
        }),
        likedEntries,
      );
    },
    [setLiked, offerUndo, t],
  );

  return { confirmUnliked, unlikeMany };
}
