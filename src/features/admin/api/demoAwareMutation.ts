import {
  useMutation,
  type DefaultError,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { logInfo } from "../../../shared/observability/logger";

/** The default latency demo mode pretends the round-trip takes, matching the
 *  listings mutations (`useSetListingStatus`/`useRemoveListing`). Pass
 *  `demoLatencyMs` to override (e.g. `useSetSafeSpace` waits 500). */
export const DEMO_LATENCY_MS = 400;

/** The suffix appended to every demo log line so a reader knows the "mutation"
 *  never touched the network. Kept in one place so the wording stays uniform. */
const DEMO_LOG_SUFFIX = " (demo — no network)";

export interface DemoAwareMutationFnConfig<Variables, Data> {
  /** Whether the app is in demo mode (`useDemoMode().demoMode`). */
  demoMode: boolean;
  /** How long the simulated demo round-trip sleeps. Defaults to
   *  {@link DEMO_LATENCY_MS}; pass `0` to resolve synchronously. */
  demoLatencyMs?: number;
  /** Synthesizes the demo result from the variables — the value the mutation
   *  resolves with when there is no network (e.g. `{ ...row, status }`). */
  demoResult: (variables: Variables) => Data | Promise<Data>;
  /** The real network call, run only in live mode. */
  live: (variables: Variables) => Promise<Data>;
  /** Base message logged in demo mode; {@link DEMO_LOG_SUFFIX} is appended
   *  automatically. Omit to log nothing (e.g. `useModAction`). */
  logLabel?: string;
  /** Structured context for the demo log line, e.g. `({ row }) => ({ ref: row.ref })`. */
  logContext?: (variables: Variables) => Record<string, unknown>;
}

/**
 * Collapses the `mutationFn` boilerplate every dual-mode admin mutation repeats:
 * in demo mode, sleep out {@link DEMO_LATENCY_MS}, log a `"... (demo — no
 * network)"` line, and return a synthesized result; in live mode, call the real
 * API. Returns the async `mutationFn` to hand to `useMutation` (or use
 * {@link useDemoAwareMutation}, which also gates the settle callbacks).
 *
 * `useSetListingStatus` expresses its `mutationFn` as:
 * ```ts
 * mutationFn: demoAwareMutationFn<SetListingStatusVars, ListingQueueRow>({
 *   demoMode,
 *   demoResult: ({ row, status }) => ({ ...row, status }),
 *   live: async ({ row, status, reason }) =>
 *     listingDtoToQueueRow(await setListingStatus(row.ref, status, reason)),
 *   logLabel: "admin.listing.setStatus",
 *   logContext: ({ row, status, reason }) => ({ ref: row.ref, status, reason }),
 * }),
 * ```
 */
export function demoAwareMutationFn<Variables, Data>({
  demoMode,
  demoLatencyMs = DEMO_LATENCY_MS,
  demoResult,
  live,
  logLabel,
  logContext,
}: DemoAwareMutationFnConfig<Variables, Data>): (
  variables: Variables,
) => Promise<Data> {
  return async (variables) => {
    if (demoMode) {
      if (demoLatencyMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, demoLatencyMs));
      }
      if (logLabel) {
        logInfo(logLabel + DEMO_LOG_SUFFIX, logContext?.(variables));
      }
      return demoResult(variables);
    }
    return live(variables);
  };
}

export interface DemoAwareMutationOptions<Data, Error, Variables, Context>
  extends Omit<
      UseMutationOptions<Data, Error, Variables, Context>,
      "mutationFn"
    >,
    DemoAwareMutationFnConfig<Variables, Data> {
  /** Runs on success in LIVE mode only — where the `invalidateQueries` that demo
   *  mode skips belongs (its fixture never goes stale, so there is nothing to
   *  reconcile). Fires after any `onSuccess`. */
  onLiveSuccess?: UseMutationOptions<
    Data,
    Error,
    Variables,
    Context
  >["onSuccess"];
  /** Runs on error in LIVE mode only. Fires after any `onError`. */
  onLiveError?: UseMutationOptions<Data, Error, Variables, Context>["onError"];
  /** Runs on settle in LIVE mode only — the live-gated place for
   *  `invalidateQueries` when a mutation reconciles via `onSettled`
   *  (e.g. `useModAction`). Fires after any `onSettled`. */
  onLiveSettled?: UseMutationOptions<
    Data,
    Error,
    Variables,
    Context
  >["onSettled"];
}

