import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import {
  getTransparencyReport,
  type PublishedCountDTO,
  type TransparencyLegalRequestsDTO,
  type TransparencyPeriodSelector,
  type TransparencyReportDTO,
} from "./transparency.api";

export interface TransparencyReportResult {
  report: TransparencyReportDTO | null;
  /**
   * The legal-request register (PRD-32), or `null` when the served report did
   * not carry a usable one. `null` is a state the page RENDERS rather than a
   * state it hides: see `readLegalRequestsSection` below.
   */
  legalRequests: TransparencyLegalRequestsDTO | null;
  /** True while the first fetch for this period is in flight. */
  isLoading: boolean;
  /** True when the fetch failed, so the page offers a retry instead of an
   *  empty document that reads like "we had nothing to report". */
  hasError: boolean;
  retry: () => void;
}

/**
 * Demo-only escape hatch that serves the report WITHOUT its legal-request
 * section, so the unavailable state is reachable without a stale backend.
 * Live mode never reads it.
 */
const DEMO_SCENARIO_PARAM = "demo";
const DEMO_LEGAL_REQUESTS_UNAVAILABLE = "legal-requests-unavailable";

function isPublishedCount(value: unknown): value is PublishedCountDTO {
  if (typeof value !== "object" || value === null) return false;
  const count = value as Partial<PublishedCountDTO>;
  const isValueUsable = count.value === null || typeof count.value === "number";
  return isValueUsable && typeof count.isSuppressed === "boolean";
}

/**
 * Read the legal-request section off a report, or return `null` when it is
 * absent or malformed (PRD-32).
 *
 * WHY THIS DETECTS RATHER THAN THROWS, AND WHY IT NEVER DEFAULTS TO ZEROES.
 *
 * Three things could happen when a backend one deploy behind serves the rest
 * of the document with `legalRequests` missing, and two of them are wrong.
 *
 * Reading an absent section as zeroes would print "No court, police force or
 * government body has ever asked QueerPulse to hand over information about a
 * member" purely because of deploy skew. That is the most consequential
 * sentence on the platform and it must never be printed off missing data, so
 * there is no `?? 0` here and there must never be one.
 *
 * Dropping the section silently republishes the exact omission the register
 * exists to close: a reader would see a transparency report with nothing at
 * all about state demands, which is what the page looked like before PRD-32.
 *
 * Throwing (which this function used to do) sent the whole page to its error
 * state, so one absent section took down reports, appeals, moderator decisions
 * and everything else. The frontend ships to Vercel and the backend to
 * Railway, independently, so that made backend-before-frontend a hard deploy
 * ordering requirement: an operational trap for a failure the page can state
 * in one paragraph.
 *
 * So the section fails, the page does not. `null` reaches
 * `LegalRequestsSection`, which renders an explicit unavailable state saying
 * the figure could not be loaded and that this is a loading problem rather
 * than a statement about the world.
 *
 * The check is strict on purpose. A present-but-malformed section is treated
 * as absent, because half a register rendered as a full one is the same
 * false statement wearing a table. The casts are deliberate: the field is
 * required by the contract, so the type says it is always there, and this
 * function is about a server that disagrees.
 */
export function readLegalRequestsSection(
  report: TransparencyReportDTO | null,
): TransparencyLegalRequestsDTO | null {
  const legalRequests = report?.legalRequests as
    Partial<TransparencyLegalRequestsDTO> | undefined;
  if (!legalRequests) return null;
  if (typeof legalRequests.hasEverReceivedRequest !== "boolean") return null;
  if (!Array.isArray(legalRequests.byType)) return null;
  if (!Array.isArray(legalRequests.byOutcome)) return null;
  const counts = [
    legalRequests.received,
    legalRequests.accountsAffected,
    legalRequests.accountsNotified,
    legalRequests.recordsVoided,
  ];
  if (!counts.every(isPublishedCount)) return null;
  return legalRequests as TransparencyLegalRequestsDTO;
}

/**
 * Data source for the public Transparency Report page.
 *
 * Demo mode reads the page's own fixture (imported on demand so it never ships
 * in the live bundle); live mode calls the public `GET /transparency/report`.
 * The endpoint needs no session, so this hook works for a signed-out visitor,
 * which is the whole point of the page.
 */
export function useTransparencyReport(
  period: TransparencyPeriodSelector,
): TransparencyReportResult {
  const { demoMode } = useDemoMode();
  const [searchParams] = useSearchParams();
  const isDemoLegalRequestsUnavailable =
    demoMode &&
    searchParams.get(DEMO_SCENARIO_PARAM) === DEMO_LEGAL_REQUESTS_UNAVAILABLE;

  const query = useQuery<TransparencyReportDTO>({
    queryKey: [
      "transparency-report",
      period,
      demoMode,
      isDemoLegalRequestsUnavailable,
    ],
    queryFn: async () => {
      if (!demoMode) return getTransparencyReport(period);
      const {
        TRANSPARENCY_DEMO_REPORT,
        TRANSPARENCY_DEMO_REPORT_WITHOUT_LEGAL_REQUESTS,
      } = await import("../transparency.data");
      return isDemoLegalRequestsUnavailable
        ? TRANSPARENCY_DEMO_REPORT_WITHOUT_LEGAL_REQUESTS[period]
        : TRANSPARENCY_DEMO_REPORT[period];
    },
  });

  const retry = () => {
    void query.refetch();
  };

  const report = query.data ?? null;

  return {
    report,
    legalRequests: readLegalRequestsSection(report),
    isLoading: query.isPending,
    hasError: query.isError,
    retry,
  };
}
