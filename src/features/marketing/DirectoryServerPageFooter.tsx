import {
  LoadMoreButton,
  LoadMoreStatus,
  Sending,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import s from "./DirectoryPage.module.css";

/**
 * ENG-501: the footer under the directory's list, online grids and map while the
 * server holds more pages. Those pages arrive on their own (the list pulls one
 * once its loaded cards are all revealed, the online tab pulls every page), so
 * the footer shows progress while one is in flight. A failed page keeps every
 * loaded card on screen: the status line says so and the button fetches that
 * page again. Both live regions (the failure line and the progress line)
 * mount with the footer, before any fetch or failure, so what changes inside
 * them is announced.
 */
export function DirectoryServerPageFooter({
  isFetchingNextPage,
  isFetchNextPageError,
  onLoadMore,
}: {
  isFetchingNextPage: boolean;
  /** True when the latest server page failed. */
  isFetchNextPageError: boolean;
  /** Fetches the next server page, or retries the one that failed. */
  onLoadMore: () => void;
}) {
  const { t } = useTranslation();
  const progress = <Sending label={t("marketing:directory.loadingMore")} />;
  return (
    <div className={s.loadingMore}>
      <LoadMoreStatus
        isFetchingNextPage={isFetchingNextPage}
        isFetchNextPageError={isFetchNextPageError}
        errorMessage={t("common:error.loadMore")}
        messageClassName={s.loadMoreError}
      />
      {isFetchNextPageError && (
        <LoadMoreButton
          isFetchingNextPage={isFetchingNextPage}
          isFetchNextPageError={isFetchNextPageError}
          onLoadMore={onLoadMore}
          label={t("common:error.retry")}
          loadingLabel={progress}
        />
      )}
      <span aria-live="polite">
        {!isFetchNextPageError && isFetchingNextPage && progress}
      </span>
    </div>
  );
}
