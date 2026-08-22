import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_PAST_DSAR } from "../../marketing/dsar.data";
import {
  listDsar,
  simulateOr,
  submitDsar,
  type DsarArticle,
  type DsarRequest,
} from "./account.api";
import { useReauth } from "./useAccountMutations";

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
 * is resolved here so the page needn't know the route is gated (see
 * `useReauthToken.ts`) — live mode requires a fresh OAuth step-up round trip,
 * not a mintable-on-demand token.
 *
 * On success, the new request is prepended directly into the `useListDsar`
 * cache (see `dsarListQueryKey`) instead of invalidating and refetching.
 * There's no backend workflow that ever moves a request past `received` (no
 * admin route touches `dsar_request.status`), so a round trip back to the
 * server would just re-fetch the exact row already in hand.
 */
export function useSubmitDsar() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  const { getReauthToken, beginReauth } = useReauth();
  return useCallback(
    async (input: SubmitDsarInput): Promise<DsarRequest> => {
      const demoResult: DsarRequest = {
        reference: "QP-DSAR-DEMO",
        article: input.article,
        status: "received",
        submittedAt: daysFromNow(0),
        dueBy: daysFromNow(DSAR_DUE_DAYS),
      };
      const created = await simulateOr(demoMode, demoResult, async () => {
        // No fresh step-up token cached yet: redirect instead of proceeding,
        // and never resolve — the page is about to unload, and the caller
        // must not see this as either a success or an error. The member
        // submits again after landing back with a fresh token.
        const reauthToken = getReauthToken();
        if (!reauthToken) {
          beginReauth();
          return new Promise<DsarRequest>(() => {});
        }
        return submitDsar({ ...input, reauthToken });
      });
      queryClient.setQueryData<DsarRequest[]>(dsarListQueryKey(), (current) => [
        created,
        ...(current ?? []),
      ]);
      return created;
    },
    [demoMode, queryClient, getReauthToken, beginReauth],
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
 *
 * `staleTime: Infinity`: deliberately never refetches on remount/refocus.
 * There is no backend workflow that changes a `dsar_request` after it's
 * created (no admin route ever transitions its status), so re-fetching a row
 * already in cache can only ever return the same bytes. `useSubmitDsar`
 * keeps the cache correct by prepending each newly created request directly;
 * a cold app load still gets the real server list via the initial fetch.
 */
export function useListDsar(): ListDsarResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<DsarRequest[]>({
    queryKey: dsarListQueryKey(),
    enabled: !demoMode,
    queryFn: listDsar,
    staleTime: Infinity,
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
