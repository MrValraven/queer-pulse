import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./ForumPage.module.css";

/** The "Load more" pager below the thread list — live mode only (demo returns
 * one terminal page, so `hasNextPage` is always false and this never renders). */
export function ForumLoadMore({
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}) {
  const { t } = useTranslation();
  if (!hasNextPage) return null;
  return (
    <div className={styles.loadMore}>
      <Button
        type="button"
        variant="ghost"
        disabled={isFetchingNextPage}
        onClick={fetchNextPage}
      >
        {isFetchingNextPage
          ? t("forum:threadList.loadingMore")
          : t("forum:threadList.loadMoreCta")}
      </Button>
    </div>
  );
}
