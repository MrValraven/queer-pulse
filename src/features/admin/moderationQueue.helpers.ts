import type { Formatters } from "../../shared/i18n/format";
import { ageLabelOf, oldestRowOf, type ModReportView } from "./moderationAge";
import {
  ALL_COMMUNITIES,
  clusterKeyOf,
  type FilterId,
  type ModReportCluster,
} from "./moderationQueue.types";

/** The queue's own SLA check, shared by the row chip and the `overdue` filter,
 *  so both agree about the clock. */
export function isReportOverdue(report: ModReportView): boolean {
  return (
    report.slaDueAt != null && new Date(report.slaDueAt).getTime() < Date.now()
  );
}

export function matchesQueueFilter(
  report: ModReportView,
  filter: FilterId,
  currentUserId: string | undefined,
  clusters: ModReportCluster[] = [],
): boolean {
  if (filter === "emergencies") return report.severity === "emergency";
  if (filter === "mine")
    return (
      currentUserId != null && report.assignedModeratorId === currentUserId
    );
  // TS-06. The server applies both of these to the whole queue; these arms are
  // what keeps the locally-held rows (and demo mode, which has no server to
  // ask) agreeing with the filter that is switched on.
  if (filter === "overdue") return isReportOverdue(report);
  if (filter === "surge") {
    const cluster = clusters.find(
      (candidate) => clusterKeyOf(candidate) === clusterKeyOf(report),
    );
    return cluster?.isSurge === true;
  }
  return true;
}

/**
 * TS-14: does this row belong to the community the queue is narrowed to?
 *
 * `ALL_COMMUNITIES` matches everything. A specific slug matches only rows the
 * server attributed to that community — a member or message report carries no
 * community, so narrowing to one correctly hides them rather than pretending
 * they might belong.
 */
export function matchesCommunityFilter(
  report: ModReportView,
  community: string,
): boolean {
  if (community === ALL_COMMUNITIES) return true;
  return report.community === community;
}

/**
 * Every community present in the loaded queue, sorted, for the filter's
 * options. Derived from the rows themselves rather than fetched: the queue's
 * useful question is "which room is this week's noise coming from", and that
 * is answered by the communities actually in the queue, not by all of them.
 */
export function communitiesInQueue(open: ModReportView[]): string[] {
  const communities = new Set<string>();
  for (const report of open) {
    if (report.community) communities.add(report.community);
  }
  return [...communities].sort((left, right) => left.localeCompare(right));
}

/**
 * TS-06: derive the piles from the rows the client is holding.
 *
 * Live mode gets clusters from the server, counted over EVERY open report
 * about the subject including the ones that never reached the page. This is
 * the demo-mode path, where the seed arrays are the whole world, so the counts
 * are simply what is on screen. Distinct reporters can only be counted by
 * display name here: the demo seed carries no reporter id.
 *
 * Same rule as the server: a subject with a single report gets no cluster,
 * because its own row already says everything a cluster would.
 */
export function clustersFromRows(
  reports: ModReportView[],
  surgeMinReports: number,
  surgeMinReporters: number,
): ModReportCluster[] {
  const byKey = new Map<string, ModReportView[]>();
  for (const report of reports) {
    const key = clusterKeyOf(report);
    byKey.set(key, [...(byKey.get(key) ?? []), report]);
  }

  const clusters: ModReportCluster[] = [];
  for (const rows of byKey.values()) {
    if (rows.length < 2) continue;
    const first = rows[0]!;
    const reporters = new Set(rows.map((report) => report.reporterName));
    const timestamps = rows
      .map((report) => report.createdAt)
      .filter((createdAt): createdAt is string => createdAt != null)
      .sort();
    clusters.push({
      subjectType: first.subjectType,
      subjectId: first.subjectId,
      openCount: rows.length,
      distinctReporterCount: reporters.size,
      overdueCount: rows.filter(isReportOverdue).length,
      highestSeverity: highestSeverityOf(rows),
      firstReportedAt: timestamps[0] ?? "",
      lastReportedAt: timestamps[timestamps.length - 1] ?? "",
      isSurge:
        rows.length >= surgeMinReports && reporters.size >= surgeMinReporters,
      reportIds: rows.map((report) => report.id),
    });
  }
  return clusters.sort(
    (left, right) =>
      right.distinctReporterCount - left.distinctReporterCount ||
      right.openCount - left.openCount,
  );
}

const SEVERITY_ORDER = ["emergency", "high", "medium", "low"] as const;

/** The most severe row in a pile, which is how the pile reads. */
function highestSeverityOf(rows: ModReportView[]): ModReportView["severity"] {
  for (const severity of SEVERITY_ORDER) {
    if (rows.some((report) => report.severity === severity)) return severity;
  }
  return "low";
}

/**
 * TS-06: the open queue as clustered groups, in the order the rows arrived.
 *
 * A subject with one visible row keeps its plain row (`cluster: null`) so the
 * queue does not grow a badge around every single report, which would teach a
 * moderator to stop reading badges. A subject the server flagged as a pile
 * gets one group carrying all of its visible rows, headed by the real counts.
 */
export interface QueueGroup {
  key: string;
  cluster: ModReportCluster | null;
  reports: ModReportView[];
}

export function groupRowsByCluster(
  reports: ModReportView[],
  clusters: ModReportCluster[],
): QueueGroup[] {
  const clusterByKey = new Map(
    clusters.map((cluster) => [clusterKeyOf(cluster), cluster]),
  );
  const groups: QueueGroup[] = [];
  const groupIndexByKey = new Map<string, number>();

  for (const report of reports) {
    const key = clusterKeyOf(report);
    const cluster = clusterByKey.get(key) ?? null;
    if (!cluster) {
      groups.push({ key: report.id, cluster: null, reports: [report] });
      continue;
    }
    const existingIndex = groupIndexByKey.get(key);
    if (existingIndex == null) {
      groupIndexByKey.set(key, groups.length);
      groups.push({ key, cluster, reports: [report] });
      continue;
    }
    groups[existingIndex]!.reports.push(report);
  }
  return groups;
}

export interface QueueView {
  visible: ModReportView[];
  emergencies: ModReportView[];
  others: ModReportView[];
  oldest: string;
}

/**
 * Derives the open queue's filtered/split view. FE-ADM-29: the queue is
 * fetched `sort: "priority"`, so the LAST row is the lowest-priority one and
 * reading its age as "the oldest" understated a three-day-old medium-severity
 * report sitting mid-list. Compare the real timestamps instead, then format
 * the winner the same localized way the cards do.
 */
export function deriveQueueView(
  open: ModReportView[],
  filter: FilterId,
  currentUserId: string | undefined,
  fmt: Formatters,
  community: string = ALL_COMMUNITIES,
  clusters: ModReportCluster[] = [],
): QueueView {
  const visible = open.filter(
    (report) =>
      matchesQueueFilter(report, filter, currentUserId, clusters) &&
      matchesCommunityFilter(report, community),
  );
  const emergencies = visible.filter(
    (report) => report.severity === "emergency",
  );
  const others = visible.filter((report) => report.severity !== "emergency");
  const oldestReport = oldestRowOf(visible);
  const oldest = oldestReport ? ageLabelOf(oldestReport, fmt) : "";
  return { visible, emergencies, others, oldest };
}
