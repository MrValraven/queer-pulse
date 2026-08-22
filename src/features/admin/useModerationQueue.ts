import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/authContext";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import {
  ageLabelOf,
  oldestRowOf,
  type AppealView,
  type ModReportView,
} from "./moderationAge";
import {
  captureRemovedRows,
  withRowsRestored,
  type RemovalHandle,
} from "./moderationUndo";
import { useModReports } from "./api/useModReports";
import {
  useModAction,
  useModBulkAction,
  type ModBulkVars,
} from "./api/useModAction";
import { useReportAssignment } from "./api/useReportAssignment";
import { useReviewAppeal } from "./api/useReviewAppeal";
import type { ModActionCode } from "./api/moderation.api";
import type { ReasonCode } from "../safety/reportReasons";

export type TabId = "open" | "appeals" | "resolved";
export type FilterId = "all" | "emergencies" | "mine";

/** Drawer action id (MOD_ACTIONS) → server action code (spec 04 action set). */
const ACTION_CODE: Record<string, ModActionCode> = {
  hide: "hide_content",
  remove: "remove_content",
  shield: "shield",
  warn: "warn",
  restrict: "restrict",
  ban: "ban",
  dismiss: "dismiss",
  escalate: "escalate",
};

/** Canonical toast-verb id — never displayed directly. Resolve its label via
 *  `t(`admin:moderation.queue.verb.${verb}`)`. */
export type ResolveVerb = "resolved" | "escalated" | "actioned";

export interface ResolveOpts {
  /** Toast verb id, e.g. "resolved" / "actioned" / "escalated". */
  verb?: ResolveVerb;
  /** MOD_ACTIONS id chosen in the drawer (mapped to a server action code). */
  action?: string;
  reasonCode?: ReasonCode;
  /** The member-facing note — the reason the member reads. */
  note?: string;
  /** e.g. "7d" — required by the backend for `restrict` (always time-boxed). */
  duration?: string;
}

/** Canonical bulk-verb id — never displayed directly. Resolve its label via
 *  `t(`admin:moderation.queue.bulkVerb.${verb}`)`. */
export type BulkVerb =
  | "dismissed"
  | "removedAsSpam"
  | "escalated"
  | "warned"
  | "suspended"
  | "banned";

// Slightly longer than the action-toast's 5200ms undo window (ToastProvider),
// so the moderator has the full toast lifetime to click Undo before it sends.
const UNDO_COMMIT_MS = 5600;

/**
 * Deferred-commit scheduler for the Undo pattern (audit P1-1). `scheduleCommit`
 * holds a destructive action back until the undo window closes and returns a
 * handle; `cancelCommit(handle)` drops it outright (the Undo path). On unmount
 * every still-pending commit is flushed — the moderator confirmed it by not
 * undoing — and its timer cleared so nothing fires against a dead component.
 * Handles are monotonic so bulk (many ids) and per-row actions cancel alone.
 */
function useDeferredCommits() {
  const pending = useRef(new Map<number, { commit: () => void; timer: number }>());
  const nextHandle = useRef(0);

  const cancelCommit = (handle: number) => {
    const entry = pending.current.get(handle);
    if (!entry) return;
    window.clearTimeout(entry.timer);
    pending.current.delete(handle);
  };

  const scheduleCommit = (commit: () => void): number => {
    const handle = nextHandle.current++;
    const timer = window.setTimeout(() => {
      pending.current.delete(handle);
      commit();
    }, UNDO_COMMIT_MS);
    pending.current.set(handle, { commit, timer });
    return handle;
  };

  useEffect(() => {
    const commits = pending.current;
    return () => {
      commits.forEach(({ commit, timer }) => {
        window.clearTimeout(timer);
        commit();
      });
      commits.clear();
    };
  }, []);

  return { scheduleCommit, cancelCommit };
}

/**
 * All Moderation-page view-state (tab / filter / selection / multi-select /
 * leave animation) plus the reversible actions that drive it. The data source is
 * `useModReports` (demo → mock arrays, live → GET /mod/reports); this hook layers
 * optimistic row removal + Undo on top.
 *
 * **Undo is a real deferred commit** (audit P1-1): actioning a report removes the
 * row and shows the Undo toast, but the destructive PATCH (`ban`/`warn`/`remove`
 * — which notifies the member server-side) is only fired once the undo window
 * elapses. Clicking Undo cancels the pending commit outright, so nothing ever
 * reaches the server; navigating away flushes any still-pending commits (the
 * moderator confirmed them by not undoing), and every timer is cleared on
 * unmount so nothing fires late. In demo mode the deferred mutation is a network
 * no-op, so the flow is identical but purely local.
 */
