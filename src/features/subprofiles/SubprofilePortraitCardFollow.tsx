import { FiUserCheck, FiUserPlus } from "react-icons/fi";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFollow } from "./api/useFollow";
import { personaFollowErrorKey } from "./api/personaFollowError";
import styles from "./SubprofilePortraitCard.module.css";

export interface SubprofilePortraitCardFollowProps {
  /** The persona id the follow routes key on. */
  personaId: string;
  /** The name the card shows. It follows the visible label in the button's
   *  accessible name, hidden from sight. */
  personaName: string;
  followerCount: number;
  viewerFollowing: boolean;
}

/**
 * The portrait card's Follow toggle. On a wide card it is the outline button
 * beside View persona; in compact mode the card's CSS moves it onto the
 * picture's corner as a 44px icon disc. It sits above the card's stretched
 * link on z-index and lives outside that link in the DOM. `useFollow` patches
 * the directory cache on success, so the pressed state arrives through props.
 * A bare button on purpose: the shared pill cannot become the corner disc.
 */
export function SubprofilePortraitCardFollow({
  personaId,
  personaName,
  followerCount,
  viewerFollowing,
}: SubprofilePortraitCardFollowProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { follow, unfollow } = useFollow(personaId);
  const isPending = follow.isPending || unfollow.isPending;

  function toggleFollow() {
    if (isPending) return;
    const mutation = viewerFollowing ? unfollow : follow;
    mutation
      .mutateAsync({ currentFollowerCount: followerCount })
      .catch((error: unknown) => {
        showToast(t(personaFollowErrorKey(error)), "error");
      });
  }

  const FollowIcon = viewerFollowing ? FiUserCheck : FiUserPlus;

  return (
    <button
      type="button"
      className={styles.follow}
      data-following={viewerFollowing ? "true" : undefined}
      // aria-disabled keeps the button focused while the call is in flight;
      // a real `disabled` would drop keyboard focus to the page.
      aria-disabled={isPending || undefined}
      onClick={toggleFollow}
    >
      <FollowIcon aria-hidden className={styles.followIcon} />
      <span className={styles.followLabel}>
        {t(
          viewerFollowing
            ? "subprofiles:hero.follow.following"
            : "subprofiles:hero.follow.cta",
        )}
      </span>
      {/* The name finishes the visible label, so the accessible name reads
          "Follow Alex" or "Following Alex" and still matches what shows. */}
      <span className={styles.visuallyHidden}> {personaName}</span>
    </button>
  );
}
