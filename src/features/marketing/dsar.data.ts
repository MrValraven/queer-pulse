import type { DsarRequest } from "../settings/api/account.api";

/**
 * Illustrative past-DSAR history for the standalone demo prototype. Rendered in
 * DEMO MODE ONLY — a live member sees their real `GET /account/dsar` history via
 * `useListDsar`, never these fabricated references. Shapes match the live
 * `DsarRequest` contract exactly, so the same row renderer covers both modes.
 * The `dueBy` on each is `submittedAt` + 30 days (statutory), matching the
 * backend's own computation.
 */
export const DEMO_PAST_DSAR: DsarRequest[] = [
  {
    reference: "QP-DSAR-2026-018",
    article: 15,
    status: "resolved",
    submittedAt: "2026-03-14T10:12:00.000Z",
    dueBy: "2026-04-13T10:12:00.000Z",
    respondedAt: "2026-03-17T14:40:00.000Z",
  },
  {
    reference: "QP-DSAR-2025-184",
    article: 21,
    status: "resolved",
    submittedAt: "2025-11-11T09:05:00.000Z",
    dueBy: "2025-12-11T09:05:00.000Z",
    respondedAt: "2025-11-13T16:20:00.000Z",
  },
];
