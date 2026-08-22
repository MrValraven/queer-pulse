import { useCallback } from "react";
import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useToast } from "../components/feedback/useToast";
import { reasonFor } from "./errorMessage";

/**
 * A mutation whose success UI can only fire after the server confirmed it.
 *
 * The single most common defect in this codebase is a write that reports itself
 * done before it is: `mutate(...)` followed by an unconditional
 * `showToast("Saved")` or `setStep("done")`, with no `onError` anywhere. The
 * member is told the thing happened; the request then 500s, the optimistic card
 * links to a route that does not exist, the prompt they dismissed never comes
 * back, and nothing on screen ever says otherwise. It has been found in auth
 * invites, connections, notifications, communities, forum, messaging and the
 * admin console.
 *
 * This closes that hole by construction rather than by discipline:
 *
 *  - `onConfirmed` runs from react-query's `onSuccess`. There is nowhere else to
 *    put success UI, because the hook never hands the caller a "fired the
 *    request" moment to hang it off.
 *  - `successToast` is emitted for you, from that same `onSuccess`.
 *  - `errorToast` is emitted on failure, with the backend's own specific reason
 *    folded in when it gave one (`reasonFor`). Pass an already-translated
 *    string from `t()`; this module holds no copy of its own.
 *  - Every other `useMutation` option (`onMutate` for an optimistic patch,
 *    `retry`, `mutationKey`, `meta`) passes straight through, so an optimistic
 *    update still works normally. Roll it back in `onFailed`.
 *
 * Demo/live dual-mode is the caller's, exactly as with a plain `useMutation`:
 * branch inside `mutationFn` (`if (demoMode) return mockResult`).
 *
 * ```ts
 * const leaveCommunity = useConfirmedMutation({
 *   mutationFn: (slug: string) =>
 *     demoMode ? undefined : apiDelete(`/communities/${slug}/members/me`),
 *   successToast: t("communities:leave.doneToast"),
 *   errorToast: t("communities:leave.failedToast"),
 *   onConfirmed: () => setHasLeft(true),
 * });
 * ```
 */
export function useConfirmedMutation<
  TData = unknown,
  TVariables = void,
  TOnMutateResult = unknown,
>(
  options: Omit<
    UseMutationOptions<TData, unknown, TVariables, TOnMutateResult>,
    "onSuccess" | "onError"
  > & {
    /**
     * The ONLY place success UI belongs: a toast, a step change, a "done"
     * panel, a navigation. Runs after the server confirmed the write.
     */
    onConfirmed?: (data: TData, variables: TVariables) => void;
    /** Runs after a confirmed failure — roll back optimistic state here. */
    onFailed?: (
      error: unknown,
      variables: TVariables,
      onMutateResult: TOnMutateResult | undefined,
    ) => void;
    /** Already-translated success copy. Omit for a silent success. */
    successToast?: string;
    /**
     * Already-translated failure copy. Omit to leave the failure to the
     * app-wide MutationCache handler (which toasts a generic message) or to
     * your own `onFailed`.
     */
    errorToast?: string;
  },
): UseMutationResult<TData, unknown, TVariables, TOnMutateResult> {
  const { showToast } = useToast();
  const {
    onConfirmed,
    onFailed,
    successToast,
    errorToast,
    ...mutationOptions
  } = options;

  const handleSuccess = useCallback(
    (data: TData, variables: TVariables) => {
      if (successToast) showToast(successToast, "success");
      onConfirmed?.(data, variables);
    },
    [showToast, successToast, onConfirmed],
  );

  const handleError = useCallback(
    (
      error: unknown,
      variables: TVariables,
      onMutateResult: TOnMutateResult | undefined,
    ) => {
      if (errorToast) {
        // The backend's own reason when it gave a usable one, so "that name is
        // taken" beats "something went wrong" — see `reasonFor`.
        showToast(reasonFor(error) ?? errorToast, "error");
      }
      onFailed?.(error, variables, onMutateResult);
    },
    [showToast, errorToast, onFailed],
  );

  return useMutation<TData, unknown, TVariables, TOnMutateResult>({
    ...mutationOptions,
    // A toast emitted here would double up with the app-wide MutationCache
    // handler, which also toasts every failure. Tell it this write owns its own
    // error UI.
    meta: errorToast
      ? { ...mutationOptions.meta, silentError: true }
      : mutationOptions.meta,
    onSuccess: handleSuccess,
    onError: handleError,
  });
}
