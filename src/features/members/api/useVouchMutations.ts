import { useCallback, useRef, type Dispatch, type SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { ApiError } from "../../../shared/api/client";
import { unvouch } from "./members.api";
import type { GivenVouchFace } from "./useGivenVouches";

interface UseVouchMutationsArgs {
  /** The VouchProvider's `vouched` list setter — updated optimistically here. */
  setVouched: Dispatch<SetStateAction<string[]>>;
  /** Re-run auth refresh after a settle (picks up a status promotion/demotion). */
  refresh: () => void | Promise<void>;
}

/**
 * The withdraw-vouch optimistic lifecycle, moved out of VouchProvider and into
 * React Query. Optimistically updates the provider's `vouched` list on
 * `onMutate`, rolls that change back on `onError` (a 404 is the one
 * exception: it means the vouch was already gone, so it settles as a success
 * instead), and on `onSettled` invalidates the affected query keys plus
 * re-runs auth refresh. It also drops
 * the withdrawn slug from the `["givenVouches", demoMode]` cache (and puts it
 * back on failure), because that query is deliberately never invalidated — see
 * `useGivenVouches`.
 *
 * (Adding a vouch is owned by `VouchMemberModal` via `useVouchMember` — it does
 * the real POST with relationship/note/anonymous — so there is no `vouch`
 * mutation here; the modal's `onVouched` updates `vouched` directly.)
 *
 * Demo mode never hits the network: `mutationFn` short-circuits, and the
 * optimistic `setVouched` change simply stays (there's no server to reconcile,
 * and localStorage in the provider persists it). `invalidateQueries` is a
 * harmless no-op against mock hooks, and `refresh()` no-ops in demo.
 */
export function useVouchMutations({
  setVouched,
  refresh,
}: UseVouchMutationsArgs) {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  // Per-slug record of "was this vouch actually in the list before we removed
  // it?", written from inside the state updater and read in `onError`.
  //
  // It used to be a local `let` assigned by the updater and returned as
  // mutation context on the very next line. That only holds when React takes
  // its eager-state path; when `VouchProvider`'s fiber already has a queued
  // update the updater runs at render time instead, so `existed` was still
  // `false` when the context was built, `onError` skipped the rollback, and a
  // failed DELETE left the vouch visibly withdrawn. A ref sidesteps the timing
  // entirely: `onError` only ever runs after the network round-trip, by which
  // point the updater has certainly run.
  const existedBySlugRef = useRef<Record<string, boolean>>({});

  // Per-slug registry for `removeVouch`'s caller-supplied `onSettled`. Keyed
  // this way, because `mutate()`'s own per-call options cannot hold it safely:
  // `unvouchMutation` is ONE shared observer for the whole app (this hook runs
  // once, inside `VouchProvider`), and react-query's
  // `MutationObserver` keeps only the LATEST per-call options for a given
  // observer. A member withdrawing on profile A, then navigating and
  // withdrawing on profile B before A's request settles, would otherwise lose
  // A's callback the moment B's `mutate()` call overwrote it, and A would
  // resolve silently either way. Keying by slug keeps two different
  // withdrawals independent; the same slug withdrawn twice at once is
  // accepted as out of scope, since the UI already shows it as withdrawn
  // (optimistically) after the first click.
  const settleCallbacksRef = useRef<
    Record<string, ((didSucceed: boolean) => void) | undefined>
  >({});

  const onSettled = (_data: void, _error: Error | null, slug: string) => {
    delete existedBySlugRef.current[slug];
    // Refresh the vouchee's profile + the directory so counts update, and the
    // "Vouched for by…" face row so the server's authoritative voucher list
    // replaces the optimistic "+ you" face rather than lingering beside it.
    void queryClient.invalidateQueries({ queryKey: ["profile"] });
    void queryClient.invalidateQueries({ queryKey: ["members"] });
    void queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    // A vouch can cross a status threshold (promotion); a withdrawal can drop
    // back below it. Pick up the new status claim. (No-op in demo.)
    void refresh();
  };

  /** The rows the "You vouched for" list held before this withdrawal, so a
   *  failed DELETE can put them back. `undefined` when that query never ran. */
  const givenVouchesKey = ["givenVouches", demoMode] as const;

  const unvouchMutation = useMutation<
    void,
    Error,
    string,
    { previousGivenVouches: GivenVouchFace[] | undefined }
  >({
    // `ProfileSafetyMenu` owns this write's success/error toast through the
    // `onSettled` callback `removeVouch` registers below; the app-wide
    // `MutationCache` handler (`handleMutationError`) would otherwise raise
    // its own toast on top of it for every non-401/404 failure.
    meta: { silentError: true },
    onMutate: (slug) => {
      setVouched((prev) => {
        existedBySlugRef.current[slug] = prev.includes(slug);
        return prev.filter((vouchedSlug) => vouchedSlug !== slug);
      });
      // `useGivenVouches` is deliberately never invalidated (a refetch mid-flight
      // would clobber the optimistic list), so drop the row from its cache by
      // hand — otherwise the owner's profile keeps listing someone they just
      // stopped vouching for until the session's cache is evicted.
      const previousGivenVouches =
        queryClient.getQueryData<GivenVouchFace[]>(givenVouchesKey);
      if (previousGivenVouches) {
        queryClient.setQueryData<GivenVouchFace[]>(
          givenVouchesKey,
          previousGivenVouches.filter((face) => face.slug !== slug),
        );
      }
      return { previousGivenVouches };
    },
    mutationFn: async (slug) => {
      if (demoMode) return;
      await unvouch(slug);
    },
    onError: (error, slug, context) => {
      // A 404 ("No vouch to withdraw") means the vouch is already gone,
      // withdrawn from another tab, or otherwise severed server-side. Settle
      // this the way a real success would: keep the optimistic removal, keep
      // the given-vouches cache as patched, and tell the caller `true`.
      // Rolling it back would show the vouch as still standing and invite a
      // retry that lands on the same 404 every time, the PRD-425 pattern
      // applied here to withdrawal.
      if (error instanceof ApiError && error.status === 404) {
        settleCallbacksRef.current[slug]?.(true);
        delete settleCallbacksRef.current[slug];
        return;
      }
      // Roll back the optimistic removal (restore most-recent-first) if it existed.
      if (existedBySlugRef.current[slug]) {
        setVouched((prev) => (prev.includes(slug) ? prev : [slug, ...prev]));
      }
      if (context?.previousGivenVouches) {
        queryClient.setQueryData<GivenVouchFace[]>(
          givenVouchesKey,
          context.previousGivenVouches,
        );
      }
      settleCallbacksRef.current[slug]?.(false);
      delete settleCallbacksRef.current[slug];
    },
    onSuccess: (_data, slug) => {
      settleCallbacksRef.current[slug]?.(true);
      delete settleCallbacksRef.current[slug];
    },
    onSettled,
  });

  /**
   * Withdraw a vouch. `onSettled`, when given, fires once the server confirms
   * or rejects the withdrawal (`true`/`false`), so a caller can wait for the
   * real outcome before telling the member it worked (PRD-424). It goes into
   * `settleCallbacksRef`, keyed by slug; see that ref's doc comment for why
   * `mutate()`'s own transient per-call options cannot carry it safely on
   * this shared mutation.
   */
  const removeVouch = useCallback(
    (slug: string, onSettled?: (didSucceed: boolean) => void) => {
      if (onSettled) settleCallbacksRef.current[slug] = onSettled;
      unvouchMutation.mutate(slug);
    },
    [unvouchMutation],
  );

  return { removeVouch };
}
