import { useId, useRef } from "react";
import { AnimatePresence } from "motion/react";
import { Collapse, LoadMoreFooter } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { StudioArtistRefView } from "./api/studio.adapters";
import { useStudioPurchaseInbox } from "./api/useStudioPurchaseLists";
import { StudioDeclinePurchaseDialog } from "./StudioDeclinePurchaseDialog";
import { StudioLoadError } from "./StudioLoadStates";
import { StudioPaymentsInboxRow } from "./StudioPaymentsInboxRow";
import { StudioPaymentsListSkeleton } from "./StudioPaymentsSkeletons";
import { studioReasonCopyKey, studioReasonOf } from "./studioReason";
import { useStudioInboxDecide } from "./useStudioInboxDecide";
import css from "./StudioPayments.module.css";

/** The To confirm panel: one persona's claimed payments, oldest first. A
 *  decision folds the row away at once and announces it; a claim another
 *  member of the persona already answered leaves the same way and says so.
 *  `useStudioInboxDecide` holds the decisions, their lines and the focus
 *  moves. */
export function StudioPaymentsInbox({
  persona,
}: {
  persona: StudioArtistRefView;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const inbox = useStudioPurchaseInbox(persona.id);
  const decide = useStudioInboxDecide({
    subprofileId: persona.id,
    purchases: inbox.items,
    listRef,
    headingRef,
  });
  const { items, listFailure, declineTarget } = decide;
  const hasItems = items.length > 0;
  const nextPageReasonKey = studioReasonCopyKey(
    studioReasonOf(inbox.fetchNextPageError),
    "load",
  );
  return (
    <section className={css.section} aria-labelledby={headingId}>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className={css.panelTitle}
      >
        {t("studio:purchase.inbox.listLabel", { name: persona.name })}
      </h2>
      <Collapse isOpen={listFailure?.isShown ?? false}>
        <p key={listFailure?.sequence} className={css.alert} role="alert">
          {listFailure?.message}
        </p>
      </Collapse>
      <Collapse isOpen={inbox.loadState.isLoading}>
        <StudioPaymentsListSkeleton />
      </Collapse>
      <Collapse isOpen={!hasItems && inbox.loadState.isError}>
        <StudioLoadError
          loadState={inbox.loadState}
          what="studio:errors.what.paymentsInbox"
        />
      </Collapse>
      <Collapse
        isOpen={
          !hasItems && !inbox.loadState.isLoading && !inbox.loadState.isError
        }
      >
        <p className={css.empty}>{t("studio:purchase.inbox.empty")}</p>
      </Collapse>
      <ul ref={listRef} className={css.rows} aria-labelledby={headingId}>
        <AnimatePresence>
          {items.map((purchase) => (
            <StudioPaymentsInboxRow
              key={purchase.id}
              purchase={purchase}
              isBusy={decide.isBusy}
              onConfirm={() => decide.confirm(purchase)}
              onDecline={() => decide.openDecline(purchase)}
            />
          ))}
        </AnimatePresence>
      </ul>
      <Collapse isOpen={inbox.hasMore || inbox.isFetchNextPageError}>
        <LoadMoreFooter
          className={css.footer}
          isFetchingNextPage={inbox.isFetchingNextPage}
          isFetchNextPageError={inbox.isFetchNextPageError}
          onLoadMore={inbox.fetchNextPage}
          label={t("studio:purchase.inbox.showMore")}
          loadingLabel={t("studio:purchase.inbox.loadingMore")}
          errorMessage={`${t("common:error.loadMore")} ${t(nextPageReasonKey)}`}
          aria-busy={inbox.isFetchingNextPage}
        />
      </Collapse>
      <p className="visuallyHidden" role="status">
        {decide.statusMessage}
      </p>
      <AnimatePresence onExitComplete={decide.handleDeclineExitComplete}>
        {declineTarget && (
          <StudioDeclinePurchaseDialog
            key={declineTarget.id}
            purchase={declineTarget}
            isDeclining={decide.busyPurchaseId === declineTarget.id}
            errorMessage={decide.declineError}
            onClose={decide.closeDecline}
            onDecline={(body) => decide.decline(declineTarget, body)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
