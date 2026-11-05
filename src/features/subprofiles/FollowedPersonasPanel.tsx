import { useState } from "react";
import { FiHeart } from "react-icons/fi";
import {
  Button,
  Collapse,
  EmptyState,
  LoadErrorState,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { FilterResultsTop } from "../../shared/components/filterPage";
import { useToast } from "../../shared/components/feedback/useToast";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { FollowedPersonaRow } from "./FollowedPersonaRow";
import { personaAddressName } from "./subprofile-kinds";
import {
  FOLLOWED_PERSONAS_PAGE_SIZE,
  useFollowedPersonas,
  useUnfollowPersona,
} from "./api/useFollowedPersonas";
import styles from "./FollowedPersonas.module.css";

/** Skeleton rows while the first page loads: about one screenful. */
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
 * Paged: `total` is honest, and the pager reads the same
 * way the browse tab's does. The count sits on top in the Everyone tab's
 * results-top style (`FilterResultsTop`), so both tabs say how many first.
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
      <>
        <FilterResultsTop count={<SkeletonLine width={150} height={14} />} />
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
      </>
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
      <FilterResultsTop count={<FollowingCount total={following.total} />} />
      <ul className={styles.list}>
        {following.items.map((persona) => (
          <FollowedPersonaRow
            key={persona.id}
            persona={persona}
            isUnfollowing={unfollowingId === persona.id}
            onUnfollow={() =>
              void handleUnfollow(
                persona.id,
                // The toast addresses the persona in a sentence, so it takes
                // the owner's first name for a persona still named after its
                // profession ("You no longer follow Tiago"); the row's composed
                // "Tiago | Dancer" title is for the row alone.
                personaAddressName({
                  displayName: persona.displayName,
                  kind: persona.kind,
                  ownerName: persona.ownerName ?? undefined,
                }),
              )
            }
          />
        ))}
      </ul>
      {/* An unfollow can bring the list down to one page, and the pager
          then folds away. */}
      <Collapse isOpen={lastPage > 1}>
        <div className={styles.pager}>
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
        </div>
      </Collapse>
    </>
  );
}

/** "Following 3 personas" with the number large, serif and coral, the way the
 *  Everyone tab's result count reads. It rolls when an unfollow lowers it. */
function FollowingCount({ total }: { total: number }) {
  const fmt = useFormat();
  return (
    <Translation
      i18nKey="subprofiles:following.countLine"
      values={{ count: total }}
      slots={{
        count: (
          <b>
            <em>
              <RollingNumber value={fmt.number(total)} numericValue={total} />
            </em>
          </b>
        ),
      }}
    />
  );
}
