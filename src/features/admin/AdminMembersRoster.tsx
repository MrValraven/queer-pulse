import {
  Button,
  LoadErrorState,
  SkeletonLine,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminMemberRows } from "./AdminMemberRows";
import type { AdminMember } from "./adminMembers.data";
import type { useAdminMembers } from "./api/useAdminMembers";
import { hasFailedWithoutData, isRetryingFailedRead } from "./queryLoadFailure";
import styles from "./AdminMembersPage.module.css";

/**
 * The "All members" tab body: skeleton, error, empty line or rows, plus
 * "Load more". Split out of `AdminMembersPage` to keep that page under the
 * per-component line limit.
 *
 * DES-424: a roster read that failed with nothing loaded shows the error
 * state with a retry, so an expired grant or a 403 never reads as "No
 * members match those filters". A failed `fetchNextPage` also sets `isError`,
 * so the check is on `data`: pages that already loaded stay on screen.
 */
export function AdminMembersRoster({
  roster,
  onSelect,
}: {
  roster: ReturnType<typeof useAdminMembers>;
  onSelect: (member: AdminMember) => void;
}) {
  const { t } = useTranslation();
  const {
    isLoading,
    refetch,
    visibleMembers,
    isSearchPending,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = roster;
  // Presses while a page is already on its way are dropped; the button keeps
  // focus through `aria-disabled`.
  const loadNextPage = () => {
    if (!isFetchingNextPage) void fetchNextPage();
  };

  if (hasFailedWithoutData(roster)) {
    // A retry in flight keeps the panel, so focus stays on its busy Retry.
    // It replaces the whole tab body straight under the page h1, hence h2.
    return (
      <LoadErrorState
        headingLevel={2}
        isRetrying={isRetryingFailedRead(roster)}
        onRetry={() => void refetch()}
        title={
          <Translation
            i18nKey="admin:members.loadError.title"
            components={{ em: <em /> }}
          />
        }
        description={t("admin:members.loadError.body")}
      />
    );
  }

  // A pending search with no held rows left to narrow is still loading, so it
  // shows the skeleton.
  if (isLoading || (isSearchPending && visibleMembers.length === 0)) {
    return <MemberRowsSkeleton />;
  }

  return (
    <>
      <AdminMemberRows members={visibleMembers} onSelect={onSelect} />
      {/* A failed "Load more" says so: the global handler stays quiet on a
          4xx, so an expired grant would otherwise look like a dead button.
          The rows above stay, and its Retry fetches the same page again.
          A failed page keeps `isFetchNextPageError` through its retry, so the
          panel stays mounted and its Retry reads busy. */}
      {isFetchNextPageError ? (
        <LoadErrorState
          compact
          headingLevel={2}
          className={styles.loadMoreError}
          isRetrying={isFetchingNextPage}
          onRetry={loadNextPage}
          title={
            <Translation
              i18nKey="admin:members.loadMoreError.title"
              components={{ em: <em /> }}
            />
          }
          description={t("admin:members.loadMoreError.body")}
        />
      ) : (
        hasNextPage &&
        !isSearchPending && (
          <div className={styles.loadMore}>
            <Button
              variant="ghost"
              size="md"
              onClick={loadNextPage}
              aria-disabled={isFetchingNextPage || undefined}
            >
              {t("admin:members.loadMore")}
            </Button>
          </div>
        )
      )}
    </>
  );
}

/** The roster's loading rows, shared with the Flagged tab. */
export function MemberRowsSkeleton() {
  return (
    <div className={styles.rows}>
      {[0, 1, 2, 3, 4].map((skeletonIndex) => (
        <SkeletonLine
          key={skeletonIndex}
          height={64}
          style={{ borderRadius: 14 }}
        />
      ))}
    </div>
  );
}
