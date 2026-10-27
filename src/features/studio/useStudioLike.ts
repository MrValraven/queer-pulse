import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSaved, type SavedItem } from "../../app/providers/useSaved";
import { useStorageScope } from "../../app/providers/useStorageScope";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioSavedId } from "./api/studio.adapters";
import { readStudioLikedStatus } from "./api/studioLikedStatusBatcher";
import { studioKeys } from "./api/studioQueryKeys";
import { useStudioAccess } from "./api/useStudioAccess";

/** The track a heart likes. Liked songs are `studio_track` saves, so the
 *  title, link and artist name become the saved item's snapshot. */
export interface StudioLikeSubject {
  trackId: string;
  title: string;
  href: string;
  artistName: string;
}

/** Like or unlike a track: Liked songs is the member's private default
 *  playlist, kept in the existing Saved feature. `toggle` returns the new
 *  state (true once liked) and confirms it with a toast. A null subject
 *  reads as not liked and toggles nothing. Live, Liked songs reads again
 *  once the server holds the change, so its list and count catch up. The
 *  demo list is keyed by the saved ids, so it reads again by itself.
 *  `isQuiet` skips the toast, for a surface that confirms the change itself
 *  (a Liked songs row fades out and hands focus on).
 *
 *  Live, the Saved store holds the newest saves only, so a heart whose track
 *  it lacks asks the server once whether it is liked (hearts mounted
 *  together share one request) and, when it is, puts the like into the
 *  store. A heart then reads right whichever page of Liked songs holds the
 *  like. */
export function useStudioLike(
  subject: StudioLikeSubject | null,
  options: { isQuiet?: boolean } = {},
): {
  isLiked: boolean;
  toggle: () => boolean;
} {
  const { isSaved, toggleSave, remember, readSaveScope } = useSaved();
  const { demoMode } = useDemoMode();
  const { hasAccess } = useStudioAccess();
  const scopeId = useStorageScope();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const savedId = subject ? studioSavedId.track(subject.trackId) : null;
  const isLiked = savedId ? isSaved(savedId) : false;
  // A member's own press settles the state, so the lookup stops there.
  const [hasToggled, setHasToggled] = useState(false);
  useQuery({
    queryKey: studioKeys.likedStatus(scopeId, subject?.trackId ?? ""),
    enabled:
      !demoMode && hasAccess && subject !== null && !isLiked && !hasToggled,
    staleTime: Number.POSITIVE_INFINITY,
    queryFn: async () => {
      if (!subject || !savedId) return false;
      // Read before the request: an answer that lands after another member
      // signed in on this device stays out of their store.
      const scopeAtRead = readSaveScope();
      const isLikedOnServer = await readStudioLikedStatus(subject.trackId);
      if (isLikedOnServer)
        remember(
          [
            {
              id: savedId,
              kind: "studio_track",
              title: subject.title,
              href: subject.href,
              meta: subject.artistName,
            },
          ],
          { scopeAtRead },
        );
      return isLikedOnServer;
    },
  });
  return {
    isLiked,
    toggle: () => {
      if (!subject || !savedId) return false;
      setHasToggled(true);
      const item: SavedItem = {
        id: savedId,
        kind: "studio_track",
        title: subject.title,
        href: subject.href,
        meta: subject.artistName,
      };
      const isNowLiked = demoMode
        ? toggleSave(item)
        : toggleSave(item, {
            onSynced: () =>
              void queryClient.invalidateQueries({
                queryKey: studioKeys.likedTracks(false),
              }),
          });
      if (options.isQuiet) return isNowLiked;
      showToast(
        isNowLiked
          ? t("studio:like.addedToast")
          : t("studio:like.removedToast"),
        isNowLiked ? "success" : "info",
      );
      return isNowLiked;
    },
  };
}
