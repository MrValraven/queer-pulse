import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryKey,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { loadModerationTranslate } from "./moderationTranslate";
import {
  APPEALS,
  EMERGENCY_REPORTS,
  OTHER_REPORTS,
  RESOLVED,
} from "../adminModeration.data";
import type {
  AppealView,
  ModReportView,
  ResolvedItemView,
} from "../moderationAge";
import { getModReports } from "./moderation.api";
import {
  modReportClusterDtoToView,
  modReportDtoToView,
  resolvedDtoToView,
} from "./moderation.adapters";
import { clustersFromRows } from "../moderationQueue.helpers";
import {
  SURGE_MIN_REPORTERS,
  SURGE_MIN_REPORTS,
  type ModReportCluster,
} from "../moderationQueue.types";

export interface ModQueueData {
  /** Live rows carry `createdAt` so the age renders localized per locale
   *  (FE-ADM-26) and "oldest" is a real comparison (FE-ADM-29); the demo seed's
   *  plain `ModReport` rows stay assignable through the optional field. */
  open: ModReportView[];
  /**
   * ALWAYS EMPTY since TS-11, and kept on the shape rather than deleted so the
   * queue's optimistic-row machinery keeps one type for both tabs.
   * `useAppealsQueue` owns the appeals rows now: they page on their own keyset,
   * ordered by the published decision deadline, and reading them here meant
   * they loaded exactly once, on page one of the REPORTS cursor. The header's
   * appeal count still comes from `counts` below, which the reports endpoint
   * returns.
   */
  appeals: AppealView[];
  /** Live rows carry `closedAt` for the same reason: the "Closed …" line is
   *  formatted per locale at render time (`closedLabelOf`). */
  resolved: ResolvedItemView[];
  counts: { open: number; appeals: number; resolved: number };
  /** TS-06: the piles behind the open rows. Live rows carry the server's
   *  counts over every open report about the subject; demo mode derives them
   *  from the seed, where the seed is the whole world. */
  clusters: ModReportCluster[];
}

/** One fetched page. Only the OPEN queue pages: appeals and the resolved tab
 *  are read once, on the first page, and carried through unchanged. */
interface ModQueuePage extends ModQueueData {
  nextCursor: string | null;
}

/** The queue's client-side filter, forwarded to the server so "Assigned to me"
 *  and "Emergencies" narrow the WHOLE queue instead of whatever landed on the
 *  first page. `computeCounts()` is filter-independent server-side, so the tab
 *  counts stay true totals either way. */
export type ModQueueFilter =
  "all" | "emergencies" | "mine" | "overdue" | "surge";

/** The opaque keyset cursor `GET /mod/reports` returns; absent on page one. */
type ModCursor = string | undefined;

/** Stable demo seed — module constants so refetches don't clobber optimistic edits. */
const DEMO_OPEN: ModReportView[] = [...EMERGENCY_REPORTS, ...OTHER_REPORTS];

const DEMO_CLUSTERS: ModReportCluster[] = clustersFromRows(
  DEMO_OPEN,
  SURGE_MIN_REPORTS,
  SURGE_MIN_REPORTERS,
);

// The appeals TAB COUNT in demo mode. The rows themselves come from
// `useAppealsQueue`; only the header number lives here, mirroring live mode,
// where the count rides on the reports response and the rows do not.
const DEMO_APPEAL_COUNT = APPEALS.length;

const DEMO_DATA: ModQueueData = {
  open: DEMO_OPEN,
  appeals: [],
  resolved: RESOLVED,
  counts: {
    open: DEMO_OPEN.length,
    appeals: DEMO_APPEAL_COUNT,
    resolved: RESOLVED.length,
  },
  clusters: DEMO_CLUSTERS,
};

/**
 * The moderation queue data source (spec 04). Demo mode returns the colocated
 * mock arrays (stable references, real counts) and never hits the network — the
 * maintainer demos offline. Live mode fetches the open + resolved queues
 * (`GET /mod/reports?tab=`) and `GET /mod/appeals`, adapting each DTO into the
 * existing view models — one query feeds all three tabs — surfacing real counts
 * to replace the hardcoded `23`/`3` literals. `useModerationQueue` layers its
 * view-state + leave animation on top of this.
 *
 * `subjectId`, when set, narrows both the open and resolved queues to reports
 * about that exact subject (ADM-8's deep-link from a flagged Trust Network
 * node, or COM-6's "view this member's report history" chip) — demo mode
 * filters the same seed arrays locally so the deep-link still works offline.
 *
 * The OPEN queue is now cursor-paginated. It used to read page one only
 * (bounded by the backend's DEFAULT_LIMIT of 20) while the header showed the
 * server's true total, so past 20 open reports the page claimed "N need you"
 * and listed 20, with reports 21+ unreachable. `hasMoreOpen`/`loadMoreOpen`
 * back the queue's "Load more". `filter` is forwarded to the server too, so
 * "Assigned to me" no longer hides a moderator's own reports that fall outside
 * the first page.
 */