/**
 * A thin wrapper over react-query's `useMutation` that wires the demo/live
 * `mutationFn` via {@link demoAwareMutationFn} and gates the settle callbacks to
 * live mode, collapsing the `if (demoMode) return;` guard the admin hooks repeat
 * before `invalidateQueries`.
 *
 * `onMutate`/`onError`/`onSuccess`/`onSettled` still run in BOTH modes (the
 * optimistic cache patch is demo mode's source of truth, so it must not be
 * skipped) — pass them as usual. Put the live-only invalidation in
 * `onLiveSuccess`/`onLiveSettled`/`onLiveError` instead.
 *
 * `useSetListingStatus` and the near-identical `useRemoveListing` express as:
 * ```ts
 * // useSetListingStatus
 * return useDemoAwareMutation<
 *   ListingQueueRow, Error, SetListingStatusVars, SetListingStatusContext
 * >({
 *   demoMode,
 *   demoResult: ({ row, status }) => ({ ...row, status }),
 *   live: async ({ row, status, reason }) =>
 *     listingDtoToQueueRow(await setListingStatus(row.ref, status, reason)),
 *   logLabel: "admin.listing.setStatus",
 *   logContext: ({ row, status, reason }) => ({ ref: row.ref, status, reason }),
 *   onMutate: async ({ row, status }) => { ...optimistic patch, both modes... },
 *   onError: (_error, { row }, context) => { ...rollback, both modes... },
 *   onLiveSuccess: (_data, { row }) => {
 *     void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
 *     void queryClient.invalidateQueries({
 *       queryKey: listingHistoryQueryKey(row.ref, false),
 *     });
 *   },
 * });
 *
 * // useRemoveListing — identical shape, void data:
 * return useDemoAwareMutation<void, Error, RemoveListingVars, RemoveListingContext>({
 *   demoMode,
 *   demoResult: () => undefined,
 *   live: ({ row, reason }) => deleteListingAsModerator(row.ref, reason),
 *   logLabel: "admin.listing.remove",
 *   logContext: ({ row, reason }) => ({ ref: row.ref, reason }),
 *   onMutate: async ({ row }) => { ...optimistic drop, both modes... },
 *   onError: (_error, { row }, context) => { ...rollback, both modes... },
 *   onLiveSuccess: (_data, { row }) => {
 *     void queryClient.invalidateQueries({ queryKey: [ADMIN_LISTINGS_KEY] });
 *     void queryClient.invalidateQueries({
 *       queryKey: listingHistoryQueryKey(row.ref, false),
 *     });
 *   },
 * });
 * ```
 */
export function useDemoAwareMutation<
  Data = unknown,
  Error = DefaultError,
  Variables = void,
  Context = unknown,
>(options: DemoAwareMutationOptions<Data, Error, Variables, Context>) {
  const {
    demoMode,
    demoLatencyMs,
    demoResult,
    live,
    logLabel,
    logContext,
    onSuccess,
    onError,
    onSettled,
    onLiveSuccess,
    onLiveError,
    onLiveSettled,
    ...mutationOptions
  } = options;

  return useMutation<Data, Error, Variables, Context>({
    ...mutationOptions,
    mutationFn: demoAwareMutationFn<Variables, Data>({
      demoMode,
      demoLatencyMs,
      demoResult,
      live,
      logLabel,
      logContext,
    }),
    onSuccess: (...successArgs) => {
      onSuccess?.(...successArgs);
      if (!demoMode) onLiveSuccess?.(...successArgs);
    },
    onError: (...errorArgs) => {
      onError?.(...errorArgs);
      if (!demoMode) onLiveError?.(...errorArgs);
    },
    onSettled: (...settledArgs) => {
      onSettled?.(...settledArgs);
      if (!demoMode) onLiveSettled?.(...settledArgs);
    },
  });
}
