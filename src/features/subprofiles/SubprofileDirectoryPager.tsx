import {
  Collapse,
  LoadMoreButton,
  LoadMoreStatus,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./SubprofileDirectoryPage.module.css";

export interface SubprofileDirectoryPagerProps {
  /** The rolling "N" in "N of M". */
  shownCount: number;
  /** The rolling "M" in "N of M": the server's count. */
  total: number;
  /** True when another page is waiting on the server; Show more renders only
   *  then. */
  hasMore: boolean;
  isFetchingMore: boolean;
  isFetchNextPageError: boolean;
  onShowMore: () => void;
  /** True when no grid sits above the pager, so its divider has nothing to
   *  divide (see `.pagerBare`). */
  isBare: boolean;
  /** Folds the "N of M" away while `shownCount` is 0. The You follow tab
   *  sets it: a card unfollowed in place stays on the grid, so once every
   *  shown card is unfollowed the count would read "0 of 0" under visible
   *  cards. Everyone leaves it off and keeps its "0 of M". */
  shouldHideCountAtZero?: boolean;
}

/**
 * The "Show more" row under a persona grid: the rolling "N of M" count, the
 * failure line for a page that did not load, and the Show more button that
 * retries it. Both hub tabs draw it, so Everyone and You follow page the
 * same way and read the same.
 */
export function SubprofileDirectoryPager({
  shownCount,
  total,
  hasMore,
  isFetchingMore,
  isFetchNextPageError,
  onShowMore,
  isBare,
  shouldHideCountAtZero = false,
}: SubprofileDirectoryPagerProps) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const isCountShown = !(shouldHideCountAtZero && shownCount === 0);
  return (
    <div
      className={isBare ? `${styles.pager} ${styles.pagerBare}` : styles.pager}
    >
      {/* The slot stays in the row while the count folds, so Show more keeps
          its place at the row's end. */}
      <div className={styles.pagerCount}>
        <Collapse isOpen={isCountShown}>
          <Translation
            i18nKey="subprofiles:directory.shownOfTotal"
            values={{ shown: shownCount, total }}
            slots={{
              shown: (
                <RollingNumber
                  value={fmt.number(shownCount)}
                  numericValue={shownCount}
                />
              ),
              total: (
                <RollingNumber value={fmt.number(total)} numericValue={total} />
              ),
            }}
          />
        </Collapse>
      </div>
      {/* The failure line sits between the count and its Retry. */}
      <LoadMoreStatus
        className={styles.pagerStatus}
        messageClassName={styles.pagerStatusMessage}
        isFetchingNextPage={isFetchingMore}
        isFetchNextPageError={hasMore && isFetchNextPageError}
        errorMessage={t("subprofiles:directory.showMoreError")}
      />
      {hasMore && (
        <LoadMoreButton
          size="sm"
          className={styles.pagerShowMore}
          isFetchingNextPage={isFetchingMore}
          isFetchNextPageError={isFetchNextPageError}
          onLoadMore={onShowMore}
          label={t("subprofiles:directory.showMore")}
          loadingLabel={t("subprofiles:directory.showMoreLoading")}
        />
      )}
    </div>
  );
}