export function useModerationQueue() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLink = searchParams.get("tab");
  // Deep-link from a flagged Trust Network node (ADM-8) or a report's
  // "prior reports" chip (COM-6): narrows the queue to one subject.
  const subjectId = searchParams.get("subjectId") ?? undefined;
  const { user } = useAuth();
  const modAction = useModAction();
  const modBulk = useModBulkAction();
  const reviewAppeal = useReviewAppeal();
  const reportAssignment = useReportAssignment();

  const [tab, setTab] = useState<TabId>(
    deepLink === "appeals"
      ? "appeals"
      : deepLink === "resolved"
        ? "resolved"
        : "open",
  );
  const [filter, setFilter] = useState<FilterId>(
    deepLink === "emergencies" ? "emergencies" : "all",
  );
  // `filter` is passed through so the server narrows the whole queue, not just
  // whatever landed on page one; `matchesFilter` below still applies it to the
  // locally-held rows (demo mode has no server to ask).
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasMoreOpen,
    isLoadingMoreOpen,
    loadMoreOpen,
  } = useModReports(subjectId, filter);
  const [open, setOpen] = useState<ModReportView[]>(data?.open ?? []);
  const [appeals, setAppeals] = useState<AppealView[]>(data?.appeals ?? []);
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<ModReportView | null>(null);
  const [appeal, setAppeal] = useState<AppealView | null>(null);
  const { showToast } = useToast();
  const fmt = useFormat();

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

  const matchesFilter = (r: ModReportView) => {
    if (filter === "emergencies") return r.severity === "emergency";
    if (filter === "mine")
      return user != null && r.assignedModeratorId === user.id;
    return true;
  };

  const visible = open.filter(matchesFilter);
  const emergencies = visible.filter((r) => r.severity === "emergency");
  const others = visible.filter((r) => r.severity !== "emergency");
  // FE-ADM-29: the queue is fetched `sort: "priority"`, so the LAST row is the
  // lowest-priority one and reading its age as "the oldest" understated a
  // three-day-old medium-severity report sitting mid-list. Compare the real
  // timestamps instead, then format the winner the same localized way the cards
  // do.
  const oldestReport = oldestRowOf(visible);
  const oldest = oldestReport ? ageLabelOf(oldestReport, fmt) : "";

  const counts = {
    open: open.length,
    appeals: appeals.length,
    resolved: data?.counts.resolved ?? 0,
  };

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

  const resolveReport = (id: string, opts: ResolveOpts = {}) => {
    const verb = opts.verb ?? "resolved";
    const removal = removeReports([id]);
    // Mark the row pending-removed so a background refetch during the undo
    // window can't resurrect it (query-mirror guard).
    pendingOpenRemoval.current.add(id);
    // Defer the real PATCH until the undo window closes. The backend writes the
    // audit entry + notifies the reported member (mod_action) and reporter
    // (report_outcome), so it must not fire while Undo is still on offer. Demo:
    // the mutation is a network no-op, so this stays a pure local flow.
    const handle = scheduleCommit(() =>
      modAction.mutate(
        {
          id,
          action: ACTION_CODE[opts.action ?? "dismiss"] ?? "dismiss",
          reasonCode: opts.reasonCode ?? "other",
          note: opts.note ?? "",
          duration: opts.duration,
        },
        {
          // Committed: the server now agrees the row is gone (a resolved report
          // never returns on the open tab), so stop shielding its id.
          onSuccess: () => pendingOpenRemoval.current.delete(id),
          // Failed: the row is still open server-side. Drop the shield and
          // refetch so server truth rolls the row back into view.
          onError: () => {
            pendingOpenRemoval.current.delete(id);
            showToast(t("admin:moderation.queue.serviceErrorToast"), "error");
            void refetch();
          },
        },
      ),
    );
    undoToast(
      t("admin:moderation.queue.actionToast", {
        verb: t(`admin:moderation.queue.verb.${verb}`),
      }),
      // Undo restores BY ID into the CURRENT queue and cancels only this
      // action's own timers and shield (FE-ADM-15) — a report actioned later in
      // the same undo window keeps its removal and its pending commit.
      () => {
        cancelCommit(handle);
        removal.cancel();
        pendingOpenRemoval.current.delete(id);
        setOpen((queue) => withRowsRestored(queue, removal.removed));
      },
      t("admin:moderation.queue.restoredToast"),
    );
  };

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
   * Apply one action to every picked report. `decision` carries the reason code
   * and the exact member-facing note for the sanctioning actions (ban / warn /
   * remove-content / suspend), collected by `BulkActionModal` before this runs.
   * Dismiss and escalate need neither, so they still fire straight from the
   * bulk bar and fall back to the unspecified reason code.
   */
  const bulkAct = (
    verb: BulkVerb,
    action: ModActionCode = "dismiss",
    decision?: { reasonCode?: string; note?: string; duration?: string },
  ) => {
    const ids = [...picked];
    if (ids.length === 0) return;
    const removal = removeReports(ids);
    // Shield every removed id from a background refetch (query-mirror guard).
    ids.forEach((id) => pendingOpenRemoval.current.add(id));
    // Deferred, like resolveReport — a bulk PATCH also notifies members, so it
    // waits out the undo window and is cancelled outright if Undo is clicked.
    const handle = scheduleCommit(() =>
      modBulk.mutate(
        {
          ids,
          action,
          reasonCode: (decision?.reasonCode ??
            "other") as ModBulkVars["reasonCode"],
          note: decision?.note,
          duration: decision?.duration,
        },
        {
          // Continue-on-error (P0-16): the backend never throws for a partial
          // batch, so a failure here means EVERY report failed rather than
          // being thrown outright — `data.failed` is how a partial batch
          // surfaces. Either way, only `data.updated` actually resolved
          // server-side, so the failed ids must come back into view rather
          // than staying optimistically removed.
          onSuccess: (data) => {
            ids.forEach((id) => pendingOpenRemoval.current.delete(id));
            if (data.failed.length > 0) {
              const reasons = [
                ...new Set(data.failed.map((failure) => failure.reason)),
              ]
                .slice(0, 2)
                .join("; ");
              showToast(
                t("admin:moderation.queue.bulkPartialToast", {
                  succeededCount: data.updated.length,
                  failedCount: data.failed.length,
                  reasons,
                }),
                "error",
              );
              void refetch();
            }
          },
          onError: () => {
            ids.forEach((id) => pendingOpenRemoval.current.delete(id));
            showToast(t("admin:moderation.queue.serviceErrorToast"), "error");
            void refetch();
          },
        },
      ),
    );
    undoToast(
      t("admin:moderation.queue.bulkToast", {
        count: ids.length,
        verb: t(`admin:moderation.queue.bulkVerb.${verb}`),
      }),
      // Same by-id restore as `resolveReport` (FE-ADM-15): only this batch's
      // rows come back, only this batch's shields are dropped.
      () => {
        cancelCommit(handle);
        removal.cancel();
        ids.forEach((id) => pendingOpenRemoval.current.delete(id));
        setOpen((queue) => withRowsRestored(queue, removal.removed));
      },
      t("admin:moderation.queue.bulkRestoredToast"),
    );
  };

  /** Patches a report's assignee fields in every place it's held locally, so
   *  the drawer and the "Assigned to me" filter reflect the claim/release
   *  immediately without waiting on a refetch. */
  const patchAssignment = (
    id: string,
    assignedModeratorId: string | null,
    assignedModeratorName: string | undefined,
  ) => {
    const apply = (r: ModReportView): ModReportView =>
      r.id === id ? { ...r, assignedModeratorId, assignedModeratorName } : r;
    setOpen((current) => current.map(apply));
    setSelected((current) => (current ? apply(current) : current));
  };

  /** Self-assign (COM-5) — claims a report for the signed-in moderator. */
  const assignToMe = (report: ModReportView) => {
    reportAssignment.mutate(
      { id: report.id, assign: true },
      {
        onSuccess: (result) =>
          patchAssignment(
            report.id,
            result.assignedModeratorId,
            result.assignedModeratorName,
          ),
        onError: () =>
          showToast(t("admin:moderation.queue.serviceErrorToast"), "error"),
      },
    );
  };

  /** Releases a report the signed-in moderator had claimed. */
  const unassignReport = (report: ModReportView) => {
    reportAssignment.mutate(
      { id: report.id, assign: false },
      {
        onSuccess: () => patchAssignment(report.id, null, undefined),
        onError: () =>
          showToast(t("admin:moderation.queue.serviceErrorToast"), "error"),
      },
    );
  };

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
    tab,
    setTab,
    filter,
    setFilter,
    subjectId,
    clearSubjectFilter,
    open,
    appeals,
    resolved: data?.resolved ?? [], // read-only: resolved rows carry no actions
    leaving,
    picked,
    selected,
    setSelected,
    appeal,
    setAppeal,
    visible,
    emergencies,
    others,
    oldest,
    counts,
    hasMoreOpen,
    isLoadingMoreOpen,
    loadMoreOpen,
    loading: isLoading,
    // Live-fetch failure (P1-14): the panes render a retryable error state
    // instead of a false "all caught up". Demo seeds via initialData → never errors.
    isError,
    refetch: () => void refetch(),
    showToast,
    currentUserId: user?.id,
    replayOpen,
    resolveReport,
    openReport,
    togglePick,
    bulkAct,
    assignToMe,
    unassignReport,
    viewSubjectHistory,
    recordAppeal,
    resetAppeals: () => dataAppeals && setAppeals(dataAppeals),
    clearPicked: () => setPicked(new Set()),
  };
}
