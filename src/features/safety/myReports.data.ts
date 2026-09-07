import type { BadgeTone } from "../../shared/components/ui";
import type { MyReportEntry } from "./api/useMyReports";

/** `ReportDTO.status` (open/resolved/escalated, per `reports.api.ts`) → the
 *  shared `<Badge>` tone + a copy key. An unrecognised status still renders
 *  (falls back to `ghost`/a raw-key label) rather than throwing. */
export const REPORT_STATUS_TONE: Record<string, BadgeTone> = {
  open: "amber",
  resolved: "jade",
  escalated: "danger",
};

export const REPORT_STATUS_LABEL_KEY: Record<string, string> = {
  open: "safety:myReports.status.open",
  resolved: "safety:myReports.status.resolved",
  escalated: "safety:myReports.status.escalated",
};

/** Demo-mode fallback for `useMyReports` — a few plausible entries so the page
 *  and the profile sheet both have something to render in the prototype. The
 *  references match the real `formatReportReference` shape (`QPR-<year>-<4 hex>`,
 *  backend `report-reference.ts`) so the demo teaches the format a member will
 *  actually be quoting back to the safety team. Dates stay RELATIVE here
 *  because the rows are about elapsed time ("filed 2 days ago"), which a
 *  hand-dated fixture would silently turn into "filed 8 months ago". */
export const DEMO_MY_REPORTS: MyReportEntry[] = [
  {
    id: "demo-report-1",
    reference: "QPR-2026-4A1C",
    subjectType: "post",
    reasonCode: "off_topic",
    status: "resolved",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "demo-report-2",
    reference: "QPR-2026-7BE2",
    subjectType: "member",
    reasonCode: "unwanted_contact",
    status: "open",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    resolvedAt: null,
  },
];
