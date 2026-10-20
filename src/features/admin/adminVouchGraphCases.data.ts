/* ============================================================
   Admin: vouch graph demo: rings, cases and platform facts.
   Mirrors what the live endpoint returns for the same fixture so demo
   and live agree. No React, no runtime imports.
   ============================================================ */

import type { TrustCase, TrustRing } from "./trustGraph/trustGraphModel";
import type { TrustNetworkSummaryDTO } from "./api/adminTrustNetwork.api";

/** The ring accounts joined on one day, hours apart. */
export const RING_MEMBER_JOINED_AT: Record<string, string> = {
  a1: "2026-06-14T10:00:00.000Z",
  a2: "2026-06-14T12:00:00.000Z",
  a3: "2026-06-14T14:00:00.000Z",
  a4: "2026-06-14T16:00:00.000Z",
  a5: "2026-06-14T18:00:00.000Z",
};

const RING_MEMBER_IDS = ["a1", "a2", "a3", "a4", "a5"];
const RING_ID = "ring:a1";
const MILLISECONDS_PER_HOUR = 3_600_000;

/** The live assessment's case scores, so demo ranks cases the same way. */
const RING_CASE_BASE_SCORE = 3000;
const FLAGGED_CASE_BASE_SCORE = 2000;
const FLAGGED_CASE_REPORT_WEIGHT = 10;
const ISOLATED_CASE_BASE_SCORE = 1000;
const FLAGGED_OPEN_REPORT_COUNT = 4;
const ISOLATED_WEAK_VOUCHER_COUNT = 2;

const RING_FIRST_JOINED_AT = RING_MEMBER_JOINED_AT.a1!;
const RING_LAST_JOINED_AT = RING_MEMBER_JOINED_AT.a5!;

export const DEMO_RINGS: TrustRing[] = [
  {
    id: RING_ID,
    memberIds: RING_MEMBER_IDS,
    memberCount: RING_MEMBER_IDS.length,
    firstJoinedAt: RING_FIRST_JOINED_AT,
    lastJoinedAt: RING_LAST_JOINED_AT,
    sharedVouchers: [],
  },
];

const RING_WINDOW_HOURS = Math.ceil(
  (Date.parse(RING_LAST_JOINED_AT) - Date.parse(RING_FIRST_JOINED_AT)) /
    MILLISECONDS_PER_HOUR,
);

export const DEMO_CASES: TrustCase[] = [
  {
    id: RING_ID,
    kind: "ring",
    subjectId: "a1",
    subjectName: "@new_4471",
    ringId: RING_ID,
    memberCount: RING_MEMBER_IDS.length,
    weakVoucherCount: 0,
    openReportCount: 0,
    windowHours: RING_WINDOW_HOURS,
    score: RING_CASE_BASE_SCORE + RING_MEMBER_IDS.length,
  },
  {
    id: "flagged:nightowl",
    kind: "flagged",
    subjectId: "nightowl",
    subjectName: "@nightowl",
    ringId: null,
    memberCount: 1,
    weakVoucherCount: 0,
    openReportCount: FLAGGED_OPEN_REPORT_COUNT,
    windowHours: null,
    score:
      FLAGGED_CASE_BASE_SCORE +
      FLAGGED_CASE_REPORT_WEIGHT * FLAGGED_OPEN_REPORT_COUNT,
  },
  {
    id: "isolated:lone",
    kind: "isolated",
    subjectId: "lone",
    subjectName: "@lone.star",
    ringId: null,
    memberCount: 1,
    weakVoucherCount: ISOLATED_WEAK_VOUCHER_COUNT,
    openReportCount: 0,
    windowHours: null,
    score: ISOLATED_CASE_BASE_SCORE + ISOLATED_WEAK_VOUCHER_COUNT,
  },
];

export const DEMO_OPEN_CASE_COUNT = DEMO_CASES.length;
export const DEMO_PLATFORM_STARTED_AT = "2023-03-01T00:00:00.000Z";
export const DEMO_NEW_ACCOUNT_WINDOW_DAYS = 30;

export const DEMO_TRUST_NETWORK_SUMMARY: TrustNetworkSummaryDTO = {
  openCaseCount: DEMO_OPEN_CASE_COUNT,
  entrySlug: DEMO_CASES[0]?.subjectId ?? null,
};
