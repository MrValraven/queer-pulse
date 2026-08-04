import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_PAST_DSAR } from "../../marketing/dsar.data";
import {
  listDsar,
  reauth,
  simulateOr,
  submitDsar,
  type DsarArticle,
  type DsarRequest,
} from "./account.api";

const DAY_MS = 24 * 60 * 60 * 1000;
const DSAR_DUE_DAYS = 30;

/** now + `days`, ISO — used to fabricate believable demo timestamps. */
function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

export interface SubmitDsarInput {
  article: DsarArticle;
  scopes: string[];
  details: string;
  context?: string;
}

/**
 * `POST /account/dsar`. Live mode mints the same short-lived step-up token the
 * erasure/export flows require, then records the request and returns the real
 * server-generated reference plus the statutory 30-day due date. Demo resolves a
 * simulated `received` request without touching the network, so the standalone
 * prototype still confirms end to end — and never invents a persona or a
 * fixed reference on a real session. No `reauthToken` is passed by callers; it
 * is minted here so the page needn't know the route is gated (see `reauth`).
 */
export function useSubmitDsar() {
  const { demoMode } = useDemoMode();
  return useCallback(
    (input: SubmitDsarInput): Promise<DsarRequest> => {
      const demoResult: DsarRequest = {
        reference: "QP-DSAR-DEMO",
        article: input.article,
        status: "received",
        submittedAt: daysFromNow(0),
        dueBy: daysFromNow(DSAR_DUE_DAYS),
      };
      return simulateOr(demoMode, demoResult, async () => {
        const { reauthToken } = await reauth();
        return submitDsar({ ...input, reauthToken });
      });
    },
    [demoMode],
  );
}

/** Stable empty array so the "no requests yet" case keeps a steady identity. */
const EMPTY_DSAR: DsarRequest[] = [];

export function dsarListQueryKey() {
  return ["account", "dsar", "list"] as const;
}

export interface ListDsarResult {
  requests: DsarRequest[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
  /** True when the live fetch failed — the page says so rather than showing nothing. */
  failed: boolean;
}

/**
 * `GET /account/dsar` — the caller's own request history for the "Past requests"
 * list. Live mode fetches the real per-account rows; demo returns the colocated
 * `DEMO_PAST_DSAR` sample so the standalone prototype still tells its story. A
 * live member never sees fabricated reference numbers as their own history. The
 * list is small and unpaginated (one row per filed request), so a single fetch
 * covers it. Callers gate mounting on demo-or-authenticated, so the live query
 * only runs for a signed-in member and never 401s a logged-out visitor.
 */
export function useListDsar(): ListDsarResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<DsarRequest[]>({
    queryKey: dsarListQueryKey(),
    enabled: !demoMode,
    queryFn: listDsar,
  });

  if (demoMode) {
    return { requests: DEMO_PAST_DSAR, loading: false, failed: false };
  }
  return {
    requests: query.data ?? EMPTY_DSAR,
    loading: query.isPending,
    failed: query.isError,
  };
}
