import { memo, useEffect, useMemo, useRef, useState } from "react";
import { FiAlertCircle, FiClock } from "react-icons/fi";
import {
  Button,
  EmptyState,
  LoadErrorState,
  SkeletonLine,
} from "../../../../../shared/components/ui";
import { intlLocale } from "../../../../../shared/i18n/locale";
import { Translation } from "../../../../../shared/i18n/Translation";
import { useTranslation } from "../../../../../shared/i18n/useTranslation";
import { useOwnerListingHistory } from "../../api/useOwnerListingHistory";
import {
  INITIAL_VISIBLE_ROWS,
  type HistoryTextFormat,
} from "./listingHistory.data";
import { ListingHistoryRow } from "./ListingHistoryRow";
import styles from "./ListingHistory.module.css";

const KEY_PREFIX = "marketing:listBusiness.editor.history";

/** Focus the row at `index`, or the last row when fewer arrived. */
function focusHistoryRow(list: HTMLOListElement | null, index: number) {
  const rows = list?.children;
  if (!rows || rows.length === 0) return;
  const target = rows[Math.min(index, rows.length - 1)];
  if (target instanceof HTMLElement) target.focus();
}

/**
 * "History" inside the listing editor: who changed what on this listing,
 * newest first. The owner and every co-manager read the same record, so a
 * team can see each other's edits alongside what moderation did.
 *
 * The prop is `listingRef` because a prop named `ref` trips the React
 * compiler's refs lint even when it holds a plain string. Memoised because
 * the editor around it re-renders on every keystroke.
 *
 * The newest rows come first. The first "Show older" reveals the rest of the
 * loaded page with no request; later presses fetch the next page. Either way
 * focus moves to the first row it added, which sits exactly where the button
 * was, so the reader carries on from there and a last page (which removes the
 * button) never drops focus. A failed page keeps every loaded row and turns
 * the footer into an inline retry; the full error state is only for a first
 * load that returned nothing at all.
 */
export const ListingHistorySection = memo(function ListingHistorySection({
  listingRef,
}: {
  listingRef: string;
}) {
  const { t, language } = useTranslation();
  const history = useOwnerListingHistory(listingRef);
  const { events, isFetchingNextPage, isFetchNextPageError, hasNextPage } =
    history;
  const [isExpanded, setIsExpanded] = useState(false);
  const listElementRef = useRef<HTMLOListElement>(null);
  const revealFocusIndexRef = useRef<number | null>(null);
  const fetchFocusIndexRef = useRef<number | null>(null);

  const format = useMemo<HistoryTextFormat>(() => {
    const listFormatter = new Intl.ListFormat(intlLocale(language), {
      style: "long",
      type: "conjunction",
    });
    return { joinList: (items) => listFormatter.format(items) };
  }, [language]);

  const hasHiddenLoadedRows =
    !isExpanded && events.length > INITIAL_VISIBLE_ROWS;
  const visibleEvents = isExpanded
    ? events
    : events.slice(0, INITIAL_VISIBLE_ROWS);

  useEffect(() => {
    const revealFocusIndex = revealFocusIndexRef.current;
    if (revealFocusIndex === null) return;
    revealFocusIndexRef.current = null;
    focusHistoryRow(listElementRef.current, revealFocusIndex);
  }, [isExpanded]);

  useEffect(() => {
    const fetchFocusIndex = fetchFocusIndexRef.current;
    if (fetchFocusIndex === null || isFetchingNextPage) return;
    fetchFocusIndexRef.current = null;
    // A failed page keeps the footer, so focus stays on its retry button.
    if (isFetchNextPageError) return;
    // Move only when the page really added rows, or when the list reached its
    // end and the button that held focus is gone. A cancelled page (a save
    // refetching the whole history mid-flight) leaves focus on the button.
    const rowCount = listElementRef.current?.children.length ?? 0;
    if (rowCount <= fetchFocusIndex && hasNextPage) return;
    focusHistoryRow(listElementRef.current, fetchFocusIndex);
  }, [isFetchingNextPage, isFetchNextPageError, hasNextPage]);

  const showOlder = () => {
    if (isFetchingNextPage) return;
    if (hasHiddenLoadedRows) {
      revealFocusIndexRef.current = INITIAL_VISIBLE_ROWS;
      setIsExpanded(true);
      return;
    }
    setIsExpanded(true);
    fetchFocusIndexRef.current = events.length;
    history.fetchNextPage();
  };

  const statusText = history.isLoading
    ? t(`${KEY_PREFIX}.loadingHistory`)
    : isFetchingNextPage
      ? t(`${KEY_PREFIX}.loadingOlder`)
      : isFetchNextPageError
        ? // The footer's alert reports the failure; this stays quiet.
          ""
        : isExpanded && events.length > INITIAL_VISIBLE_ROWS
          ? t(`${KEY_PREFIX}.olderLoaded`)
          : "";

  return (
    <>
      <p className={styles.intro}>{t(`${KEY_PREFIX}.intro`)}</p>
      <p className="visuallyHidden" role="status">
        {statusText}
      </p>

      {history.isLoading ? (
        <HistorySkeleton />
      ) : history.isError && history.loadedPageCount === 0 ? (
        <LoadErrorState
          compact
          title={
            <Translation
              i18nKey={`${KEY_PREFIX}.loadError.title`}
              components={{ em: <em /> }}
            />
          }
          onRetry={history.refetch}
        />
      ) : events.length === 0 ? (
        <EmptyState
          compact
          icon={<FiClock />}
          title={t(`${KEY_PREFIX}.empty.title`)}
          description={t(`${KEY_PREFIX}.empty.description`)}
        />
      ) : (
        <ol ref={listElementRef} className={styles.list}>
          {visibleEvents.map((event) => (
            <ListingHistoryRow key={event.id} event={event} format={format} />
          ))}
        </ol>
      )}

      {(hasHiddenLoadedRows || hasNextPage) && (
        <ShowOlderFooter
          isFetching={isFetchingNextPage}
          hasFailed={isFetchNextPageError}
          onShowOlder={showOlder}
        />
      )}
    </>
  );
});

/** "Show older", and the inline retry when an older page failed to load. */
function ShowOlderFooter({
  isFetching,
  hasFailed,
  onShowOlder,
}: {
  isFetching: boolean;
  hasFailed: boolean;
  onShowOlder: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.footer}>
      {hasFailed && (
        <p className={styles.footerError} role="alert">
          <FiAlertCircle aria-hidden="true" />
          {t(`${KEY_PREFIX}.olderError`)}
        </p>
      )}
      <Button
        variant="ghost"
        aria-disabled={isFetching || undefined}
        onClick={onShowOlder}
      >
        {isFetching
          ? t(`${KEY_PREFIX}.loadingOlder`)
          : hasFailed
            ? t("common:error.retry")
            : t(`${KEY_PREFIX}.showOlder`)}
      </Button>
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <SkeletonLine width="85%" height={14} />
      <SkeletonLine width="70%" height={14} />
      <SkeletonLine width="60%" height={14} />
    </div>
  );
}
