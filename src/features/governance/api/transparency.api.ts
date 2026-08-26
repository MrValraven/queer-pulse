import { apiGet } from "../../../shared/api/client";

/**
 * `GET /transparency/report` — the public, unauthenticated aggregate behind
 * `/about/governance/transparency`.
 *
 * Aggregate-only by contract: the backend module
 * (`queerpulse-backend/src/transparency/`) serves counts, durations and a
 * period label and nothing else. Every `key` below is a stable identifier the
 * frontend translates, so no label text and no member-authored text ever
 * crosses this boundary.
 */

/**
 * One published figure. `value` is the exact count, or `null` when the backend
 * withheld it. `isSuppressed` distinguishes "withheld because it was small
 * enough to identify someone" from a genuine absence, so the page can say
 * "fewer than 5" rather than show a blank.
 */
export interface PublishedCountDTO {
  value: number | null;
  isSuppressed: boolean;
}

export interface TransparencyBreakdownRowDTO {
  key: string;
  count: PublishedCountDTO;
}

export interface TransparencyPeriodDTO {
  /** e.g. "2026-Q3". */
  id: string;
  year: number;
  quarter: number;
  startsAt: string;
  endsAt: string;
  /** How far the figures actually reach: a running quarter stops at the moment
   *  the report was generated. */
  coversUntil: string;
  isComplete: boolean;
}

export interface TransparencyPeriodOptionDTO {
  selector: TransparencyPeriodSelector;
  id: string;
  isComplete: boolean;
}

export type TransparencyPeriodSelector = "current" | "previous";

export interface TransparencyReportDTO {
  period: TransparencyPeriodDTO;
  availablePeriods: TransparencyPeriodOptionDTO[];
  generatedAt: string;
  smallCountFloor: number;
  reports: {
    received: PublishedCountDTO;
    resolved: PublishedCountDTO;
    byCategory: TransparencyBreakdownRowDTO[];
    medianHoursToResolution: number | null;
    p90HoursToResolution: number | null;
  };
  actions: {
    byType: TransparencyBreakdownRowDTO[];
    accountsRemoved: PublishedCountDTO;
  };
  appeals: {
    filed: PublishedCountDTO;
    byOutcome: TransparencyBreakdownRowDTO[];
    overturnRatePercent: number | null;
  };
  communities: {
    frozen: PublishedCountDTO;
  };
}

export const getTransparencyReport = (period: TransparencyPeriodSelector) =>
  apiGet<TransparencyReportDTO>(
    `/transparency/report?period=${encodeURIComponent(period)}`,
  );
