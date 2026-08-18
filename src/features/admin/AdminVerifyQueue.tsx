import { useState } from "react";
import { FadeIn, SkeletonLine } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useJoinRequests, type JoinRequestView } from "./api/useJoinRequests";
import { useReviewJoinRequest } from "./api/useReviewJoinRequest";
import { useJoinRequestQueueSelection } from "./useJoinRequestQueueSelection";
import { JoinRequestCard } from "./JoinRequestCard";
import { JoinRequestApprovedCard } from "./JoinRequestApprovedCard";
import { JoinRequestDeclineModal } from "./JoinRequestDeclineModal";
import { JoinRequestBulkActionBar } from "./JoinRequestBulkActionBar";
import styles from "./AdminMembersPage.module.css";

/**
 * Moderator review of incoming platform join requests. Sourced from
 * useJoinRequests (GET /join-requests?status=pending), with approve/decline wired
 * to useReviewJoinRequest (PATCH /join-requests/:id). The mutation invalidates the
 * ["join-requests"] query so the list refetches; declines drop the row locally
 * with a short leave animation so the action reads instantly in either mode.
 *
 * Approvals do *not* drop: the response carries an invite code, and while
 * approval fires an automatic invite email, the reviewer can still copy that
 * link and send it as a backup. The approved card is held in local state so
 * it survives the refetch that removes the row from the pending list.
 */
