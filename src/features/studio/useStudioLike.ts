import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSaved, type SavedItem } from "../../app/providers/useSaved";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioSavedId } from "./api/studio.adapters";
import { studioKeys } from "./api/studioQueryKeys";

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
 *  (a Liked songs row fades out and hands focus on). */
export function useStudioLike(
  subject: StudioLikeSubject | null,
  options: { isQuiet?: boolean } = {},
): {
  isLiked: boolean;
  toggle: () => boolean;
} {
  const { isSaved, toggleSave } = useSaved();
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const savedId = subject ? studioSavedId.track(subject.trackId) : null;
  return {
    isLiked: savedId ? isSaved(savedId) : false,
    toggle: () => {
      if (!subject || !savedId) return false;
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
