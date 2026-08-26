import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ToastContextValue } from "../../shared/components/feedback/toastContext";
import type { TFunction } from "../../shared/i18n/types";
import {
  captureRemovedRows,
  withRowsRestored,
  type RemovalHandle,
} from "./moderationUndo";
import type { AppealView, ModReportView } from "./moderationAge";
import type { ModQueueData } from "./api/useModReports";
import { useReviewAppeal } from "./api/useReviewAppeal";
import { useDeferredCommits } from "./useDeferredCommits";
import { useModerationReportActions } from "./useModerationReportActions";
import { useModerationAssignmentActions } from "./useModerationAssignmentActions";

export interface UseModerationQueueActionsParams {
  data: ModQueueData | undefined;
  refetch: () => unknown;
  t: TFunction;
  showToast: ToastContextValue["showToast"];
}

/**
 * The moderation queue's mutating layer: local row state (open/appeals),
 * selection + leave-animation state, and every reversible action that drives
 * them. Colocated with `useModerationQueue` because the Undo pattern (audit
 * P1-1) ties row removal, the deferred commit, and the query-mirror guard
 * together tightly enough that splitting them further would just move the
 * coupling around.
 *
 * **Undo is a real deferred commit** (audit P1-1): actioning a report removes
 * the row and shows the Undo toast, but the destructive PATCH (`ban`/`warn`/
 * `remove` — which notifies the member server-side) is only fired once the
 * undo window elapses. Clicking Undo cancels the pending commit outright, so
 * nothing ever reaches the server; navigating away flushes any still-pending
 * commits (the moderator confirmed them by not undoing), and every timer is
 * cleared on unmount so nothing fires late. In demo mode the deferred
 * mutation is a network no-op, so the flow is identical but purely local.
 */
