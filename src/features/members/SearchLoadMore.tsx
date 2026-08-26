import { useState } from "react";
import { Button } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { searchApi, type LiveResultType } from "./api/search.api";
import { resultToSearchItem } from "./api/search.adapters";
import { SEARCH_TAB_PAGE_SIZE, type SearchItem } from "./search.data";
import { ResultGrid } from "./SearchResultCard";
import styles from "./SearchLoadMore.module.css";

interface PagedState {
  /** Identifies the result set these pages belong to. */
  key: string;
  items: SearchItem[];
  hasMore: boolean;
  hasFailed: boolean;
}

const emptyState = (key: string): PagedState => ({
  key,
  items: [],
  hasMore: true,
  hasFailed: false,
});

/**
 * Pages one category tab past the first `SEARCH_TAB_PAGE_SIZE` hits (SOC-08).
 *
 * Search used to stop dead at the cap: six results per type on the merged view,
 * fifty on a tab, and nothing after that however many matches existed. This
 * owns its own pages rather than going through `useSearchData`, so the first
 * page keeps its debounce, its cancellation and its cache untouched.
 *
 * Demo mode renders nothing: the demo corpus is a fixed local list with no
 * second page to fetch.
 */
export function SearchLoadMore({
  query,
  type,
}: {
  query: string;
  type: LiveResultType;
}) {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const pageKey = `${type}::${query}`;
  const [paged, setPaged] = useState<PagedState>(() => emptyState(pageKey));
  const [isLoading, setIsLoading] = useState(false);

  // A new query or a new tab is a new result set: drop everything paged in for
  // the previous one rather than appending to it. Adjusted during render (the
  // pattern React documents for state derived from props) instead of in an
  // effect, which would render the stale page once before clearing it.
  if (paged.key !== pageKey) {
    setPaged(emptyState(pageKey));
  }

  if (demoMode) return null;

  const loadNextPage = () => {
    const offset = SEARCH_TAB_PAGE_SIZE + paged.items.length;
    setIsLoading(true);
    searchApi(query, type, undefined, SEARCH_TAB_PAGE_SIZE, offset)
      .then((response) => {
        setPaged((previous) =>
          // A tab switch mid-flight retires this page: appending it would mix
          // one type's results into another's.
          previous.key === pageKey
            ? {
                ...previous,
                items: [
                  ...previous.items,
                  ...response.results.map(resultToSearchItem),
                ],
                hasMore: response.hasMore,
                hasFailed: false,
              }
            : previous,
        );
      })
      .catch(() => {
        setPaged((previous) =>
          previous.key === pageKey
            ? { ...previous, hasFailed: true }
            : previous,
        );
      })
      .finally(() => setIsLoading(false));
  };

  const buttonLabelKey = isLoading
    ? "members:search.loadMore.loading"
    : paged.hasFailed
      ? "members:search.loadMore.retry"
      : "members:search.loadMore.action";

  return (
    <>
      {paged.items.length > 0 && (
        <div className={styles.extraGrid}>
          <ResultGrid items={paged.items} />
        </div>
      )}
      <div className={styles.loadMoreRow} aria-live="polite">
        {paged.hasFailed && (
          <p className={styles.loadMoreError}>
            {t("members:search.loadMore.failed")}
          </p>
        )}
        {paged.hasMore ? (
          <Button variant="ghost" onClick={loadNextPage} disabled={isLoading}>
            {t(buttonLabelKey)}
          </Button>
        ) : (
          <p className={styles.loadMoreEnd}>
            {t("members:search.loadMore.end")}
          </p>
        )}
      </div>
    </>
  );
}
