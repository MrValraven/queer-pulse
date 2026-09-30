import { LoadMoreFooter } from "../../shared/components/ui";
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
  return (
    <LoadMoreFooter
      className={styles.jobsLoadMore}
      isFetchingNextPage={isFetchingNextPage}
      isFetchNextPageError={isFetchNextPageError}
      onLoadMore={onLoadMore}
      errorMessage={t("economy:jobs.loadMoreError")}
      label={t("economy:jobs.loadMoreCta")}
      loadingLabel={t("economy:jobs.loadingMore")}
    />
  );
}
