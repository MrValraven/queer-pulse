import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  EMERGENCY_REPORTS,
  OTHER_REPORTS,
  APPEALS,
  RESOLVED,
  type Appeal,
  type ModReport,
  type ResolvedItem,
} from "../adminModeration.data";
import { getAppeals, getModReports } from "./moderation.api";
import {
  appealDtoToView,
  modReportDtoToView,
  resolvedDtoToView,
} from "./moderation.adapters";

export interface ModQueueData {
  open: ModReport[];
  appeals: Appeal[];
  resolved: ResolvedItem[];
  counts: { open: number; appeals: number; resolved: number };
}

/** Stable demo seed — module constants so refetches don't clobber optimistic edits. */
const DEMO_OPEN: ModReport[] = [...EMERGENCY_REPORTS, ...OTHER_REPORTS];

const DEMO_DATA: ModQueueData = {
  open: DEMO_OPEN,
  appeals: APPEALS,
  resolved: RESOLVED,
  counts: {
    open: DEMO_OPEN.length,
    appeals: APPEALS.length,
    resolved: RESOLVED.length,
  },
};

/**
 * The moderation queue data source (spec 04). Demo mode returns the colocated
 * mock arrays (stable references, real counts) and never hits the network — the
 * maintainer demos offline. Live mode fetches the open + resolved queues
 * (`GET /mod/reports?tab=`) and `GET /mod/appeals`, adapting each DTO into the
 * existing view models — one query feeds all three tabs — surfacing real counts
 * to replace the hardcoded `23`/`3` literals. `useModerationQueue` layers its
 * view-state + leave animation on top of this.
 */
export function useModReports() {
  const { demoMode } = useDemoMode();
  return useQuery<ModQueueData>({
    queryKey: ["mod-reports", demoMode],
    // Demo seeds synchronously so the queue never flashes an empty "caught up".
    initialData: demoMode ? DEMO_DATA : undefined,
    queryFn: async () => {
      if (demoMode) return DEMO_DATA;
      const [reports, appeals, resolved] = await Promise.all([
        getModReports({ tab: "open", sort: "priority" }),
        getAppeals(),
        getModReports({ tab: "resolved", sort: "priority" }),
      ]);
      // Canonical cursor-page envelope: rows live under `.data`, real per-tab
      // totals under `.counts` (carried alongside the envelope). Only the first
      // page (newest-first, bounded by the backend's DEFAULT_LIMIT) is read —
      // `pageInfo.nextCursor`/`hasMore` are available for a future infinite
      // scroll — while `counts` always reflects the true totals for the header.
      return {
        open: reports.data.map(modReportDtoToView),
        appeals: appeals.map(appealDtoToView),
        resolved: resolved.data.map(resolvedDtoToView),
        counts: reports.counts,
      };
    },
  });
}
