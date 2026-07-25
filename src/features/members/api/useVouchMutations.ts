import type { Dispatch, SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { unvouch } from "./members.api";

/** Rollback context: whether the slug was already in the list before onMutate. */
interface VouchMutationContext {
  existed: boolean;
}

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
 * invalidates the affected query keys plus re-runs auth refresh.
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

  const onSettled = () => {
    // Refresh the vouchee's profile + the directory so counts update, and the
    // "Vouched for by…" face row so the server's authoritative voucher list
    // replaces the optimistic "+ you" face rather than lingering beside it.
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["members"] });
    queryClient.invalidateQueries({ queryKey: ["vouchers"] });
    // A vouch can cross a status threshold (promotion); a withdrawal can drop
    // back below it. Pick up the new status claim. (No-op in demo.)
    void refresh();
  };

  const unvouchMutation = useMutation<
    void,
    Error,
    string,
    VouchMutationContext
  >({
    onMutate: (slug) => {
      let existed = false;
      setVouched((prev) => {
        existed = prev.includes(slug);
        return prev.filter((s) => s !== slug);
      });
      return { existed };
    },
    mutationFn: async (slug) => {
      if (demoMode) return;
      await unvouch(slug);
    },
    onError: (_e, slug, ctx) => {
      // Roll back the optimistic removal (restore most-recent-first) if it existed.
      if (ctx?.existed) {
        setVouched((prev) => (prev.includes(slug) ? prev : [slug, ...prev]));
      }
    },
    onSettled,
  });

  return { unvouch: unvouchMutation };
}
