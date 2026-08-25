import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/authContext";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useModReports } from "./api/useModReports";
import { deriveQueueView } from "./moderationQueue.helpers";
import { useModerationQueueActions } from "./useModerationQueueActions";
import type { TabId, FilterId } from "./moderationQueue.types";

export type {
  TabId,
  FilterId,
  ResolveVerb,
  ResolveOpts,
  BulkVerb,
} from "./moderationQueue.types";

/**
 * All Moderation-page view-state (tab / filter / selection / multi-select /
 * leave animation) plus the reversible actions that drive it. The data source is
 * `useModReports` (demo → mock arrays, live → GET /mod/reports); this hook layers
 * optimistic row removal + Undo on top (see `useModerationQueueActions`).
 */
export function useModerationQueue() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const deepLink = searchParams.get("tab");
  // Deep-link from a flagged Trust Network node (ADM-8) or a report's
  // "prior reports" chip (COM-6): narrows the queue to one subject.
  const subjectId = searchParams.get("subjectId") ?? undefined;
  const { user } = useAuth();

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
  // whatever landed on page one; `deriveQueueView` below still applies it to
  // the locally-held rows (demo mode has no server to ask).
  const {
    data,
    isLoading,
    isError,
    refetch,
    hasMoreOpen,
    isLoadingMoreOpen,
    loadMoreOpen,
  } = useModReports(subjectId, filter);
  const { showToast } = useToast();
  const fmt = useFormat();

  const actions = useModerationQueueActions({
    data,
    refetch,
    t,
    showToast,
  });

  const { visible, emergencies, others, oldest } = deriveQueueView(
    actions.open,
    filter,
    user?.id,
    fmt,
  );

  const counts = {
    open: actions.open.length,
    appeals: actions.appeals.length,
    resolved: data?.counts.resolved ?? 0,
  };

  return {
    tab,
    setTab,
    filter,
    setFilter,
    subjectId,
    open: actions.open,
    appeals: actions.appeals,
    resolved: data?.resolved ?? [], // read-only: resolved rows carry no actions
    leaving: actions.leaving,
    picked: actions.picked,
    selected: actions.selected,
    setSelected: actions.setSelected,
    appeal: actions.appeal,
    setAppeal: actions.setAppeal,
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
    replayOpen: actions.replayOpen,
    resolveReport: actions.resolveReport,
    openReport: actions.openReport,
    togglePick: actions.togglePick,
    bulkAct: actions.bulkAct,
    assignToMe: actions.assignToMe,
    unassignReport: actions.unassignReport,
    clearSubjectFilter: actions.clearSubjectFilter,
    viewSubjectHistory: actions.viewSubjectHistory,
    recordAppeal: actions.recordAppeal,
    resetAppeals: actions.resetAppeals,
    clearPicked: actions.clearPicked,
  };
}
