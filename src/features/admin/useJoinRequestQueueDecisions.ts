import { useState } from "react";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { JoinRequestView } from "./api/useJoinRequests";
import { useReviewJoinRequest } from "./api/useReviewJoinRequest";
import { useJoinRequestQueueSelection } from "./useJoinRequestQueueSelection";

/**
 * Every decision a reviewer can take on the platform join-request queue, plus
 * the local bookkeeping that keeps the visible queue in step with them — so
 * `AdminVerifyQueue` stays layout only (a plain hook returns no JSX, so the
 * per-component line limit doesn't apply to it, the same split
 * `useModToolsActions` makes for the community mod tools).
 *
 * The shape every decision follows: fire the write, and announce it ONLY in
 * `onSuccess`. Approving a request also sends the real invite email
 * server-side, so a toast fired before the server answered asserted a welcome
 * that had not happened; on a 403 or a 5xx the reviewer then got a second,
 * contradicting error toast on top of it with the card still sitting pending.
 *
 * Only one decision may be in flight at a time. A second click, or an Enter on
 * a button that still holds focus, would otherwise fire a contradicting second
 * review for the same applicant. `decidingId` names the row that is waiting so
 * its card can show it.
 */
export function useJoinRequestQueueDecisions(pendingRows: JoinRequestView[]) {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const reviewJoinRequest = useReviewJoinRequest();
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [declined, setDeclined] = useState<Set<string>>(new Set());
  // A single "Waitlist" click's rows: held here (mirroring `approved`) so
  // they both drop out of the pending view immediately and appear under
  // the Waitlisted section right away, in demo mode where the mock queue
  // never mutates its own backing array on a mutation so neither the
  // pending nor the waitlisted query would otherwise reflect the decision.
  const [waitlistedLocally, setWaitlistedLocally] = useState<JoinRequestView[]>(
    [],
  );
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
  // The row whose review PATCH is still in flight, or null when none is.
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const approvedIds = new Set(approved.map((row) => row.id));
  const waitlistedLocallyIds = new Set(waitlistedLocally.map((row) => row.id));
  const queue = pendingRows.filter(
    (row) =>
      !declined.has(row.id) &&
      !approvedIds.has(row.id) &&
      !waitlistedLocallyIds.has(row.id) &&
      !bulkResolved.has(row.id),
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
    setLeaving((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }

  function resolve(item: JoinRequestView, status: "approved" | "waitlisted") {
    if (reviewJoinRequest.isPending) return;
    setDecidingId(item.id);
    reviewJoinRequest.mutate(
      { id: item.id, status },
      {
        onSuccess: (dto) => {
          if (status === "approved") {
            setApproved((list) =>
              list.some((row) => row.id === item.id)
                ? list
                : [{ ...item, inviteCode: dto.inviteCode }, ...list],
            );
            showToast(
              t("admin:members.verify.approvedToast", { name: item.name }),
              "success",
            );
          } else {
            setWaitlistedLocally((list) =>
              list.some((row) => row.id === item.id) ? list : [item, ...list],
            );
            showToast(
              t("admin:members.verify.waitlistedToast", { name: item.name }),
              "info",
            );
          }
          removeFromSelection(item.id);
        },
        onError: () => showToast(t("admin:members.verify.errorToast"), "error"),
        onSettled: () => setDecidingId(null),
      },
    );
  }

  function requestDecline(item: JoinRequestView) {
    setDecliningItem(item);
  }

  function confirmDecline(reason: string) {
    const item = decliningItem;
    if (!item || reviewJoinRequest.isPending) return;
    setDecidingId(item.id);
    setLeaving((current) => new Set(current).add(item.id));
    window.setTimeout(() => {
      setDeclined((current) => new Set(current).add(item.id));
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
          setDeclined((current) => {
            const next = new Set(current);
            next.delete(item.id);
            return next;
          });
          showToast(t("admin:members.verify.errorToast"), "error");
        },
        onSettled: () => setDecidingId(null),
      },
    );
    setDecliningItem(null);
  }

  /** Merges the server's waitlisted rows with any waitlisted in this session
   *  (demo mode's mock queue never mutates its own backing array, so a
   *  refetched `waitlisted` query wouldn't otherwise carry a fresh decision).
   *  Once the server copy does carry the row, prefer it and drop the local
   *  stand-in so the row isn't rendered twice. */
  function displayedWaitlisted(serverRows: JoinRequestView[]) {
    const serverIds = new Set(serverRows.map((row) => row.id));
    return [
      ...waitlistedLocally.filter((row) => !serverIds.has(row.id)),
      ...serverRows,
    ];
  }

  return {
    queue,
    approved,
    leaving,
    decidingId,
    decliningItem,
    selection,
    isPending: reviewJoinRequest.isPending,
    displayedWaitlisted,
    handleBulkSuccess,
    resolve,
    requestDecline,
    confirmDecline,
    closeDecline: () => setDecliningItem(null),
  };
}