export function useModReports(
  subjectId?: string,
  filter: ModQueueFilter = "all",
  community?: string,
  /**
   * `false` mounts the hook without fetching. The admin rail's badge hook
   * passes it: since ENG-180 an admin reads the open-report count off
   * `GET /admin/overview`, which the dashboard has already fetched, and only a
   * viewer without the admin role (`/admin/overview` is `@Roles(Admin)` alone)
   * still needs this queue to count. The query key is unchanged either way, so
   * a disabled observer still shares the moderation page's cache entry.
   */
  isEnabled = true,
) {
  const { demoMode } = useDemoMode();
  // The adapters resolve catalog keys (reason label, triage category, "X
  // notified", "Resolved by …"), so a translator is threaded in and `language`
  // joins the query key: a language switch has to re-derive every mapped row
  // rather than serve the previous locale's strings from cache. Demo mode
  // reads its fixtures untouched, exactly as before.
  const { language } = useTranslation();
  // Generics spelled out so the cursor page-param is `string | undefined`
  // rather than `unknown`: page one has no cursor.
  const query = useInfiniteQuery<
    ModQueuePage,
    Error,
    InfiniteData<ModQueuePage, ModCursor>,
    QueryKey,
    ModCursor
  >({
    queryKey: [
      "mod-reports",
      demoMode,
      subjectId ?? null,
      filter,
      community ?? null,
      language,
    ],
    initialPageParam: undefined,
    // Demo seeds synchronously so the queue never flashes an empty "caught up".
    initialData:
      demoMode && !subjectId
        ? {
            pages: [{ ...DEMO_DATA, nextCursor: null }],
            pageParams: [undefined],
          }
        : undefined,
    queryFn: async ({ pageParam: cursor }) => {
      if (demoMode) {
        // The whole fixture is one page, so `getNextPageParam` yields undefined
        // and demo mode never issues a second fetch.
        if (!subjectId) return { ...DEMO_DATA, nextCursor: null };
        // The demo fixtures only carry a display name for the reported member
        // (`reportedName`, e.g. "@sofia-vale") — no stable id like the live
        // DTO's `reported.handle`. Match against that instead; `ResolvedItem`
        // carries no subject field at all, so a subject filter can only
        // narrow the open queue in demo mode.
        const term = subjectId.toLowerCase();
        const open = DEMO_OPEN.filter(
          (report) =>
            report.reportedName.replace(/^@/, "").toLowerCase() === term,
        );
        return {
          open,
          appeals: [],
          resolved: [],
          counts: {
            open: open.length,
            appeals: DEMO_APPEAL_COUNT,
            resolved: 0,
          },
          clusters: clustersFromRows(
            open,
            SURGE_MIN_REPORTS,
            SURGE_MIN_REPORTERS,
          ),
          nextCursor: null,
        };
      }
      const serverFilter = filter === "all" ? undefined : filter;
      // Pages 2+ only extend the OPEN queue: appeals and the resolved tab were
      // already read on page 1, so re-fetching them per page would be waste.
      if (cursor) {
        // Catalog-bound translator, not the provider's lazy `t`: this mapping
        // bakes strings into the query cache, and `safety` is never warm on an
        // admin route (see `loadModerationTranslate`).
        const [more, t] = await Promise.all([
          getModReports({
            tab: "open",
            sort: "priority",
            subjectId,
            filter: serverFilter,
            community,
            cursor,
          }),
          loadModerationTranslate(language),
        ]);
        return {
          open: more.data.map((dto) => modReportDtoToView(dto, t)),
          appeals: [],
          resolved: [],
          counts: more.counts,
          clusters: more.clusters.map(modReportClusterDtoToView),
          nextCursor: more.pageInfo.hasMore ? more.pageInfo.nextCursor : null,
        };
      }
      const [reports, resolved, t] = await Promise.all([
        getModReports({
          tab: "open",
          sort: "priority",
          subjectId,
          filter: serverFilter,
          community,
        }),
        getModReports({
          tab: "resolved",
          sort: "priority",
          subjectId,
          community,
        }),
        loadModerationTranslate(language),
      ]);
      // Canonical cursor-page envelope: rows live under `.data`, real per-tab
      // totals under `.counts` (carried alongside the envelope). `counts`
      // always reflects the true totals for the header, while `nextCursor`
      // drives the queue's "Load more".
      return {
        open: reports.data.map((dto) => modReportDtoToView(dto, t)),
        appeals: [],
        resolved: resolved.data.map((dto) => resolvedDtoToView(dto, t)),
        counts: reports.counts,
        clusters: reports.clusters.map(modReportClusterDtoToView),
        nextCursor: reports.pageInfo.hasMore
          ? reports.pageInfo.nextCursor
          : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: isEnabled,
  });

  // Flatten every loaded page back into the single `ModQueueData` shape
  // `useModerationQueue` mirrors into local state. Memoized on `query.data` so
  // the array identities stay stable between renders: the queue re-seeds its
  // optimistic local state off these references.
  const pages = query.data?.pages;
  const data = useMemo<ModQueueData | undefined>(() => {
    if (!pages) return undefined;
    const first = pages[0]!;
    // Clusters are per-page: page two brings the piles behind ITS rows, and a
    // pile that spans both pages is described identically by both (the server
    // counts over every open report, not over the page). De-duplicated by
    // subject so the later page's copy wins, which is the fresher read.
    const clustersByKey = new Map<string, ModReportCluster>();
    for (const page of pages) {
      for (const cluster of page.clusters) {
        clustersByKey.set(
          `${cluster.subjectType}:${cluster.subjectId}`,
          cluster,
        );
      }
    }
    return {
      open: pages.flatMap((page) => page.open),
      appeals: first.appeals,
      resolved: first.resolved,
      counts: pages[pages.length - 1]!.counts,
      clusters: [...clustersByKey.values()],
    };
  }, [pages]);

  return {
    data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    hasMoreOpen: query.hasNextPage,
    isLoadingMoreOpen: query.isFetchingNextPage,
    loadMoreOpen: () => void query.fetchNextPage(),
  };
}