export function useModerationQueueActions({
  data,
  refetch,
  t,
  showToast,
}: UseModerationQueueActionsParams) {
  const [, setSearchParams] = useSearchParams();
  const reviewAppeal = useReviewAppeal();

  const [open, setOpen] = useState<ModReportView[]>(data?.open ?? []);
  const [appeals, setAppeals] = useState<AppealView[]>(data?.appeals ?? []);
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<ModReportView | null>(null);
  const [appeal, setAppeal] = useState<AppealView | null>(null);

  // Ids optimistically removed from a tab whose deferred commit hasn't settled
  // yet. Guards the query-mirror antipattern: a background react-query refetch
  // (window focus, reconnect, or another action's `onSettled` invalidation)
  // returns a fresh array that STILL contains these rows — the server hasn't
  // been told, because the destructive PATCH is deferred behind the undo window
  // — so re-seeding local state from it verbatim would resurrect a row the
  // moderator just actioned, clobbering the in-flight optimistic edit. The
  // re-seed effects below reconcile by id: any pending-removed id is filtered
  // out of the incoming data until its commit settles (success → server now
  // agrees, drop it), is undone (row restored, drop it), or fails (drop it and
  // refetch so server truth rolls the row back).
  const pendingOpenRemoval = useRef<Set<string>>(new Set());
  const pendingAppealRemoval = useRef<Set<string>>(new Set());

  // Re-seed local state whenever the query data changes. In demo the reference is
  // a stable module constant (effect runs once), so optimistic edits survive; in
  // live each refetch is a fresh array, so a settled mutation resyncs to server
  // truth — which doubles as the rollback when a PATCH fails.
  const dataOpen = data?.open;
  const dataAppeals = data?.appeals;
  useEffect(() => {
    // Re-seeds from the react-query result (each live refetch resyncs to server
    // truth) BUT keeps out rows with an in-flight optimistic removal — see
    // `pendingOpenRemoval` — so a background refetch can't resurrect a row the
    // moderator just actioned while its deferred PATCH is still pending.

    if (dataOpen)
      setOpen(dataOpen.filter((r) => !pendingOpenRemoval.current.has(r.id)));
  }, [dataOpen]);
  useEffect(() => {
    // Same query-mirror guard for the appeals tab (see `pendingAppealRemoval`).

    if (dataAppeals)
      setAppeals(
        dataAppeals.filter((a) => !pendingAppealRemoval.current.has(a.id)),
      );
  }, [dataAppeals]);

  const clearLeaving = (ids: string[]) =>
    setLeaving((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });

  const replayOpen = () => {
    setLeaving(new Set());
    setPicked(new Set());
    if (dataOpen) setOpen(dataOpen);
  };

  /**
   * Animate ids out of the open queue, then drop them.
   *
   * Returns a handle (FE-ADM-15) carrying the removed rows with their original
   * positions, plus a `cancel` that clears THIS removal's own 340ms drop timer
   * and only its own leave flags. Without the cancel, an Undo clicked inside
   * that 340ms window was immediately overwritten by the timer that was already
   * scheduled; without the per-action scoping, one Undo wiped every other
   * in-flight action's leave animation too.
   */
  const removeReports = (ids: string[]): RemovalHandle<ModReportView> => {
    const removingIds = new Set(ids);
    const removed = captureRemovedRows(open, ids);
    setLeaving((prev) => new Set([...prev, ...ids]));
    setPicked(new Set());
    const dropTimer = window.setTimeout(() => {
      setOpen((queue) => queue.filter((row) => !removingIds.has(row.id)));
      clearLeaving(ids);
    }, 340);
    return {
      removed,
      cancel: () => {
        window.clearTimeout(dropTimer);
        clearLeaving(ids);
      },
    };
  };

  const undoToast = (message: string, restore: () => void, restored: string) =>
    showToast(message, "success", undefined, {
      label: t("admin:common.undo"),
      onClick: () => {
        restore();
        showToast(restored, "info");
      },
    });

  // Deferred-commit Undo (P1-1): destructive PATCHes wait out the undo window.
  const { scheduleCommit, cancelCommit } = useDeferredCommits();

  // The two report-level actions (resolve one / bulk-act on the picked set)
  // share this state's row/removal/Undo primitives but are big enough to live
  // in their own module — see `useModerationReportActions`.
  const { resolveReport, bulkAct } = useModerationReportActions({
    picked,
    setOpen,
    removeReports,
    undoToast,
    pendingOpenRemoval,
    scheduleCommit,
    cancelCommit,
    refetch,
    t,
    showToast,
  });

  // Opening a report never resolves it — it presents the decision drawer (the
  // action grid + reason + member-facing note). The drawer fetches / falls back
  // to context on its own when the list item carries no `detail`.
  const openReport = (r: ModReportView) => setSelected(r);

  const togglePick = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /**
   * TS-06: select every report in one cluster at once, so the bulk bar can act
   * on a whole pile-on in a single call.
   *
   * The ids come from the SERVER's cluster, which counts every open report
   * about the subject, so most of them are usually not on screen. That is the
   * point: `bulkAct` sends the id list to `PATCH /mod/reports/bulk` whether or
   * not a row for it was ever rendered, and the ids that are on screen still
   * animate out. Selecting a cluster that is already fully selected clears it,
   * so the same control toggles.
   */
  const pickCluster = (ids: string[]) =>
    setPicked((prev) => {
      const isFullySelected = ids.length > 0 && ids.every((id) => prev.has(id));
      const next = new Set(prev);
      ids.forEach((id) => (isFullySelected ? next.delete(id) : next.add(id)));
      return next;
    });

  // Claim/release don't touch the Undo/removal machinery this hook is built
  // around, only the assignee fields on the row — see
  // `useModerationAssignmentActions`.
  const { assignToMe, unassignReport } = useModerationAssignmentActions({
    setOpen,
    setSelected,
    t,
    showToast,
  });

  const recordAppeal = (
    id: string,
    decision: "uphold" | "overturn",
    note = "",
  ) => {
    const a = appeals.find((x) => x.id === id);
    // Same by-id undo contract as the open queue (FE-ADM-15): capture just this
    // appeal and where it sat, and keep a handle on its own drop timer.
    const removed = captureRemovedRows(appeals, [id]);
    setLeaving((prev) => new Set([...prev, id]));
    const dropTimer = window.setTimeout(() => {
      setAppeals((list) => list.filter((x) => x.id !== id));
      clearLeaving([id]);
    }, 340);
    // Shield the decided appeal from a background refetch (query-mirror guard).
    pendingAppealRemoval.current.add(id);
    // Deferred: an appeal decision notifies the appellant, so hold it until the
    // undo window closes and cancel it if Undo is clicked.
    const handle = scheduleCommit(() =>
      reviewAppeal.mutate(
        { id, decision, note },
        {
          onSuccess: () => pendingAppealRemoval.current.delete(id),
          onError: () => {
            pendingAppealRemoval.current.delete(id);
            showToast(t("admin:moderation.queue.serviceErrorToast"), "error");
            void refetch();
          },
        },
      ),
    );
    const verbKey =
      decision === "uphold"
        ? "admin:moderation.queue.appealVerb.upheld"
        : "admin:moderation.queue.appealVerb.overturned";
    undoToast(
      t("admin:moderation.queue.appealToast", {
        verb: t(verbKey),
        name: a?.appealBy ?? t("admin:moderation.appeal.fallbackName"),
      }),
      () => {
        cancelCommit(handle);
        window.clearTimeout(dropTimer);
        clearLeaving([id]);
        pendingAppealRemoval.current.delete(id);
        setAppeals((list) => withRowsRestored(list, removed));
      },
      t("admin:moderation.queue.appealRestoredToast"),
    );
  };

  const clearSubjectFilter = () =>
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete("subjectId");
      return next;
    });

  /** The "prior reports" chip's click-through (COM-6): narrows the queue to
   *  every other report about this exact subject, via the `?subjectId=`
   *  deep-link `useModReports` already understands. Closes the drawer first
   *  (if open) so the filtered list is what the moderator lands on. */
  const viewSubjectHistory = (report: ModReportView) => {
    setSelected(null);
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("subjectId", report.subjectId);
      return next;
    });
  };

  return {
    open,
    appeals,
    leaving,
    picked,
    selected,
    setSelected,
    appeal,
    setAppeal,
    replayOpen,
    resolveReport,
    openReport,
    togglePick,
    pickCluster,
    bulkAct,
    assignToMe,
    unassignReport,
    viewSubjectHistory,
    recordAppeal,
    resetAppeals: () => dataAppeals && setAppeals(dataAppeals),
    clearPicked: () => setPicked(new Set()),
    clearSubjectFilter,
  };
}
