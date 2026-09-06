import { useState } from "react";
import { FiHeart } from "react-icons/fi";
import {
  Button,
  EmptyState,
  LoadErrorState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FollowedPersonaRow } from "./FollowedPersonaRow";
import {
  FOLLOWED_PERSONAS_PAGE_SIZE,
  useFollowedPersonas,
  useUnfollowPersona,
} from "./api/useFollowedPersonas";
import styles from "./FollowedPersonas.module.css";

/** Skeleton rows while the first page loads: a screenful, no more. */
const FOLLOWING_SKELETON_COUNT = 4;

/**
 * "The personas you follow" (PRD-208), the hub's second tab.
 *
 * Following used to be write-only: the tap sent the persona's owner one
 * notification and gave the follower a pill and nothing else, so there was no
 * way back to a persona followed weeks earlier. This is the list.
 *
 * The server decides what is on it. A persona that has since been unpublished,
 * made private, owner-removed, taken down by a moderator, or blocked either
 * way is filtered out in the query, so this list can never resurrect something
 * moderation removed and never shows a row whose link would 404.
 *
 * Paged rather than infinite: `total` is honest, and the pager reads the same
 * way the browse tab's does.
 */
export function FollowedPersonasPanel({
  onBrowse,
}: {
  /** Sends an empty state to the tab where personas are actually found. */
  onBrowse: () => void;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const followingQuery = useFollowedPersonas(page, true);
  const unfollow = useUnfollowPersona();
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  // Waits for the server before confirming anything, the contract
  // `ConnectionMoreMenu` uses: the row is only gone once the request settled,
  // and a failure says so and leaves the row where it was.
  async function handleUnfollow(personaId: string, displayName: string) {
    setUnfollowingId(personaId);
    try {
      await unfollow.mutateAsync({ personaId });
      showToast(
        t("subprofiles:following.unfollowedToast", { name: displayName }),
        "success",
      );
      // The last row of a later page just left: step back so the member is not
      // stranded on a page that no longer exists.
      setPage((current) =>
        current > 1 && followingQuery.data?.items.length === 1
          ? current - 1
          : current,
      );
    } catch {
      showToast(t("subprofiles:following.unfollowError"), "error");
    } finally {
      setUnfollowingId(null);
    }
  }

  if (followingQuery.isLoading) {
    return (
      <div
        className={styles.list}
        role="status"
        aria-busy="true"
        aria-label={t("subprofiles:following.loading")}
      >
        {Array.from({ length: FOLLOWING_SKELETON_COUNT }, (_, index) => (
          <div className={styles.skRow} key={index} aria-hidden>
            <SkeletonAvatar size={48} />
            <div className={styles.skText}>
              <SkeletonLine width="38%" height={18} />
              <SkeletonLine width="62%" height={13} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (followingQuery.isError) {
    return (
      <LoadErrorState
        title={t("subprofiles:following.error.title")}
        description={t("subprofiles:following.error.description")}
        onRetry={() => void followingQuery.refetch()}
      />
    );
  }

  const following = followingQuery.data;
  if (!following || following.items.length === 0) {
    return (
      <EmptyState
        icon={<FiHeart />}
        title={t("subprofiles:following.empty.title")}
        description={t("subprofiles:following.empty.description")}
        action={{
          label: t("subprofiles:following.empty.cta"),
          onClick: onBrowse,
        }}
      />
    );
  }

  const lastPage = Math.max(
    1,
    Math.ceil(following.total / FOLLOWED_PERSONAS_PAGE_SIZE),
  );

  return (
    <>
      <ul className={styles.list}>
        {following.items.map((persona) => (
          <FollowedPersonaRow
            key={persona.id}
            persona={persona}
            isUnfollowing={unfollowingId === persona.id}
            onUnfollow={() =>
              void handleUnfollow(persona.id, persona.displayName)
            }
          />
        ))}
      </ul>
      <div className={styles.pager}>
        <span className={styles.pagerCount}>
          {t("subprofiles:following.countLine", { count: following.total })}
        </span>
        {lastPage > 1 && (
          <span className={styles.pagerButtons}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              {t("subprofiles:following.previousPage")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setPage((current) => Math.min(lastPage, current + 1))
              }
              disabled={page >= lastPage}
            >
              {t("subprofiles:following.nextPage")}
            </Button>
          </span>
        )}
      </div>
    </>
  );
}
