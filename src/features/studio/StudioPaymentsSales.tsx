import { useId } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import {
  Collapse,
  CollapseListItem,
  LoadMoreFooter,
} from "../../shared/components/ui";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import type {
  StudioSalesTotalsView,
  StudioSellerPurchaseView,
} from "./api/studioPurchases.adapters";
import {
  useStudioSales,
  useStudioSalesTotals,
} from "./api/useStudioPurchaseLists";
import { StudioEuroAmount } from "./StudioEuroAmount";
import { StudioLoadError } from "./StudioLoadStates";
import {
  StudioPaymentsListSkeleton,
  StudioPaymentsTotalsSkeleton,
} from "./StudioPaymentsSkeletons";
import { studioReasonCopyKey, studioReasonOf } from "./studioReason";
import css from "./StudioPayments.module.css";

/** The last 28 days and all time, each an amount and a count. */
function StudioSalesTotals({ totals }: { totals: StudioSalesTotalsView }) {
  const { t } = useTranslation();
  const totalsWindows = [
    {
      key: "last28",
      labelKey: "studio:purchase.sales.last28",
      total: totals.last28Days,
    },
    {
      key: "allTime",
      labelKey: "studio:purchase.sales.allTime",
      total: totals.allTime,
    },
  ];
  return (
    <div role="group" aria-label={t("studio:purchase.sales.totalsLabel")}>
      <dl className={css.totals}>
        {totalsWindows.map((totalsWindow) => (
          <div key={totalsWindow.key} className={css.total}>
            <dt className={css.totalLabel}>{t(totalsWindow.labelKey)}</dt>
            <dd className={css.totalValue}>
              <StudioEuroAmount
                value={totalsWindow.total.amountCents / 100}
                shouldEmphasizeNumber
              />
            </dd>
            <dd className={css.totalCount}>
              {t("studio:purchase.sales.count", {
                count: totalsWindow.total.count,
              })}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** One confirmed sale: the item, the amount, the buyer and the day. */
function StudioSaleRow({ sale }: { sale: StudioSellerPurchaseView }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <CollapseListItem>
      <div className={css.saleRow}>
        <div className={css.saleText}>
          <p className={css.itemTitle}>
            {sale.item.href ? (
              <Link to={sale.item.href} className={css.link}>
                {sale.item.title}
              </Link>
            ) : (
              sale.item.title
            )}
          </p>
          <p className={css.buyer}>
            {sale.buyer?.href ? (
              <Link to={sale.buyer.href} className={css.link}>
                {sale.buyer.name}
              </Link>
            ) : (
              <span>
                {sale.buyer?.name ?? t("studio:purchase.inbox.deletedAccount")}
              </span>
            )}
            {sale.decidedAt && (
              <span>
                {t("studio:purchase.sales.confirmedOn", {
                  date: fmt.date(sale.decidedAt, { dateStyle: "medium" }),
                })}
              </span>
            )}
          </p>
        </div>
        <p className={css.amount}>
          <StudioEuroAmount
            value={sale.amountCents / 100}
            shouldEmphasizeNumber
          />
        </p>
      </div>
    </CollapseListItem>
  );
}

/** The Sales panel: the persona's totals, the note that the money stays
 *  between the artist and the buyers, then the confirmed sales, newest
 *  first, with Show more. */
export function StudioPaymentsSales({
  persona,
}: {
  persona: StudioArtistRefView;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const sales = useStudioSales(persona.id);
  const { totals, loadState: totalsLoadState } = useStudioSalesTotals(
    persona.id,
  );
  const hasItems = sales.items.length > 0;
  const nextPageReasonKey = studioReasonCopyKey(
    studioReasonOf(sales.fetchNextPageError),
    "load",
  );
  return (
    <section className={css.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={css.panelTitle}>
        {t("studio:purchase.sales.listLabel", { name: persona.name })}
      </h2>
      <Collapse isOpen={totalsLoadState.isLoading}>
        <StudioPaymentsTotalsSkeleton />
      </Collapse>
      <Collapse isOpen={totals !== null}>
        {totals && <StudioSalesTotals totals={totals} />}
      </Collapse>
      <Collapse isOpen={totals === null && totalsLoadState.isError}>
        <StudioLoadError
          loadState={totalsLoadState}
          what="studio:errors.what.sales"
        />
      </Collapse>
      <p className={`${css.dek} ${css.salesNote}`}>
        {t("studio:purchase.sales.note")}
      </p>
      <Collapse isOpen={sales.loadState.isLoading}>
        <StudioPaymentsListSkeleton />
      </Collapse>
      <Collapse isOpen={!hasItems && sales.loadState.isError}>
        <StudioLoadError
          loadState={sales.loadState}
          what="studio:errors.what.sales"
        />
      </Collapse>
      <Collapse
        isOpen={
          !hasItems && !sales.loadState.isLoading && !sales.loadState.isError
        }
      >
        <p className={css.empty}>{t("studio:purchase.sales.empty")}</p>
      </Collapse>
      <ul className={css.rows} aria-labelledby={headingId}>
        <AnimatePresence>
          {sales.items.map((sale) => (
            <StudioSaleRow key={sale.id} sale={sale} />
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={sales.hasMore || sales.isFetchNextPageError}>
        <LoadMoreFooter
          className={css.footer}
          isFetchingNextPage={sales.isFetchingNextPage}
          isFetchNextPageError={sales.isFetchNextPageError}
          onLoadMore={sales.fetchNextPage}
          label={t("studio:purchase.sales.showMore")}
          loadingLabel={t("studio:purchase.sales.loadingMore")}
          errorMessage={`${t("common:error.loadMore")} ${t(nextPageReasonKey)}`}
          aria-busy={sales.isFetchingNextPage}
        />
      </Collapse>
    </section>
  );
}
