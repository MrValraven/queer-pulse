import { AnimatePresence } from "motion/react";
import { useCallback, useId } from "react";
import { Collapse, LoadMoreFooter } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioListeningRecent } from "./api/useStudioListening";
import { useStudioListeningHistorySwitch } from "./api/useStudioListeningHistorySwitch";
import { useStudioHideExplicit } from "./api/useStudioPlaybackPreferences";
import { StudioListeningRecentRow } from "./StudioListeningRecentRow";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioTrackRowSkeleton } from "./StudioSkeletons";
import { useStudioFocusFirstNewRow } from "./useStudioFocusFirstNewRow";
import { studioReasonCopyKey, studioReasonOf } from "./studioReason";
import styles from "./StudioListeningLists.module.css";

const SKELETON_ROW_COUNT = 4;

function StudioListeningRecentSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
        <StudioTrackRowSkeleton key={index} />
      ))}
    </div>
  );
}

/** "Played lately": the listener's own history, newest first, a page at a
 *  time. After every Show more, focus moves to the first row that page
 *  added and the row scrolls into view once it has faded in. */
export function StudioListeningRecent() {
  const { t } = useTranslation();
  const {
    items,
    loadState,
    hasMore,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPageError,
    fetchNextPage,
  } = useStudioListeningRecent();
  const headingId = useId();
  const shouldHideExplicit = useStudioHideExplicit();
  // The same stored row the page reads: paused only once it has loaded.
  const historySwitch = useStudioListeningHistorySwitch();
  const isHistoryPaused = !historySwitch.isOn && !historySwitch.isAwaitingRow;
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
    // A playable row offers its play button; an unavailable one offers
    // nothing to press, so its played-on line takes the focus.
    focusSelector: "button, a, [data-history-row]",
    shouldFocusEveryPage: true,
  });
  // The shared hook reads the list's rows through a list element ref; the
  // history is an ordered list, so its element is handed over here.
  const setListElement = useCallback(
    (element: HTMLOListElement | null) => {
      listRef.current = element;
    },
    [listRef],
  );
  // The footer names why the page failed after the label, so an offline
  // member reads "You're offline" right beside it.
  const nextPageReasonKey = studioReasonCopyKey(
    studioReasonOf(fetchNextPageError),
    "load",
  );
  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {t("studio:listening.recent.heading")}
      </h2>
      <Collapse isOpen={loadState.isLoading}>
        <StudioListeningRecentSkeleton />
      </Collapse>
      <Collapse isOpen={!hasItems && loadState.isError}>
        <StudioLoadError
          loadState={loadState}
          what="studio:errors.what.listeningHistory"
        />
      </Collapse>
      <Collapse isOpen={isEmpty}>
        <p className={styles.empty}>
          {t(
            isHistoryPaused
              ? "studio:listening.recent.pausedEmpty"
              : "studio:listening.recent.empty",
          )}
        </p>
      </Collapse>
      <Collapse isOpen={hasItems}>
        <ol
          ref={setListElement}
          className={styles.list}
          aria-labelledby={headingId}
        >
          <AnimatePresence>
            {items.map((listen, index) => (
              <StudioListeningRecentRow
                key={listen.id}
                listen={listen}
                index={index}
                shouldHideExplicit={shouldHideExplicit}
              />
            ))}
          </AnimatePresence>
        </ol>
      </Collapse>
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
            label={t("studio:listening.recent.showMore")}
            loadingLabel={t("studio:liked.page.loadingMore")}
            errorMessage={`${t("common:error.loadMore")} ${t(nextPageReasonKey)}`}
            aria-busy={isFetchingNextPage}
          />
        </div>
      </Collapse>
    </section>
  );
}
