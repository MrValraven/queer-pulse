import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./JobsPage.module.css";

interface JobsLoadMoreProps {
  isFetchingNextPage: boolean;
  /**
   * True when the latest page fetch failed. The board keeps every loaded role
   * on screen; this footer alone shows the error, and its button retries.
   */
  isFetchNextPageError: boolean;
  onLoadMore: () => void;
}

/** The jobs board's "Load more roles" footer, with an inline retry. */
export function JobsLoadMore({
  isFetchingNextPage,
  isFetchNextPageError,
  onLoadMore,
}: JobsLoadMoreProps) {
  const { t } = useTranslation();
  const label = isFetchingNextPage
    ? t("economy:jobs.loadingMore")
    : isFetchNextPageError
      ? t("common:error.retry")
      : t("economy:jobs.loadMoreCta");
  return (
    <div className={styles.loadMore}>
      {isFetchNextPageError && (
        <p className={styles.loadMoreError} role="alert">
          {t("economy:jobs.loadMoreError")}
        </p>
      )}
      <Button
        type="button"
        variant="ghost"
        disabled={isFetchingNextPage}
        onClick={onLoadMore}
      >
        {label}
      </Button>
    </div>
  );
}
