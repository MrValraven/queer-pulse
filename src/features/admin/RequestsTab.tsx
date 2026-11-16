import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { Button, ConfirmDialog, SearchInput } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useReviewJoinRequest } from "../communities/api/useCommunityMutations";
import { useJoinRequests } from "../communities/api/useJoinRequests";
import { RequestsTabRow } from "./RequestsTabRow";
import {
  AdminEmptyState,
  AdminPanel,
  AdminToolbar,
  adminToolbarClasses,
} from "./ui";
import styles from "./ModPanel.module.css";

/**
 * The mod panel's Requests tab: a community's pending join requests, one
 * decision at a time or all at once.
 *
 * Every decision is announced ONLY once the server has answered it, and a
 * failed one puts its row back. Before this, the row vanished under a
 * "{name} approved" toast whatever the server said, and "Approve all" fired N
 * parallel PATCHes, marked every row resolved and claimed all of them landed
 * before a single one had, so a partial failure was invisible and the queue
 * looked empty until the next reload brought the unapproved rows back.
 *
 * The queue is paginated (ENG-41). The count beside the section label is the
 * SERVER's pending total, so it says how many people are waiting, and "Load
 * more" reaches the rest. Two things
 * stay scoped to the loaded rows on purpose: the search box (which filters what
 * is in hand) and "Approve all", whose own label states the number it will act
 * on.
 */
export function RequestsTab({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  // Live: GET /communities/:slug/join-requests (real ids); demo: the flagship's
  // mock queue. Either way the review PATCH below now carries a real id.
  const incoming = useJoinRequests(slug);
  const reviewRequest = useReviewJoinRequest(slug);
  // Track which requests the moderator has already actioned this session and
  // hide them by id, so a live queue that arrives after the first render still
  // shows and optimistic removals stick.
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  // The rows whose decision is in flight, so their own actions stop taking
  // input. A set of ids: decisions on different applicants are independent
  // and may overlap, and only a repeat on the SAME row is the
  // double-decision this guards against.
  const [decidingIds, setDecidingIds] = useState<Set<string>>(new Set());
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [isConfirmingApproveAll, setIsConfirmingApproveAll] = useState(false);

  const requests = incoming.items.filter((r) => !resolvedIds.includes(r.id));
  // Every decision made this session comes off the server's total, so the label
  // shrinks as the moderator works and agrees with the rows on screen.
  const pendingTotal = Math.max(
    incoming.total - resolvedIds.length,
    requests.length,
  );
  const filtered = requests.filter((r) =>
    r.person.name.toLowerCase().includes(search.toLowerCase()),
  );

  const resolveRequest = (id: string, name: string, isApproved: boolean) => {
    if (decidingIds.has(id) || isApprovingAll) return;
    setResolvedIds((prev) => [...prev, id]);
    setDecidingIds((prev) => new Set(prev).add(id));
    reviewRequest.mutate(
      { id, action: isApproved ? "approve" : "decline" },
      {
        onSuccess: () =>
          showToast(
            t(
              isApproved
                ? "admin:modPanel.requests.approvedToast"
                : "admin:modPanel.requests.declinedToast",
              { name },
            ),
            isApproved ? "success" : "info",
          ),
        onError: () => {
          setResolvedIds((prev) => prev.filter((resolved) => resolved !== id));
          showToast(t("admin:modPanel.requests.errorToast", { name }), "error");
        },
        onSettled: () =>
          setDecidingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          }),
      },
    );
  };

  /** Reviews the whole visible batch, then reports what actually landed.
   *  Only the ids the server accepted leave the queue, so a request that
   *  failed stays put for another try. */
  const approveAll = async () => {
    const batch = requests;
    if (batch.length === 0 || isApprovingAll) return;
    setIsApprovingAll(true);
    const outcomes = await Promise.allSettled(
      batch.map((request) =>
        reviewRequest.mutateAsync({ id: request.id, action: "approve" }),
      ),
    );
    const approvedIds = batch
      .filter((_, index) => outcomes[index]?.status === "fulfilled")
      .map((request) => request.id);
    const failedCount = outcomes.length - approvedIds.length;
    setResolvedIds((prev) => [...prev, ...approvedIds]);
    setIsApprovingAll(false);
    setIsConfirmingApproveAll(false);
    if (failedCount === 0) {
      showToast(
        t("admin:modPanel.requests.approvedAllToast", {
          count: approvedIds.length,
        }),
        "success",
      );
    } else if (approvedIds.length === 0) {
      showToast(
        t("admin:modPanel.requests.approveAllFailedToast", {
          count: failedCount,
        }),
        "error",
      );
    } else {
      showToast(
        t("admin:modPanel.requests.approvedSomeToast", {
          approved: approvedIds.length,
          failed: failedCount,
        }),
        "warning",
      );
    }
  };

  return (
    <div className={styles.tabStack}>
      <AdminToolbar
        label={t("admin:modPanel.requests.toolbarLabel")}
        end={
          requests.length > 1 && (
            <Button
              variant="jade"
              disabled={isApprovingAll}
              onClick={() => setIsConfirmingApproveAll(true)}
            >
              <FiCheck aria-hidden />{" "}
              {t("admin:modPanel.requests.approveAllCta", {
                count: requests.length,
              })}
            </Button>
          )
        }
      >
        <SearchInput
          className={adminToolbarClasses.search}
          value={search}
          onChange={setSearch}
          placeholder={t("admin:modPanel.requests.searchPlaceholder")}
          ariaLabel={t("admin:modPanel.requests.searchPlaceholder")}
        />
      </AdminToolbar>
      <AdminPanel
        title={t("admin:modPanel.requests.sectionLabel")}
        actions={
          pendingTotal > 0 && (
            <span className={styles.tabCount}>{pendingTotal}</span>
          )
        }
        padding="flush"
      >
        {filtered.length === 0 ? (
          <div className={styles.panelEmpty}>
            <AdminEmptyState
              size="inline"
              title={t("admin:modPanel.requests.emptyTitle")}
              body={t("admin:modPanel.requests.emptyDesc")}
            />
          </div>
        ) : (
          filtered.map((r) => (
            <RequestsTabRow
              key={r.id}
              request={r}
              isBusy={decidingIds.has(r.id) || isApprovingAll}
              onApprove={() => resolveRequest(r.id, r.person.name, true)}
              onDecline={() => resolveRequest(r.id, r.person.name, false)}
            />
          ))
        )}
      </AdminPanel>
      {filtered.length > 0 && incoming.paging.hasNextPage && (
        <div className={styles.loadMore}>
          <Button
            variant="ghost"
            disabled={incoming.paging.isFetchingNextPage}
            onClick={incoming.paging.fetchNextPage}
          >
            {incoming.paging.isFetchingNextPage
              ? t("admin:modPanel.requests.loadingMore")
              : t("admin:modPanel.requests.loadMore")}
          </Button>
        </div>
      )}

      {isConfirmingApproveAll && (
        <ConfirmDialog
          open
          onClose={() => setIsConfirmingApproveAll(false)}
          onConfirm={() => void approveAll()}
          title={t("admin:modPanel.requests.approveAllConfirm.title", {
            count: requests.length,
          })}
          description={t("admin:modPanel.requests.approveAllConfirm.body", {
            count: requests.length,
          })}
          loading={isApprovingAll}
          confirmLabel={t("admin:modPanel.requests.approveAllConfirm.cta")}
          cancelLabel={t("admin:modPanel.settings.cancel")}
        />
      )}
    </div>
  );
}
