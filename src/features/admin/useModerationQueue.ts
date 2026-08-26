import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../app/providers/authContext";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useModReports } from "./api/useModReports";
import { useAppealsQueue } from "./api/useAppealsQueue";
import {
  useBanRatifications,
  useDecideRatification,
} from "./api/useBanRatifications";
import {
  communitiesInQueue,
  deriveQueueView,
  groupRowsByCluster,
} from "./moderationQueue.helpers";
import { useModerationQueueActions } from "./useModerationQueueActions";
import { ALL_COMMUNITIES } from "./moderationQueue.types";
import type { AppealTabId, TabId, FilterId } from "./moderationQueue.types";

export type {
  AppealTabId,
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
        : deepLink === "ratification"
          ? "ratification"
          : // TS-04. `?tab=health` is what the queue-alert notification and the
            // compact indicator both deep-link to.
            deepLink === "health"
            ? "health"
            : "open",
  );
  // TS-11: which half of the appeals queue is showing, and whether it is
  // narrowed to the appeals already past their published decision window.
  const [appealTab, setAppealTab] = useState<AppealTabId>("awaiting");
  const [isAppealOverdueOnly, setIsAppealOverdueOnly] = useState(false);
  const [filter, setFilter] = useState<FilterId>(
    deepLink === "emergencies" ? "emergencies" : "all",
  );
  // TS-14: narrow the queue to one community. Deep-linkable (`?community=`) so
  // a community's admin page can hand a moderator straight to its own reports.
  const [community, setCommunity] = useState<string>(
    searchParams.get("community") ?? ALL_COMMUNITIES,
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
  } = useModReports(
    subjectId,
    filter,
    community === ALL_COMMUNITIES ? undefined : community,
  );
  // TS-11: appeals page on their own keyset, ordered by the deadline the Code
  // of Conduct publishes, so they are their own query rather than a passenger
  // on the reports cursor.
  const appealsQueue = useAppealsQueue(appealTab, isAppealOverdueOnly);
  // TS-12: the permanent bans waiting on a second moderator.
  const ratifications = useBanRatifications();
  const decideRatification = useDecideRatification();
  const { showToast } = useToast();
  const fmt = useFormat();

  // The appeals rows are spliced in here so the queue's optimistic-removal and
  // Undo machinery keeps ONE code path for both tabs. `appealsQueue.appeals` is
  // memoized, so the wrapper object being fresh each render is harmless: the
  // re-seed effects depend on the inner array's identity, never on this.
  const actions = useModerationQueueActions({
    data: data
      ? { ...data, appeals: appealsQueue.appeals ?? [] }
      : appealsQueue.appeals
        ? {
            open: [],
            appeals: appealsQueue.appeals,
            resolved: [],
            counts: { open: 0, appeals: 0, resolved: 0 },
            clusters: [],
          }
        : undefined,
    refetch,
    t,
    showToast,
  });

  // TS-06: the piles behind the rows. Live counts come from the server (over
  // every open report about the subject, including the ones no page ever
  // showed); demo mode derives them from its seed inside `useModReports`.
  const clusters = data?.clusters ?? [];

  const { visible, emergencies, others, oldest } = deriveQueueView(
    actions.open,
    filter,
    user?.id,
    fmt,
    community,
    clusters,
  );
  // Both lists, grouped: a subject with several open reports renders as ONE
  // expandable row carrying its real counts, instead of as N rows that each
  // look like an independent complaint with its own SLA clock. The emergency
  // band gets the same treatment, because a pile-on is most likely to arrive
  // exactly there and thirty emergency rows is the reading this replaced.
  const emergencyGroups = groupRowsByCluster(emergencies, clusters);
  const otherGroups = groupRowsByCluster(others, clusters);
  // Options come from the loaded rows, so the control only ever offers
  // communities that actually have reports in the queue.
  const communityOptions = communitiesInQueue(actions.open);

  const counts = {
    open: actions.open.length,
    // The server's true total, never the loaded rows' length: the appeals queue
    // is paginated now, so counting what happens to be on screen would
    // undercount the tab the moment there is a second page.
    appeals: appealsQueue.counts.awaiting,
    resolved: data?.counts.resolved ?? 0,
    ratification: ratifications.ratifications.length,
  };

  return {
    tab,
    setTab,
    filter,
    setFilter,
    community,
    setCommunity,
    communityOptions,
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
    appealTab,
    setAppealTab,
    isAppealOverdueOnly,
    setIsAppealOverdueOnly,
    appealCounts: appealsQueue.counts,
    isAppealsLoading: appealsQueue.isLoading,
    isAppealsError: appealsQueue.isError,
    refetchAppeals: appealsQueue.refetch,
    hasMoreAppeals: appealsQueue.hasMore,
    isLoadingMoreAppeals: appealsQueue.isLoadingMore,
    loadMoreAppeals: appealsQueue.loadMore,
    ratifications: ratifications.ratifications,
    isRatificationsLoading: ratifications.isLoading,
    isRatificationsError: ratifications.isError,
    refetchRatifications: ratifications.refetch,
    decideRatification,
    visible,
    emergencies,
    emergencyGroups,
    others,
    otherGroups,
    clusters,
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
    pickCluster: actions.pickCluster,
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
