import { useState } from "react";
import { FiCheck, FiSearch } from "react-icons/fi";
import { Button, ConfirmDialog, EmptyState } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useReviewJoinRequest } from "../communities/api/useCommunityMutations";
import { useJoinRequests } from "../communities/api/useJoinRequests";
import { RequestsTabRow } from "./RequestsTabRow";
import styles from "./ModPanel.module.css";

/**
 * The mod panel's Requests tab: a community's pending join requests, one
 * decision at a time or all at once.
 *
 * Every decision is announced ONLY once the server has answered it, and a
 * failed one puts its row back. Before this, the row vanished under a
 * "{name} approved" toast whatever the server said, and "Approve all" fired N
 * parallel PATCHes, marked every row resolved and claimed all of them landed
 * before a single one had — so a partial failure was invisible and the queue
 * looked empty until the next reload brought the unapproved rows back.
 */
export function RequestsTab({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  // Live: GET /communities/:slug/join-requests (real ids); demo: the flagship's
  // mock queue. Either way the review PATCH below now carries a real id.
  const incoming = useJoinRequests(slug);
  const reviewRequest = useReviewJoinRequest(slug);
  // Track which requests the moderator has already actioned this session and
  // hide them, rather than snapshotting the list once — so a live queue that
  // arrives after the first render still shows, and optimistic removals stick.
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  // The rows whose decision is in flight, so their own actions stop taking
  // input. A set rather than one id: decisions on different applicants are
  // independent and may overlap, and only a repeat on the SAME row is the
  // double-decision this guards against.
  const [decidingIds, setDecidingIds] = useState<Set<string>>(new Set());
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [isConfirmingApproveAll, setIsConfirmingApproveAll] = useState(false);

  const requests = incoming.items.filter((r) => !resolvedIds.includes(r.id));
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

  /** Reviews the whole visible batch, then reports what actually landed —
   *  only the ids the server accepted leave the queue, so a request that
   *  failed stays put for another try instead of silently disappearing. */
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
    <div>
      <div className={styles.searchRow}>
        <FiSearch className={styles.searchIcon} aria-hidden />
        <input
          className={styles.search}
          aria-label={t("admin:modPanel.requests.searchPlaceholder")}
          placeholder={t("admin:modPanel.requests.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {requests.length > 1 && (
        <div className={styles.bulkRow}>
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
        </div>
      )}
      <div className={styles.secLbl}>
        {t("admin:modPanel.requests.sectionLabel")}{" "}
        {requests.length > 0 && (
          <span className={styles.tabCount}>{requests.length}</span>
        )}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          compact
          title={t("admin:modPanel.requests.emptyTitle")}
          description={t("admin:modPanel.requests.emptyDesc")}
        />
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
