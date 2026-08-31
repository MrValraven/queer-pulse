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

export interface TransparencyBreakdownRowDTO<Key extends string = string> {
  key: Key;
  count: PublishedCountDTO;
}

/**
 * The kind of instrument that arrived, mirroring `LEGAL_REQUEST_TYPES` in
 * `queerpulse-backend/src/legal-requests/legal-request-vocabulary.ts`. Stable
 * identifiers only: the label a reader sees is written in this repo's
 * catalogues, in both languages.
 */
export type LegalRequestType =
  | "subpoena"
  | "court_order"
  | "police_request"
  | "emergency_disclosure_request"
  | "preservation_request"
  | "takedown_demand"
  | "other";

/** What QueerPulse did about a demand, mirroring `LEGAL_REQUEST_OUTCOMES`. */
export type LegalRequestOutcome =
  | "complied_in_full"
  | "complied_in_part"
  | "narrowed"
  | "refused"
  | "withdrawn"
  | "pending";

/**
 * The published aggregate over the legal-request register (PRD-32): demands
 * from courts, police forces, ministries and other arms of a state.
 *
 * Counts only. No requesting body, no jurisdiction, no date, no account and no
 * description of anything disclosed crosses this boundary, and a gag-ordered
 * demand is counted in every figure below exactly like an ordinary one with
 * nothing marking which it was.
 */
export interface TransparencyLegalRequestsDTO {
  /**
   * Whether the register has EVER held a live record, over all time rather
   * than over the selected period. It is separate from the windowed counts on
   * purpose: a young register's quarter of zeroes cannot carry "we have never
   * been asked" on its own, and this boolean can.
   */
  hasEverReceivedRequest: boolean;
  /** Demands that arrived inside the period. */
  received: PublishedCountDTO;
  byType: TransparencyBreakdownRowDTO<LegalRequestType>[];
  byOutcome: TransparencyBreakdownRowDTO<LegalRequestOutcome>[];
  /** Member accounts named across the period's demands, summed. */
  accountsAffected: PublishedCountDTO;
  /** How many of those accounts the team recorded telling. */
  accountsNotified: PublishedCountDTO;
  /** Records received in this period and since struck from the register, so
   *  `received` plus this is every row the register holds for the window. */
  recordsVoided: PublishedCountDTO;
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
  /** Always present, including on an empty register, which publishes an
   *  explicit zero. The disclosure is the point: an absence stated beats an
   *  absence omitted. */
  legalRequests: TransparencyLegalRequestsDTO;
}

export const getTransparencyReport = (period: TransparencyPeriodSelector) =>
  apiGet<TransparencyReportDTO>(
    `/transparency/report?period=${encodeURIComponent(period)}`,
  );
