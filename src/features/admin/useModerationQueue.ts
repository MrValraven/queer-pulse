import { useEffect, useState } from "react";
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

/**
 * All Moderation-page view-state (tab / filter / selection / multi-select /
 * leave animation) plus the reversible actions that drive it. The data source is
 * `useModReports` (demo → mock arrays, live → GET /mod/reports); this hook layers
 * optimistic row removal + Undo on top and, in live mode, fires the real
 * PATCH mutations. Demo mode stays a pure local no-op with snapshot-restore Undo.
 */
export function useModerationQueue() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const deepLink = searchParams.get("tab");
  const { data, isLoading } = useModReports();
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

  // Re-seed local state whenever the query data changes. In demo the reference is
  // a stable module constant (effect runs once), so optimistic edits survive; in
  // live each refetch is a fresh array, so a settled mutation resyncs to server
  // truth — which doubles as the rollback when a PATCH fails.
  const dataOpen = data?.open;
  const dataAppeals = data?.appeals;
  useEffect(() => {
    // Re-seeds from the react-query result (each live refetch resyncs to server truth).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (dataOpen) setOpen(dataOpen);
  }, [dataOpen]);
  useEffect(() => {
    // Re-seeds from the react-query result (each live refetch resyncs to server truth).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (dataAppeals) setAppeals(dataAppeals);
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

  const resolveReport = (id: string, opts: ResolveOpts = {}) => {
    const verb = opts.verb ?? "resolved";
    const snapshot = open;
    removeReports([id]);
    // Live: fire the real PATCH. Backend writes the audit entry + notifies the
    // reported member (mod_action) and reporter (report_outcome). Demo: no-op.
    modAction.mutate(
      {
        id,
        action: ACTION_CODE[opts.action ?? "dismiss"] ?? "dismiss",
        reasonCode: opts.reasonCode ?? "other",
        note: opts.note ?? "",
      },
      {
        onError: () =>
          showToast(t("admin:moderation.queue.serviceErrorToast"), "error"),
      },
    );
    undoToast(
      t("admin:moderation.queue.actionToast", {
        verb: t(`admin:moderation.queue.verb.${verb}`),
      }),
      () => {
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
    modBulk.mutate(
      { ids, action, reasonCode: "other" },
      {
        onError: () =>
          showToast(t("admin:moderation.queue.serviceErrorToast"), "error"),
      },
    );
    undoToast(
      t("admin:moderation.queue.bulkToast", {
        count: ids.length,
        verb: t(`admin:moderation.queue.bulkVerb.${verb}`),
      }),
      () => {
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
    reviewAppeal.mutate(
      { id, decision, note },
      {
        onError: () =>
          showToast(t("admin:moderation.queue.serviceErrorToast"), "error"),
      },
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
