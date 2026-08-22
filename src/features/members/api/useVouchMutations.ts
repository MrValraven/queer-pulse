import { useRef, type Dispatch, type SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
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
 * `onMutate`, rolls that change back on `onError`, and on `onSettled`
 * invalidates the affected query keys plus re-runs auth refresh. It also drops
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
    onError: (_error, slug, context) => {
      // Roll back the optimistic removal (restore most-recent-first) if it existed.
      if (existedBySlugRef.current[slug]) {
        setVouched((prev) =>
          prev.includes(slug) ? prev : [slug, ...prev],
        );
      }
      if (context?.previousGivenVouches) {
        queryClient.setQueryData<GivenVouchFace[]>(
          givenVouchesKey,
          context.previousGivenVouches,
        );
      }
    },
    onSettled,
  });

  return { unvouch: unvouchMutation };
}
