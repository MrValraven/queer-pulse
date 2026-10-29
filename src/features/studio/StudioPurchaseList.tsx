import { AnimatePresence } from "motion/react";
import {
  Collapse,
  LoadMoreFooter,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useStudioMyPurchases } from "./api/useStudioPurchaseLists";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioPurchaseRow } from "./StudioPurchaseRow";
import { studioReasonCopyKey, studioReasonOf } from "./studioReason";
import css from "./StudioPurchaseList.module.css";

/** The first paint: three rows of lines, on app-wide tokens so it reads on
 *  the account page too. */
function StudioPurchaseListSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className={css.skeleton}
      role="status"
      aria-label={t("studio:loading.detail")}
    >
      {[0, 1, 2].map((line) => (
        <div key={line} className={css.skeletonRow}>
          <SkeletonLine width="45%" height={18} />
          <SkeletonLine width="30%" height={12} />
        </div>
      ))}
    </div>
  );
}

/** The buyer's purchases, newest first, with Show more. The library and the
 *  account page both pass every status; the account page passes
 *  `isStudioContext={false}`, which leaves out the links into Studio,
 *  the pending code and cancel, and the wall switch. Nothing here reads a
 *  Studio-only provider, so the list works without Studio access. */
export function StudioPurchaseList({
  status,
  isStudioContext,
  headingLevel,
}: {
  status: "all" | "confirmed";
  isStudioContext: boolean;
  /** The level of each purchase's title. */
  headingLevel: 2 | 3;
}) {
  const { t } = useTranslation();
  const purchases = useStudioMyPurchases(status);
  const { loadState } = purchases;
  const hasItems = purchases.items.length > 0;
  const isLoading = loadState.isLoading && !hasItems;
  // A failed Show more also sets isError; loaded rows stay on screen.
  const isFailed = loadState.isError && !hasItems;
  const isEmpty = !hasItems && !isLoading && !isFailed;
  const nextPageReasonKey = studioReasonCopyKey(
    studioReasonOf(purchases.fetchNextPageError),
    "load",
  );
  return (
    <div>
      <Collapse isOpen={isLoading}>
        <StudioPurchaseListSkeleton />
      </Collapse>
      <Collapse isOpen={isFailed}>
        <StudioLoadError
          loadState={loadState}
          what="studio:errors.what.purchases"
        />
      </Collapse>
      <Collapse isOpen={isEmpty}>
        <p className={css.empty}>
          {status === "confirmed"
            ? t("studio:purchase.account.empty")
            : t("studio:purchase.list.empty")}
        </p>
      </Collapse>
      {/* Named only with rows in it, so no empty "Your purchases" list is
          announced while it loads, fails or stays empty. */}
      <ul
        className={css.rows}
        aria-label={hasItems ? t("studio:purchase.list.label") : undefined}
      >
        <AnimatePresence>
          {purchases.items.map((purchase) => (
            <StudioPurchaseRow
              key={purchase.id}
              purchase={purchase}
              isStudioContext={isStudioContext}
              headingLevel={headingLevel}
            />
          ))}
        </AnimatePresence>
      </ul>
      <Collapse
        isOpen={
          hasItems && (purchases.hasMore || purchases.isFetchNextPageError)
        }
      >
        <LoadMoreFooter
          className={css.footer}
          isFetchingNextPage={purchases.isFetchingNextPage}
          isFetchNextPageError={purchases.isFetchNextPageError}
          onLoadMore={purchases.fetchNextPage}
          label={t("studio:purchase.list.showMore")}
          loadingLabel={t("shared:loading.label")}
          errorMessage={`${t("common:error.loadMore")} ${t(nextPageReasonKey)}`}
          aria-busy={purchases.isFetchingNextPage}
        />
      </Collapse>
    </div>
  );
}
