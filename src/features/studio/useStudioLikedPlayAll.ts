import { useRef, useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioLikedTracksResult } from "./api/useStudioLikedTracks";
import { useStudioPlayer } from "./player/studioPlayerContext";
import { queueFromTracks, shuffledQueue } from "./player/studioQueue";
import { studioReasonCopyKey, studioReasonOf } from "./studioReason";

export type StudioLikedPlayMode = "play" | "shuffle";

export type StudioLikedPlayAll = ReturnType<typeof useStudioLikedPlayAll>;

/**
 * Play and Shuffle over every like the member holds: with pages
 * still waiting, each reads the rest first (`pendingMode` says which button
 * asked), then queues the whole set; Shuffle shuffles all of it in the
 * browser and sends nothing. Pressing again while it reads cancels it and
 * stops the page reads; a failed read says why and plays nothing, and so
 * does a set with nothing that can play. Share one per page: the hero and
 * the sticky header show the same state.
 */
export function useStudioLikedPlayAll(liked: StudioLikedTracksResult) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const player = useStudioPlayer();
  const [pendingMode, setPendingMode] = useState<StudioLikedPlayMode | null>(
    null,
  );
  // Each press takes a number; a read that settles after a newer press (or
  // a cancel) plays nothing.
  const requestRef = useRef(0);

  async function start(mode: StudioLikedPlayMode) {
    requestRef.current += 1;
    const requestId = requestRef.current;
    let tracks = liked.playableTracks;
    if (liked.hasMore) {
      setPendingMode(mode);
      const isCancelled = () => requestRef.current !== requestId;
      try {
        const loaded = await liked.loadAllPlayableTracks({ isCancelled });
        if (loaded === null) return;
        tracks = loaded;
      } catch (error) {
        if (requestRef.current !== requestId) return;
        setPendingMode(null);
        showToast(
          t("studio:liked.page.loadAllError", {
            reason: t(studioReasonCopyKey(studioReasonOf(error), "load")),
          }),
          "error",
        );
        return;
      }
      if (requestRef.current !== requestId) return;
      setPendingMode(null);
    }
    const queue = queueFromTracks(tracks);
    if (queue.length === 0) {
      showToast(t("studio:liked.page.nothingToPlayToast"), "info");
      return;
    }
    void player.playTracks(mode === "shuffle" ? shuffledQueue(queue) : queue);
  }

  return {
    pendingMode,
    start: (mode: StudioLikedPlayMode) => void start(mode),
    cancel: () => {
      requestRef.current += 1;
      setPendingMode(null);
    },
  };
}