export function AdminVerifyQueue() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const { data, isLoading } = useJoinRequests("pending");
  const { data: waitlisted } = useJoinRequests("waitlisted");
  const reviewJoinRequest = useReviewJoinRequest();
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [declined, setDeclined] = useState<Set<string>>(new Set());
  // A single "Waitlist" click's rows: held here (mirroring `approved`) so
  // they both drop out of the pending view immediately and appear under
  // the Waitlisted section right away, in demo mode where the mock queue
  // never mutates its own backing array on a mutation so neither the
  // pending nor the waitlisted query would otherwise reflect the decision.
  const [waitlistedLocally, setWaitlistedLocally] = useState<
    JoinRequestView[]
  >([]);
  // Approved rows keep their place, now carrying the invite code to hand over.
  const [approved, setApproved] = useState<JoinRequestView[]>([]);
  // The row a reviewer just clicked "decline" on, still waiting on a reason.
  const [decliningItem, setDecliningItem] = useState<JoinRequestView | null>(
    null,
  );
  // Rows a bulk action already resolved — dropped from the pending view the
  // same way `declined`/`approved` already do for a single decision. Needed
  // because demo mode's mock queue never mutates its own backing array on a
  // mutation, so a bulk decide's query invalidation alone wouldn't otherwise
  // remove these rows from view.
  const [bulkResolved, setBulkResolved] = useState<Set<string>>(new Set());

  const approvedIds = new Set(approved.map((r) => r.id));
  const waitlistedLocallyIds = new Set(waitlistedLocally.map((r) => r.id));
  const queue = (data ?? []).filter(
    (r) =>
      !declined.has(r.id) &&
      !approvedIds.has(r.id) &&
      !waitlistedLocallyIds.has(r.id) &&
      !bulkResolved.has(r.id),
  );
  const selection = useJoinRequestQueueSelection(queue);

  function handleBulkSuccess(ids: string[]) {
    setBulkResolved((current) => {
      const next = new Set(current);
      for (const id of ids) next.add(id);
      return next;
    });
  }

  // A row a single-row action just resolved stops belonging in the bulk
  // selection: drop just that id rather than the whole `resetSelection()`,
  // which would also wipe an unrelated in-progress multi-select.
  function removeFromSelection(id: string) {
    selection.setSelectedIds((current) => {
      if (!current.has(id)) return current;
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }

  function unmarkLeaving(id: string) {
    setLeaving((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  }

  function resolve(item: JoinRequestView, status: "approved" | "waitlisted") {
    reviewJoinRequest.mutate(
      { id: item.id, status },
      {
        onSuccess: (dto) => {
          if (status === "approved") {
            setApproved((list) =>
              list.some((r) => r.id === item.id)
                ? list
                : [{ ...item, inviteCode: dto.inviteCode }, ...list],
            );
          } else {
            setWaitlistedLocally((list) =>
              list.some((r) => r.id === item.id) ? list : [item, ...list],
            );
          }
          removeFromSelection(item.id);
        },
        onError: () => {
          showToast(t("admin:members.verify.errorToast"), "error");
        },
      },
    );
    if (status === "approved") {
      showToast(
        t("admin:members.verify.approvedToast", { name: item.name }),
        "success",
      );
    } else {
      showToast(
        t("admin:members.verify.waitlistedToast", { name: item.name }),
        "info",
      );
    }
  }

  function requestDecline(item: JoinRequestView) {
    setDecliningItem(item);
  }

  function confirmDecline(reason: string) {
    const item = decliningItem;
    if (!item) return;
    setLeaving((s) => new Set(s).add(item.id));
    window.setTimeout(() => {
      setDeclined((s) => new Set(s).add(item.id));
      removeFromSelection(item.id);
    }, 320);
    reviewJoinRequest.mutate(
      { id: item.id, status: "declined", declineReason: reason },
      {
        onSuccess: () => {
          showToast(
            t("admin:members.verify.declinedToast", { name: item.name }),
            "info",
          );
        },
        onError: () => {
          unmarkLeaving(item.id);
          setDeclined((s) => {
            const next = new Set(s);
            next.delete(item.id);
            return next;
          });
          showToast(t("admin:members.verify.errorToast"), "error");
        },
      },
    );
    setDecliningItem(null);
  }

  if (isLoading) {
    return (
      <div className={styles.queueGrid}>
        {[0, 1, 2].map((i) => (
          <div className={styles.queueCard} key={i}>
            <SkeletonLine width="55%" height={18} />
            <SkeletonLine width="80%" />
            <SkeletonLine width="90%" height={40} />
          </div>
        ))}
      </div>
    );
  }

  // Merge the server's waitlisted rows with any this session waitlisted
  // locally (demo mode's mock queue never mutates its own backing array, so
  // a refetched `waitlisted` query wouldn't otherwise carry a fresh
  // decision). Once the server copy does carry the row, prefer it and drop
  // the local stand-in so the row isn't rendered twice.
  const serverWaitlistedIds = new Set((waitlisted ?? []).map((r) => r.id));
  const displayedWaitlisted = [
    ...waitlistedLocally.filter((r) => !serverWaitlistedIds.has(r.id)),
    ...(waitlisted ?? []),
  ];

  if (
    queue.length === 0 &&
    approved.length === 0 &&
    displayedWaitlisted.length === 0
  ) {
    return (
      <div className={styles.queueEmpty}>
        <p className={styles.queueIntro}>{t("admin:members.verify.empty")}</p>
      </div>
    );
  }

  return (
    <div>
      <p className={styles.queueIntro}>{t("admin:members.verify.intro")}</p>
      <p className={styles.queueIntroEm}>
        <em>{t("admin:members.verify.introEm")}</em>
      </p>

      <div className={styles.queueGrid}>
        {approved.map((item) => (
          <FadeIn key={item.id}>
            <JoinRequestApprovedCard item={item} />
          </FadeIn>
        ))}
        {queue.map((item, i) => (
          <FadeIn key={item.id} delay={i * 60}>
            <JoinRequestCard
              item={item}
              leaving={leaving.has(item.id)}
              stage="pending"
              selected={selection.selectedIds.has(item.id)}
              onApprove={() => resolve(item, "approved")}
              onDecline={() => requestDecline(item)}
              onWaitlist={() => resolve(item, "waitlisted")}
              onToggleSelect={selection.toggleSelected}
            />
          </FadeIn>
        ))}
      </div>

      {selection.selectedIds.size > 0 && (
        <JoinRequestBulkActionBar
          selectedIds={selection.selectedIds}
          onClear={() => selection.setSelectedIds(new Set())}
          onSuccess={handleBulkSuccess}
        />
      )}

      {displayedWaitlisted.length > 0 && (
        <div className={styles.queueWaitlistSection}>
          <h3 className={styles.dHeading}>
            {t("admin:members.verify.waitlistedSectionTitle")}
          </h3>
          <div className={styles.queueGrid}>
            {displayedWaitlisted.map((item, i) => (
              <FadeIn key={item.id} delay={i * 60}>
                <JoinRequestCard
                  item={item}
                  leaving={false}
                  stage="waitlisted"
                  selected={false}
                  onApprove={() => resolve(item, "approved")}
                  onDecline={() => requestDecline(item)}
                  onToggleSelect={() => {}}
                />
              </FadeIn>
            ))}
          </div>
        </div>
      )}

      {decliningItem && (
        <JoinRequestDeclineModal
          applicantName={decliningItem.name}
          pending={reviewJoinRequest.isPending}
          onConfirm={confirmDecline}
          onClose={() => setDecliningItem(null)}
        />
      )}
    </div>
  );
}
