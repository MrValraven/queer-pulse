import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioLike, type StudioLikeSubject } from "./useStudioLike";

/** Why a hero's heart cannot like a track, or undefined when it can. The
 *  owner of a taken-down release reads its tracks, and a like there would
 *  land in Liked songs as Withdrawn, so the heart names the cause. A track
 *  already liked stays unlikeable, so the heart still takes it out. */
export function useStudioLikeBlockedReason(
  subject: StudioLikeSubject,
  isReleaseWithdrawn: boolean | undefined,
): string | undefined {
  const { t } = useTranslation();
  const { isLiked } = useStudioLike(subject);
  return isReleaseWithdrawn === true && !isLiked
    ? t("studio:like.blockedWithdrawn")
    : undefined;
}
