import {
  Button,
  LoadMoreButton,
  LoadMoreStatus,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ConnectionsSearchResult } from "../connect/api/useConnectionsSearch";
import styles from "./InviteMembersListFooter.module.css";

/** The paging fields the footer reads. Any paged list of connections that
 *  carries them can reuse it, e.g. the community invite picker's candidates. */
export type InviteMembersListPaging = Pick<
  ConnectionsSearchResult,
  | "isError"
  | "refetch"
  | "hasNextPage"
  | "fetchNextPage"
  | "isFetchingNextPage"
  | "isFetchNextPageError"
>;

/**
 * The end of the invite picker's scrolling list in live mode: the retry for a
 * list that failed to load, or the button that brings in the next page of
 * connections. The status region stays mounted so a failed page is announced.
 */
export function InviteMembersListFooter({
  connections,
}: {
  connections: InviteMembersListPaging;
}) {
  const { t } = useTranslation();
  const {
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = connections;
  return (
    <div className={styles.footer}>
      <LoadMoreStatus
        isFetchingNextPage={isFetchingNextPage}
        isFetchNextPageError={hasNextPage && isFetchNextPageError}
        errorMessage={t("gatherings:manage.invite.loadMoreError")}
      />
      {isError && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={styles.action}
          onClick={refetch}
        >
          {t("shared:loadError.retryCta")}
        </Button>
      )}
      {hasNextPage && (
        <LoadMoreButton
          size="sm"
          className={styles.action}
          isFetchingNextPage={isFetchingNextPage}
          isFetchNextPageError={isFetchNextPageError}
          onLoadMore={fetchNextPage}
          label={t("connect:allTab.loadMore")}
          loadingLabel={t("connect:page.loadMoreLoading")}
        />
      )}
    </div>
  );
}
