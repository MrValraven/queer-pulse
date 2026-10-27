import { AnimatePresence } from "motion/react";
import { useId } from "react";
import {
  Collapse,
  LoadErrorState,
  LoadMoreFooter,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioPlacements } from "./api/useStudioPlacements";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioPlacementRow } from "./StudioPlacementRow";
import { StudioLine } from "./StudioSkeletons";
import { useStudioFocusFirstNewRow } from "./useStudioFocusFirstNewRow";
import { studioReasonCopyKey, studioReasonOf } from "./studioReason";
import styles from "./StudioPlacements.module.css";
import kit from "./studioKit.module.css";

const SKELETON_ROW_COUNT = 3;
const PLACEMENTS_WHAT_KEY = "studio:errors.what.placements";

function StudioPlacementsSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <div key={index} className={styles.skeletonRow}>
          <StudioLine width={48} height={48} />
          <div className={styles.skeletonText}>
            <StudioLine width="45%" height={14} />
            <StudioLine width="70%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}

/** A persona the member no longer owns (a co-owner removed mid-session)
 *  reads as not found. A Retry cannot change that answer, so this panel
 *  offers none. */
function StudioPlacementsNotFound() {
  const { t } = useTranslation();
  return (
    <LoadErrorState
      title={
        <Translation
          i18nKey="studio:errors.load.title"
          components={{ em: <em /> }}
          values={{ what: t(PLACEMENTS_WHAT_KEY) }}
        />
      }
      description={t(studioReasonCopyKey("notFound", "load"))}
      compact
      className={kit.loadError}
    />
  );
}

/** "Where your music lives": the public playlists holding one persona's
 *  tracks. "Show more" follows `hasMore`, so a page that came back empty
 *  with a cursor still leads to the next one. */
export function StudioPlacementsCard({
  subprofileId,
}: {
  subprofileId: string;
}) {
  const { t } = useTranslation();
  const {
    items,
    loadState,
    hasMore,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPageError,
    fetchNextPage,
  } = useStudioPlacements(subprofileId);
  const headingId = useId();
  const hasItems = items.length > 0;
  const isEmpty =
    !hasItems &&
    !loadState.isLoading &&
    !loadState.isError &&
    !loadState.isNotFound &&
    !hasMore;
  const { listRef, footerRef, markPageRequested } = useStudioFocusFirstNewRow({
    rowCount: items.length,
    hasMore,
    isSettled: !isFetchingNextPage && !isFetchNextPageError,
  });
  // The footer names why the page failed after the label, so an offline
  // member reads "You're offline" right beside it.
  const nextPageReasonKey = studioReasonCopyKey(
    studioReasonOf(fetchNextPageError),
    "load",
  );
  return (
    <section className={styles.card} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {t("studio:numbers.placements.heading")}
      </h2>
      <p className={styles.dek}>{t("studio:numbers.placements.dek")}</p>
      <Collapse isOpen={loadState.isLoading}>
        <StudioPlacementsSkeleton />
      </Collapse>
      <Collapse
        isOpen={!hasItems && (loadState.isError || loadState.isNotFound)}
      >
        {loadState.isNotFound ? (
          <StudioPlacementsNotFound />
        ) : (
          <StudioLoadError loadState={loadState} what={PLACEMENTS_WHAT_KEY} />
        )}
      </Collapse>
      <Collapse isOpen={isEmpty}>
        <p className={styles.empty}>{t("studio:numbers.placements.empty")}</p>
      </Collapse>
      {hasItems && (
        <ul ref={listRef} className={styles.list}>
          <AnimatePresence>
            {items.map((placement, index) => (
              <StudioPlacementRow
                key={placement.playlist.id}
                placement={placement}
                index={index}
              />
            ))}
          </AnimatePresence>
        </ul>
      )}
      <Collapse isOpen={hasMore || isFetchNextPageError}>
        <div ref={footerRef}>
          <LoadMoreFooter
            className={styles.footer}
            isFetchingNextPage={isFetchingNextPage}
            isFetchNextPageError={isFetchNextPageError}
            onLoadMore={() => {
              markPageRequested();
              fetchNextPage();
            }}
            label={t("studio:numbers.placements.showMore")}
            loadingLabel={t("studio:playlist.add.loadingMore")}
            errorMessage={`${t("studio:playlist.add.loadMoreError")}. ${t(nextPageReasonKey)}`}
            aria-busy={isFetchingNextPage}
          />
        </div>
      </Collapse>
    </section>
  );
}
