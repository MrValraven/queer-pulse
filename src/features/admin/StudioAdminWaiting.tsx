import { useId, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { useToast } from "../../shared/components/feedback/useToast";
import {
  Collapse,
  ConfirmDialog,
  LoadMoreFooter,
  SkeletonLine,
} from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { studioLoadStateOf } from "../studio/api/studioLoadState";
import { useStudioFocusFirstNewRow } from "../studio/useStudioFocusFirstNewRow";
import { studioReasonCopyKey, studioReasonOf } from "../studio/studioReason";
import type { AdminStudioAccessRequestDTO } from "./api/studioAccessRequestsAdmin.api";
import {
  useAdminStudioAccessRequests,
  useDismissStudioAccessRequest,
  useGrantStudioAccessRequest,
} from "./api/useStudioAdminAccessRequests";
import {
  StudioAdminLoadPanel,
  StudioAdminWaitingRow,
} from "./StudioAdminWaitingRow";
import { studioAdminSaveErrorKeyOf } from "./studioAdmin.model";
import { focusNeighbourControl } from "./useStudioAdminReorderRow";
import css from "./StudioAdminFounding.module.css";

/** The Waiting for Studio tab: members who asked for Studio access, artists
 *  first, then the longest wait. Grant Studio access acts at once; Dismiss
 *  request confirms. The next page loads on Show more requests only. */
export function StudioAdminWaiting() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const query = useAdminStudioAccessRequests();
  const grant = useGrantStudioAccessRequest();
  const dismiss = useDismissStudioAccessRequest();
  const [dismissTarget, setDismissTarget] =
    useState<AdminStudioAccessRequestDTO | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const { data, hasNextPage, isFetchingNextPage, isFetchNextPageError } = query;
  const loadState = studioLoadStateOf(query, data !== undefined);
  const requests = data?.pages.flatMap((page) => page.items) ?? [];
  const latestPage = data?.pages.at(-1);
  const hasMore = hasNextPage;
  const isBusy = grant.isPending || dismiss.isPending;
  const { listRef, footerRef, markPageRequested } = useStudioFocusFirstNewRow({
    rowCount: requests.length,
    hasMore,
    isSettled: !isFetchingNextPage && !isFetchNextPageError,
    focusSelector: "a, button",
    shouldFocusEveryPage: true,
  });

  const toastRefusal = (actionKey: string, cause: unknown) =>
    showToast(
      `${t(actionKey)}: ${t(studioAdminSaveErrorKeyOf(cause))}`,
      "error",
    );

  function focusNeighbourOf(request: AdminStudioAccessRequestDTO) {
    focusNeighbourControl({
      list: listRef.current,
      index: requests.indexOf(request),
      findControl: (row) =>
        row.querySelector<HTMLElement>("[data-waiting-grant]"),
      fallback: headingRef.current,
    });
  }

  function grantRequest(request: AdminStudioAccessRequestDTO) {
    if (isBusy) return;
    grant.mutate(request, {
      onSuccess: () => {
        setStatusMessage(
          t("admin:studioAdmin.waiting.granted", {
            name: request.member.displayName,
          }),
        );
        focusNeighbourOf(request);
      },
      onError: (cause) =>
        toastRefusal("admin:studioAdmin.waiting.grantFailed", cause),
    });
  }

  function confirmDismiss(request: AdminStudioAccessRequestDTO) {
    dismiss.mutate(request, {
      onSuccess: () => {
        setDismissTarget(null);
        setStatusMessage(
          t("admin:studioAdmin.waiting.dismissed", {
            name: request.member.displayName,
          }),
        );
        focusNeighbourOf(request);
      },
      onError: (cause) => {
        setDismissTarget(null);
        toastRefusal("admin:studioAdmin.waiting.dismissFailed", cause);
      },
    });
  }

  return (
    <section className={css.section} aria-labelledby={headingId}>
      <div className={css.head}>
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className={css.heading}
        >
          {t("admin:studioAdmin.waiting.heading")}
        </h2>
        <p className={css.sub}>{t("admin:studioAdmin.waiting.sub")}</p>
      </div>
      <Collapse isOpen={loadState.isLoading}>
        <SkeletonLine height={160} style={{ borderRadius: 14 }} />
      </Collapse>
      <Collapse isOpen={loadState.isError}>
        <StudioAdminLoadPanel
          loadState={loadState}
          error={query.error}
          title={t("admin:studioAdmin.waiting.loadError")}
        />
      </Collapse>
      <Collapse isOpen={latestPage !== undefined && latestPage.totalCount > 0}>
        <p className={css.counts}>
          {t("admin:studioAdmin.waiting.counts", {
            count: latestPage?.totalCount ?? 0,
            artistCount: latestPage?.artistCount ?? 0,
          })}
        </p>
      </Collapse>
      <Collapse isOpen={data !== undefined && requests.length === 0}>
        <p className={css.empty}>{t("admin:studioAdmin.waiting.empty")}</p>
      </Collapse>
      <Collapse isOpen={requests.length > 0}>
        <ul ref={listRef} className={css.list} aria-labelledby={headingId}>
          <AnimatePresence initial={false}>
            {requests.map((request) => (
              <StudioAdminWaitingRow
                key={request.id}
                request={request}
                isBusy={isBusy}
                onGrant={() => grantRequest(request)}
                onDismiss={() => setDismissTarget(request)}
              />
            ))}
          </AnimatePresence>
        </ul>
      </Collapse>
      <Collapse isOpen={hasMore || isFetchNextPageError}>
        <div ref={footerRef} className={css.footer}>
          <LoadMoreFooter
            isFetchingNextPage={isFetchingNextPage}
            isFetchNextPageError={isFetchNextPageError}
            onLoadMore={() => {
              markPageRequested();
              void query.fetchNextPage();
            }}
            label={t("admin:studioAdmin.waiting.showMore")}
            loadingLabel={t("studio:liked.page.loadingMore")}
            errorMessage={`${t("common:error.loadMore")} ${t(
              studioReasonCopyKey(studioReasonOf(query.error), "load"),
            )}`}
            aria-busy={isFetchingNextPage}
          />
        </div>
      </Collapse>
      <p className="visuallyHidden" role="status">
        {statusMessage}
      </p>
      <ConfirmDialog
        open={dismissTarget !== null}
        onClose={() => setDismissTarget(null)}
        onConfirm={() => {
          if (dismissTarget) confirmDismiss(dismissTarget);
        }}
        tone="destructive"
        loading={dismiss.isPending}
        title={t("admin:studioAdmin.waiting.dismissConfirm.title", {
          name: dismissTarget?.member.displayName ?? "",
        })}
        description={t("admin:studioAdmin.waiting.dismissConfirm.body", {
          name: dismissTarget?.member.displayName ?? "",
        })}
        confirmLabel={t("admin:studioAdmin.waiting.dismissCta")}
      />
    </section>
  );
}
