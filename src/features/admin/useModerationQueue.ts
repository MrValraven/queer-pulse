import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ModReport, Appeal } from "./adminModeration.data";
import { useModReports } from "./api/useModReports";
import { useModAction, useModBulkAction } from "./api/useModAction";
import { useReviewAppeal } from "./api/useReviewAppeal";
import type { ModActionCode } from "./api/moderation.api";
import type { ReasonCode } from "../safety/reportReasons";

export type TabId = "open" | "appeals" | "resolved";
export type FilterId = "all" | "emergencies" | "mine";

/** Reports notionally assigned to the signed-in moderator (for "Assigned to me"). */
const MINE = new Set(["r-emerg-1", "r-harass", "r-offtopic"]);

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
}

/** Canonical bulk-verb id — never displayed directly. Resolve its label via
 *  `t(`admin:moderation.queue.bulkVerb.${verb}`)`. */
export type BulkVerb = "dismissed" | "removedAsSpam" | "reassigned";

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
  const [searchParams] = useSearchParams();
  const deepLink = searchParams.get("tab");
  const { data, isLoading, isError, refetch } = useModReports();
  const modAction = useModAction();
  const modBulk = useModBulkAction();
  const reviewAppeal = useReviewAppeal();

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
  const [open, setOpen] = useState<ModReport[]>(data?.open ?? []);
  const [appeals, setAppeals] = useState<Appeal[]>(data?.appeals ?? []);
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<ModReport | null>(null);
  const [appeal, setAppeal] = useState<Appeal | null>(null);
  const { showToast } = useToast();

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

  const matchesFilter = (r: ModReport) => {
    if (filter === "emergencies") return r.severity === "emergency";
    if (filter === "mine") return MINE.has(r.id);
    return true;
  };

  const visible = open.filter(matchesFilter);
  const emergencies = visible.filter((r) => r.severity === "emergency");
  const others = visible.filter((r) => r.severity !== "emergency");
  const oldest = visible.length > 0 ? visible[visible.length - 1]!.age : "";

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

  /** Animate ids out of the open queue, then drop them. */
  const removeReports = (ids: string[]) => {
    setLeaving((prev) => new Set([...prev, ...ids]));
    setPicked(new Set());
    window.setTimeout(() => {
      setOpen((q) => q.filter((r) => !ids.includes(r.id)));
      clearLeaving(ids);
    }, 340);
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
    const snapshot = open;
    removeReports([id]);
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
      () => {
        cancelCommit(handle);
        pendingOpenRemoval.current.delete(id);
        setLeaving(new Set());
        setOpen(snapshot);
      },
      t("admin:moderation.queue.restoredToast"),
    );
  };

  // Opening a report never resolves it — it presents the decision drawer (the
  // action grid + reason + member-facing note). The drawer fetches / falls back
  // to context on its own when the list item carries no `detail`.
  const openReport = (r: ModReport) => setSelected(r);

  const togglePick = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const bulkAct = (verb: BulkVerb, action: ModActionCode = "dismiss") => {
    const ids = [...picked];
    if (ids.length === 0) return;
    const snapshot = open;
    removeReports(ids);
    // Shield every removed id from a background refetch (query-mirror guard).
    ids.forEach((id) => pendingOpenRemoval.current.add(id));
    // Deferred, like resolveReport — a bulk PATCH also notifies members, so it
    // waits out the undo window and is cancelled outright if Undo is clicked.
    const handle = scheduleCommit(() =>
      modBulk.mutate(
        { ids, action, reasonCode: "other" },
        {
          onSuccess: () =>
            ids.forEach((id) => pendingOpenRemoval.current.delete(id)),
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
      () => {
        cancelCommit(handle);
        ids.forEach((id) => pendingOpenRemoval.current.delete(id));
        setLeaving(new Set());
        setOpen(snapshot);
      },
      t("admin:moderation.queue.bulkRestoredToast"),
    );
  };

  const recordAppeal = (
    id: string,
    decision: "uphold" | "overturn",
    note = "",
  ) => {
    const a = appeals.find((x) => x.id === id);
    const snapshot = appeals;
    setLeaving((prev) => new Set([...prev, id]));
    window.setTimeout(() => {
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
        pendingAppealRemoval.current.delete(id);
        setLeaving(new Set());
        setAppeals(snapshot);
      },
      t("admin:moderation.queue.appealRestoredToast"),
    );
  };

  return {
    tab,
    setTab,
    filter,
    setFilter,
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
    loading: isLoading,
    // Live-fetch failure (P1-14): the panes render a retryable error state
    // instead of a false "all caught up". Demo seeds via initialData → never errors.
    isError,
    refetch: () => void refetch(),
    showToast,
    replayOpen,
    resolveReport,
    openReport,
    togglePick,
    bulkAct,
    recordAppeal,
    resetAppeals: () => dataAppeals && setAppeals(dataAppeals),
    clearPicked: () => setPicked(new Set()),
  };
}
